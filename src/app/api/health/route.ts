import { NextResponse } from "next/server";
import { createAIProvider } from "@/lib/ai/factory";
import { isPersistenceEnabled } from "@/lib/db/queries";
import { BinancePublicClient } from "@/lib/market/binance/client";
import { getMarketProviderDescriptor } from "@/lib/market/factory";
import { toChaosError } from "@/lib/utils/errors";

export const dynamic = "force-dynamic";

/**
 * Answers one question from wherever the app is actually deployed: can this
 * machine reach Binance, and if not, why. A region block and a network failure
 * look identical from the outside, and only the deployed instance can tell them
 * apart. Reports configuration by name only — never a key, never a URL secret.
 */
export async function GET() {
  const marketProvider = getMarketProviderDescriptor();
  const ai = createAIProvider().descriptor;
  const startedAt = Date.now();

  const binance = await probeBinance();

  return NextResponse.json(
    {
      status: binance.ok ? "ok" : "degraded",
      checkedAt: new Date().toISOString(),
      latencyMs: Date.now() - startedAt,
      marketData: {
        provider: marketProvider.name,
        isDemo: marketProvider.isDemo,
        ...binance,
      },
      ai: { provider: ai.name, model: ai.model, usingFallback: ai.isFallback },
      persistence: { enabled: isPersistenceEnabled() },
    },
    { status: binance.ok ? 200 : 503 },
  );
}

async function probeBinance() {
  if (getMarketProviderDescriptor().isDemo) {
    return { ok: true, reachable: false, note: "Demo provider is selected, so Binance is not contacted." };
  }

  try {
    const ticker = await new BinancePublicClient().getTicker("BTCUSDT");

    return { ok: true, reachable: true, sampleSymbol: ticker.symbol };
  } catch (error) {
    const chaosError = toChaosError(error);

    return {
      ok: false,
      reachable: false,
      errorCode: chaosError.code,
      message: chaosError.message,
      hint: chaosError.toPayload().hint,
    };
  }
}
