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
| `AI_MODEL` | no | provider default | Model id, e.g. `claude-haiku-4-5-20251001`, `gpt-4o-mini`, `gemini-2.0-flash`. |
| `DATABASE_URL` | no | — | PostgreSQL connection string. Without it workflows still run, and the UI states that persistence is disabled. |
| `BINANCE_MCP_URL` | no | — | Reserved for the Binance Agent OS / MCP adapter. |

### Binance market data

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

Vercel:

1. Import the repository and keep the default Next.js build (`npm run build`).
2. Set project environment variables: `MARKET_PROVIDER`, `AI_PROVIDER`, `AI_API_KEY`, `AI_MODEL`, `DATABASE_URL`. Set them as server-side variables only — never prefix any of them with `NEXT_PUBLIC_`.
3. Run `npm run db:migrate` against the production database once before the first deploy.
4. Every product route is dynamic and uncached, so no build-time market data is baked into the deployment.
5. Binance blocks some hosting regions. Confirm the deployment region can reach `fapi.binance.com`, or point `BINANCE_PUBLIC_BASE_URL` at a reachable Binance endpoint.

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
