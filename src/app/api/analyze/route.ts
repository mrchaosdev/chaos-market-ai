import { NextResponse } from "next/server";
import { z } from "zod";
import { normalizeSymbol } from "@/lib/agent/parse-command";
import { badRequestResponse, chaosErrorResponse } from "@/lib/api/response";
import { createMarketDataProvider } from "@/lib/market/factory";
import { analyzeAssetWorkflow } from "@/lib/workflows/analyze-asset";

export const dynamic = "force-dynamic";

const AnalyzeRequestSchema = z.object({
  symbol: z.string().min(2).max(20).optional(),
  timeframe: z.enum(["15m", "1h", "4h", "1d"]).optional(),
});

export async function POST(request: Request) {
  const parsed = AnalyzeRequestSchema.safeParse(await request.json().catch(() => ({})));

  if (!parsed.success) {
    return badRequestResponse("symbol must be a string and timeframe must be one of 15m, 1h, 4h, 1d.");
  }

  try {
    const result = await analyzeAssetWorkflow(createMarketDataProvider(), {
      symbol: normalizeSymbol(parsed.data.symbol ?? "BTCUSDT"),
      timeframe: parsed.data.timeframe ?? "4h",
    });

    return NextResponse.json(result);
  } catch (error) {
    return chaosErrorResponse(error);
  }
}
