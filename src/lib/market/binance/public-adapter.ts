import type { Candle, FundingRate, KlineRequest, OrderBook, Ticker } from "@/lib/market/types";
import type { MarketDataProvider } from "../provider";
import { BinancePublicClient } from "./client";
import { mapBinanceDepth, mapBinanceFundingRate, mapBinanceKline, mapBinanceTicker } from "./mapper";

export class BinancePublicAdapter implements MarketDataProvider {
  constructor(private readonly client = new BinancePublicClient()) {}

  async getTicker(symbol: string): Promise<Ticker> {
    return mapBinanceTicker(await this.client.getTicker(symbol));
  }

  async getKlines(request: KlineRequest): Promise<Candle[]> {
    const klines = await this.client.getKlines(request.symbol, mapTimeframe(request.timeframe), request.limit);
    return klines.map(mapBinanceKline);
  }

  async getFundingRate(symbol: string): Promise<FundingRate> {
    return mapBinanceFundingRate(await this.client.getFundingRate(symbol));
  }

  async getOrderBook(symbol: string): Promise<OrderBook> {
    return mapBinanceDepth(await this.client.getDepth(symbol));
  }
}

function mapTimeframe(timeframe: KlineRequest["timeframe"]) {
  if (timeframe === "15m") {
    return "15m";
  }

  if (timeframe === "1h") {
    return "1h";
  }

  if (timeframe === "1d") {
    return "1d";
  }

  return "4h";
}
