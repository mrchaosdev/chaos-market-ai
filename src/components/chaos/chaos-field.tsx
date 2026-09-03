export function ChaosField() {
  return (
    <div aria-hidden className="pointer-events-none absolute inset-0 overflow-hidden">
      <div className="chaos-dot-field absolute inset-0" />
      <div className="chaos-scanlines absolute inset-0 opacity-40" />
      <div className="absolute left-[8%] top-[12%] h-28 w-px bg-border-strong" />
      <div className="absolute bottom-[14%] right-[10%] h-px w-44 bg-border-strong" />
    </div>
  );
}
