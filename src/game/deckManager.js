// deckManager.js — shuffles the card pool and draws cards one at a time.
//
// deckState = { pile: Card[], pool: Card[] }
//   pile — the remaining shuffled cards to draw from
//   pool — the original set, used to reshuffle if the pile runs dry before the
//          win condition is reached (keeps the run going to ~35 cards)

// Fisher–Yates shuffle (returns a new array, does not mutate input).
export function shuffle(arr) {
  const a = [...arr]
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[a[i], a[j]] = [a[j], a[i]]
  }
  return a
}

export function initDeck(cards) {
  const pool = [...cards]
  return { pile: shuffle(pool), pool }
}

// Draw the next regular card. Chain cards and trigger cards are injected by the
// store ahead of this (they bypass the pile), so this only handles the pool.
// Returns { card, newDeckState }.
export function drawNext(deckState) {
  let pile = deckState.pile
  // Reshuffle from the pool if we've exhausted the pile.
  if (pile.length === 0) {
    pile = shuffle(deckState.pool)
  }
  const [card, ...rest] = pile
  return {
    card: card || null,
    newDeckState: { pile: rest, pool: deckState.pool },
  }
}
