import type { MarketDataProvider } from "../../src/lib/market/provider";
import type { Candle, FundingRate, KlineRequest, OrderBook, Ticker } from "../../src/lib/market/types";
import { ChaosError, type ChaosErrorCode } from "../../src/lib/utils/errors";

export function buildCandles(count = 200, options: { start?: number; step?: number; intervalMs?: number } = {}): Candle[] {
  const start = options.start ?? 100_000;
  const step = options.step ?? 60;
  const intervalMs = options.intervalMs ?? 4 * 60 * 60 * 1000;
  const now = 1_700_000_000_000;

  return Array.from({ length: count }).map((_, index) => {
    const open = start + index * step;
    const close = open + step * 0.6;

    return {
      timestamp: now - (count - index) * intervalMs,
      open,
      high: close + step * 0.4,
      low: open - step * 0.4,
      close,
      volume: 1000 + (index % 25) * 12,
    };
  });
}

export type FakeProviderOptions = {
  candles?: Candle[];
  price?: number;
  fundingRate?: number;
  failOn?: Partial<Record<keyof MarketDataProvider, ChaosErrorCode>>;
};

export class FakeMarketDataProvider implements MarketDataProvider {
  readonly calls: string[] = [];

  constructor(private readonly options: FakeProviderOptions = {}) {}

  async getTicker(symbol: string): Promise<Ticker> {
    this.record("getTicker");

    return {
      symbol,
      price: this.options.price ?? this.candles().at(-1)?.close ?? 100_000,
      change24hPercent: 2.31,
      volume24h: 42_810,
      quoteVolume24h: 4_815_200_000,
      timestamp: 1_700_000_000_000,
    };
  }

  async getKlines(request: KlineRequest): Promise<Candle[]> {
    this.record("getKlines");
    return this.candles().slice(-request.limit);
  }

  async getFundingRate(symbol: string): Promise<FundingRate> {
    this.record("getFundingRate");
    return { symbol, rate: this.options.fundingRate ?? 0.0001, nextFundingTime: 1_700_000_000_000 };
  }

  async getOrderBook(): Promise<OrderBook> {
    this.record("getOrderBook");

    return {
      bids: [
        { price: 99_900, quantity: 18.4 },
        { price: 99_800, quantity: 12.8 },
      ],
      asks: [{ price: 100_100, quantity: 11.2 }],
      timestamp: 1_700_000_000_000,
    };
  }

  private candles() {
    return this.options.candles ?? buildCandles();
  }

  private record(tool: keyof MarketDataProvider) {
    this.calls.push(tool);
    const failure = this.options.failOn?.[tool];

    if (failure) {
      throw new ChaosError(failure, `${tool} failed in test fixture.`);
    }
  }
}
