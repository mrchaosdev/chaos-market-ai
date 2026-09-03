# Chaos Market AI — Architecture

## 1. System principle

Chaos Market AI follows this pipeline:

```text
USER COMMAND
→ INTENT ROUTER
→ DETERMINISTIC WORKFLOW
→ MARKET DATA PROVIDER
→ NORMALIZED DATA
→ INDICATOR ENGINE
→ MARKET STRUCTURE
→ SIGNAL ENGINE
→ STRUCTURED AI CONTEXT
→ AI PROVIDER
→ EVIDENCE-FIRST RESULT
→ PERSISTENCE / EVALUATION
```

The agent routes. The workflow orchestrates. The LLM explains.

---

## 2. Frontend architecture

```text
src/app
├── page.tsx                 landing
├── app/                     product workspace
│   ├── page.tsx             overview
│   ├── analyze/page.tsx     analyze asset
│   ├── compare/page.tsx     compare assets
│   ├── agent/page.tsx       command + trace
│   ├── history/page.tsx     saved runs
│   └── settings/page.tsx    app preferences
└── api/                     server workflow entrypoints
```

Prefer Server Components. Use Client Components only for interaction, streaming, chart runtime, or GSAP.

---

## 3. Domain architecture

```text
src/lib/market
├── provider.ts              MarketDataProvider interface
├── types.ts                 normalized market domain types
└── binance/                 Binance MCP / public adapter boundary
```

```text
src/lib/indicators
├── ema.ts
├── rsi.ts
├── atr.ts
└── volume.ts
```

```text
src/lib/analysis
├── market-structure.ts
├── support-resistance.ts
├── signal-engine.ts
└── comparison.ts
```

Indicators and signal scoring are deterministic and unit-tested. They must not call the LLM.

---

## 4. Provider boundary

No Binance-specific response shape may leak into workflows, UI, AI prompts, DB persistence, or tests.

Adapters convert external data to:

- `Ticker`
- `Candle`
- `FundingRate`
- `OrderBook`

If Binance MCP changes, only the adapter should change.

---

## 5. AI boundary

```text
src/lib/ai
├── provider.ts              AIProvider interface
├── factory.ts               provider selection
├── schemas.ts               Zod output schemas
├── types.ts                 AI/domain context types
├── providers/               OpenAI/Gemini/Anthropic/Local implementations
└── prompts/                 system prompts by workflow
```

The LLM receives compact structured context, not raw candle dumps.

The LLM must not calculate:

- prices
- RSI
- EMA
- ATR
- support/resistance
- signal score

---

## 6. Workflow boundary

V1 workflows:

- `MarketOverviewWorkflow`
- `AnalyzeAssetWorkflow`
- `CompareAssetsWorkflow`
- `EntryAnalysisWorkflow`

Each workflow returns:

- run id
- observed market data
- deterministic calculations
- signal result
- AI interpretation
- traceable evidence

---

## 7. API routes

Required V1 routes:

| Route | Method | Responsibility |
|---|---:|---|
| `/api/market` | GET | Market overview workflow |
| `/api/analyze` | POST | Analyze one asset/timeframe |
| `/api/compare` | POST | Compare assets |
| `/api/chat` | POST/stream | Route command to workflow and emit events |
| `/api/history` | GET | Saved runs |

Routes should validate input, call workflow modules, and return typed JSON. They must not embed analysis logic directly.

---

## 8. Error handling

Known domain errors:

- `MCP_CONNECTION_ERROR`
- `BINANCE_UNAVAILABLE`
- `INVALID_SYMBOL`
- `RATE_LIMIT`
- `MARKET_DATA_ERROR`
- `ANALYTICS_ERROR`
- `AI_PROVIDER_ERROR`
- `DATABASE_ERROR`

UI should render domain-specific errors, not generic failure text.

---

## 9. Caching

V1 may use memory cache only.

Suggested TTL:

| Data | TTL |
|---|---:|
| ticker | 5–10s |
| orderbook | 5–10s |
| funding | 30–60s |
| 1H candles | 30s |
| 4H candles | 60–120s |

Future: Redis.

---

## 10. Security

V1 is read-only.

Do not add:

- trading API keys
- order endpoints
- withdrawal logic
- private key storage
- secrets in client env vars

Only expose `NEXT_PUBLIC_*` values when intentionally public.
