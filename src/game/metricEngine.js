// metricEngine.js — applies effects, checks thresholds, handles passive heat rise.
//
// Three metrics, all integers 0–100:
//   heat      start 37  — high is bad (background climate change)
//   money     start 65  — low is bad (city budget)
//   happiness start 60  — low is bad (resident trust / "mood")

export const START = { heat: 37, money: 65, happiness: 60 }

export const FAILURE = { heatMax: 100, moneyMin: 0, happinessMin: 0 }
export const WIN_CARD_COUNT = 35
export const WIN_HEAT_BELOW = 70
export const PASSIVE_HEAT_RISE = 4
export const PASSIVE_EVERY = 3

const clamp = (n) => Math.max(0, Math.min(100, n))

// Apply a choice's effects. Effects are integers -3..+3; each point = 8 metric points.
// Returns a NEW metric object (does not mutate input).
export function applyEffects(state, effects) {
  return {
    heat: clamp(state.heat + (effects.heat || 0) * 8),
    money: clamp(state.money + (effects.money || 0) * 8),
    happiness: clamp(state.happiness + (effects.happiness || 0) * 8),
  }
}

// Background warming that happens regardless of player choices.
export function applyPassiveHeat(state) {
  return { ...state, heat: clamp(state.heat + PASSIVE_HEAT_RISE) }
}

// Returns null | 'heat' | 'money' | 'happiness'
export function checkFailure(state) {
  if (state.heat >= FAILURE.heatMax) return 'heat'
  if (state.money <= FAILURE.moneyMin) return 'money'
  if (state.happiness <= FAILURE.happinessMin) return 'happiness'
  return null
}

// Survive the deck without overheating.
export function checkWin(state, cardCount) {
  return cardCount >= WIN_CARD_COUNT && state.heat < WIN_HEAT_BELOW
}

// ---- Display helpers -------------------------------------------------------

// Map the internal heat scale onto °C above the 2025 baseline, anchored so the
// start (37) reads +1.5°C and the loss point (100) reads +4.0°C.
const TEMP_PER_HEAT = 2.5 / (100 - START.heat) // ≈ 0.0397 °C per heat point

export function tempFromHeat(heat) {
  return Math.max(0, 1.5 + (heat - START.heat) * TEMP_PER_HEAT)
}

// °C change for a raw effect value (effect points → heat points → °C).
export function tempDeltaFromEffect(effect) {
  return effect * 8 * TEMP_PER_HEAT
}

export function formatTemp(heat) {
  return `+${tempFromHeat(heat).toFixed(1)}°C`
}

// The year ticks from 2025 toward 2040 across the run.
export function yearFromCount(cardCount) {
  const year = 2025 + Math.round((cardCount / WIN_CARD_COUNT) * 15)
  return Math.min(2040, year)
}
