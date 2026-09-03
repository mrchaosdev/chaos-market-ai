# Chaos Market AI — Mandatory Coding Agent Skill

> This file contains hard constraints. Read before editing the project.

---

## 1. Mandatory reading order

Before substantial implementation, read these files in order:

1. `docs/PROJECT.md`
2. `docs/DESIGN_SYSTEM.md`
3. `docs/ARCHITECTURE.md`
4. `docs/AGENT.md`
5. `docs/DATABASE.md`
6. `docs/ROADMAP.md`
7. `docs/SOURCES.md`
8. `docs/ACCEPTANCE.md`

Existing project code and these docs take precedence over external examples.

---

## 2. Prime directive

Chaos Market AI must remain:

```text
FINANCIAL
TECHNICAL
EVIDENCE-FIRST
EXPERIMENTAL BUT RESTRAINED
PROCESS-ORIENTED
```

Do not turn it into:

- generic AI app
- chatbot template
- Binance clone
- generic shadcn dashboard
- purple/blue AI SaaS
- auto-trading system

---

## 3. Design law

The V1 palette is locked to Happy Hues Palette 13.

Raw colors are allowed only in the central token CSS:

```text
src/styles/tokens.css
```

Components, routes and feature CSS must use semantic tokens/classes only.

Forbidden in components/pages:

- HEX / RGB / HSL / OKLCH literals
- arbitrary Tailwind palette colors
- random gradients
- ad hoc green/red/yellow/blue classes

---

## 4. UI source order

```text
existing project component
→ Chaos primitive
→ shadcn primitive
→ ReactUI Gray / local ChaoUi interaction concept
→ 21st.dev functional reference
→ custom component
```

The local ReactUI Gray/ChaoUi source is documented in `docs/SOURCES.md`.

---

## 5. Agent law

Chaos Agent is represented by:

- command intent
- workflow selection
- tool execution
- analytics state
- signal generation
- evidence result

Not by:

- chat bubbles
- AI avatar
- orb
- robot
- brain
- giant prompt homepage
- hidden chain-of-thought

---

## 6. Market data law

Market values must come from:

```text
MarketDataProvider
→ normalized types
→ deterministic analytics
```

The LLM never generates prices, indicator values, levels, or signal score.

No Binance-specific response shape may leak past the adapter.

---

## 7. Workflow law

Known intents map to deterministic workflows:

- `MARKET_OVERVIEW`
- `ANALYZE_ASSET`
- `COMPARE_ASSETS`
- `ENTRY_ANALYSIS`

The agent routes. The workflow orchestrates. The AI explains.

---

## 8. Read-only V1

Do not add:

- trading API keys
- trade permissions
- order routes
- `placeOrder`
- `cancelOrder`
- buy/sell execution
- withdrawal

without an explicit post-V1 product phase.

---

## 9. AI output law

AI output must be structured and validated with Zod.

Do not parse arbitrary markdown as application state.

The AI must not:

- invent missing market data
- guarantee returns
- describe signal alignment as probability
- tell the user to buy or sell

---

## 10. Motion law

Use GSAP / `@gsap/react` for meaningful sequencing and reveal motion.

Respect `prefers-reduced-motion`.

Do not install another motion framework without explicit approval.

---

## 11. Implementation quality

- Avoid `any`.
- Prefer explicit types and discriminated unions.
- Prefer Server Components.
- Use Client Components only for browser-only needs.
- Keep components/workflows focused.
- Run tests, lint and build before finishing.
- Extend evals when routing, prompts, schemas, signals, or safety rules change.

---

## 12. Final self-check

Before marking work complete, verify:

- no raw colors outside token CSS
- no generic AI/chatbot visuals
- no fake production market data
- no fake technical logs/traces unless labeled demo
- no trading behavior
- evidence appears before AI prose
- domain errors are specific
- tests/lint/build pass
