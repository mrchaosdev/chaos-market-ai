export const readOnlyTools = [
  "getTicker",
  "getKlines",
  "getFundingRate",
  "getOrderBook",
  "getMarketSummary",
] as const;

export type ReadOnlyTool = (typeof readOnlyTools)[number];
