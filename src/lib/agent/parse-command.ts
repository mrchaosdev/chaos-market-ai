import type { Timeframe } from "@/lib/market/types";

export const supportedBaseAssets = ["BTC", "ETH", "BNB", "SOL", "XRP", "DOGE", "ADA", "AVAX", "LINK", "TON"];

export const defaultTimeframe: Timeframe = "4h";

const timeframePatterns: { timeframe: Timeframe; pattern: RegExp }[] = [
  { timeframe: "15m", pattern: /\b15\s?(?:m|min|minute|minutes)\b/i },
  { timeframe: "1h", pattern: /\b(?:1\s?(?:h|hr|hour)|hourly)\b/i },
  { timeframe: "4h", pattern: /\b4\s?(?:h|hr|hour|hours)\b/i },
  { timeframe: "1d", pattern: /\b(?:1\s?(?:d|day)|daily|24\s?h)\b/i },
];

export function parseTimeframe(command: string): Timeframe {
  return timeframePatterns.find((entry) => entry.pattern.test(command))?.timeframe ?? defaultTimeframe;
}

export function parseSymbols(command: string): string[] {
  const upper = command.toUpperCase();
  const symbols = supportedBaseAssets
    .map((base) => ({ base, index: findAssetIndex(upper, base) }))
    .filter((entry) => entry.index >= 0)
    .sort((left, right) => left.index - right.index)
    .map((entry) => `${entry.base}USDT`);

  return [...new Set(symbols)];
}

export function normalizeSymbol(value: string): string {
  const upper = value.trim().toUpperCase();

  if (upper.length === 0) {
    return "BTCUSDT";
  }

  return upper.endsWith("USDT") ? upper : `${upper}USDT`;
}

function findAssetIndex(upperCommand: string, base: string) {
  const match = new RegExp(`\\b${base}(?:USDT)?\\b`).exec(upperCommand);
  return match?.index ?? -1;
}
