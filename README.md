# Chaos Market AI

Evidence-first crypto market intelligence agent for Binance Agent OS workflows.

The agent routes a command into a deterministic workflow, retrieves live Binance market data, calculates indicators in code, scores signal alignment, and only then asks a language model to explain what was measured.

**V1 is read-only.** No trading API keys, no order routes, no execution.

---

## Quick start

```bash
npm install
cp .env.example .env.local
npm run dev
```

Open `http://localhost:3000`. With no configuration at all the app runs against Binance public market data and the deterministic local interpretation provider.

---

## Environment

Every value is server-only. Nothing is exposed through `NEXT_PUBLIC_*`.

| Variable | Required | Default | Purpose |
|---|---|---|---|
| `MARKET_PROVIDER` | no | `binance-public` | `binance-public` or `demo`. `demo` uses synthetic candles and is labelled as demo data in the UI. |
| `BINANCE_PUBLIC_BASE_URL` | no | `https://fapi.binance.com` | Binance USDT-M futures public REST base URL. |
| `AI_PROVIDER` | no | `local` | `local`, `openai`, `gemini`, or `anthropic`. |
| `AI_API_KEY` | only for cloud providers | — | Provider API key. Without it the app falls back to `local`. |
| `AI_MODEL` | no | provider default | Model id, e.g. `claude-haiku-4-5-20251001`, `gpt-4o-mini`, `gemini-3.6-flash`. |
| `DATABASE_URL` | no | — | PostgreSQL connection string. Without it workflows still run, and the UI states that persistence is disabled. |

### Binance market data

V1 talks to Binance directly over its public REST API — there is no Binance Agent OS / MCP runtime to connect to yet, so `MarketDataProvider` has exactly one live implementation (`BinancePublicAdapter`). If a Binance MCP server becomes available, it plugs in as a second `MarketDataProvider` implementation behind the same interface; no caller changes. See `docs/TODO.md` §4 for that item's status.

The public adapter reads four endpoints, all unauthenticated and read-only:

```text
GET /fapi/v1/ticker/24hr
GET /fapi/v1/klines
GET /fapi/v1/fundingRate
GET /fapi/v1/depth
```

No API key is used, and no private or trading endpoint is reachable from this codebase. Responses pass through Zod schemas and a mapper before anything else sees them, so no Binance-specific shape leaks into workflows, the UI, prompts, or the database. Failures surface as domain errors (`BINANCE_UNAVAILABLE`, `RATE_LIMIT`, `INVALID_SYMBOL`, `MARKET_DATA_ERROR`) rather than as placeholder prices. Ticker and depth are cached for 8s, funding for 45s, and candles for 15–120s depending on timeframe.

### AI setup

The AI layer only receives a compact structured context — price, indicator values, market structure, funding, and signal score. It never computes numbers and never sees raw candle dumps.

```bash
# .env.local
AI_PROVIDER=anthropic
AI_API_KEY=sk-ant-...
AI_MODEL=claude-haiku-4-5-20251001
```

Output is validated against a Zod schema, requests time out after 20s, transient provider errors are retried twice, and every number in the model's prose is checked against the analysis context. If the model introduces a number that is not in the context it is asked to rewrite once; if it fails again the run degrades to the deterministic local interpretation and the trace records a warning. The active provider and model are always shown in the workflow meta bar.

### PostgreSQL setup

```bash
# start a local database
docker run --name chaos-pg -e POSTGRES_PASSWORD=chaos -e POSTGRES_DB=chaos_market_ai -p 5432:5432 -d postgres:16

# .env.local
DATABASE_URL=postgres://postgres:chaos@localhost:5432/chaos_market_ai

npm run db:migrate
```

`npm run db:generate` regenerates SQL from `src/lib/db/schema.ts` into `drizzle/`. Runs, tool calls, results, and feedback persist; the history screen and `/api/history` read from the same tables. Without `DATABASE_URL` the app runs normally and says so.

#### Database tests

`tests/db/live-persistence.test.ts` exercises the real SQL. Point it at a throwaway database:

```bash
docker run --name chaos-pg-test -e POSTGRES_PASSWORD=chaos -e POSTGRES_DB=chaos_test   -p 55432:5432 -d postgres:16
DATABASE_URL=postgres://postgres:chaos@localhost:55432/chaos_test npx drizzle-kit migrate
npm run test
```

It defaults to that connection string and honours `TEST_DATABASE_URL` if you use another. With no database reachable the suite skips and prints why, so the rest of `npm run test` still runs.

---

## Commands

Commands are routed at `/app/agent` by keyword, not by a language model — the router is a small set of regular expressions in [`src/lib/agent/router.ts`](src/lib/agent/router.ts), deliberately, so that routing is deterministic and auditable rather than another place the model can improvise. Two consequences worth stating plainly:

- **English only.** The patterns match English verbs. A command in any other language routes to `COMMAND NOT ROUTED`, which is a routing limit, not a comment on the input.
- **The keyword decides the workflow**, not the overall sense of the sentence.

| Workflow | Triggered by any of |
|---|---|
| Compare assets | `compare`, `versus`, `vs`, `stronger`, `relative strength` |
| Entry analysis | `entry`, `entries`, `good time/level/area/spot`, `near support`, `pullback` |
| Market overview | `overview`, `how is the market`, `market today/overview/regime/state/condition`, `market now` |
| Analyze one asset | `analyze`/`analyse`, `analysis`, `inspect`, `breakdown`, `structure of` |

Rules are evaluated in that order, so `Compare BTC entry area` compares — `compare` is tested before `entry`.

Symbols are read from the command against a ten-asset allowlist (BTC, ETH, BNB, SOL, XRP, DOGE, ADA, AVAX, LINK, TON), and timeframes from `15m`, `1h`, `4h`, `1d` (also `hourly`, `daily`, `24h`). Anything unstated falls back: BTC on 4H for a single asset, BTC and ETH for a comparison; the market overview is always BTC / ETH / BNB.

```text
Analyze SOL on 1d
Compare ETH vs SOL on 4h
Is DOGE near a good entry area?
Inspect LINK structure on 1h
How is the market today?
```

Anything outside those four workflows returns `COMMAND NOT ROUTED` with suggestions. There is no general chatbot fallback, by design — see [V1 law](#v1-law).

---

## Demo flow

The full recording script is in [`docs/DEMO.md`](docs/DEMO.md).

1. Open `/` — the landing page runs a real `Analyze BTC 4H` workflow and shows its actual trace.
2. Click **Run Analysis** to reach `/app/agent`.
3. Send `Analyze BTC on 4H`. The trace streams in per real executed step: four Binance tool calls, the indicator engine, market structure, signal engine, interpretation, persistence.
4. Read the result right to left: evidence and deterministic metrics first, model prose last.
5. Try `Compare BTC and ETH on 4H`, `Is BTC near a good entry area?`, and `How is the market today?`.
6. Send something unrelated — the agent answers `COMMAND NOT ROUTED` instead of falling back to a chatbot.

---

## API

| Route | Method | Body | Responsibility |
|---|---|---|---|
| `/api/chat` | POST | `{ command, stream? }` | Route the command to a workflow and execute it. Returns JSON by default; with `stream: true` returns NDJSON (`intent`, one `trace` per executed step, then `done`) |
| `/api/market` | GET | — | Market overview for BTC / ETH / BNB |
| `/api/analyze` | POST | `{ symbol?, timeframe? }` | Analyze one asset |
| `/api/compare` | POST | `{ symbols?, timeframe? }` | Compare two or three assets |
| `/api/entry` | POST | `{ symbol?, timeframe? }` | Entry-area structure, in neutral language |
| `/api/history` | GET | — | Persisted runs |
| `/api/feedback` | POST | `{ runId, helpful, rating?, comment? }` | Record run feedback |
| `/api/health` | GET | — | Whether this deployment can actually reach Binance, plus active provider and persistence state. No secrets. |

Errors return `{ error: { code, message, hint }, runId, trace }` with a status derived from the domain error code.

---

## Verify

```bash
npm run test      # unit tests plus router / tool / schema / safety eval runners
npm run lint
npm run build
npm run test:e2e  # requires a running dev server; demo flow, NDJSON streaming, market pulse,
                  # reduced motion, and 390-1440px screenshots
```

`npm run test:e2e` writes screenshots to `test-results/` and fails on console errors, horizontal overflow, or any instructional trading language rendered on screen.

---

## Deployment

### Region comes first

**Binance refuses public market data to US IP ranges, and Vercel deploys to `iad1` (US East) by default.** A deployment that lands there returns `REGION_RESTRICTED` on every workflow, and no amount of environment configuration fixes it. `vercel.json` therefore pins the deployment to `fra1`:

```json
{ "regions": ["fra1"] }
```

If `fra1` is unavailable on your plan, `sin1` and `syd1` are the usual alternatives. Verify before recording anything:

```bash
curl -s https://<your-deployment>/api/health | jq
```

```json
{ "status": "ok", "marketData": { "reachable": true, "sampleSymbol": "BTCUSDT" } }
```

A blocked region reports itself precisely:

```json
{ "status": "degraded", "marketData": { "errorCode": "REGION_RESTRICTED", "hint": "..." } }
```

### Then the rest

1. Import the repository and keep the default Next.js build (`npm run build`).
2. Environment variables are all optional. With none set the app still runs: `binance-public` market data, the deterministic `local` interpretation provider, and persistence disabled. Add `AI_PROVIDER` + `AI_API_KEY` + `AI_MODEL` for a cloud model, and `DATABASE_URL` for history. Server-side only — never prefix any of them with `NEXT_PUBLIC_`.
3. Run `npm run db:migrate` against the production database once, only if you set `DATABASE_URL`.
4. Every product route is dynamic and uncached, so no build-time market data is baked into the deployment.

---

## Docs

Read before implementation:

1. `docs/SKILL.md`
2. `docs/PROJECT.md`
3. `docs/DESIGN_SYSTEM.md`
4. `docs/ARCHITECTURE.md`
5. `docs/AGENT.md`
6. `docs/DATABASE.md`
7. `docs/ROADMAP.md`
8. `docs/SOURCES.md`
9. `docs/ACCEPTANCE.md`
10. `docs/TODO.md`
11. `docs/DEMO.md`

## V1 law

No trading execution. Market data first, deterministic calculations second, AI interpretation last.
