import type { MarketDataProvider } from "./provider";
import { BinanceDemoAdapter } from "./binance/adapter";
import { BinancePublicAdapter } from "./binance/public-adapter";

export type MarketProviderName = "binance-public" | "demo";

export function createMarketDataProvider(): MarketDataProvider {
  const provider = parseMarketProvider(process.env.MARKET_PROVIDER);

  if (provider === "demo") {
    return new BinanceDemoAdapter();
  }

  return new BinancePublicAdapter();
}

function parseMarketProvider(value: string | undefined): MarketProviderName {
  if (value === "demo" || value === "binance-public") {
    return value;
  }

  return "binance-public";
}
