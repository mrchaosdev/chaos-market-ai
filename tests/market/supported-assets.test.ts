import { beforeAll, describe, expect, it } from "vitest";
import { supportedBaseAssets } from "../../src/lib/agent/parse-command";

const baseUrl = process.env.BINANCE_PUBLIC_BASE_URL ?? "https://fapi.binance.com";

/**
 * The allowlist is offered to users twice — as the symbol picker and as the set
 * of symbols a typed command may name — so an entry the exchange does not list
 * is a dead button, not a caught edge case. `TON` shipped that way: Binance
 * answers HTTP 200 with `{}` for an unlisted symbol, so it looked like a
 * malformed response rather than a missing market, and every TON run failed.
 *
 * This asks the exchange directly. It skips loudly rather than failing when
 * Binance is unreachable, because an offline laptop is not a broken allowlist.
 */
describe("supported assets are listed on Binance USDT-M futures", () => {
  let reachable = false;

  beforeAll(async () => {
    try {
      const response = await fetch(`${baseUrl}/fapi/v1/ticker/24hr?symbol=BTCUSDT`, { signal: AbortSignal.timeout(10_000) });
      reachable = response.ok && typeof (await response.json())?.lastPrice === "string";
    } catch {
      reachable = false;
    }

    if (!reachable) {
      console.log(`[supported-assets] SKIPPED — ${baseUrl} is not reachable from here`);
    }
  }, 15_000);

  it("every allowlisted asset has a real USDT-M ticker", async () => {
    if (!reachable) {
      return;
    }

    const missing: string[] = [];

    for (const base of supportedBaseAssets) {
      const response = await fetch(`${baseUrl}/fapi/v1/ticker/24hr?symbol=${base}USDT`, { signal: AbortSignal.timeout(10_000) });
      const body = await response.json().catch(() => null);

      if (!response.ok || typeof body?.lastPrice !== "string") {
        missing.push(base);
      }
    }

    expect(missing, `not listed on Binance USDT-M futures: ${missing.join(", ")}`).toEqual([]);
  }, 60_000);
});
