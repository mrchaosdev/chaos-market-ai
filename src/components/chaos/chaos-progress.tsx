export function ChaosProgress({ value }: { value: number }) {
  return (
    <div className="cm-progress h-2 border border-border bg-background">
      <div className="cm-progress__fill h-full bg-primary" style={{ width: `${Math.max(0, Math.min(100, value))}%` }} />
    </div>
  );
}
