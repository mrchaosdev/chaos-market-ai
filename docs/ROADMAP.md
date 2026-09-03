# Chaos Market AI — Roadmap

## 1. Hackathon MVP

Goal: one polished end-to-end workflow.

```text
Landing
→ Launch Chaos
→ Analyze BTC on 4H
→ visible execution trace
→ market data retrieved
→ indicators calculated
→ signal generated
→ AI interpretation validated
→ evidence rendered
```

Required:

- real or clearly demo-labeled market provider
- deterministic EMA / RSI / ATR / volume
- signal alignment score
- agent trace UI
- evidence-first result UI
- no trading tools

---

## 2. V1 completion

V1 is complete when:

- Analyze BTC 4H works end-to-end with real Binance market data.
- Compare BTC/ETH works from the same analysis pipeline.
- Market overview works for BTC/ETH/BNB.
- Entry-area analysis uses neutral, non-instructional language.
- AI output validates with Zod.
- Runs and feedback persist to PostgreSQL.
- Unit tests cover indicators and signal engine.
- Evaluation covers router/tool/schema/safety checks.
- UI follows the locked design system.

---

## 3. V2 — Product depth

- watchlist
- richer history filters
- more assets
- market alerts
- more deterministic indicators
- better chart overlays

---

## 4. V3 — Portfolio read-only

- balances
- allocation
- concentration
- exposure
- portfolio risk

Still no autonomous execution.

---

## 5. V4 — Scenario / paper mode

- virtual positions
- scenario testing
- paper signal tracking
- post-analysis outcome review

---

## 6. V5 — Human-approved execution

Only after explicit product approval:

```text
AI recommendation
→ user reviews evidence
→ user explicitly confirms
→ system executes
```

No hidden execution.

---

## 7. V6 — Research layer

- news
- documents
- RAG
- market reports
- source citations

---

## 8. V7 — Local inference

- Ollama / vLLM
- Qwen / Llama / Gemma
- provider swap through `AIProvider`

---

## 9. V8 — Fine-tuning

Only after enough evaluated product data exists:

```text
collect dataset
→ clean dataset
→ evaluate baseline
→ LoRA / QLoRA
→ regression eval
→ deploy if better
```
