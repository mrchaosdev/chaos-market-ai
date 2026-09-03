import { ChaosNumber } from "./chaos-number";

export function ChaosTicker({ symbol, price, change }: { symbol: string; price: string; change: string }) {
  return (
    <div className="grid grid-cols-3 gap-3 border-b border-border px-4 py-3 font-mono text-xs tabular last:border-b-0">
      <span>{symbol}</span>
      <ChaosNumber value={price} />
      <ChaosNumber tone={change.startsWith("+") ? "positive" : "negative"} value={change} />
    </div>
  );
}
