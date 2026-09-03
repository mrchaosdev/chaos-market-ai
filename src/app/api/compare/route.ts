import { NextResponse } from "next/server";
import { z } from "zod";
import { normalizeSymbol } from "@/lib/agent/parse-command";
import { badRequestResponse, chaosErrorResponse } from "@/lib/api/response";
import { createMarketDataProvider } from "@/lib/market/factory";
import { compareAssetsWorkflow } from "@/lib/workflows/compare-assets";

export const dynamic = "force-dynamic";

const CompareRequestSchema = z.object({
  symbols: z.array(z.string().min(2).max(20)).min(2).max(3).optional(),
  timeframe: z.enum(["15m", "1h", "4h", "1d"]).optional(),
});

export async function POST(request: Request) {
  const parsed = CompareRequestSchema.safeParse(await request.json().catch(() => ({})));

  if (!parsed.success) {
    return badRequestResponse("symbols must contain two or three symbols and timeframe must be one of 15m, 1h, 4h, 1d.");
  }

  try {
    const symbols = (parsed.data.symbols ?? ["BTCUSDT", "ETHUSDT"]).map(normalizeSymbol);
    const result = await compareAssetsWorkflow(createMarketDataProvider(), symbols, parsed.data.timeframe ?? "4h");

    return NextResponse.json(result);
  } catch (error) {
    return chaosErrorResponse(error);
  }
}
