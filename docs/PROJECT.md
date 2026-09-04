# Chaos Market AI — Product Specification

## 1. Product definition

Chaos Market AI is an evidence-first crypto market intelligence agent that retrieves live Binance market data, calculates deterministic signals, and uses AI to reason over structured evidence instead of guessing.

It is not a generic chat interface and is not an automated trading system.

## 2. Core product principles

### 2.1 Data first

Every factual market claim must come from a market-data provider.

### 2.2 Deterministic calculation

Indicators, levels, scores and classifications are implemented in code.

### 2.3 AI last

The LLM receives a compact, structured analysis context and is responsible for language, synthesis, comparison and risk explanation.

### 2.4 Evidence before prose

UI renders observed evidence and calculated signals before long AI-generated explanation.

### 2.5 Read-only first

V1 must not place, modify or cancel orders.

### 2.6 Build product before training

The system collects evaluated real interactions before any fine-tuning effort.

---

# 3. User problems

Chaos Market AI should answer these well:

1. How is the market today?
2. Analyze BTC on a timeframe.
3. Compare BTC and ETH.
4. Is an asset near an interesting technical entry area?
5. Why did the agent reach that conclusion?
6. What data and tools did the agent use?

---

# 4. V1 workflows

## 4.1 Market Overview

Input:

```text
How is the market today?
```

Required data:

- BTCUSDT ticker / candles / funding
- ETHUSDT ticker / candles / funding
- BNBUSDT ticker / candles / funding
- 24h movement and volume

Calculated:

- trend
- momentum
- volatility
- volume state
- market regime

Output:

- regime
- key assets
- signal summary
- concise AI interpretation

## 4.2 Analyze Asset

Input:

```text
Analyze BTC on 4H
```

Required tools:

- ticker
- klines
- funding
- order book

Calculated:

- EMA20
- EMA50
- RSI
- ATR
- volume change
- trend
- momentum
- volatility
- support
- resistance
- signal alignment

Output:

- bias
- structured metrics
- evidence
- risks
- AI interpretation

## 4.3 Compare Assets

Input:

```text
Compare BTC and ETH on 4H
```

System independently analyzes both assets, then compares normalized dimensions.

Output dimensions:

- trend
- momentum
- volume
- funding
- risk
- total signal
- relative strength

## 4.4 Entry-area Analysis

Input:

```text
Is BTC a good entry now?
```

Output must use neutral analytical language:

- current structure
- support
- resistance
- potential zone
- invalidation
- risk
- signal alignment
- evidence

Never output direct trade instruction such as `BUY NOW`.

---

# 5. Product surfaces

## 5.1 Landing

Purpose: explain the product through a real agent-run visual, not generic SaaS marketing.

Sections:

1. Hero
2. Live agent-run visual
3. Data → Signals → Reasoning flow
4. Real product preview
5. Technology
6. Launch CTA

## 5.2 Overview

- market regime
- BTC / ETH / BNB snapshots
- primary chart
- market signal list
- top movers

## 5.3 Analyze

- symbol / timeframe header
- financial chart
- signal alignment
- market structure
- indicators
- key levels
- evidence
- risks
- AI interpretation

## 5.4 Compare

- side-by-side assets
- normalized score dimensions
- relative-strength result
- evidence
- AI explanation

## 5.5 Agent

Command-style input, structured execution trace, workflow result.

Not a messenger/chat-bubble layout.

## 5.6 History

- previous runs
- filters
- workflow
- symbol
- timeframe
- result
- latency
- feedback

## 5.7 Settings

V1 settings should be restrained:

- AI provider/model
- default timeframe
- display preferences
- reduced motion / system preference
- data retention preferences if later required

---

# 6. Non-goals for V1

Do not implement:

- automated order execution
- trading API keys
- withdrawal
- copy trading
- news RAG
- X/Twitter sentiment
- Telegram bot
- voice agent
- portfolio execution
- NFT features
- multi-agent swarm
- 100 indicators
- full backtesting platform
- model training

---

# 7. Technical stack

```text
Next.js
TypeScript
React
Tailwind CSS
shadcn/ui
GSAP
@gsap/react
Lucide
TradingView Lightweight Charts
Vercel AI SDK
Zod
PostgreSQL
Drizzle ORM
Vitest
Playwright
```

Market data reaches Binance today through its public REST API only (`BinancePublicAdapter`). Binance Agent OS / MCP is not integrated — no public runtime exists to connect to. `MarketDataProvider` is the interface it would land behind as a second adapter, with no change required to workflows, UI, or persistence. Tracked as a blocked backlog item in `docs/TODO.md` §4.

---

# 8. Long-term phases

## Phase A — Product foundation

Cloud model, public/read-only market data, deterministic analytics.

## Phase B — Data quality

Observability, evaluation, user feedback, dataset curation.

## Phase C — Portfolio read-only

Balances, allocation, concentration and exposure.

## Phase D — Paper execution

Virtual positions and scenario testing.

## Phase E — Human-approved execution

AI recommendation → explicit user confirmation → execution.

## Phase F — Research

News and document RAG.

## Phase G — Local inference

Ollama/vLLM and suitable open-weight models.

## Phase H — Fine-tuning

Curated dataset → LoRA/QLoRA → evaluation → deployment.

---

# 9. Definition of done for V1

The V1 is considered complete when:

- Analyze BTC 4H works end-to-end with real market data.
- No market number in AI prose can be traced to an invented LLM value.
- Indicators are deterministic and unit-tested.
- Tool activity is visible in the Agent UI.
- AI output validates against Zod.
- Failed data retrieval produces a domain-specific error.
- The screen does not resemble ChatGPT, default shadcn dashboard, or Binance clone.
- All colors use approved design tokens.
- GSAP motion respects reduced-motion preferences.
- Runs, tool calls and feedback can be persisted.
- At least a small evaluation suite exists for intent/tool/schema/hallucination checks.
