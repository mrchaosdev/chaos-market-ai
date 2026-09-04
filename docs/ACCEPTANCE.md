# Chaos Market AI — V1 Acceptance Checklist

## 1. Product workflow

- [ ] Landing explains product through real agent-run visual.
- [ ] `/app/agent` accepts command-style input.
- [ ] `Analyze BTC on 4H` runs end-to-end.
- [ ] Agent trace displays real executed workflow steps.
- [ ] Result renders evidence before AI prose.
- [ ] Entry analysis never says buy/sell.

## 2. Market data

- [ ] `MarketDataProvider` boundary is used everywhere.
- [ ] Binance public adapter returns normalized types. *(MCP adapter deferred — no runtime exists yet; see `docs/TODO.md` §4.)*
- [ ] No Binance response shapes leak into UI/workflows.
- [ ] Market data errors return domain error codes.
- [ ] No silent production fallback to mock prices.

## 3. Deterministic analytics

- [ ] EMA20 is implemented and tested.
- [ ] EMA50 is implemented and tested.
- [ ] RSI is implemented and tested.
- [ ] ATR is implemented and tested.
- [ ] Volume state is implemented and tested.
- [ ] Support/resistance is deterministic.
- [ ] Signal score is deterministic and tested.
- [ ] Signal alignment is never described as probability.

## 4. AI layer

- [ ] `AIProvider` boundary is used.
- [ ] AI input is compact structured context.
- [ ] AI output validates against Zod.
- [ ] AI never computes indicators.
- [ ] AI never invents missing market data.
- [ ] AI never guarantees returns.

## 5. Persistence

- [ ] Drizzle schema covers runs/tool calls/results/feedback.
- [ ] `DATABASE_URL` is server-only.
- [ ] Runs persist after successful workflow.
- [ ] Tool calls persist sanitized input/output summaries.
- [ ] Feedback can be captured.
- [ ] No secrets are logged or persisted.

## 6. Evaluation

- [ ] Router eval covers overview/analyze/compare/entry/unknown.
- [ ] Tool eval covers required tools per workflow.
- [ ] Schema eval validates AI output.
- [ ] Safety eval rejects buy/sell instruction language.
- [ ] Missing-data eval returns reliability warning.

## 7. UI/design

- [ ] Palette uses Happy Hues Palette 13 tokens.
- [ ] Raw colors appear only in central token CSS.
- [ ] No arbitrary Tailwind palette classes in components.
- [ ] No chatbot bubbles.
- [ ] No giant centered prompt box.
- [ ] No AI orb/robot/brain/sparkle identity.
- [ ] No default shadcn dashboard look.
- [ ] No Binance clone.
- [ ] Chart uses token colors.
- [ ] Motion respects reduced-motion.
- [ ] Mobile hierarchy follows market → metrics → chart → signal → evidence → interpretation.

## 8. Verification

- [ ] `npm run test` passes.
- [ ] `npm run lint` passes.
- [ ] `npm run build` passes.
- [ ] Dependency audit reviewed.
