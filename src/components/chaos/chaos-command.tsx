export function ChaosCommand({ value }: { value: string }) {
  return (
    <div className="flex items-center gap-3 border border-border bg-background px-4 py-3 font-mono text-sm text-foreground">
      <span className="text-primary">&gt;</span>
      <span className="text-muted-foreground">{value}</span>
      <span className="ml-auto text-[11px] text-subtle-foreground">ENTER</span>
    </div>
  );
}
