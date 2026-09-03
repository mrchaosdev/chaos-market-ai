import type { MarketStructure } from "./market-structure";
import type { SignalScore } from "./signal-engine";

export type PulseTone = "positive" | "negative" | "neutral";

export type PulseState = {
  bpm: number;
  amplitude: number;
  tone: PulseTone;
  rhythm: string;
  cycleMs: number;
};

export type PulseInput = {
  volatility: MarketStructure["volatility"];
  trend: MarketStructure["trend"];
  volume: MarketStructure["volume"];
  signalScore: SignalScore["score"];
};

/**
 * Volatility class sets the rate. A calm tape rests, a violent tape races.
 * These are fixed classes, not a continuous read of ATR, so the same market
 * structure always produces the same rate.
 */
const bpmByVolatility: Record<MarketStructure["volatility"], number> = {
  low: 46,
  medium: 64,
  high: 92,
};

/** Expanding volume adds a little urgency, declining volume takes it away. */
const bpmByVolume: Record<MarketStructure["volume"], number> = {
  expanding: 8,
  stable: 0,
  declining: -6,
};

const toneByTrend: Record<MarketStructure["trend"], PulseTone> = {
  bullish: "positive",
  bearish: "negative",
  neutral: "neutral",
};

export const minAmplitude = 0.028;
export const maxAmplitude = 0.098;

export function derivePulse(input: PulseInput): PulseState {
  const bpm = bpmByVolatility[input.volatility] + bpmByVolume[input.volume];
  const strength = clamp(input.signalScore, 0, 100) / 100;

  return {
    bpm,
    amplitude: minAmplitude + strength * (maxAmplitude - minAmplitude),
    tone: toneByTrend[input.trend],
    rhythm: `${input.trend} · ${input.volatility} volatility`,
    cycleMs: (60 / bpm) * 1000,
  };
}

/**
 * One cardiac cycle in [0,1): a strong systolic spike, a weaker dicrotic
 * second beat, then rest. The double beat is what reads as a heart rather
 * than as breathing — a single sine wave never does.
 */
export function heartbeat(phase: number): number {
  return spike(phase, 0, 0.045) + 0.52 * spike(phase, 0.17, 0.058);
}

/** Asymmetric spike: fast attack, slow decay, peaking at exactly 1. */
function spike(phase: number, center: number, width: number): number {
  const distance = (phase - center) / width;

  if (distance < 0) {
    return 0;
  }

  return distance * Math.exp(1 - distance);
}

function clamp(value: number, min: number, max: number) {
  return Math.min(max, Math.max(min, value));
}
