import { describe, expect, it } from "vitest";
import { mapBinanceDepth, mapBinanceFundingRate, mapBinanceKline, mapBinanceTicker } from "../../src/lib/market/binance/mapper";

describe("binance mapper", () => {
  it("normalizes ticker", () => {
    const ticker = mapBinanceTicker({
      symbol: "BTCUSDT",
      lastPrice: "112481.32",
      priceChangePercent: "2.31",
      volume: "42810",
      quoteVolume: "4815200000",
      closeTime: 1,
    });

    expect(ticker.price).toBe(112481.32);
    expect(ticker.change24hPercent).toBe(2.31);
  });

  it("normalizes kline", () => {
    const candle = mapBinanceKline([1, "1", "2", "0.5", "1.5", "100", 2, "150", 10, "50", "75", "0"]);

    expect(candle.high).toBe(2);
    expect(candle.close).toBe(1.5);
  });

  it("normalizes funding and depth", () => {
    expect(mapBinanceFundingRate({ symbol: "BTCUSDT", fundingRate: "0.0001", fundingTime: 1 }).rate).toBe(0.0001);
    expect(mapBinanceDepth({ lastUpdateId: 1, bids: [["100", "2"]], asks: [["101", "1"]] }).bids[0].quantity).toBe(2);
  });
});
