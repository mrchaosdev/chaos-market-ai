# Chaos Market AI — Mandatory Coding Agent Skill

> This file contains hard constraints. Read before editing the project.

---

# 1. Prime directive

Do not turn Chaos Market AI into a generic AI application.

The product identity is:

```text
FINANCIAL
TECHNICAL
EVIDENCE-FIRST
EXPERIMENTAL BUT RESTRAINED
PROCESS-ORIENTED
```

The application must not visually or architecturally drift into a chatbot template.

---

# 2. Mandatory reading order

Before substantial implementation, read:

1. `PROJECT.md`
2. `DESIGN_SYSTEM.md`
3. `ARCHITECTURE.md`
4. `AGENT.md`
5. `DATABASE.md`
6. `ROADMAP.md`
7. `SOURCES.md`

Existing project code takes precedence over external examples.

---

# 3. No invented color

## Forbidden

Do not introduce raw:

- HEX
- RGB
- HSL
- OKLCH
- arbitrary Tailwind palette classes

inside feature/components/pages.

Examples of forbidden component styling:

```tsx
className="bg-[#151515]"
className="text-purple-400"
className="border-zinc-800"
className="from-purple-600 to-cyan-500"
```

Colors come only from the locked design-token system based on Happy Hues Palette 13.

If a new semantic color is genuinely required, stop and add it deliberately to the central design system rather than inventing it locally.

---

# 4. Do not invent a second palette

The V1 palette is locked.

Do not:

- switch Happy Hues palette
- introduce Binance yellow as an ad hoc brand color
- create a purple/blue AI theme
- add neon cyan because the app is technical
- add random green/red Tailwind shades

---

# 5. UI source order

Use this hierarchy:

```text
existing project component
→ Chaos primitive
→ shadcn primitive
→ ReactUI Gray interaction concept
→ 21st.dev functional reference
→ custom component
```

Do not pull unrelated components from random libraries.

Approved references are defined in `SOURCES.md`.

---

# 6. shadcn is primitive infrastructure, not identity

Allowed:

- Button
- Tooltip
- Dialog
- Sheet
- Drawer
- Tabs
- Select
- Dropdown
- Command
- Table
- ScrollArea
- Separator
- Skeleton
- Sidebar primitives

Forbidden workflow:

```text
install shadcn dashboard block
→ change logo
→ ship
```

Any block/reference must be visually normalized to Chaos.

---

# 7. Generic AI UI is prohibited

Do not create these patterns by default:

- giant centered prompt input
- "How can I help you today?"
- user/assistant chat bubbles
- ChatGPT clone
- Claude clone
- Gemini clone
- AI orb
- robot avatar
- brain icon identity
- magic wand identity
- Sparkles icon everywhere
- blue-purple gradient
- glassmorphism AI cards
- giant glowing hero blob

Chaos Agent is represented by execution, tools, state and evidence.

---

# 8. Agent UI = execution trace

Preferred hierarchy:

```text
USER INTENT
→ WORKFLOW
→ MARKET DATA
→ ANALYTICS
→ SIGNAL
→ AI INTERPRETATION
→ RESULT
```

Show real status events:

```text
01 getTicker       DONE
02 getKlines       DONE
03 getFundingRate  DONE
04 EMA             DONE
05 RSI             DONE
06 Interpretation  RUNNING
```

Do not display hidden chain-of-thought.

Do not fake technical steps that did not execute.

---

# 9. No fake technical decoration

Forbidden unless explicitly marked demo/mock:

- fake terminal commands
- fake server logs
- fake latency
- fake market values
- meaningless hex dumps
- binary decoration
- fake API calls
- fake tool traces

Technical UI must correspond to real app state whenever possible.

---

# 10. Card discipline

Do not wrap every section in `<Card>`.

Before adding a card, ask whether independent visual containment is necessary.

Prefer:

- whitespace
- typography
- separators
- grid
- surface contrast
- alignment

Nested cards are strongly discouraged.

---

# 11. Shape discipline

Default radius is restrained: 4–8px.

Do not scatter:

```text
rounded-xl
rounded-2xl
rounded-3xl
```

throughout the financial workspace.

Do not use large SaaS shadows or colored glow shadows.

---

# 12. Gradient / glass rules

Default gradient: none.

Default glassmorphism: none.

Any exception needs a clear visual purpose and should normally remain on the marketing surface, not the analytical workspace.

---

# 13. Icons

Use Lucide.

Do not mix icon packs.

Avoid generic AI-icon language unless semantically necessary.

---

# 14. Animation

Primary animation engine:

```text
GSAP
@gsap/react
```

Use `useGSAP()` and cleanup correctly.

Do not install:

- Framer Motion / Motion
- anime.js
- react-spring

without explicit approval.

Use GSAP for:

- execution sequencing
- panel/result reveal
- navigation transition
- landing choreography
- marketing ScrollTrigger

Use CSS for ordinary hover/focus transitions.

Do not animate every element.

Respect `prefers-reduced-motion`.

---

# 15. Market values cannot come from the LLM

All values such as:

- price
- volume
- funding
- RSI
- EMA
- ATR
- support
- resistance
- signal score

must come from provider or deterministic code.

The LLM explains supplied values.

---

# 16. Indicators are deterministic

Never send a prompt asking the LLM to calculate RSI/EMA/ATR.

Implement and test domain functions.

---

# 17. Provider boundaries

Do not spread Binance-specific response shapes around the app.

Use:

```text
MarketDataProvider
→ BinanceMCPAdapter
→ normalized domain types
```

UI/workflow/analytics consume normalized types.

---

# 18. AI provider boundaries

Do not scatter direct provider SDK calls through routes/components.

Use:

```text
AIProvider
→ provider implementation
```

so cloud/local models can be swapped later.

---

# 19. Structured output

AI output must validate against schemas.

Do not parse arbitrary markdown for application state.

Use Zod.

---

# 20. Known workflows are deterministic

Known intents map to defined workflows.

Do not create one unrestricted agent that improvises all domain operations.

The agent routes. The workflow orchestrates.

---

# 21. Read-only V1

Do not add:

- trade permission
- order APIs
- placeOrder
- cancelOrder
- buy/sell execution
- withdrawal

without an explicit new product phase.

---

# 22. TypeScript quality

Avoid `any`.

Prefer:

- explicit types
- schemas
- discriminated unions
- exhaustive switches
- pure functions
- adapter boundaries

If `any` is unavoidable, document why.

---

# 23. Component boundaries

Avoid giant files.

Guideline:

```text
React component < ~250 lines
workflow < ~300 lines
```

When larger, split by responsibility, not arbitrary line count.

---

# 24. Server/client boundary

Prefer Server Components.

Use `"use client"` only for real browser needs such as:

- interaction
- state
- chart
- GSAP
- streaming event presentation

Do not mark the whole app client-side.

---

# 25. No production mock leakage

Mock fixtures belong in test/demo-specific locations.

Do not silently fall back to fake BTC values in a production workflow when Binance fails.

Return a domain error.

---

# 26. Error quality

Do not render:

```text
Something went wrong.
```

when the domain knows what failed.

Prefer:

```text
BINANCE MARKET DATA UNAVAILABLE

Could not retrieve BTCUSDT 4H candles.
Retry analysis.
```

---

# 27. Loading quality

Primary agent loading state must expose real workflow status.

Do not hide the entire process behind a spinner.

Skeletons are fine for initial static layout loading.

Do not combine spinner + skeleton + shimmer + animated text for the same state.

---

# 28. Copy style

UI copy is:

- short
- technical
- neutral
- domain-specific

Avoid generic AI words:

- Magic
- Smart
- AI Powered
- Ask AI
- Unlock insights

Prefer:

- Inspect Market
- Run Analysis
- Compare Markets
- Inspect Evidence
- Re-run

---

# 29. Accessibility

Every interactive screen must consider:

- keyboard
- visible focus
- semantic HTML
- ARIA where needed
- contrast
- reduced motion

Experimental visuals may not reduce usability.

---

# 30. Responsive requirement

At minimum test:

```text
1440
1280
1024
768
390
```

Do not shrink desktop blindly.

Mobile prioritizes:

```text
context
→ metrics
→ chart
→ signal
→ evidence
→ interpretation
```

---

# 31. External component adaptation

Anything copied from a source must be normalized to:

- Chaos tokens
- Chaos typography
- Chaos spacing
- Chaos radius
- Lucide
- GSAP policy

Do not retain a source component's arbitrary colors, icon pack or motion dependency.

---

# 32. Dependency gate

Before installing a package, answer:

1. Does an existing dependency solve this?
2. Does shadcn primitive solve this?
3. Can it be implemented simply?
4. Will this package become a long-term dependency?
5. Does it violate `SOURCES.md` or motion rules?

Do not install a library for one attractive component.

---

# 33. Evaluation is part of AI development

When changing routing, prompt, signal schema or AI output:

- run/extend eval cases
- preserve known good behavior
- add a regression case for bugs fixed

Prompt editing without evaluation is incomplete.

---

# 34. Database / logging

Do not log secrets.

Persist normalized useful tool data, not credentials.

Record run/model/version/latency for evaluation.

---

# 35. Final UI self-check

Before finishing a screen ask:

```text
Does this look like ChatGPT?
Does this look like Claude?
Does this look like default shadcn?
Does this look like Binance?
Does this look like generic SaaS?
Does this use arbitrary colors?
Does this have too many cards?
Does the motion communicate state?
Is every technical visual real?
```

If the answer exposes generic drift, redesign.

---

# 36. Final implementation law

When choosing between:

```text
flashy generic component
```

and:

```text
simpler component with stronger Chaos identity
```

choose Chaos identity.

When choosing between:

```text
AI-generated calculation
```

and:

```text
deterministic code
```

choose deterministic code.

When choosing between:

```text
five unfinished features
```

and:

```text
one excellent end-to-end workflow
```

choose the complete workflow.
