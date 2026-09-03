export type ChaosErrorCode = "MCP_CONNECTION_ERROR" | "BINANCE_UNAVAILABLE" | "INVALID_SYMBOL" | "RATE_LIMIT" | "MARKET_DATA_ERROR" | "ANALYTICS_ERROR" | "AI_PROVIDER_ERROR" | "DATABASE_ERROR";

export class ChaosError extends Error {
  constructor(public readonly code: ChaosErrorCode, message: string) {
    super(message);
  }
}
