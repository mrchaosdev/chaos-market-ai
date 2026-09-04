import { maxSignalScore } from "@/lib/analysis/signal-engine";
import type { AIAnalysis, AnalysisContext } from "./types";

const numberPattern = /-?\d[\d,]*(?:\.\d+)?/g;

/**
 * Indicator periods, small ordinals, and the signal scale itself. These are
 * structural constants of the system rather than market data, so quoting them is
 * not an invented number.
 */
const alwaysAllowed = new Set([0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 12, 14, 20, 24, 50, 100, 200, maxSignalScore]);

export function collectContextNumbers(context: AnalysisContext): number[] {
  const base = [
    context.market.price,
    context.market.change24hPercent,
    context.market.volume24h,
    context.indicators.rsi,
    context.indicators.ema20,
    context.indicators.ema50,
    context.indicators.atr,
    context.structure.support,
    context.structure.resistance,
    context.funding.rate,
    context.funding.rate * 100,
    context.signal.score,
  ].filter((value): value is number => typeof value === "number" && Number.isFinite(value));

  return base.flatMap((value) => [value, Math.round(value), Number(value.toFixed(1)), Number(value.toFixed(2))]);
}

export function extractNumbers(text: string): number[] {
  return (text.match(numberPattern) ?? []).map((token) => Number(token.replaceAll(",", ""))).filter(Number.isFinite);
}

export function findUnsupportedNumbers(analysis: AIAnalysis, context: AnalysisContext): number[] {
  const allowed = collectContextNumbers(context);
  const prose = [analysis.summary, analysis.conclusion, ...analysis.observations, ...analysis.bullishFactors, ...analysis.bearishFactors, ...analysis.risks];

  const unsupported = prose
    .flatMap(extractNumbers)
    .filter((value) => !alwaysAllowed.has(Math.abs(value)))
    .filter((value) => !allowed.some((reference) => isClose(value, reference)));

  return [...new Set(unsupported)];
}

function isClose(value: number, reference: number) {
  const tolerance = Math.max(Math.abs(reference) * 0.005, 0.0001);
  return Math.abs(value - reference) <= tolerance;
}
