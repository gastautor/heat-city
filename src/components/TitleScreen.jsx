import { useGameStore } from '../store/gameStore'
import { formatTemp, START } from '../game/metricEngine'

export default function TitleScreen() {
  const startIntro = useGameStore((s) => s.startIntro)

  return (
    <div className="title-screen" onClick={startIntro} role="button" tabIndex={0}>
      <div className="title-top">
        <div className="title-tagline">EIN SPIEL ÜBER EINE STADT, DIE LEBENSWERT BLEIBT</div>
        <svg className="title-logo" width="66" height="66" viewBox="0 0 24 24" aria-hidden="true">
          <g fill="#fffdf7" stroke="#fffdf7" strokeWidth="2.2" strokeLinecap="round">
            <circle cx="12" cy="12" r="5" />
            <line x1="12" y1="1.6" x2="12" y2="4.4" />
            <line x1="12" y1="19.6" x2="12" y2="22.4" />
            <line x1="1.6" y1="12" x2="4.4" y2="12" />
            <line x1="19.6" y1="12" x2="22.4" y2="12" />
            <line x1="5" y1="5" x2="7" y2="7" />
            <line x1="17" y1="17" x2="19" y2="19" />
            <line x1="5" y1="19" x2="7" y2="17" />
            <line x1="17" y1="7" x2="19" y2="5" />
          </g>
        </svg>
        <h1 className="title-h1">
          HEAT
          <br />
          CITY
        </h1>
      </div>
      <div className="title-bottom">
        <p className="title-lede">
          Du bist Bürgermeister*in. Die Stadt wird jedes Jahr heißer. Jede Entscheidung trägt dazu bei, wie lebenswert sie bleibt.
        </p>
        <button className="title-start" onClick={startIntro}>
          Tippen zum Starten →
        </button>
        <div className="title-meta">
          <span>JAHR 2025 · {formatTemp(START.heat)}</span>
          <span>5–7 MIN</span>
        </div>
      </div>
    </div>
  )
}
