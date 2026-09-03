import { NextResponse } from "next/server";
import { chaosErrorResponse } from "@/lib/api/response";
import { createMarketDataProvider } from "@/lib/market/factory";
import { marketOverviewWorkflow } from "@/lib/workflows/market-overview";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    return NextResponse.json(await marketOverviewWorkflow(createMarketDataProvider()));
  } catch (error) {
    return chaosErrorResponse(error);
  }
}
