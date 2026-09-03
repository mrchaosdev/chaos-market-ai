# Chaos Market AI — Design System

## 1. Source of truth

### Palette source

**Happy Hues Palette 13**

Reference:
`https://www.happyhues.co/palettes/13`

Approved base palette:

```text
background / dark     #0f0e17
foreground            #fffffe
muted                 #a7a9be
primary orange        #ff8906
secondary red         #f25f4c
tertiary pink         #e53170
```

This palette is locked for V1.

The coding agent MUST NOT choose a different Happy Hues palette and MUST NOT introduce an unrelated color family without explicit approval.

---

# 2. Color usage law

Raw color literals are allowed only in the central token file: `src/styles/tokens.css`.

Raw color literals are forbidden in:

- React components
- page files
- feature CSS
- chart components
- GSAP animation definitions

Components use semantic classes/tokens only.

---

# 3. Token strategy

Base values live in one location: `src/styles/tokens.css`. `src/app/globals.css` may import this file and define Tailwind theme aliases, but it should not become a second palette source.

Recommended base:

```css
:root {
  --palette-bg: #0f0e17;
  --palette-fg: #fffffe;
  --palette-muted: #a7a9be;
  --palette-primary: #ff8906;
  --palette-secondary: #f25f4c;
  --palette-tertiary: #e53170;
}
```

Semantic values are mapped or algorithmically derived from those approved bases.

Example:

```css
:root {
  --background: var(--palette-bg);
  --foreground: var(--palette-fg);
  --muted-foreground: var(--palette-muted);

  --primary: var(--palette-primary);
  --primary-foreground: var(--palette-fg);

  --negative: var(--palette-secondary);
  --negative-foreground: var(--palette-fg);

  --highlight: var(--palette-tertiary);

  --surface: color-mix(
    in srgb,
    var(--palette-fg) 3%,
    var(--palette-bg)
  );

  --surface-raised: color-mix(
    in srgb,
    var(--palette-fg) 6%,
    var(--palette-bg)
  );

  --surface-hover: color-mix(
    in srgb,
    var(--palette-fg) 9%,
    var(--palette-bg)
  );

  --border: color-mix(
    in srgb,
    var(--palette-fg) 12%,
    transparent
  );

  --border-strong: color-mix(
    in srgb,
    var(--palette-fg) 22%,
    transparent
  );
}
```

Derived values must come from approved tokens using controlled transforms such as `color-mix`, opacity, or documented chart-specific mapping. Do not invent another raw hex value.

---

# 4. Financial semantics

Do not use product accent to imply financial direction.

### Positive market movement

V1 approves `--positive` as a semantic market token derived from the locked palette, not from a random green family. Use it only for bullish movement, successful tool execution, and healthy system state.

Recommended derivation:

```css
--positive: color-mix(in srgb, var(--palette-primary) 72%, var(--palette-fg));
--positive-muted: color-mix(in srgb, var(--positive) 62%, var(--palette-bg));
```

### Negative market movement

Use the approved secondary red semantic token for bearish movement, error, and risk.

### Important

The bot must not casually add `green-500`, `emerald-*`, `red-*`, `yellow-*`, `blue-*`, etc.

Tailwind stock palette utilities are prohibited unless mapped to the design system.

---

# 5. Typography

Primary font:

```text
Geist
```

Financial / code / changing values:

```text
Geist Mono
```

Use tabular numerals for changing market values:

```css
font-variant-numeric: tabular-nums;
```

Suggested hierarchy:

| Role | Size |
|---|---:|
| Hero | 48–72 |
| Page title | 28–32 |
| Primary market value | 28–40 |
| Body | 14–16 |
| Section label | 11–13 |
| Metadata | 11–12 |

Section labels should often be compact uppercase:

```text
MARKET STRUCTURE
SIGNAL ALIGNMENT
EVIDENCE
RISKS
ORDERBOOK
```

---

# 6. Spacing

Use a deliberate spacing scale. Do not create arbitrary one-off values per component.

Recommended product rhythm:

```text
4
8
12
16
20
24
32
40
48
64
```

Dense financial panels may use 8–16.

Large working regions use 24–40.

---

# 7. Radius

Default UI radius range:

```text
4px
6px
8px
```

Avoid default use of:

```text
rounded-xl
rounded-2xl
rounded-3xl
```

Larger radius is reserved for deliberate floating or marketing surfaces.

---

# 8. Borders and shadows

Hierarchy should come from:

1. spacing
2. typography
3. surface contrast
4. borders
5. shadows only when necessary

Large soft SaaS shadows and colored glows are prohibited by default.

---

# 9. Gradient

Default: no gradient.

Prohibited default gradient families:

- purple → blue
- blue → cyan
- pink → purple
- rainbow

A gradient may exist only for a specific marketing/light-falloff effect and must be documented.

---

# 10. Glassmorphism

Not part of the application design language.

Do not use frosted cards or blur-heavy dashboard surfaces.

---

# 11. Icons

Approved icon family:

```text
Lucide
```

Do not mix icon packs.

Avoid generic AI symbols as visual identity:

- Sparkles
- robot head
- brain
- magic wand
- glowing star

Prefer technical meaning:

- Activity
- Database
- Terminal
- Chart
- Search
- Clock
- Layers
- Arrow
- status indicators

---

# 12. Layout language

The app is a workspace.

Primary desktop shell:

```text
compact nav rail
+
market context header
+
large analytical canvas
```

The UI must not default to:

```text
240px SaaS sidebar
+
four KPI cards
+
bar chart
+
recent activity
```

---

# 13. Card rule

Before creating a visual card, answer:

> Does this information need an independent visual boundary?

If not, use:

- spacing
- typography
- separator
- grid
- surface shift

Do not wrap every metric in a card.

Never create nested card-on-card visual noise.

---

# 14. Approved product primitives

Build an internal visual language:

```text
ChaosPanel
ChaosSection
ChaosLabel
ChaosNumber
ChaosStatus
ChaosTrace
ChaosTraceRow
ChaosTicker
ChaosMetric
ChaosDivider
ChaosCommand
ChaosProgress
ChaosBadge
```

These components own the project identity.

---

# 15. Agent visual language

Agent is represented by process.

Preferred:

```text
CHAOS / RUN 8F31

MARKET DATA
01 Ticker          DONE
02 Candles         DONE
03 Funding         DONE
04 Orderbook       DONE

ANALYTICS
05 EMA             DONE
06 RSI             DONE
07 ATR             DONE

REASONING
08 Interpretation  RUNNING
```

Not preferred:

```text
AI is thinking...
```

Forbidden as default identity:

- chatbot bubbles
- AI orb
- avatar
- robot
- giant centered prompt
- glowing magic object

---

# 16. Animation system

Primary engine:

```text
GSAP
@gsap/react
```

Use `useGSAP()` and proper cleanup.

### GSAP is appropriate for

- agent trace sequencing
- page intro choreography
- status transitions
- result reveals
- metric sequences
- navigation transitions
- landing narrative
- ScrollTrigger on marketing pages

### CSS transition is enough for

- button hover
- input focus
- basic dropdown state
- simple opacity feedback

### Do not animate

- every card
- every row
- every price tick
- every button
- everything on hover

Motion explains state, progress, hierarchy and cause/effect.

Suggested durations:

```text
micro      120–220 ms
panel      250–450 ms
narrative  500–900 ms
```

Preferred GSAP ease vocabulary:

```text
power2.out
power3.out
power2.inOut
expo.out
```

All experiences must respect `prefers-reduced-motion`.

---

# 17. Financial chart rules

Use TradingView Lightweight Charts.

V1 requires:

- candlestick
- volume
- EMA20
- EMA50
- support
- resistance

Chart styling must consume design tokens. No independent chart palette.

Do not build a TradingView clone.

---

# 18. Responsive priorities

Support at minimum:

```text
1440
1280
1024
768
390
```

Mobile hierarchy:

```text
market context
→ key metrics
→ chart
→ signal
→ evidence
→ AI interpretation
```

Secondary content becomes collapsible rather than being squeezed into desktop layout.

---

# 19. Final visual test

Before finishing a page, test:

- Does it resemble ChatGPT?
- Does it resemble Claude?
- Does it resemble a generic AI SaaS template?
- Does it resemble default shadcn?
- Does it resemble a Binance clone?
- Is color being used as decoration rather than meaning?
- Are there too many cards?
- Is GSAP decorative instead of explanatory?
- Could this screenshot belong to any random startup?

If yes, redesign.
