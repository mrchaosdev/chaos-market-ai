import { describe, expect, it } from "vitest";
import schemaCases from "../../evals/schema.json";
import { findUnsupportedNumbers } from "../../src/lib/ai/guard";
import { AIAnalysisSchema } from "../../src/lib/ai/schemas";
import type { AIAnalysis, AnalysisContext } from "../../src/lib/ai/types";

const context: AnalysisContext = {
  symbol: "BTCUSDT",
  timeframe: "4h",
  market: { price: 112481.32, change24hPercent: 2.31, volume24h: 42810 },
  structure: { trend: "bullish", momentum: "strong", volatility: "medium", volume: "expanding", support: 108000, resistance: 115000 },
  indicators: { rsi: 61.4, ema20: 111400, ema50: 109800, atr: 1280 },
  funding: { rate: 0.0001 },
  signal: { score: 72, bias: "bullish" },
};

const emptyAnalysis: Omit<AIAnalysis, "summary"> = {
  bias: "neutral",
  observations: [],
  bullishFactors: [],
  bearishFactors: [],
  risks: [],
  conclusion: "Market analysis only.",
};

describe("ai schema eval", () => {
  it.each(schemaCases.valid)("accepts $name", (testCase) => {
    expect(AIAnalysisSchema.safeParse(testCase.output).success).toBe(true);
  });

  it.each(schemaCases.invalid)("rejects $name", (testCase) => {
    expect(AIAnalysisSchema.safeParse(testCase.output).success).toBe(false);
  });
});

describe("hallucination eval", () => {
  it.each(schemaCases.hallucinationCases)("$name", (testCase) => {
    const analysis: AIAnalysis = { ...emptyAnalysis, summary: testCase.prose };
    const unsupported = findUnsupportedNumbers(analysis, context);

    expect(unsupported.length > 0).toBe(testCase.expectUnsupported);
  });
});
