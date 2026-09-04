import type { ReactNode } from "react";
import { ChaosField } from "@/components/chaos/chaos-field";
import { MarketHeader } from "./market-header";

export function AppShell({ children }: { children: ReactNode }) {
  return (
    <main className="relative min-h-screen overflow-hidden bg-background text-foreground" data-app-shell>
      <ChaosField />
      <section className="relative flex min-h-screen flex-col">
        <MarketHeader />
        {children}
      </section>
    </main>
  );
}
