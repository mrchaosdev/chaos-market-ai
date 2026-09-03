import { z } from "zod";

export const BinanceTickerSchema = z.object({
  symbol: z.string(),
  lastPrice: z.string(),
  priceChangePercent: z.string(),
  volume: z.string(),
  quoteVolume: z.string(),
  closeTime: z.number(),
});

export const BinanceFundingRateSchema = z.object({
  symbol: z.string(),
  fundingRate: z.string(),
  fundingTime: z.number(),
});

export const BinanceDepthSchema = z.object({
  lastUpdateId: z.number(),
  bids: z.array(z.tuple([z.string(), z.string()])),
  asks: z.array(z.tuple([z.string(), z.string()])),
});

export const BinanceKlineSchema = z.tuple([
  z.number(),
  z.string(),
  z.string(),
  z.string(),
  z.string(),
  z.string(),
  z.number(),
  z.string(),
  z.number(),
  z.string(),
  z.string(),
  z.string(),
]);

export const BinanceKlinesSchema = z.array(BinanceKlineSchema);
