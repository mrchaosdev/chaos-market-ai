import { afterEach, describe, expect, it, vi } from "vitest";
import { BinancePublicClient } from "../../src/lib/market/binance/client";
import { BinancePublicAdapter } from "../../src/lib/market/binance/public-adapter";
import { ChaosError } from "../../src/lib/utils/errors";

const tickerPayload = {
  symbol: "BTCUSDT",
  lastPrice: "112481.32",
  priceChangePercent: "2.31",
  volume: "42810",
  quoteVolume: "4815200000",
  closeTime: 1_700_000_000_000,
};

function mockFetch(response: Partial<Response> & { jsonValue?: unknown }) {
  const fetchMock = vi.fn(async () => ({
    ok: response.ok ?? true,
    status: response.status ?? 200,
    json: async () => response.jsonValue,
  })) as unknown as typeof fetch;

  vi.stubGlobal("fetch", fetchMock);

  return fetchMock;
}

afterEach(() => {
  vi.unstubAllGlobals();
});

describe("binance public client", () => {
  it("normalizes a ticker through the adapter boundary", async () => {
    mockFetch({ jsonValue: tickerPayload });

    const ticker = await new BinancePublicAdapter(new BinancePublicClient({ baseUrl: "https://example.test" })).getTicker("BTCUSDT");

    expect(ticker).toEqual({
      symbol: "BTCUSDT",
      price: 112481.32,
      change24hPercent: 2.31,
      volume24h: 42810,
      quoteVolume24h: 4815200000,
      timestamp: 1_700_000_000_000,
    });
  });

  it("maps HTTP 429 to RATE_LIMIT", async () => {
    mockFetch({ ok: false, status: 429, jsonValue: {} });

    await expect(new BinancePublicClient({ baseUrl: "https://example.test" }).getTicker("BTCUSDT")).rejects.toMatchObject({ code: "RATE_LIMIT" });
  });

  it("maps Binance error code -1121 to INVALID_SYMBOL", async () => {
    mockFetch({ ok: false, status: 400, jsonValue: { code: -1121, msg: "Invalid symbol." } });

    await expect(new BinancePublicClient({ baseUrl: "https://example.test" }).getTicker("NOTREAL")).rejects.toMatchObject({ code: "INVALID_SYMBOL" });
  });

  it("maps HTTP 451 to REGION_RESTRICTED rather than to a network failure", async () => {
    mockFetch({ ok: false, status: 451, jsonValue: {} });

    const error = await new BinancePublicClient({ baseUrl: "https://example.test" }).getTicker("BTCUSDT").catch((caught) => caught);

    expect((error as ChaosError).code).toBe("REGION_RESTRICTED");
    expect((error as ChaosError).toPayload().hint).toMatch(/region/i);
  });

  it("maps HTTP 403 to REGION_RESTRICTED", async () => {
    mockFetch({ ok: false, status: 403, jsonValue: {} });

    await expect(new BinancePublicClient({ baseUrl: "https://example.test" }).getTicker("BTCUSDT")).rejects.toMatchObject({
      code: "REGION_RESTRICTED",
    });
  });

  it("maps an unreachable endpoint to BINANCE_UNAVAILABLE", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn(async () => {
        throw new TypeError("fetch failed");
      }),
    );

    await expect(new BinancePublicClient({ baseUrl: "https://example.test" }).getTicker("BTCUSDT")).rejects.toMatchObject({ code: "BINANCE_UNAVAILABLE" });
  });

  it("maps an unexpected response shape to MARKET_DATA_ERROR", async () => {
    mockFetch({ jsonValue: { symbol: "BTCUSDT" } });

    const error = await new BinancePublicClient({ baseUrl: "https://example.test" }).getTicker("BTCUSDT").catch((caught) => caught);

    expect(error).toBeInstanceOf(ChaosError);
    expect((error as ChaosError).code).toBe("MARKET_DATA_ERROR");
  });

  it("rejects an empty kline series", async () => {
    mockFetch({ jsonValue: [] });

    await expect(new BinancePublicClient({ baseUrl: "https://example.test" }).getKlines("BTCUSDT", "4h", 200)).rejects.toMatchObject({
      code: "MARKET_DATA_ERROR",
    });
  });
});
