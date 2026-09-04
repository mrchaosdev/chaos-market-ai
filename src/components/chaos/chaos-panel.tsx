import type { ReactNode } from "react";

export function ChaosPanel({ title, meta, children }: { title: string; meta?: string; children: ReactNode }) {
  return (
    <section className="cm-panel border border-border bg-surface">
      <div className="cm-panel__header flex items-center justify-between border-b border-border px-4 py-3">
        <p className="cm-panel__title font-mono text-xs uppercase tracking-[0.2em] text-muted-foreground">{title}</p>
        {meta ? <span className="cm-panel__meta font-mono text-[11px] text-subtle-foreground">{meta}</span> : null}
      </div>
      <div className="cm-panel__body p-4">{children}</div>
    </section>
  );
}
