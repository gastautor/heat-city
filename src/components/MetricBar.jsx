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
        <span className="clock">
          {yearFromCount(cardCount)} · <b className="clock-temp">{formatTemp(heat)}</b>
        </span>
      </div>
      <div className="metrics">
        <Metric
          type="heat"
          label="HITZE"
          level={heat / 100}
          color="var(--heat)"
          flash={flash.heat}
          pulse={passiveRise}
        />
        <Metric
          type="money"
          label="GELD"
          level={money / 100}
          color="var(--money)"
          flash={flash.money}
        />
        <Metric
          type="mood"
          label="STIMMUNG"
          level={happiness / 100}
          color="var(--positive)"
          flash={flash.happiness}
        />
      </div>
    </div>
  )
}

function Metric({ type, label, level, color, flash, pulse }) {
  const cls = ['metric', flash ? 'flash' : '', pulse ? 'pulse' : ''].filter(Boolean).join(' ')
  return (
    <div className={cls}>
      <MetricGlyph type={type} level={level} color={color} size={54} />
      <div className="metric-label">{label}</div>
    </div>
  )
}
