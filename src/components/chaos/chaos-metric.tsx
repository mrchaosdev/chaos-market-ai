type MetricProps = {
  label: string;
  value: string;
};

export function ChaosMetric({ label, value }: MetricProps) {
  return (
    <div className="border border-border bg-surface px-3 py-2">
      <p className="font-mono text-[10px] uppercase tracking-[0.16em] text-muted-foreground">{label}</p>
      <p className="mt-1 font-mono text-xs text-foreground">{value}</p>
    </div>
  );
}
