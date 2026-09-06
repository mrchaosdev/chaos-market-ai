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
- [x] Clarify the Agent OS/MCP story across the repo instead of leaving it half-wired. *(Found and removed dead scaffolding that implied a working MCP path: an unreachable `MCP_CONNECTION_ERROR` domain error that was never thrown anywhere, a `BINANCE_MCP_URL` env var read by no code, and an `ARCHITECTURE.md` error list that had drifted from `errors.ts`. `PROJECT.md`, `ARCHITECTURE.md`, `ACCEPTANCE.md`, and `README.md` now state plainly that `BinancePublicAdapter` is the only live `MarketDataProvider` and that MCP lands as a second adapter behind the same interface once a runtime exists — no code speaks as if it already does.)*
- [x] Memory cache with TTL.
- [x] Invalid symbol handling.
- [x] Rate-limit handling in UI.
- [x] Network unavailable handling in UI.
- [x] Separate a blocked region from an unreachable network. *(Binance answers 451 for a restricted region and 403 for a blocked hosting IP; both used to surface as `BINANCE_UNAVAILABLE`, which sends anyone debugging a deployment after the wrong cause. They now raise `REGION_RESTRICTED` with the actual remedy in the hint.)*
- [x] Add `/api/health` so a deployment can report whether it reaches Binance from where it actually runs.
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
- [x] ~~Compact nav rail.~~ **Replaced by header navigation at the owner's direction.** *(`DESIGN_SYSTEM.md` §12 prescribes a compact nav rail; the owner chose a horizontal nav in the market context header instead. Recorded here because the design doc and the code now disagree on purpose, not by accident.)*
- [x] Fix the workspace being unnavigable below 1024px. *(The rail was the only navigation in the app and was `hidden lg:flex`, so phones and tablets had zero reachable links — measured 0 at 390px and 768px, 7 at 1024px. Header nav now shows all 7 at every width, with an active state the rail never had.)*
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
- [x] Cap the landing hero at the documented type scale. *(It was `text-8xl` — 96px — against a 48-72px hero range in §5, which stacked the headline into nine lines and pushed the product panel below the fold.)*
- [x] Make the agent command line tappable, not just its text. *(The `input` box is 20px tall, under the 24px touch-target floor, and taps on the terminal icon or the padding around the text hit dead space — a form's padding does not focus its child. The icon and field are now wrapped in a `label`, so the whole 28px line is the target, with no visual change.)*
- [x] Stop an unsupported URL symbol reporting itself as a blocked region. *(`/app/analyze?symbol=NOTREAL` forwarded the value to Binance, which answers 403 for a malformed symbol — mapped, reasonably but wrongly, to `REGION_RESTRICTED`, so the screen told the reader to redeploy to another region when the fault was three characters in the query string. `resolveSymbol` now checks the allowlist first and falls back exactly the way an unknown `timeframe` already did, spending no request to find out; compare drops unknown entries instead of substituting. Covered by `tests/agent/resolve-symbol.test.ts`.)*
- [x] Give narrow screens a real navigation menu instead of a hidden horizontal scroll. *(Measured first: the seven items need ~530px, so at 360px only three were on screen and at 390px four, the rest reachable only by a horizontal scroll gesture on a bar that gives no hint it scrolls. Below `md` they now sit behind a labelled disclosure button; the row is unchanged from `md` up. The breakpoint is `md`, not `sm`, because 640px fit the row only to the pixel and still clipped the last item by 4px. The panel is `fixed` at `top-[70px]` — the bar pins at y=20 and is 50px tall, so its underside is constant, and an absolute child would have been clipped by the row's own `overflow-x-auto`. Dismisses on Escape, on an outside tap, and on choosing an item; `aria-expanded`/`aria-controls` wired; GSAP reveal that becomes an instant `set` under reduced motion. Verified across 320/390/540/640/767 and 768/1024/1440/1920 — 63 checks.)*
- [x] Fix `/app/agent` rendering the whole shell twice, and cover the gap that hid it. *(Moving `AppShell` into the shared layout missed one page, so the agent screen wrapped its own on top of the layout's: two navs, two title bands, two metric rows, stacked, on every load. The suite could not have caught it — `assertNavigable` only ever ran on the landing page and `/app/analyze`, and a doubled nav still satisfies "at least seven links". Added `checkSingleShell`, which walks all seven workspace routes and counts shells, navs, headers and active items rather than sampling one. Validated the way a regression test should be: re-broke the page, watched it fail with `/app/agent rendered 2 app shells, expected exactly 1`, then restored the fix.)*
- [x] Render the app shell once, in a layout, instead of per page. *(Every page and every `loading.tsx` wrapped its own `AppShell`, so during the streaming window the fallback and the incoming page each had a nav and a header mounted — two 50px bars, and once the mobile menu existed, two menu buttons, which broke strict locators and would have flickered visibly on a phone. `src/app/app/layout.tsx` now owns the shell and the six pages plus four loading files render content only.)*
- [x] Mobile layout pass at 390px.
- [x] Tablet layout pass at 768px.
- [x] Desktop layout pass at 1024/1280/1440px.
- [x] Rebuild asset comparison on measured values. *(The old table normalised the signal engine's bucketed components, so two assets that were both simply bullish tied on 4 of 6 dimensions and the screen read as broken. It now compares trend extension vs EMA50, RSI, volume change, funding pressure, ATR share and the alignment total — each shown with its unit, each with a real leader.)*
- [x] Fix the empty grid cell on the compare screen when fewer than three assets are shown.
- [x] Give the history screen substance when persistence is disabled, instead of one line and 700px of nothing.
- [x] Expose the router's multi-asset support in the UI, with token logos. *(`parseCommand`/`normalizeSymbol` already routed any of 10 allowlisted assets — BTC, ETH, BNB, SOL, XRP, DOGE, ADA, AVAX, LINK, TON — but `/app/analyze`, `/app/compare`, and `/app/entry` only ever showed the default BTCUSDT query param with no way to change it. Added `SymbolPicker`/`SymbolMultiPicker` (`src/components/market/symbol-picker.tsx`) as plain server-rendered links — no client state — and a `TokenIcon` component (`src/components/chaos/token-icon.tsx`) used wherever a symbol is already displayed. Logos are downloaded once from CoinGecko's public API and committed as local files under `public/img/tokens/`, not fetched live: the region-blocking incident with Binance is the exact failure mode a decorative image isn't worth risking again.)*
- [x] Fix stutter on pages showing the token logos. *(`TokenIcon` went through `next/image`, and the source files were already 250x250px/a few KB, so nothing needed shrinking — every distinct (symbol, size) pair still triggered a server-side sharp resize on first request, up to a dozen per page. Measured with the optimizer route: per-image latency climbed from ~15ms to ~39ms across a single page's icons as more unique sizes got computed. Switched to a plain `<img>` serving the static file directly — flat ~17-22ms per icon regardless of position, confirmed with the same measurement. `loading="lazy"` stayed on for icons further down a page, but it was never the fix: every logo here is on screen at load, so deferring the fetch wouldn't have touched the actual cost.)*
- [x] Wire up a real cloud AI provider (Gemini) and fix what that exposed. *(Three real bugs, in the order they surfaced: (1) `gemini-2.0-flash` is retired — Google's own error names `gemini-3.6-flash` as the replacement, now the default in `providers/gemini.ts`. (2) Flash reasons by default now; a 7-word prompt measured ~5s and 300 thinking tokens for a 4-word answer, and the real analyst prompt was timing out entire page loads at up to 60s. Fixed with `thinkingConfig.thinkingBudget: 0`, threaded through `VercelAIProvider` as a generic `providerOptions` param — the analyst call needs one schema-shaped object from data already computed, not deliberation. (3) `generateObject`'s own default `maxRetries: 2` was retrying underneath this class's own retry loop, doubling the wait on every failure; set to `0` so the outer loop is the only retry policy, which now also skips retrying 429s outright — Google's stated retry-after runs tens of seconds, an order of magnitude past what this loop's backoff could ever cover.)*
- [x] Bound trace-row log text to what a fixed-height row can hold. *(A live Gemini quota error is several hundred characters across multiple lines, and logged verbatim it broke `assertTraceRowsFit` on tablet — 168px against a 160px budget. `TraceRecorder` now collapses whitespace and caps at 160 chars for both the error and warning paths in `track()`/`warn()`; the untruncated message still reaches `ChaosError.message` and `aiWarning`, only the compact trace log is bounded.)*
- [x] Fix a real, pre-existing e2e race the faster AI pipeline exposed. *(The suite waited for `getText(/signal alignment/i)` as its "the run finished" signal — but `/app/agent`'s idle placeholder reads "Evidence · signal alignment before prose" and matches the same regex. Once `resultView` flips back to Output on `done`, whichever wins the race between that React commit and Playwright's own click on the Execution tab decides whether the tab reads execution or output afterward — previously masked by the AI call being slow enough to always lose that race by a wide margin, so cutting AI latency today made it float to the surface. Confirmed with a page-side `MutationObserver` on `aria-selected` plus timestamped stream-event logging (both since removed): the click could land at t≈641ms while `done` didn't arrive until t≈690ms, i.e. genuinely after. Fixed by waiting on `.cm-analysis__signal-score` instead — an element that exists only inside a rendered `MarketAnalysisPanel`, never in the idle state. 4/4 clean full-suite runs after the fix, against roughly 50% before it.)*
- [x] Fix the landing gutter painting in border colour beside the scrollbar. *(`cm-landing-workspace` carried both `sm:pl-[70px]` and the `bg-border` used to draw the grid's 1px gaps — a background paints the padding box, so the 20px strip left of the scroll gutter rendered as white-12% instead of the page background, a visible lighter band running the height of the workspace. Measured before the fix: the element's own background was `srgb 1 1 0.996 / 0.12` starting at x=0. `cm-landing-header` directly above it already had the right shape — padding on the outer element, `bg-border` on an inner grid — so the workspace now splits the same way into `cm-landing-workspace` + `cm-landing-workspace__grid`, and both now report a transparent outer box at x=0 with the border fill starting at x=70. It was the only element in the app combining that gutter padding with a background.)*
- [x] State the command language and routing rules in the README. *(Nothing told a reader that the router is regex over English verbs rather than a model, so a command in another language looked like a bug instead of a stated limit. `README.md` now carries a Commands section with every trigger keyword, the evaluation order, the symbol/timeframe allowlists and what each unstated field falls back to. The analyst system prompt also now pins output to English — it never did, and with the router English-only, a model that drifted would have been the single inconsistent surface in the product.)*
- [x] Fix the Gemini path being dead since the thinking-budget change. *(`thinkingBudget: 0` — added to cut the reasoning latency — is rejected by `gemini-3.6-flash` with HTTP 400 `Request contains an invalid argument`. The provider caught it and degraded to the local interpretation exactly as designed, so nothing looked broken: every run just quietly came back `LOCAL · CHAOS-DETERMINISTIC`, and the fallbacks were misread as the quota problem seen earlier the same day. Isolated it against the raw API — same prompt, 200 without the config and 400 with it — then found `thinkingLevel: "minimal"`, which the model accepts and which measures 0 thinking tokens all the same. Verified end to end: `provider: gemini`, `degraded: false`, prose citing the computed price, support, resistance and score.)*
- [x] Rewrite `DEMO.md` as the submission video script, and re-shoot the README captures. *(The old script was pure walkthrough with no problem/what-we-built/why-this-track framing, which is what a submission video is judged on; it is now seven beats for 3:00 with `[CUT FIRST]` markers down to 2:00. Binance's own spec for the video is not recorded anywhere in this repo, so the assumption is stated at the top of the file rather than left implicit. The README captures were re-shot now that the cloud provider actually answers — the hero meta bar reads `GEMINI · GEMINI-3.6-FLASH` instead of the fallback, so its caption no longer has to spend a paragraph explaining why it says `LOCAL`.)* *(It still said to watch the trace fill the screen, written before the result panel gained Output/Execution tabs; still quoted a hard-coded signal score; and said nothing about which AI provider the meta bar would name on camera — the one thing most likely to surprise the person recording. It now opens with a `/api/health` check for that, covers the tab behaviour, adds the ten-asset picker as an optional beat, and says plainly not to re-record when the bar reads `LOCAL`.)*
- [x] Use ChaoUi's `bars` spinner for the route loading state. *(Its `Spinner` turned out to be plain CSS keyframes with no animation library behind it, so it carried over as-is rather than needing a port away from something unapproved — only `@keyframes chaos-bar-scale`, the stagger and a reduced-motion branch the original lacks. Colour comes from the `--primary` token rather than the component's inline default. Verified by reading the computed style off the class: `chaos-bar-scale 0.96s`, delays 0/0.16/0.32/0.48s, `rgb(255,137,6)`.)*
- [x] Fix the perceived lag on symbol/timeframe switches. *(Not frame rate — measured a clean, unbroken 16.6ms/frame with the sphere animating throughout, so nothing on the canvas side was dropping frames. The real cause: `/app`, `/app/analyze`, `/app/compare`, and `/app/entry` are all `force-dynamic` and none of them had a `loading.tsx`, so every symbol click re-fetched Binance and re-ran the pipeline server-side (measured 250-580ms locally) with the *old* page frozen on screen and zero feedback until it finished — that gap read as stutter. Added a `loading.tsx` per route rendering a `ChaosLoadingPanel` inside the same `AppShell`, so the nav/header stay put and only the content area shows a pending state. Confirmed with Playwright under artificial network latency that the panel actually appears mid-navigation and clears once real content lands.)*

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
- [x] Add DB query tests against a live PostgreSQL instance. *(7 tests in `tests/db/live-persistence.test.ts` run against real Postgres 16: the three-table write, a failed run carrying its domain error, ordering and limit, feedback round-trip, a rejected foreign key, a duplicate run id, and `on delete cascade`. They skip loudly with a printed reason when no database is reachable, so a green run never hides that nothing was exercised.)*
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
- [ ] Deploy to Vercel. *(Owner is handling deployment. `vercel.json` pins `fra1` — the default `iad1` is a US region and Binance blocks it. Confirm with `/api/health` before recording.)*
- [ ] Verify production env vars.
- [x] Add final GitHub README. *(Opened with what a judge needs in the first screen: the Track A choice and why Track B was refused, three captures of the real running app — agent output, execution trace, landing — and a placeholder for the demo URL. The hero caption states plainly that the meta bar in the capture reads `LOCAL · CHAOS-DETERMINISTIC` and why that is the designed degradation rather than a broken screenshot, since the alternative was a caption that contradicts its own image.)*
- [x] Audit `ACCEPTANCE.md` against the working tree. *(It was 0/51 ticked, which reads as never self-checked when in fact almost all of it held. Each box was verified by reading the code, running the named test, or measuring the app — 50 now ticked with the evidence noted inline. §6.5 "Missing-data eval returns reliability warning" is deliberately left unticked: there is no reliability-warning concept in the code, and missing data instead takes two harder paths — an `ANALYTICS_ERROR` domain error for insufficient history, `n/a` for an individual uncomputable indicator. Reinterpreting the wording to fit what was built would have made the page complete and the audit worthless.)*
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
npm run test      103 tests, 18 files, passing (7 of them need a live PostgreSQL and skip without one)
npm run lint      0 problems
npm run build     passing
npm run test:e2e  demo flow + NDJSON streaming + market pulse + reduced motion + 390/768/1024/1280/1440, passing
```

Live check against `fapi.binance.com` returns real trace rows for all four workflows,
`COMMAND NOT ROUTED` for unrouted commands, and `INVALID_SYMBOL` with a partial trace
for unlisted symbols.
