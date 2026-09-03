import type { Candle } from "@/lib/market/types";

export type PriceLevels = {
  support: number | null;
  resistance: number | null;
};

export type SupportResistanceOptions = {
  lookback?: number;
  pivotStrength?: number;
};

export function calculateSupportResistance(candles: Candle[], options: SupportResistanceOptions = {}): PriceLevels {
  const lookback = options.lookback ?? 60;
  const pivotStrength = options.pivotStrength ?? 2;
  const window = candles.slice(-lookback);
  const reference = window.at(-1)?.close ?? null;

  if (window.length === 0 || reference === null) {
    return { support: null, resistance: null };
  }

  const swingLows = findPivots(window, pivotStrength, "low");
  const swingHighs = findPivots(window, pivotStrength, "high");
  const support = nearestBelow(swingLows, reference) ?? Math.min(...window.map((candle) => candle.low));
  const resistance = nearestAbove(swingHighs, reference) ?? Math.max(...window.map((candle) => candle.high));

  return { support, resistance };
}

function findPivots(candles: Candle[], strength: number, kind: "low" | "high") {
  const pivots: number[] = [];

  for (let index = strength; index < candles.length - strength; index += 1) {
    const candidate = candles[index][kind];
    let isPivot = true;

    for (let offset = 1; offset <= strength; offset += 1) {
      const left = candles[index - offset][kind];
      const right = candles[index + offset][kind];
      const failsLow = kind === "low" && (left < candidate || right < candidate);
      const failsHigh = kind === "high" && (left > candidate || right > candidate);

      if (failsLow || failsHigh) {
        isPivot = false;
        break;
      }
    }

    if (isPivot) {
      pivots.push(candidate);
    }
  }

  return pivots;
}

function nearestBelow(levels: number[], reference: number) {
  const below = levels.filter((level) => level < reference);
  return below.length === 0 ? null : Math.max(...below);
}

function nearestAbove(levels: number[], reference: number) {
  const above = levels.filter((level) => level > reference);
  return above.length === 0 ? null : Math.min(...above);
}
