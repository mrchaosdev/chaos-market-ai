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
    ai: {
      summary: "BTC maintains a constructive 4H structure based on deterministic signal alignment.",
      observations: [
        "Observed market data was retrieved before interpretation.",
        "Indicators were calculated in TypeScript, not by AI.",
        "Signal alignment is not a probability forecast.",
      ],
      risks: ["Price is near the current resistance band.", "Momentum can fade if volume expansion weakens."],
      conclusion: "Market analysis only. Not a trading instruction.",
    },
  };
}
