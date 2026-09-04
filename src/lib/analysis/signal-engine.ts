import type { FundingRate, OrderBook } from "@/lib/market/types";
import type { MarketStructure } from "./market-structure";

export type SignalScore = {
  score: number;
  bias: "strong-bullish" | "bullish" | "neutral" | "bearish" | "strong-bearish";
  components: {
    trend: number;
    momentum: number;
    volume: number;
    volatility: number;
    funding: number;
    orderbook: number;
  };
};

/** The weight ceiling of each component. Their sum is the real maximum a score can reach. */
export const signalComponentMax: Record<keyof SignalScore["components"], number> = {
  trend: 30,
  momentum: 16,
  volume: 14,
  volatility: 10,
  funding: 10,
  orderbook: 15,
};

export const maxSignalScore = Object.values(signalComponentMax).reduce((total, value) => total + value, 0);

export function calculateSignalScore(input: {
  structure: MarketStructure;
  funding: FundingRate;
  orderBook: OrderBook;
}): SignalScore {
  const components = {
    trend: scoreTrend(input.structure.trend),
    momentum: scoreMomentum(input.structure.momentum),
    volume: scoreVolume(input.structure.volume),
    volatility: scoreVolatility(input.structure.volatility),
    funding: scoreFunding(input.funding.rate),
    orderbook: scoreOrderBook(input.orderBook),
  };
  const score = Object.values(components).reduce((total, value) => total + value, 0);

  return {
    score,
    bias: getBias(score),
    components,
  };
}

function scoreTrend(trend: MarketStructure["trend"]) {
  return trend === "bullish" ? 30 : trend === "neutral" ? 15 : 4;
}

function scoreMomentum(momentum: MarketStructure["momentum"]) {
  return momentum === "strong" ? 16 : momentum === "moderate" ? 12 : 6;
}

function scoreVolume(volume: MarketStructure["volume"]) {
  return volume === "expanding" ? 14 : volume === "stable" ? 9 : 4;
}

function scoreVolatility(volatility: MarketStructure["volatility"]) {
  return volatility === "medium" ? 10 : volatility === "low" ? 8 : 4;
}

function scoreFunding(rate: number) {
  const absoluteRate = Math.abs(rate);
  return absoluteRate <= 0.0002 ? 10 : absoluteRate <= 0.0006 ? 7 : 3;
}

function scoreOrderBook(orderBook: OrderBook) {
  const bidDepth = orderBook.bids.reduce((total, level) => total + level.quantity, 0);
  const askDepth = orderBook.asks.reduce((total, level) => total + level.quantity, 0);

  if (bidDepth === 0 && askDepth === 0) {
    return 8;
  }

  return bidDepth >= askDepth ? 15 : 8;
}

function getBias(score: number): SignalScore["bias"] {
  if (score >= 82) {
    return "strong-bullish";
  }

  if (score >= 62) {
    return "bullish";
  }

  if (score >= 42) {
    return "neutral";
  }

  if (score >= 22) {
    return "bearish";
  }

  return "strong-bearish";
}
