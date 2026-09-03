import { createAIProvider } from "@/lib/ai/factory";
import type { AnalysisContext } from "@/lib/ai/types";
import { calculateMarketStructure } from "@/lib/analysis/market-structure";
import { calculateSignalScore } from "@/lib/analysis/signal-engine";
import { calculateATR, calculateEMA, calculateRSI, calculateVolumeChange } from "@/lib/indicators";
import type { MarketDataProvider } from "@/lib/market/provider";
import type { Timeframe } from "@/lib/market/types";

export type AnalyzeAssetInput = {
  symbol: string;
  timeframe: Timeframe;
};

export async function analyzeAssetWorkflow(provider: MarketDataProvider, input: AnalyzeAssetInput) {
  const [ticker, candles, funding, orderBook] = await Promise.all([
    provider.getTicker(input.symbol),
    provider.getKlines({ symbol: input.symbol, timeframe: input.timeframe, limit: 200 }),
    provider.getFundingRate(input.symbol),
    provider.getOrderBook(input.symbol),
  ]);

  const closes = candles.map((candle) => candle.close);
  const volumes = candles.map((candle) => candle.volume);
  const ema20Series = calculateEMA(closes, 20);
  const ema50Series = calculateEMA(closes, 50);
  const rsi = calculateRSI(closes);
  const atr = calculateATR(candles);
  const volumeChange = calculateVolumeChange(volumes);
  const ema20 = ema20Series.at(-1) ?? null;
  const ema50 = ema50Series.at(-1) ?? null;
  const structure = calculateMarketStructure({ candles, ema20, ema50, rsi, atr, volumeChange });
  const signal = calculateSignalScore({ structure, funding, orderBook });
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
      rsi,
      ema20,
      ema50,
      atr,
    },
    funding: {
      rate: funding.rate,
    },
    signal: {
      score: signal.score,
      bias: signal.bias,
    },
  };
  const ai = await createAIProvider().analyze(aiContext);

  return {
    runId: `run_${Date.now().toString(36)}`,
    market: {
      ticker,
      funding,
      orderBook,
      candles,
    },
    indicators: {
      ema20,
      ema50,
      rsi,
      atr,
      volumeChange,
    },
    structure,
    signal,
    ai,
  };
}
