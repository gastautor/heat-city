// Balance simulation for Heat City — replays the gameStore loop over the card
// data with a few scripted play styles and reports outcome distributions.
//
// Usage:
//   node tools/simulate.mjs            # simulate the current card data
//   node tools/simulate.mjs <dir>      # simulate another data root (expects
//                                      # <dir>/src/data/{cards,triggers,chains}.json)
//
// Comparing against a past version:
//   mkdir -p /tmp/old/src/data
//   git show HEAD:src/data/cards.json    > /tmp/old/src/data/cards.json
//   git show HEAD:src/data/triggers.json > /tmp/old/src/data/triggers.json
//   git show HEAD:src/data/chains.json   > /tmp/old/src/data/chains.json
//   node tools/simulate.mjs /tmp/old
//
// NOTE: engine constants and trigger thresholds are mirrored from
// src/game/metricEngine.js and src/game/triggerChecker.js — keep them in sync.

import { readFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { dirname, join } from 'node:path'

const ROOT = process.argv[2] || join(dirname(fileURLToPath(import.meta.url)), '..')
const cards = JSON.parse(readFileSync(join(ROOT, 'src/data/cards.json'), 'utf8'))
const triggers = JSON.parse(readFileSync(join(ROOT, 'src/data/triggers.json'), 'utf8'))
const chains = JSON.parse(readFileSync(join(ROOT, 'src/data/chains.json'), 'utf8'))

const INDEX = {}
for (const c of [...cards, ...triggers, ...chains]) INDEX[c.id] = c

// --- engine constants (mirror metricEngine.js) ---
const START = { heat: 37, money: 65, happiness: 60 }
const WIN_CARD_COUNT = 35
const PASSIVE_EVERY = 3
const PASSIVE_HEAT_RISE = 4
const clamp = (n) => Math.max(0, Math.min(100, n))

// --- trigger thresholds (mirror triggerChecker.js) ---
// Filtered so the sim also runs against old data roots that predate a trigger.
const THRESHOLDS = [
  { id: 'trigger-heatwave', test: (s) => s.heat > 75 },
  { id: 'trigger-austerity', test: (s) => s.money < 20 },
  { id: 'trigger-protest', test: (s) => s.happiness < 20 },
  { id: 'trigger-gentrification', test: (s) => s.happiness > 85 },
].filter((t) => INDEX[t.id])

const shuffle = (arr) => {
  const a = [...arr]
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[a[i], a[j]] = [a[j], a[i]]
  }
  return a
}

// --- strategies: given a card + metrics, return 'left' | 'right' ---
const strategies = {
  random: () => (Math.random() < 0.5 ? 'left' : 'right'),
  // always minimize heat; tie-break toward happiness
  eco: (card) => {
    const l = card.choices.left.effects, r = card.choices.right.effects
    if ((r.heat || 0) !== (l.heat || 0)) return (r.heat || 0) < (l.heat || 0) ? 'right' : 'left'
    return (r.happiness || 0) >= (l.happiness || 0) ? 'right' : 'left'
  },
  // always chase happiness
  populist: (card) => {
    const l = card.choices.left.effects, r = card.choices.right.effects
    return (r.happiness || 0) >= (l.happiness || 0) ? 'right' : 'left'
  },
  // plays eco but protects whichever metric is most endangered
  balanced: (card, m) => {
    const score = (e) => {
      let s = -(e.heat || 0) * (m.heat > 60 ? 2 : 1)
      s += (e.money || 0) * (m.money < 35 ? 2 : 1) * 0.7
      s += (e.happiness || 0) * (m.happiness < 35 ? 2 : 0.5)
      return s
    }
    return score(card.choices.right.effects) >= score(card.choices.left.effects) ? 'right' : 'left'
  },
}

function playGame(strategy) {
  let m = { ...START }
  let pile = shuffle(cards)
  let chainQueue = []
  let playedTriggers = []
  let count = 0
  let current = pile.shift()
  const happinessTrace = []
  let happinessPinned = 0 // turns spent at 100

  while (true) {
    const dir = strategy(current, m)
    const e = current.choices[dir].effects
    m = {
      heat: clamp(m.heat + (e.heat || 0) * 8),
      money: clamp(m.money + (e.money || 0) * 8),
      happiness: clamp(m.happiness + (e.happiness || 0) * 8),
    }
    count++
    if (count % PASSIVE_EVERY === 0) m.heat = clamp(m.heat + PASSIVE_HEAT_RISE)
    happinessTrace.push(m.happiness)
    if (m.happiness >= 100) happinessPinned++

    const chainId = current.chain ? current.chain[dir] : null
    if (chainId) chainQueue.unshift(chainId)

    if (m.heat >= 100) return { result: 'lost-heat', count, m, happinessTrace, happinessPinned }
    if (m.money <= 0) return { result: 'lost-money', count, m, happinessTrace, happinessPinned }
    if (m.happiness <= 0) return { result: 'lost-happiness', count, m, happinessTrace, happinessPinned }
    if (count >= WIN_CARD_COUNT && m.heat < 70) return { result: 'won', count, m, happinessTrace, happinessPinned }
    if (count >= 60) return { result: 'timeout', count, m, happinessTrace, happinessPinned }

    const trig = THRESHOLDS.find((t) => t.test(m) && !playedTriggers.includes(t.id))
    if (trig) {
      playedTriggers.push(trig.id)
      current = INDEX[trig.id]
    } else if (chainQueue.length) {
      current = INDEX[chainQueue.shift()]
    } else {
      if (pile.length === 0) pile = shuffle(cards)
      current = pile.shift()
    }
  }
}

const N = 3000
for (const [name, strat] of Object.entries(strategies)) {
  const outcomes = {}
  let sumHap = 0, sumHeat = 0, sumMoney = 0, pinnedTurns = 0, totalTurns = 0
  let hapMin = Infinity, hapMax = -Infinity
  for (let i = 0; i < N; i++) {
    const g = playGame(strat)
    outcomes[g.result] = (outcomes[g.result] || 0) + 1
    sumHap += g.m.happiness; sumHeat += g.m.heat; sumMoney += g.m.money
    pinnedTurns += g.happinessPinned; totalTurns += g.count
    for (const h of g.happinessTrace) { hapMin = Math.min(hapMin, h); hapMax = Math.max(hapMax, h) }
  }
  console.log(`\n=== ${name} (${N} games) ===`)
  console.log('outcomes:', Object.entries(outcomes).map(([k, v]) => `${k} ${(100 * v / N).toFixed(1)}%`).join('  '))
  console.log(`final avg — heat ${(sumHeat / N).toFixed(0)}  money ${(sumMoney / N).toFixed(0)}  happiness ${(sumHap / N).toFixed(0)}`)
  console.log(`happiness pinned at 100: ${(100 * pinnedTurns / totalTurns).toFixed(1)}% of turns  (range seen: ${hapMin}–${hapMax})`)
}
