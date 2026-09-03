import { NextResponse } from "next/server";
import { createMarketDataProvider } from "@/lib/market/factory";
import type { Timeframe } from "@/lib/market/types";
import { analyzeAssetWorkflow } from "@/lib/workflows/analyze-asset";

const timeframes: Timeframe[] = ["15m", "1h", "4h", "1d"];

export async function POST(request: Request) {
  const body = (await request.json()) as Partial<{ symbol: string; timeframe: Timeframe }>;
  const symbol = body.symbol?.toUpperCase() ?? "BTCUSDT";
  const timeframe = body.timeframe ?? "4h";

  if (!timeframes.includes(timeframe)) {
    return NextResponse.json({ error: "INVALID_TIMEFRAME" }, { status: 400 });
  }

  const provider = createMarketDataProvider();
  const result = await analyzeAssetWorkflow(provider, { symbol, timeframe });

  return NextResponse.json(result);
}
