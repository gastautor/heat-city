import { useGameStore } from '../store/gameStore'
import endings from '../data/endings.json'
import { formatTemp } from '../game/metricEngine'
import MetricGlyph from './MetricGlyph'

export default function EndScreen() {
  const gameStatus = useGameStore((s) => s.gameStatus)
  const heat = useGameStore((s) => s.heat)
  const money = useGameStore((s) => s.money)
  const happiness = useGameStore((s) => s.happiness)
  const history = useGameStore((s) => s.history)
  const initGame = useGameStore((s) => s.initGame)

  const ending = endings[gameStatus] || endings.won
  const lastThree = history.slice(-3).reverse()

  const onShare = async () => {
    const text = `HEAT CITY — ${ending.title} ${ending.emoji}\nEndstand: ${formatTemp(
      heat
    )} · Geld ${Math.round(money)}% · Stimmung ${Math.round(happiness)}%`
    try {
      if (navigator.share) {
        await navigator.share({ title: 'Heat City', text })
      } else if (navigator.clipboard) {
        await navigator.clipboard.writeText(text)
        alert('Result copied to clipboard')
      }
    } catch {
      /* user dismissed share sheet — ignore */
    }
  }

  return (
    <div className={`end theme-${ending.theme}`}>
      <div className="end-emoji">{ending.emoji}</div>
      <div className="end-kicker">{ending.kicker}</div>
      <h1 className="end-title">{ending.title}</h1>
      <p className="end-body">{ending.body}</p>

      <div className="end-stats">
        <Stat
          type="heat"
          level={heat / 100}
          value={formatTemp(heat)}
          label={heat < 70 ? 'gehalten' : 'kritisch'}
          color="var(--heat)"
        />
        <Stat
          type="money"
          level={money / 100}
          value={`${Math.round(money)}%`}
          label="Budget"
          color="var(--money)"
        />
        <Stat
          type="mood"
          level={happiness / 100}
          value={`${Math.round(happiness)}%`}
          label="mit dir"
          color="var(--positive)"
        />
      </div>

      {lastThree.length > 0 && (
        <>
          <div className="end-section">DEINE PRÄGENDEN ENTSCHEIDUNGEN</div>
          <div className="decisions">
            {lastThree.map((h, i) => (
              <div key={i} className={`decision ${h.effectsApplied.heat > 0 ? 'bad' : ''}`}>
                <div className="d-title">{h.label}</div>
                <div className="d-sub">{truncate(h.situation, 64)}</div>
              </div>
            ))}
          </div>
        </>
      )}

      <div className="science-card">
        <div className="sc-kicker">DIE WISSENSCHAFT</div>
        <div className="sc-text">{ending.science}</div>
      </div>

      <div className="end-actions">
        <button className="btn btn-primary" onClick={initGame}>
          Nochmal spielen
        </button>
        <button className="btn btn-outline" onClick={onShare}>
          Teilen
        </button>
      </div>
    </div>
  )
}

function Stat({ type, level, value, label, color }) {
  return (
    <div className="end-stat">
      <MetricGlyph type={type} level={level} color={color} size={24} />
      <div className="es-value" style={{ color }}>
        {value}
      </div>
      <div className="es-label">{label}</div>
    </div>
  )
}

function truncate(s, n) {
  return s.length > n ? s.slice(0, n - 1).trimEnd() + '…' : s
}
