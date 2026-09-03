import type { MarketDataProvider } from "./provider";
import type { Candle, FundingRate, KlineRequest, OrderBook, Ticker } from "./types";

type CacheEntry = {
  value: unknown;
  expiresAt: number;
};

const klineTtlMs: Record<KlineRequest["timeframe"], number> = {
  "15m": 15_000,
  "1h": 30_000,
  "4h": 90_000,
  "1d": 120_000,
};

export const marketCacheTtlMs = {
  ticker: 8_000,
  orderBook: 8_000,
  funding: 45_000,
};

export class MemoryCache {
  private readonly entries = new Map<string, CacheEntry>();

  constructor(private readonly now: () => number = Date.now) {}

  async resolve<T>(key: string, ttlMs: number, load: () => Promise<T>): Promise<T> {
    const entry = this.entries.get(key);

    if (entry && entry.expiresAt > this.now()) {
      return entry.value as T;
    }

    const value = await load();
    this.entries.set(key, { value, expiresAt: this.now() + ttlMs });

    return value;
  }

  clear() {
    this.entries.clear();
  }
}

export class CachedMarketDataProvider implements MarketDataProvider {
  constructor(
    private readonly inner: MarketDataProvider,
    private readonly cache = new MemoryCache(),
  ) {}

  getTicker(symbol: string): Promise<Ticker> {
    return this.cache.resolve(`ticker:${symbol}`, marketCacheTtlMs.ticker, () => this.inner.getTicker(symbol));
  }

  getKlines(request: KlineRequest): Promise<Candle[]> {
    return this.cache.resolve(
      `klines:${request.symbol}:${request.timeframe}:${request.limit}`,
      klineTtlMs[request.timeframe],
      () => this.inner.getKlines(request),
    );
  }

  getFundingRate(symbol: string): Promise<FundingRate> {
    return this.cache.resolve(`funding:${symbol}`, marketCacheTtlMs.funding, () => this.inner.getFundingRate(symbol));
  }

  getOrderBook(symbol: string): Promise<OrderBook> {
    return this.cache.resolve(`depth:${symbol}`, marketCacheTtlMs.orderBook, () => this.inner.getOrderBook(symbol));
  }
}
