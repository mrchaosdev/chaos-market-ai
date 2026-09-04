# Chaos Market AI — Demo Script

Target length: **2 minutes 30 seconds**. Recorded at 1440×900, dark room, no cursor trails.

The whole point of the demo is one claim: **the model never sees a number it did not measure.** Every beat below exists to make that claim visible.

---

## 0. Before recording

```bash
cp .env.example .env.local     # binance-public + local provider is enough
npm run dev
```

Checklist:

- [ ] `MARKET_PROVIDER=binance-public` — the meta bar must read `BINANCE PUBLIC`, never `DEMO DATA`.
- [ ] If you set `AI_API_KEY`, run one warm-up analysis first so the provider is not cold on camera.
- [ ] `DATABASE_URL` set if you want the persistence row to read `SAVED` instead of a warning.
- [ ] Browser at 1440×900, zoom 100%, no extensions bar.
- [ ] Hard reload `/` once so the landing workflow runs fresh.

---

## 1. Landing — 0:00 to 0:25

**Show:** `/`

**Say:**

> Most crypto AI tools ask a language model what Bitcoin is doing. The model has no market data, so it guesses, fluently.
> Chaos Market AI inverts that. This landing page is not a mockup — it ran a real Binance workflow when it loaded.

**Do:** scroll slightly to the right column so the execution stream and the market pulse are both visible.

> On the right is the actual trace of that run, and the sphere is the market's pulse: its rate comes from the volatility class, its amplitude from signal alignment. Nothing here is decoration.

---

## 2. Agent — 0:25 to 1:15

**Do:** click **Run Analysis** → `/app/agent`. Type `Analyze BTC on 4H`, press Enter.

**Say while the trace fills in:**

> The command is routed to a deterministic workflow, not to a chatbot. Watch the trace — these rows stream in as each step actually completes.
> Four read-only Binance calls: ticker, candles, funding, order book. Then the indicator engine: EMA, RSI, ATR. Then market structure, then the signal engine.
> The model is the last step, and by the time it runs, every number already exists.

**Point at the meta bar:**

> This line names the data provider and the exact model. If the model fails or invents a number that is not in the context, the run degrades to a deterministic interpretation and the trace records a warning — it never silently makes something up.

---

## 3. Evidence — 1:15 to 1:50

**Do:** scroll the result panel.

**Say:**

> Evidence before prose. Price against EMA20 and EMA50, RSI classifying momentum, ATR classifying volatility, funding, order-book depth.
> Signal alignment is 88 out of 95 — and yes, 95, not 100. That is the actual ceiling of the six component weights shown right below it, and the app says so rather than rounding the scale up to look tidy. It is labelled "not a probability", because it is agreement between weighted components, not a forecast.
> The chart overlays the same EMAs and the same support and resistance the engine computed. The chart and the prose cannot disagree, because they read the same numbers.

---

## 4. The other three workflows — 1:50 to 2:15

**Do:** click the preset chips in order, pausing ~4s each.

| Chip | One line to say |
|---|---|
| `Compare BTC and ETH on 4H` | "Both assets run the full pipeline, then normalise into comparable dimensions." |
| `Is BTC near a good entry area?` | "Entry analysis — structure, zone, invalidation. Notice it never says buy or sell. That is enforced by tests." |
| `How is the market today?` | "Market regime across BTC, ETH and BNB." |

---

## 5. The refusal — 2:15 to 2:30

**Do:** type something unrelated, e.g. `tell me a joke`. Press Enter.

**Say:**

> And when a command does not map to a workflow, the agent says so. It does not fall back to a general chatbot, because it has no market evidence to reason from.

**Close on:**

> Read-only by architecture. No trading keys, no order routes. Data first, deterministic calculation second, AI last.

---

## Optional 20-second appendix

Only if the submission allows a longer cut.

**Do:** open `/app/settings`.

> Provider, model, cache TTLs and safety posture are all visible. And to prove the failure path is real rather than a happy-path demo:

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

> A domain error with a partial trace, not a generic 500 and not a placeholder price.

---

## Things to avoid on camera

- Do not run with `MARKET_PROVIDER=demo`. The meta bar will say `DEMO DATA` and the whole claim collapses.
- Do not say "predicts", "probability", "chance", or "signal" to mean forecast. Say **alignment**, **structure**, **measured**.
- Do not linger on an empty history page — either set `DATABASE_URL` or skip the screen.
- Do not resize the window mid-take; the chart re-fits and the motion reads as a glitch.

---

## Recovery if the live demo breaks

Binance blocks some regions and some cloud IPs. If market data fails on camera, the app shows a domain error rather than fake prices — that is defensible, and the honest line is:

> That is the failure path working. It refuses to produce analysis from placeholder data.

Then switch to the recorded take.
