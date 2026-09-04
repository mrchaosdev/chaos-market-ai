import { supportedBaseAssets } from "@/lib/agent/parse-command";

const knownBaseAssets = new Set(supportedBaseAssets);

type TokenIconProps = {
  symbol: string;
  size?: number;
  className?: string;
};

/**
 * Local, self-hosted brand marks (public/img/tokens) rather than a live fetch
 * against a third-party image host: SOURCES.md already learned this lesson once
 * with Binance region-blocking, and a decorative logo is not worth repeating it
 * for. Any symbol outside the router's allowlist falls back to a ticker chip
 * instead of a broken image, though the allowlist means that path is unused today.
 *
 * Plain `<img>`, not `next/image`: the source files are already 250x250 and a
 * few KB each, so there is nothing for the optimizer to shrink. Routing them
 * through it anyway sent every distinct (symbol, size) pair — up to a dozen per
 * page, several pages using different sizes — through a server-side resize on
 * first request, which is exactly the stutter this was meant to fix, not lazy
 * loading (every logo here is already on screen at load, so deferring the
 * *fetch* wouldn't have helped either). `loading="lazy"` is still free for the
 * instances that do sit further down a tall page.
 */
export function TokenIcon({ symbol, size = 26, className = "" }: TokenIconProps) {
  const base = baseAsset(symbol);

  if (!knownBaseAssets.has(base)) {
    return (
      <span
        aria-hidden
        className={`cm-token-icon cm-token-icon--fallback inline-flex shrink-0 items-center justify-center rounded-full border border-border bg-surface font-mono text-[10px] uppercase text-muted-foreground ${className}`}
        style={{ width: size, height: size }}
      >
        {base.slice(0, 3)}
      </span>
    );
  }

  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      alt=""
      aria-hidden
      className={`cm-token-icon shrink-0 rounded-full ${className}`}
      decoding="async"
      height={size}
      loading="lazy"
      src={`/img/tokens/${base}.png`}
      width={size}
    />
  );
}

function baseAsset(symbol: string) {
  return symbol.trim().toUpperCase().replace(/USDT$/, "");
}
