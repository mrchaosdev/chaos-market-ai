import { NextResponse } from "next/server";
import { BinanceDemoAdapter } from "@/lib/market/binance/adapter";
import type { Timeframe } from "@/lib/market/types";
import { compareAssetsWorkflow } from "@/lib/workflows/compare-assets";

export async function POST(request: Request) {
  const body = (await request.json()) as Partial<{ symbols: string[]; timeframe: Timeframe }>;
  const symbols = body.symbols?.map((symbol) => symbol.toUpperCase()) ?? ["BTCUSDT", "ETHUSDT"];
  const timeframe = body.timeframe ?? "4h";
  const result = await compareAssetsWorkflow(new BinanceDemoAdapter(), symbols, timeframe);

  return NextResponse.json(result);
}
