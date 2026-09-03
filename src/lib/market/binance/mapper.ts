import type { Candle, FundingRate, OrderBook, Ticker } from "@/lib/market/types";
import type { z } from "zod";
import type { BinanceDepthSchema, BinanceFundingRateSchema, BinanceKlineSchema, BinanceTickerSchema } from "./schemas";

export function mapBinanceTicker(input: z.infer<typeof BinanceTickerSchema>): Ticker {
  return {
    symbol: input.symbol,
    price: Number(input.lastPrice),
    change24hPercent: Number(input.priceChangePercent),
    volume24h: Number(input.volume),
    quoteVolume24h: Number(input.quoteVolume),
    timestamp: input.closeTime,
  };
}

export function mapBinanceKline(input: z.infer<typeof BinanceKlineSchema>): Candle {
  return {
    timestamp: input[0],
    open: Number(input[1]),
    high: Number(input[2]),
    low: Number(input[3]),
    close: Number(input[4]),
    volume: Number(input[5]),
  };
}

export function mapBinanceFundingRate(input: z.infer<typeof BinanceFundingRateSchema>): FundingRate {
  return {
    symbol: input.symbol,
    rate: Number(input.fundingRate),
    nextFundingTime: input.fundingTime,
  };
}

export function mapBinanceDepth(input: z.infer<typeof BinanceDepthSchema>): OrderBook {
  return {
    bids: input.bids.map(([price, quantity]) => ({ price: Number(price), quantity: Number(quantity) })),
    asks: input.asks.map(([price, quantity]) => ({ price: Number(price), quantity: Number(quantity) })),
    timestamp: Date.now(),
  };
}
