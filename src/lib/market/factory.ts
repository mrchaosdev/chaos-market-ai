import type { MarketDataProvider } from "./provider";
import { BinanceDemoAdapter } from "./binance/adapter";
import { BinancePublicAdapter } from "./binance/public-adapter";
import { CachedMarketDataProvider, MemoryCache } from "./cache";

export type MarketProviderName = "binance-public" | "demo";

export type MarketProviderDescriptor = {
  name: MarketProviderName;
  label: string;
  isDemo: boolean;
};

const sharedCache = new MemoryCache();

export function getMarketProviderDescriptor(): MarketProviderDescriptor {
  const name = parseMarketProvider(process.env.MARKET_PROVIDER);

  return {
    name,
    label: name === "demo" ? "DEMO DATA" : "BINANCE PUBLIC",
    isDemo: name === "demo",
  };
}

export function createMarketDataProvider(): MarketDataProvider {
  if (getMarketProviderDescriptor().isDemo) {
    return new BinanceDemoAdapter();
  }

  return new CachedMarketDataProvider(new BinancePublicAdapter(), sharedCache);
}

function parseMarketProvider(value: string | undefined): MarketProviderName {
  if (value === "demo" || value === "binance-public") {
    return value;
  }

  return "binance-public";
}
