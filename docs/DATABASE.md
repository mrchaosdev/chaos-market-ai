# Chaos Market AI — Database Specification

## 1. Persistence goals

The database stores analysis history, tool calls, AI outputs, feedback, and future dataset material.

It must not store secrets or trading credentials.

---

## 2. Tables

### 2.1 `analysis_runs`

| Column | Type | Notes |
|---|---|---|
| `id` | text primary key | run id |
| `user_query` | text | original command if available |
| `workflow` | text | workflow name |
| `symbol` | text | primary symbol |
| `timeframe` | text | timeframe |
| `model` | text | AI model id |
| `status` | text | queued/running/success/error |
| `latency_ms` | integer | total runtime |
| `created_at` | timestamp | server time |

### 2.2 `tool_calls`

| Column | Type | Notes |
|---|---|---|
| `id` | text primary key | tool call id |
| `analysis_run_id` | text | run reference |
| `tool_name` | text | registry tool name |
| `input_json` | jsonb | sanitized input |
| `output_json` | jsonb | normalized output or summary |
| `latency_ms` | integer | tool runtime |
| `status` | text | success/error |
| `created_at` | timestamp | server time |

### 2.3 `analysis_results`

| Column | Type | Notes |
|---|---|---|
| `id` | text primary key | result id |
| `analysis_run_id` | text | run reference |
| `market_context_json` | jsonb | normalized market context |
| `indicator_context_json` | jsonb | deterministic calculations |
| `signal_context_json` | jsonb | signal output |
| `ai_output_json` | jsonb | validated AI output |
| `created_at` | timestamp | server time |

### 2.4 `feedback`

| Column | Type | Notes |
|---|---|---|
| `id` | text primary key | feedback id |
| `analysis_run_id` | text | run reference |
| `helpful` | boolean | quick feedback |
| `rating` | integer | optional 1–5 |
| `comment` | text | optional |
| `created_at` | timestamp | server time |

---

## 3. Dataset collection

Future training/evaluation samples are derived from persisted records:

```json
{
  "query": "Analyze BTC on 4H",
  "market_context": {},
  "indicators": {},
  "signal": {},
  "ai_response": {},
  "feedback": {}
}
```

Only use sanitized, non-secret, non-private data.

---

## 4. Data retention

V1 should persist useful analysis records, not high-frequency market history.

Do not store every live ticker update unless a later product feature requires it.

---

## 5. Required implementation

- Drizzle schema exists in `src/lib/db/schema.ts`
- DB factory exists in `src/lib/db/index.ts`
- Query helpers live in `src/lib/db/queries.ts`
- Migrations generated into `drizzle/`

---

## 6. Failure mode

If `DATABASE_URL` is missing in local development, workflows may run without persistence but must clearly expose that persistence is disabled.

In production, persistence failure should produce `DATABASE_ERROR` for write paths that require saving.
