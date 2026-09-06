import type { Timeframe } from "@/lib/market/types";

/**
 * Every entry must be listed on Binance USDT-M futures, which is the only market
 * this app reads. `TON` was on this list and is not listed there: the ticker
 * endpoint answers HTTP 200 with `{}`, the schema rejects the empty shape, and
 * every TON command and every click on its picker chip failed with
 * `MARKET_DATA_ERROR`. `tests/market/supported-assets.test.ts` now checks the
 * list against the exchange so the next one is caught before a user finds it.
 */
export const supportedBaseAssets = ["BTC", "ETH", "BNB", "SOL", "XRP", "DOGE", "ADA", "AVAX", "LINK"];

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

/**
 * Query strings are hand-editable, and an unsupported one used to be forwarded
 * to Binance, which answers 403 for a malformed symbol — mapped, reasonably but
 * wrongly, to `REGION_RESTRICTED`. The screen then told the reader to redeploy
 * to another region when the actual problem was three characters in the URL.
 * Unknown symbols now fall back to the default the same way an unknown
 * `timeframe` already does, and no request is spent finding that out.
 */
export function resolveSymbol(value: string | undefined, fallback = "BTCUSDT"): string {
  const base = (value ?? "").trim().toUpperCase().replace(/USDT$/, "");
  return supportedBaseAssets.includes(base) ? `${base}USDT` : fallback;
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
