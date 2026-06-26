# Heat City — Agent Instructions

## What you are building

A mobile-first React card-swipe game about urban heat resilience. The player is the mayor of a city managing rising temperatures. Three metrics must be kept in balance across ~35 card decisions drawn from a JSON pool. The game ends when a failure condition triggers or the player survives to the win condition.

---

## Tech stack

- Vite + React (no TypeScript, no Create React App)
- Zustand for state management
- react-tinder-card for swipe gesture
- Plain CSS with CSS custom properties (no Tailwind, no component libraries)
- No backend, no database — all state lives in the browser
- Deploy target: Vercel (free tier, auto-deploy from GitHub)

---

## File structure

```
src/
  components/
    CardView.jsx        — card UI only, no logic
    MetricBar.jsx       — three metric bars at top of screen
    SwipeHandler.jsx    — wraps react-tinder-card, calls makeChoice
    AdvisorAvatar.jsx   — advisor name, role, quote
    ScienceBit.jsx      — "Did you know?" overlay after each choice
    EndScreen.jsx       — win/lose screen with personalised summary
  game/
    deckManager.js      — shuffle pool, draw next card, manage chain queue
    metricEngine.js     — apply effects, check thresholds, passive heat rise
    triggerChecker.js   — inject trigger cards when metrics cross thresholds
  data/
    cards.json          — all regular cards (start as empty array)
    triggers.json       — threshold-fired cards (start as empty array)
    chains.json         — consequence cards (start as empty array)
    endings.json        — win/lose screen content
  store/
    gameStore.js        — Zustand store
  App.jsx
  main.jsx
  index.css
```

---

## CSS custom properties (define at :root in index.css)

```css
--heat-color: #C45B0A;
--money-color: #633806;
--happiness-color: #3C3489;
--bg: #ffffff;
--bg2: #f5f5f4;
--border: #e2e2e0;
--text: #1a1a18;
--text2: #5f5e5a;
--radius: 12px;
```

Never hardcode colours anywhere. Always use these variables.

---

## Card JSON schema

Every card in cards.json must follow this exact shape:

```json
{
  "id": "unique-kebab-case-id",
  "category": "green | surfaces | water | buildings | crisis",
  "situation": "The decision text shown to the player.",
  "advisor": {
    "name": "Character name",
    "role": "Their role or relationship to the issue",
    "quote": "What they say to frame the decision."
  },
  "choices": {
    "left": {
      "label": "Short action label",
      "effects": { "heat": 0, "money": 0, "happiness": 0 }
    },
    "right": {
      "label": "Short action label",
      "effects": { "heat": 0, "money": 0, "happiness": 0 }
    }
  },
  "scienceBit": "Did you know? One concrete scientific fact tied to this decision.",
  "chain": { "left": null, "right": null },
  "trigger": null
}
```

Effects are integers from -3 to +3.
For heat: negative = cooling = good. Positive = warming = bad.
chain values are card IDs to inject into the deck after this card is played (or null).
trigger cards use the same schema but live in triggers.json and have a threshold field instead of chain.

---

## Metric system (metricEngine.js)

Three metrics, all integers 0–100:

| Metric    | Start | Bad when | Notes |
|-----------|-------|----------|-------|
| heat      | 37    | high     | represents +1.5°C on a +1 to +4°C scale |
| money     | 65    | low      | city budget |
| happiness | 60    | low      | resident trust |

**Applying effects:** `metric += effect * 8`. Clamp all values to 0–100.

**Passive heat rise:** Every 3 cards played, heat increases by +4 automatically, regardless of player choices. This simulates background climate change and must happen even if the player is making good decisions.

**Export these functions:**
```js
applyEffects(state, effects)  // returns new state
checkFailure(state)           // returns null | 'heat' | 'money' | 'happiness'
checkWin(state, cardCount)    // returns boolean
```

---

## Failure and win conditions

- `heat >= 100` → gameStatus: 'lost-heat'
- `money <= 0` → gameStatus: 'lost-money'
- `happiness <= 0` → gameStatus: 'lost-happiness'
- `cardCount >= 35 AND heat < 70` → gameStatus: 'won'

---

## Deck manager (deckManager.js)

- Shuffle cards.json pool on init using Fisher-Yates
- Draw one card at a time
- Maintain a chainQueue array — chain card IDs are prepended to this queue and drawn next
- Trigger cards bypass the queue and are injected immediately when thresholds are crossed

**Export:**
```js
initDeck(cards)                    // returns deckState
drawNext(deckState, chainQueue)    // returns { card, newDeckState }
```

---

## Trigger checker (triggerChecker.js)

Check after every card. Each trigger fires only once per game (track in playedTriggers):

- heat > 75 → inject card with id 'trigger-heatwave'
- money < 20 → inject card with id 'trigger-austerity'
- happiness < 20 → inject card with id 'trigger-protest'

**Export:**
```js
checkTriggers(state, playedTriggers)  // returns triggerCardId | null
```

---

## Zustand store shape (gameStore.js)

```js
{
  // Metrics
  heat: 37,
  money: 65,
  happiness: 60,

  // Deck
  deck: [],
  chainQueue: [],
  cardCount: 0,
  playedTriggers: [],

  // Current state
  currentCard: null,
  gameStatus: 'playing', // 'playing' | 'won' | 'lost-heat' | 'lost-money' | 'lost-happiness'

  // For end screen
  history: [], // [{ cardId, choice, effectsApplied }]
}
```

**Actions:**
```js
initGame()         // shuffle deck, draw first card, reset all state to start values
makeChoice(dir)    // 'left' | 'right'
                   // 1. apply effects
                   // 2. push to history
                   // 3. increment cardCount
                   // 4. apply passive heat rise if cardCount % 3 === 0
                   // 5. check triggers → prepend to chainQueue if triggered
                   // 6. draw next card
                   // 7. check win/failure → update gameStatus
```

---

## Component behaviour

**MetricBar.jsx**
- Sticky at top of screen
- Three bars: heat, money, happiness
- Heat bar label shows °C value (map 0–100 to +1.0–+4.0°C), not percentage
- Bars animate on change (CSS transition 0.4s ease)
- Flash red briefly if a metric drops
- Pulse orange on heat if passive rise triggers

**CardView.jsx**
- Category badge (coloured pill)
- Situation text
- Advisor section: name + role heading, quote in italics with left border
- Two choice buttons side by side (left choice / right choice)
- Science bit at bottom separated by a divider

**SwipeHandler.jsx**
- Uses react-tinder-card
- Card tilts up to 15deg as player drags
- Choice label fades in as overlay as tilt increases
- Triggers makeChoice on release past 40% screen width
- Card flies off in swipe direction
- Next card visible underneath at scale 0.97, scales to 1.0 as top card leaves

**ScienceBit.jsx**
- Full-screen overlay, appears after choice is made
- Shows the scienceBit text from the card just played
- Auto-dismisses after 2 seconds, then next card slides in

**EndScreen.jsx**
- Full-screen, fades in over game
- Content varies by gameStatus (see ending content below)
- Shows last 3 decisions from history: situation (truncated 60 chars), choice made, net heat effect
- Single "Play again" button calls initGame()

---

## End screen content

**lost-heat — "The Uninhabitable City"** 🌡️ (orange theme)
> Summers became unliveable. Businesses left, schools ran shortened years, and elderly residents were evacuated every July.
> Science: Above +4°C, summer wet-bulb temperatures regularly exceed the threshold where the human body cannot cool itself, even in the shade.

**lost-money — "Austerity Spiral"** 💰 (gold theme)
> The city ran out of money to respond to heat emergencies. Each heatwave cost lives because there was no budget for cooling centres.
> Science: Every €1 spent on heat adaptation saves an estimated €6 in emergency response and health costs.

**lost-happiness — "Political Collapse"** 😊 (purple theme)
> Residents lost faith. A populist opposition won the election and scrapped all your climate policies. Your progress was reversed in one term.
> Science: Climate scientists call this the social licence problem — even correct policy fails without public trust.

**won — "The Resilient City"** ✅ (green theme)
> You reached 2040 with the city still liveable. It was not easy — but you proved that acting on the science, spending wisely, and bringing people along are not in conflict.
> Science: Cities that invested in heat resilience before 2030 are projected to save 4x more lives per degree of warming than those that waited.

---

## Mobile requirements

- Max card width: 420px, centred
- Optimised for 390px viewport (iPhone 14)
- No scroll bounce: `overscroll-behavior: none` on body
- No text selection during swipe: `user-select: none` on card
- Tap targets minimum 44px tall
- Test on a real device, not just browser DevTools

---

## Placeholder cards for initial testing

Add these 5 cards to cards.json to make the game loop testable before real content is written:

```json
[
  {
    "id": "test-park",
    "category": "green",
    "situation": "A city car park could be converted into a pocket park.",
    "advisor": { "name": "Priya", "role": "Local shop owner", "quote": "Losing 80 parking spaces will kill footfall for my shop." },
    "choices": {
      "left": { "label": "Keep car park", "effects": { "heat": 2, "money": 1, "happiness": 0 } },
      "right": { "label": "Build the park", "effects": { "heat": -2, "money": -1, "happiness": 2 } }
    },
    "scienceBit": "Did you know? A single mature tree cools the air as much as 10 air conditioning units running for 20 hours a day.",
    "chain": { "left": null, "right": null },
    "trigger": null
  },
  {
    "id": "test-pavement",
    "category": "surfaces",
    "situation": "The main road needs resurfacing. Standard black asphalt or cool light-coloured pavement?",
    "advisor": { "name": "Dev", "role": "Local business owner", "quote": "Cool pavement costs 30% more. I'd rather spend that on the hospital." },
    "choices": {
      "left": { "label": "Standard asphalt", "effects": { "heat": 2, "money": 1, "happiness": 0 } },
      "right": { "label": "Cool pavement", "effects": { "heat": -2, "money": -1, "happiness": 1 } }
    },
    "scienceBit": "Did you know? Dark surfaces reach 70°C on hot days and keep radiating heat for hours after sunset. Light surfaces stay up to 30°C cooler.",
    "chain": { "left": null, "right": null },
    "trigger": null
  },
  {
    "id": "test-river",
    "category": "water",
    "situation": "The buried river running under the city could be daylighted.",
    "advisor": { "name": "City Engineer", "role": "Infrastructure", "quote": "Bringing the river back up would cost millions and take three years." },
    "choices": {
      "left": { "label": "Leave it buried", "effects": { "heat": 1, "money": 2, "happiness": 0 } },
      "right": { "label": "Daylight the river", "effects": { "heat": -3, "money": -3, "happiness": 2 } }
    },
    "scienceBit": "Did you know? Cities with rivers can be 2–3°C cooler in a 300m corridor. Seoul daylighted a buried river in 2005 — it is now one of the coolest areas in the city.",
    "chain": { "left": null, "right": null },
    "trigger": null
  },
  {
    "id": "test-retrofit",
    "category": "buildings",
    "situation": "Social housing residents are reporting dangerously hot flats.",
    "advisor": { "name": "Sofia", "role": "Housing rights activist", "quote": "These are the most vulnerable people in the city. We have to act now." },
    "choices": {
      "left": { "label": "Send portable fans", "effects": { "heat": 0, "money": -1, "happiness": 1 } },
      "right": { "label": "Full retrofit", "effects": { "heat": -2, "money": -3, "happiness": 3 } }
    },
    "scienceBit": "Did you know? Poorly ventilated flats can be 8–10°C hotter than outside during a heatwave. The elderly and children are most at risk — this is called the heat equity gap.",
    "chain": { "left": null, "right": null },
    "trigger": null
  },
  {
    "id": "test-heatwave",
    "category": "crisis",
    "situation": "A record heatwave hits. Schools are asking if they should close.",
    "advisor": { "name": "School Network Director", "role": "Education", "quote": "Close them and working parents are stranded. Keep them open and kids collapse." },
    "choices": {
      "left": { "label": "Keep schools open", "effects": { "heat": 0, "money": 1, "happiness": -2 } },
      "right": { "label": "Emergency closure", "effects": { "heat": 0, "money": -2, "happiness": 2 } }
    },
    "scienceBit": "Did you know? Children's bodies overheat faster than adults — they produce more heat relative to their size and sweat less efficiently.",
    "chain": { "left": null, "right": null },
    "trigger": null
  }
]
```

---

## Build order

1. Scaffold the project (Vite + React, install dependencies, create all files as stubs, push to GitHub)
2. MetricBar + CardView with hardcoded data — test on mobile
3. Zustand store + game logic (deckManager, metricEngine, triggerChecker)
4. Wire components to store — full loop working with placeholder cards
5. Swipe feel and ScienceBit overlay
6. EndScreen
7. Load real card content when ready

Commit after every phase that works.
