import type { SignalScore } from "./signal-engine";

export const signalComponentMax: Record<keyof SignalScore["components"], number> = {
  trend: 30,
  momentum: 16,
  volume: 14,
  volatility: 10,
  funding: 10,
  orderbook: 15,
};

export const maxSignalScore = Object.values(signalComponentMax).reduce((total, value) => total + value, 0);

export type ComparisonDimension = "trend" | "momentum" | "volume" | "funding" | "risk" | "total";

export const comparisonDimensions: ComparisonDimension[] = ["trend", "momentum", "volume", "funding", "risk", "total"];

export type ComparisonEntry = {
  symbol: string;
  values: Record<ComparisonDimension, number>;
};

export type ComparisonResult = {
  entries: ComparisonEntry[];
  leaders: Record<ComparisonDimension, string | null>;
  relativeStrength: string | null;
};

export function normalizeSignal(signal: SignalScore): Record<ComparisonDimension, number> {
  return {
    trend: percent(signal.components.trend, signalComponentMax.trend),
    momentum: percent(signal.components.momentum, signalComponentMax.momentum),
    volume: percent(signal.components.volume, signalComponentMax.volume),
    funding: percent(signal.components.funding, signalComponentMax.funding),
    risk: percent(signal.components.volatility + signal.components.orderbook, signalComponentMax.volatility + signalComponentMax.orderbook),
    total: percent(signal.score, maxSignalScore),
  };
}

export function compareSignals(inputs: { symbol: string; signal: SignalScore }[]): ComparisonResult {
  const entries: ComparisonEntry[] = inputs.map((input) => ({ symbol: input.symbol, values: normalizeSignal(input.signal) }));
  const leaders = comparisonDimensions.reduce<Record<ComparisonDimension, string | null>>(
    (accumulator, dimension) => ({ ...accumulator, [dimension]: findLeader(entries, dimension) }),
    {} as Record<ComparisonDimension, string | null>,
  );

  return { entries, leaders, relativeStrength: leaders.total };
}

function findLeader(entries: ComparisonEntry[], dimension: ComparisonDimension) {
  if (entries.length === 0) {
    return null;
  }

  const best = entries.reduce((leader, entry) => (entry.values[dimension] > leader.values[dimension] ? entry : leader));
  const tied = entries.filter((entry) => entry.values[dimension] === best.values[dimension]);

  return tied.length === entries.length ? null : best.symbol;
}

function percent(value: number, max: number) {
  return Math.round((value / max) * 100);
}
