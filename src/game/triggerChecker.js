// triggerChecker.js — injects special "trigger" cards when a metric crosses a
// threshold. Each trigger fires at most once per game.
//
// Checked after every card, in priority order (heat first — it's the deadliest).
//   heat      > 75 → 'trigger-heatwave'
//   money     < 20 → 'trigger-austerity'
//   happiness < 20 → 'trigger-protest'

const THRESHOLDS = [
  { id: 'trigger-heatwave', test: (s) => s.heat > 75 },
  { id: 'trigger-austerity', test: (s) => s.money < 20 },
  { id: 'trigger-protest', test: (s) => s.happiness < 20 },
]

// Returns a trigger card id to inject, or null. `playedTriggers` is the list of
// trigger ids already fired this game.
export function checkTriggers(state, playedTriggers) {
  for (const t of THRESHOLDS) {
    if (t.test(state) && !playedTriggers.includes(t.id)) return t.id
  }
  return null
}
