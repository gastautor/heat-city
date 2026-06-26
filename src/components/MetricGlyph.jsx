import { useId } from 'react'

// A flat glyph (heat / money / mood) that fills bottom-up to `level` (0..1).
// Drawn twice: a faint full-height "track", then a full-colour copy clipped to
// the fill height. No emoji — pure SVG, per the design.

function Shape({ type }) {
  if (type === 'heat') {
    // sun
    return (
      <g fill="currentColor" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round">
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
    )
  }
  if (type === 'money') {
    // coin with a € mark
    return (
      <g fill="none" stroke="currentColor" strokeWidth="2.1" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="12" r="9" />
        <path d="M15 8.5a4 4 0 1 0 0 7" />
        <line x1="7.5" y1="10.6" x2="13" y2="10.6" />
        <line x1="7.5" y1="13.4" x2="13" y2="13.4" />
      </g>
    )
  }
  // mood — a face
  return (
    <g fill="none" stroke="currentColor" strokeWidth="2.1" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="9" />
      <circle cx="8.8" cy="10" r="0.4" fill="currentColor" stroke="currentColor" strokeWidth="1.3" />
      <circle cx="15.2" cy="10" r="0.4" fill="currentColor" stroke="currentColor" strokeWidth="1.3" />
      <path d="M8.4 14.2a4.5 4.5 0 0 0 7.2 0" />
    </g>
  )
}

export default function MetricGlyph({ type, level = 0, color, size = 30 }) {
  const clipId = useId()
  const fillLevel = Math.max(0, Math.min(1, level))
  const fillHeight = 24 * fillLevel
  const y = 24 - fillHeight

  return (
    <svg
      className="metric-glyph"
      width={size}
      height={size}
      viewBox="0 0 24 24"
      style={{ color }}
      aria-hidden="true"
    >
      <defs>
        <clipPath id={clipId}>
          <rect x="0" y={y} width="24" height={fillHeight} />
        </clipPath>
      </defs>
      {/* track */}
      <g opacity="0.22">
        <Shape type={type} />
      </g>
      {/* filled portion */}
      <g clipPath={`url(#${clipId})`}>
        <Shape type={type} />
      </g>
    </svg>
  )
}
