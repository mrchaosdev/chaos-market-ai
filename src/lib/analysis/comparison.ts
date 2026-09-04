import type { AssetIndicators } from "@/lib/workflows/analyze-asset";
import type { MarketStructure } from "./market-structure";
import { maxSignalScore, type SignalScore } from "./signal-engine";

export { maxSignalScore, signalComponentMax } from "./signal-engine";

export type ComparisonDimension = "trend" | "momentum" | "volume" | "funding" | "risk" | "total";

export type ComparisonInput = {
  symbol: string;
  price: number;
  indicators: AssetIndicators;
  structure: MarketStructure;
  fundingRate: number;
  signal: SignalScore;
};

export type DimensionReading = {
  symbol: string;
  value: number | null;
  display: string;
};

export type ComparisonRow = {
  dimension: ComparisonDimension;
  label: string;
  measures: string;
  higherIsStronger: boolean;
  readings: DimensionReading[];
  leader: string | null;
};

export type ComparisonResult = {
  rows: ComparisonRow[];
  relativeStrength: string | null;
};

/**
 * Compare on the underlying measurements, not on the signal engine's bucketed
 * components. Those buckets are coarse on purpose — trend is 30, 15 or 4 — so two
 * assets that are both simply "bullish" always tie, which makes the comparison
 * look broken even when the market clearly separates them. Every value below is a
 * number the workflow already measured, shown with its unit.
 */
export function compareAssets(inputs: ComparisonInput[]): ComparisonResult {
  const rows: ComparisonRow[] = [
    buildRow("trend", "Trend extension", "price distance above EMA50", true, inputs, trendExtension, formatPercent),
    buildRow("momentum", "Momentum", "RSI", true, inputs, (input) => input.indicators.rsi, (value) => value.toFixed(1)),
    buildRow("volume", "Volume shift", "10-candle volume change", true, inputs, (input) => input.indicators.volumeChange, formatPercent),
    buildRow("funding", "Funding pressure", "absolute funding rate, lower is calmer", false, inputs, (input) => Math.abs(input.fundingRate) * 100, (value) => `${value.toFixed(4)}%`),
    buildRow("risk", "Volatility", "ATR as a share of price, lower is calmer", false, inputs, volatilityShare, formatPercent),
    buildRow("total", "Signal alignment", "deterministic component total", true, inputs, (input) => input.signal.score, (value) => `${Math.round(value)} / ${maxSignalScore}`),
  ];

  return {
    rows,
    relativeStrength: rows.find((row) => row.dimension === "total")?.leader ?? null,
  };
}

function buildRow(
  dimension: ComparisonDimension,
  label: string,
  measures: string,
  higherIsStronger: boolean,
  inputs: ComparisonInput[],
  measure: (input: ComparisonInput) => number | null,
  format: (value: number) => string,
): ComparisonRow {
  const readings: DimensionReading[] = inputs.map((input) => {
    const value = measure(input);

    return {
      symbol: input.symbol,
      value: value === null || !Number.isFinite(value) ? null : value,
      display: value === null || !Number.isFinite(value) ? "n/a" : format(value),
    };
  });

  return { dimension, label, measures, higherIsStronger, readings, leader: findLeader(readings, higherIsStronger) };
}

/** Null when nothing separates the assets, so the table never claims a winner it does not have. */
function findLeader(readings: DimensionReading[], higherIsStronger: boolean): string | null {
  const measured = readings.filter((reading): reading is DimensionReading & { value: number } => reading.value !== null);

  if (measured.length < 2) {
    return null;
  }

  const best = measured.reduce((leader, reading) =>
    higherIsStronger ? (reading.value > leader.value ? reading : leader) : reading.value < leader.value ? reading : leader,
  );

  const tied = measured.filter((reading) => Math.abs(reading.value - best.value) < 1e-9);

  return tied.length === measured.length ? null : best.symbol;
}

function trendExtension(input: ComparisonInput): number | null {
  const { ema50 } = input.indicators;

  if (ema50 === null || ema50 === 0) {
    return null;
  }

  return ((input.price - ema50) / ema50) * 100;
}

function volatilityShare(input: ComparisonInput): number | null {
  const { atr } = input.indicators;

  if (atr === null || input.price === 0) {
    return null;
  }

  return (atr / input.price) * 100;
}

function formatPercent(value: number) {
  const prefix = value > 0 ? "+" : "";
  return `${prefix}${value.toFixed(2)}%`;
}
