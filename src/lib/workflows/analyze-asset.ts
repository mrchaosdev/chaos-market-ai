import { maxSignalScore } from "@/lib/analysis/comparison";
import type { AIAnalysis, AnalysisContext } from "@/lib/ai/types";
import type { AgentTraceEvent } from "@/lib/agent/events";
import { calculateMarketStructure, type MarketStructure } from "@/lib/analysis/market-structure";
import { calculateSignalScore, type SignalScore } from "@/lib/analysis/signal-engine";
import { calculateATR, calculateEMA, calculateRSI, calculateVolumeChange } from "@/lib/indicators";
import type { MarketDataProvider } from "@/lib/market/provider";
import type { Candle, FundingRate, OrderBook, Ticker, Timeframe } from "@/lib/market/types";
import { ChaosError, toChaosError } from "@/lib/utils/errors";
import { formatNumber } from "@/lib/utils/format-number";
import { buildWorkflowMeta, createWorkflowContext, toWorkflowFailure, type WorkflowContext, type WorkflowMeta, type WorkflowOptions } from "./context";

export type AnalyzeAssetInput = {
  symbol: string;
  timeframe: Timeframe;
};

export type AssetIndicators = {
  ema20: number | null;
  ema50: number | null;
  rsi: number | null;
  atr: number | null;
  volumeChange: number | null;
};

export type AssetAnalysis = {
  symbol: string;
  timeframe: Timeframe;
  market: {
    ticker: Ticker;
    funding: FundingRate;
    orderBook: OrderBook;
    candles: Candle[];
  };
  indicators: AssetIndicators;
  structure: MarketStructure;
  signal: SignalScore;
  aiContext: AnalysisContext;
  ai: AIAnalysis;
  aiDegraded: boolean;
  aiWarning: string | null;
};

export type AnalyzeAssetResult = AssetAnalysis & {
  runId: string;
  workflow: "AnalyzeAssetWorkflow";
  trace: AgentTraceEvent[];
  meta: WorkflowMeta;
};

export async function analyzeAssetWorkflow(provider: MarketDataProvider, input: AnalyzeAssetInput, options: WorkflowOptions = {}): Promise<AnalyzeAssetResult> {
  const context = createWorkflowContext("AnalyzeAssetWorkflow", "run", options);

  try {
    const analysis = await analyzeAsset(provider, input, context);

    return {
      ...analysis,
      runId: context.recorder.runId,
      workflow: "AnalyzeAssetWorkflow",
      trace: context.recorder.snapshot(),
      meta: buildWorkflowMeta(context, analysis.aiDegraded),
    };
  } catch (error) {
    throw toWorkflowFailure(error, context);
  }
}

export async function analyzeAsset(provider: MarketDataProvider, input: AnalyzeAssetInput, context: WorkflowContext): Promise<AssetAnalysis> {
  const label = `${input.symbol} ${input.timeframe}`;
  const [ticker, candles, funding, orderBook] = await collectMarketData(provider, input, context, label);

  const indicators = await context.recorder.track(
    { phase: "analytics", toolName: "indicatorEngine", inputSummary: `${label} · ${candles.length} candles` },
    () => calculateIndicators(candles, input.symbol),
    {
      summarize: (value) => `RSI ${formatNullable(value.rsi, 1)} · EMA20 ${formatNullable(value.ema20, 2)} · ATR ${formatNullable(value.atr, 2)}`,
      errorCode: "ANALYTICS_ERROR",
    },
  );

  const structure = await context.recorder.track(
    { phase: "analytics", toolName: "marketStructure", inputSummary: label },
    () => calculateMarketStructure({ candles, ...indicators }),
    {
      summarize: (value) => `${value.trend} trend · ${value.momentum} momentum · ${value.volatility} volatility`,
      errorCode: "ANALYTICS_ERROR",
    },
  );

  const signal = await context.recorder.track(
    { phase: "signal", toolName: "signalEngine", inputSummary: label },
    () => calculateSignalScore({ structure, funding, orderBook }),
    { summarize: (value) => `${value.score} / ${maxSignalScore} alignment · ${value.bias}`, errorCode: "ANALYTICS_ERROR" },
  );

  const aiContext: AnalysisContext = {
    symbol: input.symbol,
    timeframe: input.timeframe,
    market: {
      price: ticker.price,
      change24hPercent: ticker.change24hPercent,
      volume24h: ticker.volume24h,
    },
    structure,
    indicators: {
      rsi: indicators.rsi,
      ema20: indicators.ema20,
      ema50: indicators.ema50,
      atr: indicators.atr,
    },
    funding: { rate: funding.rate },
    signal: { score: signal.score, bias: signal.bias },
  };

  const interpretation = await interpret(context, aiContext, label);

  return {
    symbol: input.symbol,
    timeframe: input.timeframe,
    market: { ticker, funding, orderBook, candles },
    indicators,
    structure,
    signal,
    aiContext,
    ai: interpretation.ai,
    aiDegraded: interpretation.degraded,
    aiWarning: interpretation.warning,
  };
}

async function collectMarketData(provider: MarketDataProvider, input: AnalyzeAssetInput, context: WorkflowContext, label: string) {
  const results = await Promise.allSettled([
    context.recorder.track({ phase: "market_data", toolName: "getTicker", inputSummary: input.symbol }, () => provider.getTicker(input.symbol), {
      summarize: (ticker) => `${formatNumber(ticker.price, 2)} · ${formatNumber(ticker.change24hPercent, 2)}% 24h`,
    }),
    context.recorder.track({ phase: "market_data", toolName: "getKlines", inputSummary: label }, () => provider.getKlines({ symbol: input.symbol, timeframe: input.timeframe, limit: 200 }), {
      summarize: (candles) => `${candles.length} candles`,
    }),
    context.recorder.track({ phase: "market_data", toolName: "getFundingRate", inputSummary: input.symbol }, () => provider.getFundingRate(input.symbol), {
      summarize: (funding) => `${formatNumber(funding.rate * 100, 4)}% funding`,
    }),
    context.recorder.track({ phase: "market_data", toolName: "getOrderBook", inputSummary: input.symbol }, () => provider.getOrderBook(input.symbol), {
      summarize: (orderBook) => `${orderBook.bids.length} bids · ${orderBook.asks.length} asks`,
    }),
  ]);

  const failure = results.find((result) => result.status === "rejected");

  if (failure && failure.status === "rejected") {
    throw toChaosError(failure.reason, "MARKET_DATA_ERROR");
  }

  const values = results.map((result) => (result.status === "fulfilled" ? result.value : null));

  return values as [Ticker, Candle[], FundingRate, OrderBook];
}

function calculateIndicators(candles: Candle[], symbol: string): AssetIndicators {
  if (candles.length < 50) {
    throw new ChaosError("ANALYTICS_ERROR", `${symbol} returned ${candles.length} candles, which is below the 50 required for EMA50.`);
  }

  const closes = candles.map((candle) => candle.close);
  const volumes = candles.map((candle) => candle.volume);

  return {
    ema20: calculateEMA(closes, 20).at(-1) ?? null,
    ema50: calculateEMA(closes, 50).at(-1) ?? null,
    rsi: calculateRSI(closes),
    atr: calculateATR(candles),
    volumeChange: calculateVolumeChange(volumes),
  };
}

async function interpret(context: WorkflowContext, aiContext: AnalysisContext, label: string) {
  try {
    const ai = await context.recorder.track(
      { phase: "ai", toolName: context.ai.descriptor.name, inputSummary: `${label} · ${context.ai.descriptor.model}` },
      () => context.ai.analyze(aiContext),
      { summarize: (value) => `bias ${value.bias} · ${value.risks.length} risks`, errorCode: "AI_PROVIDER_ERROR" },
    );

    return { ai, degraded: false, warning: null };
  } catch (error) {
    const chaosError = toChaosError(error, "AI_PROVIDER_ERROR");
    context.recorder.warn(
      { phase: "ai", toolName: context.fallbackAi.descriptor.name },
      "Deterministic local interpretation used instead.",
      chaosError.code,
    );

    return { ai: await context.fallbackAi.analyze(aiContext), degraded: true, warning: chaosError.message };
  }
}

function formatNullable(value: number | null, digits: number) {
  return value === null ? "n/a" : formatNumber(value, digits);
}
