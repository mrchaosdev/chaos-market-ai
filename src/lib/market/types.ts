export type Timeframe = "15m" | "1h" | "4h" | "1d";

export type Candle = {
  timestamp: number;
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number;
};

export type Ticker = {
  symbol: string;
  price: number;
  change24hPercent: number;
  volume24h: number;
  quoteVolume24h: number;
  timestamp: number;
};

export type FundingRate = {
  symbol: string;
  rate: number;
  nextFundingTime?: number;
};

export type OrderBookLevel = {
  price: number;
  quantity: number;
};

export type OrderBook = {
  bids: OrderBookLevel[];
  asks: OrderBookLevel[];
  timestamp: number;
};

export type KlineRequest = {
  symbol: string;
  timeframe: Timeframe;
  limit: number;
};
