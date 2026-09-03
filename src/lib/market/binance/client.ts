import { ChaosError } from "@/lib/utils/errors";
import { BinanceDepthSchema, BinanceFundingRateSchema, BinanceKlinesSchema, BinanceTickerSchema } from "./schemas";

const defaultBaseUrl = "https://fapi.binance.com";

type BinanceClientOptions = {
  baseUrl?: string;
};

export class BinancePublicClient {
  private readonly baseUrl: string;

  constructor(options: BinanceClientOptions = {}) {
    this.baseUrl = options.baseUrl ?? process.env.BINANCE_PUBLIC_BASE_URL ?? defaultBaseUrl;
  }

  async getTicker(symbol: string) {
    const payload = await this.request(`/fapi/v1/ticker/24hr?symbol=${encodeURIComponent(symbol)}`);
    return BinanceTickerSchema.parse(payload);
  }

  async getKlines(symbol: string, interval: string, limit: number) {
    const payload = await this.request(`/fapi/v1/klines?symbol=${encodeURIComponent(symbol)}&interval=${encodeURIComponent(interval)}&limit=${limit}`);
    return BinanceKlinesSchema.parse(payload);
  }

  async getFundingRate(symbol: string) {
    const payload = await this.request(`/fapi/v1/fundingRate?symbol=${encodeURIComponent(symbol)}&limit=1`);
    const parsed = BinanceFundingRateSchema.array().parse(payload);
    const [latest] = parsed;

    if (!latest) {
      throw new ChaosError("MARKET_DATA_ERROR", `Could not retrieve ${symbol} funding rate.`);
    }

    return latest;
  }

  async getDepth(symbol: string) {
    const payload = await this.request(`/fapi/v1/depth?symbol=${encodeURIComponent(symbol)}&limit=20`);
    return BinanceDepthSchema.parse(payload);
  }

  private async request(path: string): Promise<unknown> {
    const response = await fetch(`${this.baseUrl}${path}`, {
      headers: { Accept: "application/json" },
      next: { revalidate: 10 },
    });

    if (response.status === 429) {
      throw new ChaosError("RATE_LIMIT", "Binance rate limit reached.");
    }

    if (!response.ok) {
      throw new ChaosError("BINANCE_UNAVAILABLE", `Binance request failed with status ${response.status}.`);
    }

    return response.json();
  }
}
