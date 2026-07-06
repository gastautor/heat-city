import { useGameStore } from '../store/gameStore'
import MetricGlyph from './MetricGlyph'
import { tempDeltaFromEffect } from '../game/metricEngine'

// The "result beat" shown between cards: what changed + a did-you-know fact.
export default function ScienceBit() {
  const result = useGameStore((s) => s.result)
  const heat = useGameStore((s) => s.heat)
  const money = useGameStore((s) => s.money)
  const happiness = useGameStore((s) => s.happiness)
  const continueToNext = useGameStore((s) => s.continueToNext)

  if (!result) return null
  const { card, label, effects } = result

  return (
    <div className="result">
      <div className="result-top">
        <div className="result-headline">{label}.</div>
        <div className="result-deltas">
          <Delta
            type="heat"
            level={heat / 100}
            color="var(--heat)"
            text={tempDeltaText(effects.heat)}
            good={effects.heat < 0}
            bad={effects.heat > 0}
          />
          <Delta
            type="money"
            level={money / 100}
            color="var(--money)"
            effect={effects.money}
            good={effects.money > 0}
            bad={effects.money < 0}
          />
          <Delta
            type="mood"
            level={happiness / 100}
            color="var(--positive)"
            effect={effects.happiness}
            good={effects.happiness > 0}
            bad={effects.happiness < 0}
          />
        </div>
      </div>

      <div className="science-sheet">
        <div className="science-kicker">WUSSTEST DU?</div>
        <p className="science-text">{card.scienceBit}</p>
        <button className="btn btn-primary science-next" onClick={continueToNext}>
          Nächste Karte →
        </button>
      </div>
    </div>
  )
}

function Delta({ type, level, color, text, effect, good, bad }) {
  const cls = good ? 'up-good' : bad ? 'up-bad' : 'flat'
  return (
    <div className="delta">
      <MetricGlyph type={type} level={level} color={color} size={36} />
      {text != null ? (
        <div className={`delta-value ${cls}`}>{text}</div>
      ) : (
        <DeltaArrow effect={effect} cls={cls} />
      )}
    </div>
  )
}

// Direction-only indicator: arrow size grows with the impact (|effect| 1–3).
function DeltaArrow({ effect, cls }) {
  if (!effect) return <div className="delta-arrow flat">–</div>
  const size = 14 + Math.min(Math.abs(effect), 3) * 6
  return (
    <div className={`delta-arrow ${cls}`} style={{ fontSize: `${size}px` }}>
      {effect > 0 ? '▲' : '▼'}
    </div>
  )
}

function tempDeltaText(effect) {
  if (effect === 0) return '0°'
  const d = tempDeltaFromEffect(effect)
  return `${effect > 0 ? '+' : '−'}${Math.abs(d).toFixed(1)}°`
}
