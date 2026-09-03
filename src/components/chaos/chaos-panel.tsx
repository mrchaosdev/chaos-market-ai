import type { ReactNode } from "react";

export function ChaosPanel({ title, meta, children }: { title: string; meta?: string; children: ReactNode }) {
  return (
    <section className="border border-border bg-surface">
      <div className="flex items-center justify-between border-b border-border px-4 py-3">
        <p className="font-mono text-xs uppercase tracking-[0.2em] text-muted-foreground">{title}</p>
        {meta ? <span className="font-mono text-[11px] text-subtle-foreground">{meta}</span> : null}
      </div>
      <div className="p-4">{children}</div>
    </section>
  );
}
