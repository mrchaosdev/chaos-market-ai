import { ChaosError } from "@/lib/utils/errors";
import { BinanceDepthSchema, BinanceErrorSchema, BinanceFundingRateSchema, BinanceKlinesSchema, BinanceTickerSchema } from "./schemas";

const defaultBaseUrl = "https://fapi.binance.com";
const defaultTimeoutMs = 8000;
const invalidSymbolCodes = [-1121, -1122];

type BinanceClientOptions = {
  baseUrl?: string;
  timeoutMs?: number;
  revalidateSeconds?: number;
};

export class BinancePublicClient {
  private readonly baseUrl: string;
  private readonly timeoutMs: number;

  constructor(options: BinanceClientOptions = {}) {
    this.baseUrl = options.baseUrl ?? process.env.BINANCE_PUBLIC_BASE_URL ?? defaultBaseUrl;
    this.timeoutMs = options.timeoutMs ?? defaultTimeoutMs;
  }

  async getTicker(symbol: string) {
    const payload = await this.request(`/fapi/v1/ticker/24hr?symbol=${encodeURIComponent(symbol)}`, symbol);
    return parseOrFail(BinanceTickerSchema, payload, `${symbol} ticker`);
  }

  async getKlines(symbol: string, interval: string, limit: number) {
    const payload = await this.request(
      `/fapi/v1/klines?symbol=${encodeURIComponent(symbol)}&interval=${encodeURIComponent(interval)}&limit=${limit}`,
      symbol,
    );
    const klines = parseOrFail(BinanceKlinesSchema, payload, `${symbol} klines`);

    if (klines.length === 0) {
      throw new ChaosError("MARKET_DATA_ERROR", `Binance returned no ${interval} candles for ${symbol}.`);
    }

    return klines;
  }

  async getFundingRate(symbol: string) {
    const payload = await this.request(`/fapi/v1/fundingRate?symbol=${encodeURIComponent(symbol)}&limit=1`, symbol);
    const parsed = parseOrFail(BinanceFundingRateSchema.array(), payload, `${symbol} funding rate`);
    const [latest] = parsed;

    if (!latest) {
      throw new ChaosError("MARKET_DATA_ERROR", `Binance returned no funding history for ${symbol}.`);
    }

    return latest;
  }

  async getDepth(symbol: string) {
    const payload = await this.request(`/fapi/v1/depth?symbol=${encodeURIComponent(symbol)}&limit=20`, symbol);
    return parseOrFail(BinanceDepthSchema, payload, `${symbol} order book`);
  }

  private async request(path: string, symbol: string): Promise<unknown> {
    const response = await this.fetchWithTimeout(`${this.baseUrl}${path}`);

    if (response.status === 429 || response.status === 418) {
      throw new ChaosError("RATE_LIMIT", "Binance rate limit reached for this IP.");
    }

    if (response.status === 400) {
      throw await this.toBadRequestError(response, symbol);
    }

    if (!response.ok) {
      throw new ChaosError("BINANCE_UNAVAILABLE", `Binance responded with status ${response.status}.`);
    }

    try {
      return await response.json();
    } catch (error) {
      throw new ChaosError("MARKET_DATA_ERROR", "Binance response was not valid JSON.", error);
    }
  }

  private async fetchWithTimeout(url: string) {
    try {
      return await fetch(url, {
        headers: { Accept: "application/json" },
        signal: AbortSignal.timeout(this.timeoutMs),
        cache: "no-store",
      });
    } catch (error) {
      if (error instanceof Error && (error.name === "TimeoutError" || error.name === "AbortError")) {
        throw new ChaosError("BINANCE_UNAVAILABLE", `Binance did not respond within ${this.timeoutMs}ms.`, error);
      }

      throw new ChaosError("BINANCE_UNAVAILABLE", "Binance public endpoint is unreachable from this network.", error);
    }
  }

  private async toBadRequestError(response: Response, symbol: string) {
    const parsed = BinanceErrorSchema.safeParse(await response.json().catch(() => null));

    if (parsed.success && invalidSymbolCodes.includes(parsed.data.code)) {
      return new ChaosError("INVALID_SYMBOL", `${symbol} is not a listed Binance USDT-M futures symbol.`);
    }

    return new ChaosError("MARKET_DATA_ERROR", parsed.success ? parsed.data.msg : `Binance rejected the request for ${symbol}.`);
  }
}

function parseOrFail<T>(schema: { safeParse(value: unknown): { success: true; data: T } | { success: false; error: unknown } }, payload: unknown, label: string): T {
  const parsed = schema.safeParse(payload);

  if (!parsed.success) {
    throw new ChaosError("MARKET_DATA_ERROR", `Binance ${label} response did not match the expected shape.`, parsed.error);
  }

  return parsed.data;
}
