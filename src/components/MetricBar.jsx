import { useGameStore } from '../store/gameStore'
import { formatTemp, yearFromCount } from '../game/metricEngine'
import MetricGlyph from './MetricGlyph'

// Sticky top bar: status line + the three metric glyphs.
export default function MetricBar() {
  const heat = useGameStore((s) => s.heat)
  const money = useGameStore((s) => s.money)
  const happiness = useGameStore((s) => s.happiness)
  const cardCount = useGameStore((s) => s.cardCount)
  const flash = useGameStore((s) => s.flash)
  const passiveRise = useGameStore((s) => s.passiveRise)

  return (
    <div className="metricbar">
      <div className="metricbar-status">
        <span className="brand">☀ HEAT CITY</span>
        <span className="clock">
          {yearFromCount(cardCount)} · {formatTemp(heat)}
        </span>
      </div>
      <div className="metrics">
        <Metric
          type="heat"
          value={formatTemp(heat)}
          label="HITZE"
          level={heat / 100}
          color="var(--heat)"
          flash={flash.heat}
          pulse={passiveRise}
        />
        <Metric
          type="money"
          value={`${Math.round(money)}%`}
          label="GELD"
          level={money / 100}
          color="var(--money)"
          flash={flash.money}
        />
        <Metric
          type="mood"
          value={`${Math.round(happiness)}%`}
          label="STIMMUNG"
          level={happiness / 100}
          color="var(--positive)"
          flash={flash.happiness}
        />
      </div>
    </div>
  )
}

function Metric({ type, value, label, level, color, flash, pulse }) {
  const cls = ['metric', flash ? 'flash' : '', pulse ? 'pulse' : ''].filter(Boolean).join(' ')
  return (
    <div className={cls}>
      <MetricGlyph type={type} level={level} color={color} size={54} />
      <div className="metric-value">{value}</div>
      <div className="metric-label">{label}</div>
    </div>
  )
}
