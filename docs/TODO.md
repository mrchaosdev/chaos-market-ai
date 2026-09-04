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
- [x] Stream workflow events. *(`/api/chat` with `{ stream: true }` returns NDJSON: an `intent` message, one `trace` message per real executed step, then a `done` message carrying the same `AgentExecution` the JSON route returns. The agent screen renders rows as they arrive. The non-streaming path is unchanged and still the default.)*
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
- [x] Report the signal scale honestly. *(Component weights total 95, but eight surfaces claimed "/ 100" while the Signal Components panel visibly listed 30+16+14+10+10+15. The maxima now live in `signal-engine.ts` as the single source of truth, every surface reads from it, and the AI numeric guard accepts it as a system constant rather than an invented number.)*

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
- [x] Rebuild asset comparison on measured values. *(The old table normalised the signal engine's bucketed components, so two assets that were both simply bullish tied on 4 of 6 dimensions and the screen read as broken. It now compares trend extension vs EMA50, RSI, volume change, funding pressure, ATR share and the alignment total — each shown with its unit, each with a real leader.)*
- [x] Fix the empty grid cell on the compare screen when fewer than three assets are shown.
- [x] Give the history screen substance when persistence is disabled, instead of one line and 700px of nothing.

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
- [x] `docs/DEMO.md` recording script.
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

- [x] Confirm Binance hackathon track. *(Track A — build an AI agent with Agent OS, 20K USDC. Track B pays 40K but requires trading, which contradicts the read-only law in `PROJECT.md` §2.5/§6, `SKILL.md` §8 and `ACCEPTANCE.md` §5. Deadline 8 Sep 2026, 23:59 UTC.)*
- [x] Confirm final demo workflow. *(`Analyze BTC on 4H`, then compare / entry / overview, then an unrouted command. See `docs/DEMO.md`.)*
- [x] Prepare demo script. *(`docs/DEMO.md`.)*
- [ ] Record video: landing → agent → trace → evidence.
- [ ] Deploy to Vercel. *(Owner is handling deployment.)*
- [ ] Verify production env vars.
- [ ] Add final GitHub README.
- [ ] Submit GitHub URL.
- [ ] Submit demo URL/video.
- [ ] Complete Binance survey.

---

## Current priority order

1. Hackathon submission (Track A): deploy, record the demo video, submit GitHub + video, complete the survey.
2. DB query tests against a live PostgreSQL instance.
3. Binance MCP / Agent OS adapter once the runtime is available.

---

## Verification snapshot

```text
npm run test      94 tests, 17 files, passing
npm run lint      0 problems
npm run build     passing
npm run test:e2e  demo flow + NDJSON streaming + market pulse + reduced motion + 390/768/1024/1280/1440, passing
```

Live check against `fapi.binance.com` returns real trace rows for all four workflows,
`COMMAND NOT ROUTED` for unrouted commands, and `INVALID_SYMBOL` with a partial trace
for unlisted symbols.
