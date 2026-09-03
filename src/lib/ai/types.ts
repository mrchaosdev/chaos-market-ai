import type { MarketStructure } from "@/lib/analysis/market-structure";
import type { SignalScore } from "@/lib/analysis/signal-engine";
import type { FundingRate, Ticker } from "@/lib/market/types";

export type AnalysisContext = {
  symbol: string;
  timeframe: string;
  market: Pick<Ticker, "price" | "change24hPercent" | "volume24h">;
  structure: MarketStructure;
  indicators: {
    rsi: number | null;
    ema20: number | null;
    ema50: number | null;
    atr: number | null;
  };
  funding: Pick<FundingRate, "rate">;
  signal: Pick<SignalScore, "score" | "bias">;
};

export type AIAnalysis = {
  summary: string;
  bias: "strong_bullish" | "bullish" | "neutral" | "bearish" | "strong_bearish";
  observations: string[];
  bullishFactors: string[];
  bearishFactors: string[];
  risks: string[];
  conclusion: string;
};
