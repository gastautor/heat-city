import AdvisorAvatar from './AdvisorAvatar'

// German labels for the category pill (JSON keys stay English).
const CATEGORY_DE = {
  green: 'Grünflächen',
  surfaces: 'Oberflächen',
  water: 'Wasser',
  buildings: 'Gebäude',
  crisis: 'Krise',
}

// Card inner content only — no gesture logic (that lives in SwipeHandler).
export default function CardView({ card }) {
  return (
    <>
      <div className="card-category">
        <span className="dot" />
        {CATEGORY_DE[card.category] || card.category}
      </div>
      <h2 className="card-situation">{card.situation}</h2>

      <div className="card-character">
        <AdvisorAvatar advisor={card.advisor} />
        <div className="advisor-name">{card.advisor.name}</div>
        <div className="advisor-role">{card.advisor.role}</div>
        <p className="advisor-quote">„{card.advisor.quote}“</p>
      </div>
    </>
  )
}
