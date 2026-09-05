import { describe, expect, it } from "vitest";
import { resolveSymbol, supportedBaseAssets } from "../../src/lib/agent/parse-command";

describe("resolveSymbol", () => {
  it("accepts every asset the router supports, with or without the quote suffix", () => {
    for (const base of supportedBaseAssets) {
      expect(resolveSymbol(base)).toBe(`${base}USDT`);
      expect(resolveSymbol(`${base}USDT`)).toBe(`${base}USDT`);
    }
  });

  it("is case and whitespace insensitive, because the value comes from a hand-edited query string", () => {
    expect(resolveSymbol(" eth ")).toBe("ETHUSDT");
    expect(resolveSymbol("solusdt")).toBe("SOLUSDT");
  });

  it("falls back rather than forwarding an unsupported symbol to the exchange", () => {
    // Binance answers 403 for a malformed symbol, which the client maps to
    // REGION_RESTRICTED — a screen telling the reader to redeploy to another
    // region when the real fault is in the URL.
    expect(resolveSymbol("NOTREAL")).toBe("BTCUSDT");
    expect(resolveSymbol("<script>alert(1)</script>")).toBe("BTCUSDT");
    expect(resolveSymbol(undefined)).toBe("BTCUSDT");
    expect(resolveSymbol("")).toBe("BTCUSDT");
  });

  it("can report the miss instead of substituting, which is how compare drops unknown entries", () => {
    expect(resolveSymbol("NOTREAL", "")).toBe("");
    expect(resolveSymbol("ETH", "")).toBe("ETHUSDT");
  });
});
