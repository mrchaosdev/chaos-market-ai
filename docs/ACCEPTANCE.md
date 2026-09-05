# Chaos Market AI — V1 Acceptance Checklist

Audited 5 Sep 2026 against the working tree, not from memory: each box below was
checked by reading the code, running the named test, or measuring the running app
in a browser. `npm run test` · `npm run lint` · `npm run build` all pass, and
`npm audit --omit=dev` reports 0 vulnerabilities.

One item is deliberately left unchecked. It describes behaviour the project chose
not to build, and the reason is recorded inline rather than the box being ticked
to make the page look complete.

## 1. Product workflow

- [x] Landing explains product through real agent-run visual. *(`/` runs `analyzeAssetWorkflow` server-side and renders that run's own trace — not a mockup.)*
- [x] `/app/agent` accepts command-style input.
- [x] `Analyze BTC on 4H` runs end-to-end. *(`tests/workflows/analyze-workflow.test.ts`, plus the e2e demo flow against live Binance.)*
- [x] Agent trace displays real executed workflow steps. *(Rows come from `TraceRecorder` as steps complete; the e2e suite asserts at least 8 real rows and that none is left invisible.)*
- [x] Result renders evidence before AI prose. *(`MarketAnalysisPanel` orders price → indicators → signal components → evidence → interpretation.)*
- [x] Entry analysis never says buy/sell. *(`tests/evals/safety-eval.test.ts`; the e2e run also scans the rendered page for "buy now", "sell now", "go long", "go short", "guaranteed".)*

## 2. Market data

- [x] `MarketDataProvider` boundary is used everywhere. *(No Binance URL appears outside `src/lib/market/binance/`.)*
- [x] Binance public adapter returns normalized types. *(MCP adapter deferred — no runtime exists yet; see `docs/TODO.md` §4.)*
- [x] No Binance response shapes leak into UI/workflows. *(No `lastPrice`/`priceChangePercent`/`quoteVolume` outside the mapper.)*
- [x] Market data errors return domain error codes. *(`tests/market/binance-client.test.ts` covers 429 → `RATE_LIMIT`, −1121 → `INVALID_SYMBOL`, 451/403 → `REGION_RESTRICTED`, unreachable → `BINANCE_UNAVAILABLE`, bad shape → `MARKET_DATA_ERROR`.)*
- [x] No silent production fallback to mock prices. *(`demo` is an explicit `MARKET_PROVIDER` value and the meta bar labels it `DEMO DATA`; a failure raises a domain error instead of substituting numbers.)*

## 3. Deterministic analytics

- [x] EMA20 is implemented and tested.
- [x] EMA50 is implemented and tested.
- [x] RSI is implemented and tested. *(`tests/indicators/rsi.test.ts` matches the published Wilder reference.)*
- [x] ATR is implemented and tested.
- [x] Volume state is implemented and tested.
- [x] Support/resistance is deterministic. *(Nearest qualifying swing low/high, falling back to window extremes; `tests/signals/analysis.test.ts`.)*
- [x] Signal score is deterministic and tested. *(`tests/signals/signal-engine.test.ts`.)*
- [x] Signal alignment is never described as probability. *(Asserted in `tests/evals/safety-eval.test.ts` and stated on every surface that prints the score.)*

## 4. AI layer

- [x] `AIProvider` boundary is used. *(No `ai` or `@ai-sdk/*` import exists outside `src/lib/ai/`.)*
- [x] AI input is compact structured context. *(`AnalysisContext` — price, indicators, structure, funding, signal. No raw candles.)*
- [x] AI output validates against Zod. *(`AIAnalysisSchema` via `generateObject`; `tests/evals/schema-eval.test.ts`.)*
- [x] AI never computes indicators. *(Every number is computed before the provider is called; `analyze-workflow.test.ts` asserts each reported number derives from deterministic calculation.)*
- [x] AI never invents missing market data. *(`findUnsupportedNumbers` rejects any number absent from the context, asks for one rewrite, then degrades to the deterministic provider.)*
- [x] AI never guarantees returns. *(`tests/evals/safety-eval.test.ts`.)*

## 5. Persistence

- [x] Drizzle schema covers runs/tool calls/results/feedback. *(Four tables in `src/lib/db/schema.ts`.)*
- [x] `DATABASE_URL` is server-only. *(No `NEXT_PUBLIC_*` variable exists in the codebase.)*
- [x] Runs persist after successful workflow. *(`tests/db/live-persistence.test.ts` against a real PostgreSQL instance.)*
- [x] Tool calls persist sanitized input/output summaries. *(Summaries only — the recorder stores the same short strings the trace shows, and caps them at 160 characters.)*
- [x] Feedback can be captured. *(`/api/feedback` and `RunFeedback`; covered live and in the no-database path.)*
- [x] No secrets are logged or persisted. *(No log statement references a key, token or connection string; the live test suite redacts the password even when it reports why it skipped.)*

## 6. Evaluation

- [x] Router eval covers overview/analyze/compare/entry/unknown. *(`tests/evals/router-eval.test.ts` — "covers every supported intent".)*
- [x] Tool eval covers required tools per workflow. *(`tests/evals/tool-eval.test.ts`.)*
- [x] Schema eval validates AI output. *(`tests/evals/schema-eval.test.ts`.)*
- [x] Safety eval rejects buy/sell instruction language. *(`tests/evals/safety-eval.test.ts`.)*
- [ ] Missing-data eval returns reliability warning. **Not built, and not planned as written.** *(There is no "reliability warning" concept in the code. Missing data takes one of two harder paths instead: too little history raises an `ANALYTICS_ERROR` domain error carrying the trace, and an individual indicator that cannot be computed renders as `n/a` rather than a substituted value. Both are covered by tests. Leaving this box unticked rather than reinterpreting the wording to fit what was built.)*

## 7. UI/design

- [x] Palette uses Happy Hues Palette 13 tokens.
- [x] Raw colors appear only in central token CSS. *(No hex, `rgb()` or `hsl()` literal in any component.)*
- [x] No arbitrary Tailwind palette classes in components. *(No `bg-red-500`-style class anywhere in `src/`.)*
- [x] No chatbot bubbles.
- [x] No giant centered prompt box. *(The command input is a terminal line in the agent sidebar.)*
- [x] No AI orb/robot/brain/sparkle identity. *(No such icon is imported. The sphere is a market instrument: rate from volatility and volume, amplitude from signal alignment, every parameter deterministic and unit-tested — see `DESIGN_SYSTEM.md` §15.)*
- [x] No default shadcn dashboard look. *(No `components/ui` directory exists.)*
- [x] No Binance clone.
- [x] Chart uses token colors. *(`readChartPalette` resolves every series colour from CSS custom properties.)*
- [x] Motion respects reduced-motion. *(Sphere, trace reveal, nav indicator, result reveal and the loading dots each branch on `prefers-reduced-motion`; the e2e suite asserts the sphere holds still under it.)*
- [x] Mobile hierarchy follows market → metrics → chart → signal → evidence → interpretation. *(Verified at 390px in the responsive e2e pass, which also asserts no horizontal overflow.)*

## 8. Verification

- [x] `npm run test` passes. *(121 passed. The 7 live-database tests skip when no PostgreSQL is reachable and print the reason with the password redacted; they pass against a real instance.)*
- [x] `npm run lint` passes.
- [x] `npm run build` passes.
- [x] Dependency audit reviewed. *(`npm audit --omit=dev`: 0 vulnerabilities.)*
