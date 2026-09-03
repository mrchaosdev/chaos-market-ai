# Chaos Market AI — Full TODO

## 0. Fix current drift

- [x] Replace remaining demo/static UI data with workflow output.
- [x] Ensure palette is Happy Hues 13 only.
- [x] Remove or clearly label all demo-only values.
- [x] Ensure no raw colors outside `src/styles/tokens.css`.

---

## 1. Real Analyze BTC 4H workflow

- [x] Binance public read-only market provider.
- [x] Deterministic EMA / RSI / ATR / volume calculations.
- [x] Signal engine.
- [x] AI provider abstraction.
- [x] Domain error UI for Binance failures.
- [x] Real trace events from workflow execution.
- [x] Persist successful run.
- [x] Persist failed run with domain error.
- [x] Add workflow integration test for `Analyze BTC on 4H`.

---

## 2. AI layer

- [x] OpenAI provider factory.
- [x] Gemini provider factory.
- [x] Anthropic provider factory.
- [x] Local fallback provider.
- [x] Zod schema for AI output.
- [x] Structured market context input.
- [x] Provider-specific error handling.
- [x] Timeout handling.
- [x] Retry policy for transient provider errors.
- [x] AI safety regression tests.
- [x] Prompt eval cases.
- [x] UI indicator showing active provider/model.
- [x] Prevent AI prose from introducing numbers not present in context.

---

## 3. Agent system

- [x] Intent router.
- [x] Command-style UI.
- [x] `/api/chat` should execute routed workflows, not only return intent.
- [ ] Stream workflow events. *(V1 stays non-streaming per `docs/AGENT.md` §8; the event model is already in place, so streaming is a transport change only.)*
- [x] Show real tool events in `AgentTrace`.
- [x] Handle unknown intent with domain-specific message.
- [x] Add compare follow-up command.
- [x] Add entry-analysis command.
- [x] Add router regression tests for overview/analyze/compare/entry/unknown.

---

## 4. Market data layer

- [x] Normalized `Ticker` type.
- [x] Normalized `Candle` type.
- [x] Normalized `FundingRate` type.
- [x] Normalized `OrderBook` type.
- [x] Binance public client.
- [x] Binance Zod schemas.
- [x] Binance mapper tests.
- [ ] Binance MCP / Agent OS adapter when runtime is available. *(Blocked: no MCP runtime yet. `MarketDataProvider` is the only seam it needs.)*
- [x] Memory cache with TTL.
- [x] Invalid symbol handling.
- [x] Rate-limit handling in UI.
- [x] Network unavailable handling in UI.
- [x] Split support/resistance into dedicated module.
- [x] Add provider integration test with mocked fetch.

---

## 5. Deterministic analytics

- [x] EMA implementation.
- [x] RSI implementation.
- [x] ATR implementation.
- [x] Volume change implementation.
- [x] Market structure implementation.
- [x] Signal engine implementation.
- [x] Improve RSI calculation with smoothing.
- [x] Add support/resistance tests.
- [x] Add volatility classification tests.
- [x] Add signal component weighting tests.
- [x] Ensure signal alignment is never described as probability.

---

## 6. UI / product screens

- [x] Landing page.
- [x] `/app/agent` screen.
- [x] `/app/analyze` screen.
- [x] App shell.
- [x] Compact nav rail.
- [x] Market context header.
- [x] Chaos primitives baseline.
- [x] Polish `/app/overview`.
- [x] Polish `/app/compare`.
- [x] Build `/app/entry` or entry-analysis surface.
- [x] Build domain error components.
- [x] Add real TradingView Lightweight Charts component.
- [x] Add chart overlays: EMA20, EMA50, support, resistance.
- [x] Add volume chart layer.
- [x] Add GSAP sequencing for trace/result reveal.
- [x] Respect reduced motion for all animation.
- [x] Add the `MarketPulse` sphere to the landing and overview surfaces. *(`DESIGN_SYSTEM.md` §15 forbids an "AI orb" or "glowing magic object" as agent identity, so the sphere is not the agent: it is a market instrument. Rate comes from the volatility class and volume state, amplitude from signal alignment, colour from trend — every animated parameter is deterministic and unit-tested in `src/lib/analysis/pulse.ts`. It carries its own readouts and a non-prediction disclaimer, and holds still under reduced motion. Canvas 2D, no new dependency.)*
- [x] Use `public/img/logo.png` as the product mark in the nav rail, landing rail, mobile header, and generated app icons.
- [x] Mobile layout pass at 390px.
- [x] Tablet layout pass at 768px.
- [x] Desktop layout pass at 1024/1280/1440px.

---

## 7. Database / persistence

- [x] Drizzle schema.
- [x] DB factory.
- [x] Generate migrations.
- [x] Implement `saveAnalysisRun`.
- [x] Persist tool calls.
- [x] Persist analysis result.
- [x] Persist AI output.
- [x] Persist workflow errors.
- [x] Add feedback API.
- [x] Add feedback UI.
- [x] Wire history page to DB.
- [x] Add DB query tests for the persistence-disabled path.
- [ ] Add DB query tests against a live PostgreSQL instance.
- [x] Add local setup instructions for PostgreSQL.

---

## 8. Evaluation and testing

- [x] Indicator tests.
- [x] Signal engine test.
- [x] Binance mapper test.
- [x] Local AI provider test.
- [x] Workflow integration test.
- [x] Router eval runner.
- [x] Tool correctness eval runner.
- [x] AI schema eval runner.
- [x] Safety eval runner.
- [x] Missing-data eval case.
- [x] Invalid-symbol eval case.
- [x] Playwright demo flow test.
- [x] Playwright responsive screenshots.

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
- [x] Update README with real AI setup.
- [x] Update README with Binance data setup.
- [x] Update README with demo flow.
- [x] Add deployment notes.

---

## 10. Security / safety

- [x] V1 is read-only by architecture.
- [x] Verify no trading API routes exist.
- [x] Verify no private Binance keys are required.
- [x] Verify no secrets are exposed through `NEXT_PUBLIC_*`.
- [x] Verify no secrets are logged.
- [x] Add safety tests against buy/sell language.
- [x] Add domain disclaimer in relevant analysis outputs.

---

## 11. Dependency / audit

- [x] Required AI provider SDKs installed.
- [x] GSAP installed.
- [x] Lucide installed.
- [x] Lightweight Charts installed.
- [x] Drizzle installed.
- [x] Vitest installed.
- [x] Review remaining `drizzle-kit` dev audit warning. *(Reviewed: `esbuild` dev-server advisory reaching us via `@esbuild-kit/esm-loader`, a transitive dependency of `drizzle-kit@0.31.10`, which is already the latest release. `npm audit --omit=dev` reports 0 vulnerabilities, and drizzle-kit only uses esbuild to load `drizzle.config.ts` — it never starts an esbuild dev server. No action available or required.)*
- [x] Avoid installing non-approved UI libraries.
- [x] Avoid adding another animation framework.

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

1. Hackathon submission: confirm track, deploy to Vercel, record the demo video.
2. DB query tests against a live PostgreSQL instance.
3. Stream `/api/chat` workflow events (transport change on the existing event model).
4. Binance MCP / Agent OS adapter once the runtime is available.

---

## Verification snapshot

```text
npm run test      80 tests, 15 files, passing
npm run lint      0 problems
npm run build     passing
npm run test:e2e  demo flow + market pulse + reduced motion + 390/768/1024/1280/1440, passing
```

Live check against `fapi.binance.com` returns real trace rows for all four workflows,
`COMMAND NOT ROUTED` for unrouted commands, and `INVALID_SYMBOL` with a partial trace
for unlisted symbols.
