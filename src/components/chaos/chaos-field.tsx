export function ChaosField() {
  return (
    <div aria-hidden className="cm-field pointer-events-none absolute inset-0 overflow-hidden">
      <div className="cm-field__dots chaos-dot-field absolute inset-0" />
      <div className="cm-field__scanlines chaos-scanlines absolute inset-0 opacity-40" />
      <div className="cm-field__vertical-marker absolute left-[8%] top-[12%] h-28 w-px bg-border-strong" />
      <div className="cm-field__horizontal-marker absolute bottom-[14%] right-[10%] h-px w-44 bg-border-strong" />
    </div>
  );
}
