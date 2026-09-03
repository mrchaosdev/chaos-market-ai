import type { Candle } from "@/lib/market/types";
import { calculateSupportResistance } from "./support-resistance";

export type MarketStructure = {
  trend: "bullish" | "bearish" | "neutral";
  momentum: "strong" | "moderate" | "weak";
  volatility: "low" | "medium" | "high";
  volume: "expanding" | "stable" | "declining";
  support: number | null;
  resistance: number | null;
};

export function calculateMarketStructure(input: {
  candles: Candle[];
  ema20: number | null;
  ema50: number | null;
  rsi: number | null;
  atr: number | null;
  volumeChange: number | null;
}): MarketStructure {
  const currentPrice = input.candles.at(-1)?.close ?? null;
  const levels = calculateSupportResistance(input.candles);

  return {
    trend: getTrend(currentPrice, input.ema20, input.ema50),
    momentum: getMomentum(input.rsi),
    volatility: getVolatility(currentPrice, input.atr),
    volume: getVolume(input.volumeChange),
    support: levels.support,
    resistance: levels.resistance,
  };
}

function getTrend(price: number | null, ema20: number | null, ema50: number | null): MarketStructure["trend"] {
  if (price === null || ema20 === null || ema50 === null) {
    return "neutral";
  }

  if (price > ema20 && ema20 > ema50) {
    return "bullish";
  }

  if (price < ema20 && ema20 < ema50) {
    return "bearish";
  }

  return "neutral";
}

function getMomentum(rsi: number | null): MarketStructure["momentum"] {
  if (rsi === null) {
    return "weak";
  }

  if (rsi >= 60 || rsi <= 40) {
    return "strong";
  }

  if (rsi >= 48 && rsi <= 58) {
    return "moderate";
  }

  return "weak";
}

function getVolatility(price: number | null, atr: number | null): MarketStructure["volatility"] {
  if (price === null || atr === null || price === 0) {
    return "medium";
  }

  const ratio = atr / price;

  if (ratio > 0.035) {
    return "high";
  }

  if (ratio < 0.012) {
    return "low";
  }

  return "medium";
}

function getVolume(volumeChange: number | null): MarketStructure["volume"] {
  if (volumeChange === null) {
    return "stable";
  }

  if (volumeChange > 10) {
    return "expanding";
  }

  if (volumeChange < -10) {
    return "declining";
  }

  return "stable";
}
