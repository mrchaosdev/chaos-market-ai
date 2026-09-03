import { describe, expect, it } from "vitest";
import { CachedMarketDataProvider, MemoryCache } from "../../src/lib/market/cache";
import { FakeMarketDataProvider } from "../fixtures/market-provider";

describe("memory cache", () => {
  it("serves a cached value inside the TTL window", async () => {
    let now = 0;
    const cache = new MemoryCache(() => now);
    const inner = new FakeMarketDataProvider();
    const provider = new CachedMarketDataProvider(inner, cache);

    await provider.getTicker("BTCUSDT");
    await provider.getTicker("BTCUSDT");

    expect(inner.calls.filter((call) => call === "getTicker")).toHaveLength(1);

    now = 60_000;
    await provider.getTicker("BTCUSDT");

    expect(inner.calls.filter((call) => call === "getTicker")).toHaveLength(2);
  });

  it("keys candles by symbol, timeframe and limit", async () => {
    const inner = new FakeMarketDataProvider();
    const provider = new CachedMarketDataProvider(inner, new MemoryCache(() => 0));

    await provider.getKlines({ symbol: "BTCUSDT", timeframe: "4h", limit: 200 });
    await provider.getKlines({ symbol: "BTCUSDT", timeframe: "1h", limit: 200 });
    await provider.getKlines({ symbol: "BTCUSDT", timeframe: "4h", limit: 200 });

    expect(inner.calls.filter((call) => call === "getKlines")).toHaveLength(2);
  });
});
