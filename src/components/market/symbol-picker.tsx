import Link from "next/link";
import { TokenIcon } from "@/components/chaos/token-icon";
import { supportedBaseAssets } from "@/lib/agent/parse-command";

type SymbolPickerProps = {
  basePath: string;
  activeSymbol: string;
  timeframe: string;
};

/** Single-asset picker for Analyze / Entry: every link is a plain navigation, no client JS. */
export function SymbolPicker({ basePath, activeSymbol, timeframe }: SymbolPickerProps) {
  const activeBase = activeSymbol.toUpperCase().replace(/USDT$/, "");

  return (
    <div aria-label="Select asset" className="cm-symbol-picker flex flex-wrap gap-2" data-symbol-picker role="group">
      {supportedBaseAssets.map((base) => (
        <PickerItem
          active={base === activeBase}
          base={base}
          href={`${basePath}?symbol=${base}&timeframe=${timeframe}`}
          key={base}
        />
      ))}
    </div>
  );
}

type SymbolMultiPickerProps = {
  basePath: string;
  activeSymbols: string[];
  timeframe: string;
  max?: number;
};

/**
 * Multi-asset picker for Compare, capped at `max`. Each button is a plain link
 * to "the URL this click would produce" — toggling membership is computed here,
 * server-side, rather than with client state.
 */
export function SymbolMultiPicker({ basePath, activeSymbols, timeframe, max = 3 }: SymbolMultiPickerProps) {
  const activeBases = activeSymbols.map((symbol) => symbol.toUpperCase().replace(/USDT$/, ""));

  return (
    <div aria-label="Select assets to compare" className="cm-symbol-picker flex flex-wrap gap-2" data-symbol-picker role="group">
      {supportedBaseAssets.map((base) => {
        const active = activeBases.includes(base);
        const next = active ? activeBases.filter((entry) => entry !== base) : [...activeBases, base].slice(-max);

        // Removing the last remaining asset would leave an empty comparison, which
        // the workflow can't run — that one combination is disabled, not linked.
        if (next.length === 0) {
          return <PickerItem active base={base} disabled key={base} />;
        }

        return (
          <PickerItem
            active={active}
            base={base}
            href={`${basePath}?symbols=${next.join(",")}&timeframe=${timeframe}`}
            key={base}
          />
        );
      })}
    </div>
  );
}

function PickerItem({ base, active, href, disabled = false }: { base: string; active: boolean; href?: string; disabled?: boolean }) {
  const classes = `cm-symbol-picker__item flex items-center gap-2 border px-3 py-2 font-mono text-xs uppercase tracking-[0.12em] transition-colors ${
    active ? "border-primary bg-primary text-primary-foreground" : "border-border text-muted-foreground hover:bg-surface-hover"
  } ${disabled ? "cm-symbol-picker__item--disabled cursor-not-allowed opacity-50" : ""}`;

  const content = (
    <>
      <TokenIcon size={22} symbol={base} />
      {base}
    </>
  );

  if (disabled || !href) {
    return (
      <span aria-disabled className={classes}>
        {content}
      </span>
    );
  }

  return (
    <Link aria-current={active ? "true" : undefined} className={classes} href={href}>
      {content}
    </Link>
  );
}
