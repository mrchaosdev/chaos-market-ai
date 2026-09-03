# Chaos Market AI — Full TODO

## 0. Fix current drift

- [ ] Replace remaining demo/static UI data with workflow output.
- [ ] Ensure palette is Happy Hues 13 only.
- [ ] Remove or clearly label all demo-only values.
- [ ] Ensure no raw colors outside `src/styles/tokens.css`.

---

## 1. Real Analyze BTC 4H workflow

- [x] Binance public read-only market provider.
- [x] Deterministic EMA / RSI / ATR / volume calculations.
- [x] Signal engine.
- [x] AI provider abstraction.
- [ ] Domain error UI for Binance failures.
- [ ] Real trace events from workflow execution.
- [ ] Persist successful run.
- [ ] Persist failed run with domain error.
- [ ] Add workflow integration test for `Analyze BTC on 4H`.

---

## 2. AI layer

- [x] OpenAI provider factory.
- [x] Gemini provider factory.
- [x] Anthropic provider factory.
- [x] Local fallback provider.
- [x] Zod schema for AI output.
- [x] Structured market context input.
- [ ] Provider-specific error handling.
- [ ] Timeout handling.
- [ ] Retry policy for transient provider errors.
- [ ] AI safety regression tests.
- [ ] Prompt eval cases.
- [ ] UI indicator showing active provider/model.
- [ ] Prevent AI prose from introducing numbers not present in context.

---

## 3. Agent system

- [x] Intent router.
- [x] Command-style UI.
- [ ] `/api/chat` should execute routed workflows, not only return intent.
- [ ] Stream workflow events.
- [ ] Show real tool events in `AgentTrace`.
- [ ] Handle unknown intent with domain-specific message.
- [ ] Add compare follow-up command.
- [ ] Add entry-analysis command.
- [ ] Add router regression tests for overview/analyze/compare/entry/unknown.

---

## 4. Market data layer

- [x] Normalized `Ticker` type.
- [x] Normalized `Candle` type.
- [x] Normalized `FundingRate` type.
- [x] Normalized `OrderBook` type.
- [x] Binance public client.
- [x] Binance Zod schemas.
- [x] Binance mapper tests.
- [ ] Binance MCP / Agent OS adapter when runtime is available.
- [ ] Memory cache with TTL.
- [ ] Invalid symbol handling.
- [ ] Rate-limit handling in UI.
- [ ] Network unavailable handling in UI.
- [ ] Split support/resistance into dedicated module.
- [ ] Add provider integration test with mocked fetch.

---

## 5. Deterministic analytics

- [x] EMA implementation.
- [x] RSI implementation.
- [x] ATR implementation.
- [x] Volume change implementation.
- [x] Market structure implementation.
- [x] Signal engine implementation.
- [ ] Improve RSI calculation with smoothing.
- [ ] Add support/resistance tests.
- [ ] Add volatility classification tests.
- [ ] Add signal component weighting tests.
- [ ] Ensure signal alignment is never described as probability.

---

## 6. UI / product screens

- [x] Landing page.
- [x] `/app/agent` screen.
- [x] `/app/analyze` screen.
- [x] App shell.
- [x] Compact nav rail.
- [x] Market context header.
- [x] Chaos primitives baseline.
- [ ] Polish `/app/overview`.
- [ ] Polish `/app/compare`.
- [ ] Build `/app/entry` or entry-analysis surface.
- [ ] Build domain error components.
- [ ] Add real TradingView Lightweight Charts component.
- [ ] Add chart overlays: EMA20, EMA50, support, resistance.
- [ ] Add volume chart layer.
- [ ] Add GSAP sequencing for trace/result reveal.
- [ ] Respect reduced motion for all animation.
- [ ] Mobile layout pass at 390px.
- [ ] Tablet layout pass at 768px.
- [ ] Desktop layout pass at 1024/1280/1440px.

---

## 7. Database / persistence

- [x] Drizzle schema.
- [x] DB factory.
- [ ] Generate migrations.
- [ ] Implement `saveAnalysisRun`.
- [ ] Persist tool calls.
- [ ] Persist analysis result.
- [ ] Persist AI output.
- [ ] Persist workflow errors.
- [ ] Add feedback API.
- [ ] Add feedback UI.
- [ ] Wire history page to DB.
- [ ] Add DB query tests.
- [ ] Add local setup instructions for PostgreSQL.

---

## 8. Evaluation and testing

- [x] Indicator tests.
- [x] Signal engine test.
- [x] Binance mapper test.
- [x] Local AI provider test.
- [ ] Workflow integration test.
- [ ] Router eval runner.
- [ ] Tool correctness eval runner.
- [ ] AI schema eval runner.
- [ ] Safety eval runner.
- [ ] Missing-data eval case.
- [ ] Invalid-symbol eval case.
- [ ] Playwright demo flow test.
- [ ] Playwright responsive screenshots.

---

## 9. Documentation

- [x] `docs/SKILL.md`.
- [x] `docs/PROJECT.md`.
- [x] `docs/DESIGN_SYSTEM.md`.
- [x] `docs/ARCHITECTURE.md`.
- [x] `docs/AGENT.md`.
- [x] `docs/DATABASE.md`.
- [x] `docs/ROADMAP.md`.
- [x] `docs/SOURCES.md`.
- [x] `docs/ACCEPTANCE.md`.
- [x] `docs/TODO.md`.
- [ ] Update README with real AI setup.
- [ ] Update README with Binance data setup.
- [ ] Update README with demo flow.
- [ ] Add deployment notes.

---

## 10. Security / safety

- [x] V1 is read-only by architecture.
- [ ] Verify no trading API routes exist.
- [ ] Verify no private Binance keys are required.
- [ ] Verify no secrets are exposed through `NEXT_PUBLIC_*`.
- [ ] Verify no secrets are logged.
- [ ] Add safety tests against buy/sell language.
- [ ] Add domain disclaimer in relevant analysis outputs.

---

## 11. Dependency / audit

- [x] Required AI provider SDKs installed.
- [x] GSAP installed.
- [x] Lucide installed.
- [x] Lightweight Charts installed.
- [x] Drizzle installed.
- [x] Vitest installed.
- [ ] Review remaining `drizzle-kit` dev audit warning.
- [ ] Avoid installing non-approved UI libraries.
- [ ] Avoid adding another animation framework.

---

## 12. Hackathon submission

- [ ] Confirm Binance hackathon track.
- [ ] Confirm final demo workflow.
- [ ] Prepare demo script.
- [ ] Record video: landing → agent → trace → evidence.
- [ ] Deploy to Vercel.
- [ ] Verify production env vars.
- [ ] Add final GitHub README.
- [ ] Submit GitHub URL.
- [ ] Submit demo URL/video.
- [ ] Complete Binance survey.

---

## Current priority order

1. Real trace events from workflow execution.
2. Domain error UI for Binance/API failures.
3. Real `/api/chat` workflow execution.
4. Persistence for runs/tool calls/results.
5. TradingView chart integration.
6. Compare workflow polish.
7. Evaluation runners.
8. Final deployment/demo submission.
