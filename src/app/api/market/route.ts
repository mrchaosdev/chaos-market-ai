import { NextResponse } from "next/server";
import { createMarketDataProvider } from "@/lib/market/factory";
import { marketOverviewWorkflow } from "@/lib/workflows/market-overview";

export async function GET() {
  const result = await marketOverviewWorkflow(createMarketDataProvider());

  return NextResponse.json(result);
}
