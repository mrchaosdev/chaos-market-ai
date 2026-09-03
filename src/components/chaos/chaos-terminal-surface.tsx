import type { ReactNode } from "react";

export function ChaosTerminalSurface({ children }: { children: ReactNode }) {
  return (
    <div className="chaos-cut chaos-beam relative border border-border-strong bg-surface">
      <div className="chaos-lattice absolute inset-0 opacity-30" />
      <div className="relative">{children}</div>
    </div>
  );
}
