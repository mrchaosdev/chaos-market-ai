export function ChaosProgress({ value }: { value: number }) {
  return (
    <div className="h-2 border border-border bg-background">
      <div className="h-full bg-primary" style={{ width: `${Math.max(0, Math.min(100, value))}%` }} />
    </div>
  );
}
