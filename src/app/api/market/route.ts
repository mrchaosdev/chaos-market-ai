import { NextResponse } from "next/server";
import { BinanceDemoAdapter } from "@/lib/market/binance/adapter";
import { marketOverviewWorkflow } from "@/lib/workflows/market-overview";

export async function GET() {
  const result = await marketOverviewWorkflow(new BinanceDemoAdapter());

  return NextResponse.json(result);
}
