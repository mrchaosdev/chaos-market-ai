# Chaos Market AI — Agent Specification

## 1. Agent role

The Chaos Agent is a workflow router and execution presenter.

It is not:

- a chatbot persona
- a trading bot
- a free-form financial oracle
- a hidden autonomous executor

It accepts a user command, determines intent, runs a deterministic workflow, and exposes the execution path.

---

## 2. Supported V1 intents

```ts
type AgentIntent =
  | "MARKET_OVERVIEW"
  | "ANALYZE_ASSET"
  | "COMPARE_ASSETS"
  | "ENTRY_ANALYSIS"
  | "UNKNOWN";
```

Examples:

| User command | Intent |
|---|---|
| `How is the market today?` | `MARKET_OVERVIEW` |
| `Analyze BTC on 4H` | `ANALYZE_ASSET` |
| `Compare BTC and ETH on 4H` | `COMPARE_ASSETS` |
| `Is BTC near a good entry area?` | `ENTRY_ANALYSIS` |

---

## 3. Agent execution hierarchy

```text
USER INTENT
→ WORKFLOW
→ MARKET DATA
→ ANALYTICS
→ SIGNAL
→ AI INTERPRETATION
→ RESULT
```

The UI shows workflow status, not chat bubbles.

---

## 4. Tool registry

V1 read-only tools:

- `getTicker`
- `getKlines`
- `getFundingRate`
- `getOrderBook`
- `getMarketSummary`

Forbidden in V1:

- `placeOrder`
- `cancelOrder`
- `marketBuy`
- `marketSell`
- `withdraw`
- any endpoint requiring trading permission

---

## 5. Trace event model

```ts
type TraceStatus = "queued" | "running" | "success" | "warning" | "error";

type AgentTraceEvent = {
  id: string;
  runId: string;
  workflow: string;
  phase: "intent" | "market_data" | "analytics" | "signal" | "ai" | "persistence";
  toolName?: string;
  inputSummary?: string;
  outputSummary?: string;
  status: TraceStatus;
  latencyMs?: number;
  createdAt: number;
};
```

Trace rows must correspond to real executed workflow steps whenever possible.

If demo/mock trace is used, label it as demo.

---

## 6. AI interpretation rules

The AI may:

- summarize evidence
- explain risk
- compare structured contexts
- produce concise natural-language interpretation

The AI may not:

- invent prices
- invent indicators
- invent signal scores
- convert signal alignment into probability
- guarantee returns
- instruct the user to buy or sell

---

## 7. Prompt contract

Every market analysis prompt must include:

- observed market context
- deterministic indicator values
- signal score and components
- evidence list
- missing-data flags, if any

Prompt must explicitly forbid:

- invented market data
- trading instructions
- probability claims unless model-calibrated later

---

## 8. Streaming behavior

`/api/chat` should eventually stream:

1. intent detected
2. workflow selected
3. tool started
4. tool completed / failed
5. analytics completed
6. signal generated
7. AI result validated
8. persisted

The first V1 polished workflow may use non-streaming API while preserving the event model.

---

## 9. Unknown intent

For `UNKNOWN`, return a compact domain response:

```text
COMMAND NOT ROUTED

Try: Analyze BTC on 4H
```

Do not open a generic chatbot fallback.
