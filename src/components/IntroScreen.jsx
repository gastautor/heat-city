import { useState } from 'react'
import { useGameStore } from '../store/gameStore'
import MetricGlyph from './MetricGlyph'

// Short click-through explanation shown between the title screen and the game.
// Tap anywhere to advance; the last slide starts the game.

const SLIDE_COUNT = 3

export default function IntroScreen() {
  const initGame = useGameStore((s) => s.initGame)
  const [slide, setSlide] = useState(0)

  const advance = () => {
    if (slide < SLIDE_COUNT - 1) setSlide(slide + 1)
    else initGame()
  }

  return (
    <div className="intro-screen" onClick={advance} role="button" tabIndex={0}>
      <div className="intro-kicker">
        SO FUNKTIONIERT&rsquo;S · {slide + 1}/{SLIDE_COUNT}
      </div>

      {slide === 0 && (
        <div className="intro-body">
          <div className="intro-visual">
            <div className="intro-minicard">
              <span className="intro-arrow">◀</span>
              <div className="intro-minicard-inner">
                &bdquo;Der Sommer wird hei&szlig;er. Was tun wir?&ldquo;
              </div>
              <span className="intro-arrow">▶</span>
            </div>
          </div>
          <h2 className="intro-h2">Entscheide per Wisch</h2>
          <p className="intro-text">
            Jede Karte ist eine Situation in deiner Stadt. Wische nach links oder rechts, um dich
            zwischen zwei Optionen zu entscheiden.
          </p>
        </div>
      )}

      {slide === 1 && (
        <div className="intro-body">
          <div className="intro-visual intro-metrics">
            <div className="intro-metric">
              <MetricGlyph type="heat" level={0.4} color="var(--heat)" size={54} />
              <div className="intro-metric-label">HITZE</div>
              <div className="intro-metric-desc">Erreicht sie das Maximum, ist die Stadt unbewohnbar.</div>
            </div>
            <div className="intro-metric">
              <MetricGlyph type="money" level={0.65} color="var(--money)" size={54} />
              <div className="intro-metric-label">GELD</div>
              <div className="intro-metric-desc">Ist die Kasse leer, bist du handlungsunfähig.</div>
            </div>
            <div className="intro-metric">
              <MetricGlyph type="mood" level={0.6} color="var(--positive)" size={54} />
              <div className="intro-metric-label">STIMMUNG</div>
              <div className="intro-metric-desc">Verlierst du den Rückhalt, wirst du abgewählt.</div>
            </div>
          </div>
          <h2 className="intro-h2">Halte drei Werte in Balance</h2>
          <p className="intro-text">
            Jede Entscheidung verändert Hitze, Geld und Stimmung. Fällt einer der Werte aus, ist das
            Spiel vorbei.
          </p>
        </div>
      )}

      {slide === 2 && (
        <div className="intro-body">
          <div className="intro-visual">
            <div className="intro-years">
              <span>2025</span>
              <span className="intro-years-arrow">→</span>
              <span>2040</span>
            </div>
          </div>
          <h2 className="intro-h2">Dein Ziel: 2040</h2>
          <p className="intro-text">
            Die Stadt erwärmt sich auch ohne dein Zutun weiter. Bring sie bis 2040 &ndash; und halte
            die Hitze dabei im Griff.
          </p>
        </div>
      )}

      <div className="intro-footer">
        <div className="intro-dots">
          {Array.from({ length: SLIDE_COUNT }, (_, i) => (
            <span key={i} className={`intro-dot${i === slide ? ' active' : ''}`} />
          ))}
        </div>
        <div className="intro-tap">
          {slide < SLIDE_COUNT - 1 ? 'Tippen für weiter' : 'Tippen zum Spielen →'}
        </div>
      </div>
    </div>
  )
}
