import type { ReactNode } from "react";

export function ChaosTerminalSurface({ children }: { children: ReactNode }) {
  return (
    <div className="cm-terminal-surface chaos-cut chaos-beam relative border border-border-strong bg-surface">
      <div className="cm-terminal-surface__lattice chaos-lattice absolute inset-0 opacity-30" />
      <div className="cm-terminal-surface__content relative">{children}</div>
    </div>
  );
}
