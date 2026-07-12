import { create } from 'zustand'

import cards from '../data/cards.json'
import triggers from '../data/triggers.json'
import chains from '../data/chains.json'

import {
  START,
  applyEffects,
  applyPassiveHeat,
  checkFailure,
  checkWin,
  PASSIVE_EVERY,
} from '../game/metricEngine'
import { initDeck, drawNext } from '../game/deckManager'
import { checkTriggers } from '../game/triggerChecker'

// Lookup of every card by id, so chain / trigger ids resolve to full cards.
const CARD_INDEX = {}
for (const c of [...cards, ...triggers, ...chains]) CARD_INDEX[c.id] = c
const cardById = (id) => CARD_INDEX[id] || null

const initialMetrics = () => ({ ...START })

export const useGameStore = create((set, get) => ({
  // Metrics
  ...initialMetrics(),

  // Deck
  deck: { pile: [], pool: cards },
  chainQueue: [], // card ids queued to be drawn next
  cardCount: 0,
  playedTriggers: [],

  // Current state
  currentCard: null,
  gameStatus: 'playing', // 'playing' | 'won' | 'lost-heat' | 'lost-money' | 'lost-happiness'

  // UI phase: 'title' | 'intro' | 'card' | 'result' | 'over'
  phase: 'title',

  // For the result beat (shown between cards)
  result: null, // { card, choice, label, effects, prevMetrics }

  // For end screen
  history: [], // [{ cardId, choice, label, situation, effectsApplied }]

  // Transient UI flags consumed by MetricBar
  flash: { heat: false, money: false, happiness: false },
  passiveRise: false,

  // ---- Actions ------------------------------------------------------------

  goToTitle: () => set({ phase: 'title' }),

  startIntro: () => set({ phase: 'intro' }),

  initGame: () => {
    const deck = initDeck(cards)
    const { card, newDeckState } = drawNext(deck)
    set({
      ...initialMetrics(),
      deck: newDeckState,
      chainQueue: [],
      cardCount: 0,
      playedTriggers: [],
      currentCard: card,
      gameStatus: 'playing',
      phase: 'card',
      result: null,
      history: [],
      flash: { heat: false, money: false, happiness: false },
      passiveRise: false,
    })
  },

  makeChoice: (dir) => {
    const state = get()
    if (state.phase !== 'card' || !state.currentCard) return

    const card = state.currentCard
    const choice = card.choices[dir]
    const effects = choice.effects
    const prevMetrics = { heat: state.heat, money: state.money, happiness: state.happiness }

    // 1. apply effects
    let metrics = applyEffects(prevMetrics, effects)

    // 2. push to history
    const history = [
      ...state.history,
      {
        cardId: card.id,
        choice: dir,
        label: choice.label,
        situation: card.situation,
        effectsApplied: effects,
      },
    ]

    // 3. increment card count
    const cardCount = state.cardCount + 1

    // 4. passive heat rise every few cards (background warming)
    let passiveRise = false
    if (cardCount % PASSIVE_EVERY === 0) {
      metrics = applyPassiveHeat(metrics)
      passiveRise = true
    }

    // which metrics dropped (for the red flash) — heat "drops" when it rises
    const flash = {
      heat: metrics.heat > prevMetrics.heat,
      money: metrics.money < prevMetrics.money,
      happiness: metrics.happiness < prevMetrics.happiness,
    }

    // 5/6. figure out the next card.
    //   trigger cards bypass everything; then chained cards; then the deck.
    let chainQueue = [...state.chainQueue]
    let playedTriggers = state.playedTriggers
    let deck = state.deck

    // queue any chain card this choice spawns
    const chainId = card.chain ? card.chain[dir] : null
    if (chainId) chainQueue = [chainId, ...chainQueue]

    // 7. check win / failure on the new metrics
    const failure = checkFailure(metrics)
    const won = checkWin(metrics, cardCount)
    let gameStatus = 'playing'
    if (failure) gameStatus = `lost-${failure}`
    else if (won) gameStatus = 'won'

    // determine next card only if the game continues
    let nextCard = null
    if (gameStatus === 'playing') {
      const triggerId = checkTriggers(metrics, playedTriggers)
      if (triggerId) {
        nextCard = cardById(triggerId)
        playedTriggers = [...playedTriggers, triggerId]
      } else if (chainQueue.length > 0) {
        const [nextId, ...restQueue] = chainQueue
        nextCard = cardById(nextId)
        chainQueue = restQueue
      } else {
        const drawn = drawNext(deck)
        nextCard = drawn.card
        deck = drawn.newDeckState
      }
    }

    set({
      ...metrics,
      cardCount,
      history,
      chainQueue,
      playedTriggers,
      deck,
      gameStatus,
      currentCard: nextCard,
      phase: 'result',
      passiveRise,
      flash,
      result: { card, choice: dir, label: choice.label, effects, prevMetrics },
    })
  },

  // Advance from the result beat to the next card (or the end screen).
  continueToNext: () => {
    const state = get()
    if (state.gameStatus !== 'playing') {
      set({ phase: 'over', passiveRise: false })
    } else {
      set({ phase: 'card', result: null, passiveRise: false })
    }
  },
}))
