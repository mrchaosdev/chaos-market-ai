# Chaos Market AI — Submission Video Script

**Binance Agent OS Mini Hackathon, Track A.**

Written for **3:00**, with every beat marked `[CUT FIRST]` removable to land under
**2:00** without losing the argument. Recorded at 1440×900, zoom 100%.

> **Assumption, flagged:** Binance's published spec for the submission video —
> length cap, mandatory sections, language — is not recorded in this repo. This
> script is built on what is recorded (Track A, the deliverables list) plus the
> beats hackathon judges normally look for: problem, what you built, live proof,
> why it fits the track. If the official spec differs, the fix is length and
> order, not content — the demo beats stand.

The whole video defends one claim:

> **The model never sees a number it did not measure.**

Every beat exists to make that claim visible rather than asserted.

---

## 0. Before recording

```bash
npm run dev
curl -s localhost:3000/api/health | grep -o '"ai":{[^}]*}'
```

- [ ] `marketData.reachable: true` and provider `binance-public` — the meta bar must read `BINANCE PUBLIC`, never `DEMO DATA`.
- [ ] **Decide what the meta bar will say, before rolling.** It names whichever provider actually produced the prose: `GEMINI · GEMINI-3.6-FLASH` with a working key, `LOCAL · CHAOS-DETERMINISTIC` without one or when the key is rate-limited. Both are truthful. Pick your story rather than discovering it on camera.
- [ ] Run one warm-up analysis. A live cloud call adds roughly five seconds — not dead air, the trace streams underneath it, but know it is coming.
- [ ] `DATABASE_URL` set if you want the persistence row to read `SAVED`.
- [ ] Hard reload `/` so the landing workflow runs fresh.
- [ ] Close the dev-tools panel and any extension bar.

---

## 1. The problem — 0:00 to 0:20

**Show:** `/` (landing), still.

> Ask a language model what Bitcoin is doing and it will tell you — fluently,
> confidently, and without having looked. It has no market data. It is
> autocompleting the shape of an answer.
>
> Chaos Market AI inverts the order. Data first. Deterministic calculation
> second. The model last, and only to explain what was already measured.

---

## 2. This page is not a mockup — 0:20 to 0:40

**Do:** scroll slightly so the execution trace and the pulse sphere are both visible.

> This landing page ran a real Binance workflow when it loaded. On the right is
> that run's own trace. The sphere is the market's pulse — its rate comes from
> the measured volatility class, its amplitude from signal alignment. Nothing
> here is decoration, and nothing here is a placeholder.

---

## 3. The agent, and the trace — 0:40 to 1:30

**Do:** click **Run Analysis** → `/app/agent`. Type `Analyze BTC on 4H`, Enter.

The panel opens on **Execution** while the run is in flight and switches itself
to **Output** when it finishes. Let it happen; do not touch anything.

> The command is routed to a deterministic workflow, not handed to a chatbot.
> These rows are not a progress animation — each one appears when that step
> actually completed, with its real latency.
>
> Four read-only Binance calls: ticker, candles, funding rate, order book. Then
> the indicator engine — EMA, RSI, ATR. Then market structure. Then the signal
> engine.
>
> The model is the last step. By the time it runs, every number already exists.

**Do:** click back to the **Execution** tab so the finished trace is on screen.

**Point at the meta bar:**

> This line names the data provider and the exact model. If the model fails, or
> writes a number that is not in the context it was given, the run degrades to a
> deterministic interpretation, the bar says so, and the trace records why.

`[CUT FIRST]` — if the bar reads `LOCAL` because the key is rate-limited, do not
re-record. Point at it: *"and that is the degradation, live."* A demo that shows
its own failure path beats a fourth take that got lucky.

---

## 4. Evidence before prose — 1:30 to 2:05

**Do:** scroll the Output panel.

> Evidence first. Price against EMA20 and EMA50. RSI classifying momentum. ATR
> classifying volatility. Funding. Order-book depth. Then, underneath, the
> model's paragraph.
>
> Signal alignment reads [live number] out of 95 — ninety-five, not a hundred.
> That is the real ceiling of the six component weights listed right below it.
> The app shows the honest scale instead of rounding it up to look tidy. And it
> is labelled "not a probability", because it is agreement between weighted
> components, not a forecast.
>
> The chart overlays the same EMAs and the same support and resistance the
> engine computed. The chart and the prose cannot contradict each other, because
> they are reading the same numbers.

---

## 5. Not one asset, not one workflow — 2:05 to 2:30

**Do:** click the preset chips, ~4s each.

| Chip | Line |
|---|---|
| `Compare BTC and ETH on 4H` | "Both assets run the full pipeline, then normalise into comparable measured dimensions — each with a real leader, not a tie." |
| `Is BTC near a good entry area?` | "Entry analysis: structure, zone, invalidation. It never says buy or sell. That is enforced by a test, not by tone." |
| `How is the market today?` | "Market regime across BTC, ETH and BNB." |

`[CUT FIRST]` **Do:** open `/app/analyze`, click **ETH**, then **SOL**.

> Nine assets, and the picker is the router's own allowlist — the same list the
> typed commands accept. Every one runs the identical pipeline.

---

## 6. The refusal — 2:30 to 2:45

**Do:** type `tell me a joke`. Enter.

> When a command does not map to a workflow, the agent says so and stops. It
> does not fall back to a general chatbot, because it has no market evidence to
> reason from. Refusing is the feature.

---

## 7. Why Track A — 2:45 to 3:00

**Show:** `/app/settings`, or hold on the header where `MODE: READ ONLY` sits.

> Track B pays twice as much and requires placing trades. This project is
> read-only by architecture — no trading keys are read, no order, cancel or
> withdrawal route exists in the codebase — so it was submitted to Track A
> deliberately, not by default.
>
> Data first. Deterministic calculation second. AI last, and never trusted with
> arithmetic.

---

## Optional appendix — only if the format allows a longer cut

**Do:** show the failure path is real, not a happy-path demo.

```bash
curl -s -X POST localhost:3000/api/analyze \
  -H 'Content-Type: application/json' \
  -d '{"symbol":"NOTAREAL"}' | jq .error
```

```json
{
  "code": "INVALID_SYMBOL",
  "message": "NOTAREALUSDT is not a listed Binance USDT-M futures symbol.",
  "hint": "The requested symbol is not listed on the Binance USDT-M futures market."
}
```

> A domain error with a partial trace. Not a generic 500, and not a placeholder
> price.

---

## Things to avoid on camera

- Do not run with `MARKET_PROVIDER=demo`. The meta bar will read `DEMO DATA` and the entire claim collapses.
- Do not say "predicts", "probability", or "chance". Say **measured**, **alignment**, **structure**.
- Do not linger on an empty history screen — set `DATABASE_URL` or skip it.
- Do not resize the window mid-take; the chart re-fits and reads as a glitch. To show the responsive layout, record a separate short take below 768px, where the nav collapses into a menu button.
- Do not re-record because the meta bar says `LOCAL`. Narrate it.

---

## If the live demo breaks

Binance blocks some regions and some cloud IPs. If market data fails on camera,
the app raises a domain error instead of inventing prices. The honest line:

> That is the failure path working. It refuses to produce analysis from
> placeholder data.

Then cut to the recorded take.
