import { beforeEach, describe, expect, it } from "vitest";
import analyzeCases from "../../evals/analyze.json";
import compareCases from "../../evals/compare.json";
import failureCases from "../../evals/failure-cases.json";
import { WorkflowFailure } from "../../src/lib/workflows/context";
import { analyzeAssetWorkflow } from "../../src/lib/workflows/analyze-asset";
import { compareAssetsWorkflow } from "../../src/lib/workflows/compare-assets";
import { buildCandles, FakeMarketDataProvider } from "../fixtures/market-provider";
import type { ChaosErrorCode } from "../../src/lib/utils/errors";
import type { MarketDataProvider } from "../../src/lib/market/provider";

type AnalyzeCase = { query: string; expectedWorkflow: string; requiredEvidence: string[] };
type CompareCase = { query: string; expectedWorkflow: string; requiredEvidence: string[] };
type FailureCase = { name: string; failOn?: string; candles?: number; expectedCode: ChaosErrorCode; expectAiPhase: boolean };

beforeEach(() => {
  process.env.AI_PROVIDER = "local";
  process.env.AI_API_KEY = "";
});

describe("tool correctness eval", () => {
  it.each(analyzeCases as AnalyzeCase[])("$query retrieves every required tool", async (testCase) => {
    const provider = new FakeMarketDataProvider();
    const result = await analyzeAssetWorkflow(provider, { symbol: "BTCUSDT", timeframe: "4h" });

    expect(result.workflow).toBe(testCase.expectedWorkflow);
    expect(provider.calls).toContain("getTicker");
    expect(provider.calls).toContain("getKlines");
    expect(provider.calls).toContain("getFundingRate");
    expect(provider.calls).toContain("getOrderBook");

    const evidence: Record<string, unknown> = {
      ticker: result.market.ticker,
      candles: result.market.candles,
      funding: result.market.funding,
      orderbook: result.market.orderBook,
      indicators: result.indicators,
      signal: result.signal,
    };

    for (const key of testCase.requiredEvidence) {
      expect(evidence[key]).toBeDefined();
    }
  });

  it.each(compareCases as CompareCase[])("$query compares both assets", async (testCase) => {
    const result = await compareAssetsWorkflow(new FakeMarketDataProvider(), ["BTCUSDT", "ETHUSDT"], "4h");
    const symbols = result.analyses.map((analysis) => analysis.symbol);

    expect(result.workflow).toBe(testCase.expectedWorkflow);

    for (const key of testCase.requiredEvidence) {
      if (key === "relativeStrength") {
        expect(result.relativeStrength).not.toBeUndefined();
      } else {
        expect(symbols).toContain(key);
      }
    }
  });
});

describe("failure-case eval", () => {
  it.each(failureCases as FailureCase[])("$name returns $expectedCode", async (testCase) => {
    const provider = new FakeMarketDataProvider({
      candles: testCase.candles ? buildCandles(testCase.candles) : undefined,
      failOn: testCase.failOn ? { [testCase.failOn as keyof MarketDataProvider]: testCase.expectedCode } : undefined,
    });

    try {
      await analyzeAssetWorkflow(provider, { symbol: "NOTAREALPAIR", timeframe: "4h" });
      throw new Error(`${testCase.name} should have failed`);
    } catch (error) {
      const failure = error as WorkflowFailure;
      expect(failure).toBeInstanceOf(WorkflowFailure);
      expect(failure.code).toBe(testCase.expectedCode);
      expect(failure.trace.some((event) => event.phase === "ai")).toBe(testCase.expectAiPhase);
      expect(failure.trace.some((event) => event.status === "error")).toBe(true);
    }
  });
});
