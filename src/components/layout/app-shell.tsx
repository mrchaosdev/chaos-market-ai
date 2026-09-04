import type { ReactNode } from "react";
import { ChaosField } from "@/components/chaos/chaos-field";
import { ChaosScrollbar } from "@/components/chaos/chaos-scrollbar";
import { MarketHeader } from "./market-header";

export function AppShell({ children }: { children: ReactNode }) {
  return (
    <main className="relative min-h-screen bg-background text-foreground" data-app-shell>
      <ChaosField />
      <ChaosScrollbar />
      <section className="relative flex min-h-screen flex-col">
        <MarketHeader />
        <div className="flex flex-1 flex-col sm:pl-[70px]">{children}</div>
      </section>
    </main>
  );
}
