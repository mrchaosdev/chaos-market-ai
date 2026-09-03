import type { Candle, FundingRate, KlineRequest, OrderBook, Ticker } from "./types";

export interface MarketDataProvider {
  getTicker(symbol: string): Promise<Ticker>;
  getKlines(request: KlineRequest): Promise<Candle[]>;
  getFundingRate(symbol: string): Promise<FundingRate>;
  getOrderBook(symbol: string): Promise<OrderBook>;
}
