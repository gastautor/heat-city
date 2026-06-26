// A large procedural character portrait (Reigns-style), drawn deterministically
// from the advisor's name so each character always looks the same. No assets.

const SKINS = ['#f1c9a5', '#e0aa7e', '#c68642', '#8d5524', '#ffdbb0']
const HAIRS = ['#211c17', '#5a3a22', '#8a6a3a', '#b9b0a3', '#c0552b', '#e8c468']
const CLOTHES = ['#ee5a26', '#2fa36b', '#3b6fd4', '#c98a3c', '#7a5cc0', '#d24b6a', '#37908a']
const BGS = ['#ffe7d6', '#e4f3ea', '#e7ecfb', '#f6ead2', '#efe7fb', '#fbe4ea', '#dff0ee']

function hash(str) {
  let h = 0
  for (let i = 0; i < str.length; i++) h = (h * 31 + str.charCodeAt(i)) >>> 0
  return h
}
const pick = (arr, n) => arr[n % arr.length]

export default function AdvisorAvatar({ advisor, size = 168 }) {
  const h = hash(advisor.name)
  const skin = pick(SKINS, h)
  const hair = pick(HAIRS, h >> 3)
  const clothes = pick(CLOTHES, h >> 6)
  const bg = pick(BGS, h >> 9)
  const hairStyle = (h >> 12) % 4
  const glasses = (h >> 15) % 3 === 0
  const smile = (h >> 17) % 2 === 0

  return (
    <svg
      className="character-portrait"
      width={size}
      height={size}
      viewBox="0 0 100 100"
      aria-hidden="true"
    >
      <defs>
        <clipPath id={`pc-${h}`}>
          <rect x="0" y="0" width="100" height="100" rx="16" />
        </clipPath>
      </defs>
      <g clipPath={`url(#pc-${h})`}>
        <rect x="0" y="0" width="100" height="100" fill={bg} />
        {/* shoulders / clothing */}
        <ellipse cx="50" cy="104" rx="40" ry="30" fill={clothes} />
        <rect x="46" y="62" width="8" height="12" fill={skin} />
        {/* head */}
        <circle cx="50" cy="44" r="23" fill={skin} />
        {/* hair */}
        <Hair style={hairStyle} color={hair} />
        {/* eyes */}
        {glasses ? (
          <g stroke="#211c17" strokeWidth="1.6" fill="none">
            <circle cx="41" cy="44" r="5" />
            <circle cx="59" cy="44" r="5" />
            <line x1="46" y1="44" x2="54" y2="44" />
          </g>
        ) : null}
        <circle cx="41" cy="44" r="2.1" fill="#211c17" />
        <circle cx="59" cy="44" r="2.1" fill="#211c17" />
        {/* mouth */}
        {smile ? (
          <path d="M43 53 q7 6 14 0" stroke="#211c17" strokeWidth="2" fill="none" strokeLinecap="round" />
        ) : (
          <line x1="44" y1="54" x2="56" y2="54" stroke="#211c17" strokeWidth="2" strokeLinecap="round" />
        )}
      </g>
      <rect
        x="1.2"
        y="1.2"
        width="97.6"
        height="97.6"
        rx="15"
        fill="none"
        stroke="#211c17"
        strokeWidth="2.4"
      />
    </svg>
  )
}

function Hair({ style, color }) {
  switch (style) {
    case 0: // short cap
      return <path d="M27 42 a23 23 0 0 1 46 0 q-23 -14 -46 0 Z" fill={color} />
    case 1: // long, framing the face
      return (
        <g fill={color}>
          <path d="M27 44 a23 23 0 0 1 46 0 q-23 -16 -46 0 Z" />
          <rect x="27" y="40" width="7" height="30" rx="3" />
          <rect x="66" y="40" width="7" height="30" rx="3" />
        </g>
      )
    case 2: // bun / pulled back
      return (
        <g fill={color}>
          <path d="M28 40 a22 22 0 0 1 44 0 q-22 -12 -44 0 Z" />
          <circle cx="50" cy="20" r="6" />
        </g>
      )
    default: // bald-ish / very short
      return <path d="M30 40 a20 20 0 0 1 40 0 q-20 -7 -40 0 Z" fill={color} opacity="0.9" />
  }
}
