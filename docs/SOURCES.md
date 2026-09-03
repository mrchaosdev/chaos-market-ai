# Chaos Market AI — Approved Sources

## 1. Design and UI sources

Use this priority order:

```text
existing project component
→ Chaos primitive
→ shadcn primitive
→ ReactUI Gray / local ChaoUi interaction concept
→ 21st.dev functional reference
→ custom component
```

---

## 2. Local ReactUI Gray source

The local source for ReactUI Gray concepts is:

```text
C:\Users\mrcha\Desktop\Genlayer\AI\ChaoUi
```

Use it for interaction concepts only:

- dot fields
- contained cursor zones
- kinetic grids
- hold interactions
- reveal patterns
- technical surfaces

Do not copy arbitrary palette, glow, glass, or large radius from ChaoUi. Normalize to Chaos tokens.

---

## 3. Color source

Locked V1 palette:

```text
Happy Hues Palette 13
https://www.happyhues.co/palettes/13
```

Raw palette values belong only in the central token file.

---

## 4. shadcn/ui

Use for accessible primitive infrastructure:

- Button
- Dialog
- Sheet
- Drawer
- Tooltip
- Popover
- Tabs
- Select
- Dropdown
- Command
- Table
- ScrollArea
- Separator
- Skeleton
- Sidebar primitives

Do not use shadcn dashboard blocks as finished visual identity.

---

## 5. 21st.dev

Use only for specific interface problems.

Approved search terms:

- market table
- financial data
- ticker
- market snapshot
- agent status
- trace
- terminal
- chart panel
- comparison
- command palette

Forbidden starting searches:

- AI dashboard
- AI chatbot
- ChatGPT UI
- Claude clone
- AI SaaS
- AI landing page

---

## 6. Chart source

Use TradingView Lightweight Charts for production charts.

V1 chart layers:

- candles
- volume
- EMA20
- EMA50
- support
- resistance

All chart colors must come from Chaos design tokens.

---

## 7. Animation source

Use GSAP and `@gsap/react` for meaningful motion.

Do not install Framer Motion, Motion, anime.js, or react-spring without explicit approval.

Motion must communicate state, progress, hierarchy, or cause/effect.

---

## 8. Icons

Use Lucide only.

Avoid generic AI identity icons:

- sparkles
- robot
- brain
- magic wand
- glowing stars
