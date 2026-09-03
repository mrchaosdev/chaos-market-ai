import type { Candle, FundingRate, KlineRequest, OrderBook, Ticker } from "@/lib/market/types";
import type { MarketDataProvider } from "../provider";

export class BinanceDemoAdapter implements MarketDataProvider {
  async getTicker(symbol: string): Promise<Ticker> {
    return {
      symbol,
      price: 112481.32,
      change24hPercent: 2.31,
      volume24h: 42810,
      quoteVolume24h: 4815200000,
      timestamp: Date.now(),
    };
  }

  async getKlines(request: KlineRequest): Promise<Candle[]> {
    const now = Date.now();
    const interval = getIntervalMs(request.timeframe);

    return Array.from({ length: request.limit }).map((_, index) => {
      const base = 108000 + index * 72;
      const wave = Math.sin(index / 4) * 820;
      const open = base + wave;
      const close = open + Math.cos(index / 3) * 360;
      const high = Math.max(open, close) + 420;
      const low = Math.min(open, close) - 390;

      return {
        timestamp: now - (request.limit - index) * interval,
        open,
        high,
        low,
        close,
        volume: 900 + ((index * 97) % 620),
      };
    });
  }

  async getFundingRate(symbol: string): Promise<FundingRate> {
    return {
      symbol,
      rate: 0.0001,
      nextFundingTime: Date.now() + 6 * 60 * 60 * 1000,
    };
  }

  async getOrderBook(symbol: string): Promise<OrderBook> {
    void symbol;

    return {
      bids: [
        { price: 112420, quantity: 18.4 },
        { price: 112360, quantity: 12.8 },
        { price: 112300, quantity: 9.2 },
      ],
      asks: [
        { price: 112540, quantity: 11.2 },
        { price: 112600, quantity: 8.6 },
        { price: 112680, quantity: 7.4 },
      ],
      timestamp: Date.now(),
    };
  }
}

function getIntervalMs(timeframe: KlineRequest["timeframe"]) {
  if (timeframe === "15m") {
    return 15 * 60 * 1000;
  }

  if (timeframe === "1h") {
    return 60 * 60 * 1000;
  }

  if (timeframe === "1d") {
    return 24 * 60 * 60 * 1000;
  }

  return 4 * 60 * 60 * 1000;
}
