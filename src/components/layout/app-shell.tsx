import type { ReactNode } from "react";
import { ChaosField } from "@/components/chaos/chaos-field";
import { MarketHeader } from "./market-header";
import { NavRail } from "./nav-rail";

export function AppShell({ children }: { children: ReactNode }) {
  return (
    <main className="relative min-h-screen overflow-hidden bg-background text-foreground">
      <ChaosField />
      <div className="relative grid min-h-screen grid-cols-1 lg:grid-cols-[72px_1fr]">
        <NavRail />
        <section className="flex min-h-screen flex-col">
          <MarketHeader />
          {children}
        </section>
      </div>
    </main>
  );
}
