import type { ReactNode } from "react";
import { MarketHeader } from "./market-header";
import { NavRail } from "./nav-rail";

export function AppShell({ children }: { children: ReactNode }) {
  return (
    <main className="min-h-screen bg-background text-foreground">
      <div className="grid min-h-screen grid-cols-1 lg:grid-cols-[64px_1fr]">
        <NavRail />
        <section className="chaos-grid flex min-h-screen flex-col">
          <MarketHeader />
          {children}
        </section>
      </div>
    </main>
  );
}
