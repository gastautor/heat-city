import { useRef } from 'react'
import CardView from './CardView'

// Draggable card. Drag to tilt + reveal a choice overlay; release past the
// threshold to commit. left = first choice ("keep"), right = second ("build").
const COMMIT_PX = 110
const FLING_MS = 240

export default function SwipeHandler({ card, onChoose }) {
  const cardRef = useRef(null)
  const leftOv = useRef(null)
  const rightOv = useRef(null)
  const drag = useRef({ startX: 0, x: 0, active: false, committed: false })

  const setTransform = (tx, rot) => {
    if (cardRef.current) cardRef.current.style.transform = `translateX(${tx}px) rotate(${rot}deg)`
  }
  const setOverlays = (x) => {
    if (rightOv.current) rightOv.current.style.opacity = Math.max(0, Math.min(1, x / 90))
    if (leftOv.current) leftOv.current.style.opacity = Math.max(0, Math.min(1, -x / 90))
  }

  const onPointerDown = (e) => {
    if (drag.current.committed) return
    drag.current.active = true
    drag.current.startX = e.clientX
    if (cardRef.current) {
      cardRef.current.style.transition = 'none'
      cardRef.current.classList.add('grabbing')
      if (cardRef.current.setPointerCapture && e.pointerId != null) {
        cardRef.current.setPointerCapture(e.pointerId)
      }
    }
  }

  const onPointerMove = (e) => {
    if (!drag.current.active) return
    const x = e.clientX - drag.current.startX
    drag.current.x = x
    setTransform(x, x / 22)
    setOverlays(x)
  }

  const release = () => {
    if (!drag.current.active) return
    drag.current.active = false
    const x = drag.current.x
    if (cardRef.current) {
      cardRef.current.classList.remove('grabbing')
      cardRef.current.style.transition = 'transform .42s cubic-bezier(.2,.8,.2,1)'
    }
    if (Math.abs(x) > COMMIT_PX) {
      const dir = x > 0 ? 'right' : 'left'
      const sign = x > 0 ? 1 : -1
      drag.current.committed = true
      setTransform(sign * 540, sign * 26)
      window.setTimeout(() => onChoose(dir), FLING_MS)
    } else {
      setTransform(0, 0)
      setOverlays(0)
    }
    drag.current.x = 0
  }

  return (
    <div className="card-stack">
      <div className="card-back" aria-hidden="true" />
      <div
        className="swipe-card"
        ref={cardRef}
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={release}
        onPointerCancel={release}
      >
        <CardView card={card} />

        <div className="card-ov card-ov-left" ref={leftOv}>
          <span className="ov-stamp left">{stampWord(card.choices.left.label)}</span>
          <div className="ov-chip left">
            <div className="ov-dir">◀ NACH LINKS</div>
            <div className="ov-action">{card.choices.left.label}</div>
          </div>
        </div>

        <div className="card-ov card-ov-right" ref={rightOv}>
          <span className="ov-stamp right">{stampWord(card.choices.right.label)}</span>
          <div className="ov-chip right">
            <div className="ov-dir">NACH RECHTS ▶</div>
            <div className="ov-action">{card.choices.right.label}</div>
          </div>
        </div>
      </div>
    </div>
  )
}

// A short decorative stamp word from a choice label. German labels often start
// with an article, so pick the longest meaningful token instead of the first.
const STOPWORDS = new Set([
  'der', 'die', 'das', 'den', 'dem', 'des', 'ein', 'eine', 'einen', 'einem',
  'und', 'oder', 'mit', 'für', 'auf', 'im', 'in', 'zum', 'zur', 'als',
])
function stampWord(label) {
  const words = label.replace(/[^\p{L}\s-]/gu, '').split(/[\s-]+/).filter(Boolean)
  const meaningful = words.filter((w) => !STOPWORDS.has(w.toLowerCase()))
  const pool = meaningful.length ? meaningful : words
  const longest = pool.reduce((a, b) => (b.length > a.length ? b : a), pool[0] || label)
  return longest.toUpperCase()
}
