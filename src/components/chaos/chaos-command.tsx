export function ChaosCommand({ value }: { value: string }) {
  return (
    <div className="cm-command flex items-center gap-3 border border-border bg-background px-4 py-3 font-mono text-sm text-foreground">
      <span className="cm-command__prompt text-primary">&gt;</span>
      <span className="cm-command__value text-muted-foreground">{value}</span>
      <span className="cm-command__key ml-auto text-[11px] text-subtle-foreground">ENTER</span>
    </div>
  );
}
