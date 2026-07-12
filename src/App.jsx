import { useGameStore } from './store/gameStore'
import TitleScreen from './components/TitleScreen'
import IntroScreen from './components/IntroScreen'
import MetricBar from './components/MetricBar'
import SwipeHandler from './components/SwipeHandler'
import ScienceBit from './components/ScienceBit'
import EndScreen from './components/EndScreen'

export default function App() {
  const phase = useGameStore((s) => s.phase)

  return (
    <div className="app">
      {phase === 'title' && <TitleScreen />}
      {phase === 'intro' && <IntroScreen />}
      {(phase === 'card' || phase === 'result') && <GameScreen phase={phase} />}
      {phase === 'over' && <EndScreen />}
    </div>
  )
}

function GameScreen({ phase }) {
  const currentCard = useGameStore((s) => s.currentCard)
  const makeChoice = useGameStore((s) => s.makeChoice)

  return (
    <>
      <MetricBar />
      <div className="card-area">
        {phase === 'card' && currentCard && (
          <SwipeHandler key={currentCard.id} card={currentCard} onChoose={makeChoice} />
        )}
      </div>

      {phase === 'card' && currentCard && (
        <div className="card-hint">◀ wischen, um zu entscheiden ▶</div>
      )}

      {phase === 'result' && <ScienceBit />}
    </>
  )
}
