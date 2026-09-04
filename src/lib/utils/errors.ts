export type ChaosErrorCode =
  | "MCP_CONNECTION_ERROR"
  | "BINANCE_UNAVAILABLE"
  | "REGION_RESTRICTED"
  | "INVALID_SYMBOL"
  | "RATE_LIMIT"
  | "MARKET_DATA_ERROR"
  | "ANALYTICS_ERROR"
  | "AI_PROVIDER_ERROR"
  | "DATABASE_ERROR"
  | "COMMAND_NOT_ROUTED";

export type ChaosErrorPayload = {
  code: ChaosErrorCode;
  message: string;
  hint: string;
};

export class ChaosError extends Error {
  constructor(
    public readonly code: ChaosErrorCode,
    message: string,
    public readonly cause?: unknown,
  ) {
    super(message);
    this.name = "ChaosError";
  }

  toPayload(): ChaosErrorPayload {
    return { code: this.code, message: this.message, hint: chaosErrorHints[this.code] };
  }
}

export const chaosErrorHints: Record<ChaosErrorCode, string> = {
  MCP_CONNECTION_ERROR: "The Binance Agent OS / MCP runtime did not answer. Switch MARKET_PROVIDER to binance-public or start the runtime.",
  BINANCE_UNAVAILABLE: "Binance public market data is not reachable right now. No analysis is produced from placeholder prices.",
  REGION_RESTRICTED: "Binance refuses public market data from this IP. Cloud regions such as Vercel's default us-east are commonly blocked. Deploy to an allowed region, or point BINANCE_PUBLIC_BASE_URL at a reachable Binance endpoint.",
  INVALID_SYMBOL: "The requested symbol is not listed on the Binance USDT-M futures market.",
  RATE_LIMIT: "Binance rate limit reached. Wait for the limit window to reset before running the workflow again.",
  MARKET_DATA_ERROR: "Market data was retrieved but did not contain the fields the workflow requires.",
  ANALYTICS_ERROR: "Deterministic analytics could not run on the retrieved candles.",
  AI_PROVIDER_ERROR: "The AI provider failed to return a schema-valid interpretation. Deterministic evidence is still available.",
  DATABASE_ERROR: "Persistence failed. The analysis itself is unaffected.",
  COMMAND_NOT_ROUTED: "The command did not match a known workflow.",
};

export const chaosErrorStatus: Record<ChaosErrorCode, number> = {
  MCP_CONNECTION_ERROR: 502,
  BINANCE_UNAVAILABLE: 502,
  REGION_RESTRICTED: 451,
  INVALID_SYMBOL: 400,
  RATE_LIMIT: 429,
  MARKET_DATA_ERROR: 502,
  ANALYTICS_ERROR: 500,
  AI_PROVIDER_ERROR: 502,
  DATABASE_ERROR: 500,
  COMMAND_NOT_ROUTED: 400,
};

export function isChaosError(value: unknown): value is ChaosError {
  return value instanceof ChaosError;
}

export function toChaosError(value: unknown, fallbackCode: ChaosErrorCode = "MARKET_DATA_ERROR"): ChaosError {
  if (isChaosError(value)) {
    return value;
  }

  if (value instanceof Error) {
    return new ChaosError(fallbackCode, value.message, value);
  }

  return new ChaosError(fallbackCode, "Unknown workflow failure.", value);
}
