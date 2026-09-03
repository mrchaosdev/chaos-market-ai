import { beforeEach, describe, expect, it } from "vitest";
import { analyzeAssetWorkflow } from "../../src/lib/workflows/analyze-asset";
import { WorkflowFailure } from "../../src/lib/workflows/context";
import { buildCandles, FakeMarketDataProvider } from "../fixtures/market-provider";

beforeEach(() => {
  process.env.AI_PROVIDER = "local";
  process.env.AI_API_KEY = "";
  process.env.MARKET_PROVIDER = "binance-public";
});

describe("analyze asset workflow", () => {
  it("runs market data, analytics, signal and interpretation in order", async () => {
    const provider = new FakeMarketDataProvider();
    const result = await analyzeAssetWorkflow(provider, { symbol: "BTCUSDT", timeframe: "4h" });

    expect(result.workflow).toBe("AnalyzeAssetWorkflow");
    expect(result.runId).toMatch(/^run_/);
    expect(provider.calls.sort()).toEqual(["getFundingRate", "getKlines", "getOrderBook", "getTicker"]);

    const phases = result.trace.map((event) => event.phase);
    expect(phases.filter((phase) => phase === "market_data")).toHaveLength(4);
    expect(phases.indexOf("analytics")).toBeGreaterThan(phases.lastIndexOf("market_data"));
    expect(phases.indexOf("signal")).toBeGreaterThan(phases.indexOf("analytics"));
    expect(phases.indexOf("ai")).toBeGreaterThan(phases.indexOf("signal"));
    expect(result.trace.every((event) => event.status === "success")).toBe(true);
  });

  it("derives every reported number from deterministic calculation", async () => {
    const result = await analyzeAssetWorkflow(new FakeMarketDataProvider(), { symbol: "BTCUSDT", timeframe: "4h" });

    expect(result.indicators.ema20).not.toBeNull();
    expect(result.indicators.ema50).not.toBeNull();
    expect(result.indicators.rsi).not.toBeNull();
    expect(result.indicators.atr).not.toBeNull();
    expect(result.signal.score).toBe(Object.values(result.signal.components).reduce((total, value) => total + value, 0));
    expect(result.aiContext.market.price).toBe(result.market.ticker.price);
    expect(result.meta.aiProvider).toBe("local");
  });

  it("fails with a domain error and a trace when market data is unavailable", async () => {
    const provider = new FakeMarketDataProvider({ failOn: { getKlines: "BINANCE_UNAVAILABLE" } });

    await expect(analyzeAssetWorkflow(provider, { symbol: "BTCUSDT", timeframe: "4h" })).rejects.toMatchObject({
      code: "BINANCE_UNAVAILABLE",
    });

    try {
      await analyzeAssetWorkflow(provider, { symbol: "BTCUSDT", timeframe: "4h" });
    } catch (error) {
      const failure = error as WorkflowFailure;
      expect(failure).toBeInstanceOf(WorkflowFailure);
      expect(failure.trace.some((event) => event.status === "error" && event.toolName === "getKlines")).toBe(true);
      expect(failure.trace.some((event) => event.phase === "ai")).toBe(false);
    }
  });

  it("reports an analytics domain error when candle history is too short", async () => {
    const provider = new FakeMarketDataProvider({ candles: buildCandles(30) });

    await expect(analyzeAssetWorkflow(provider, { symbol: "BTCUSDT", timeframe: "4h" })).rejects.toMatchObject({
      code: "ANALYTICS_ERROR",
    });
  });
});
