import { ChaosPanel } from "@/components/chaos/chaos-panel";
import { AppShell } from "@/components/layout/app-shell";

export default function ComparePage() {
  return (
    <AppShell>
      <section className="bg-background p-5 lg:p-8">
        <ChaosPanel title="BTCUSDT / ETHUSDT" meta="4H">
          <div className="grid gap-px bg-border md:grid-cols-2">
            <Asset symbol="BTCUSDT" score="74" bias="Bullish" />
            <Asset symbol="ETHUSDT" score="61" bias="Neutral" />
          </div>
        </ChaosPanel>
      </section>
    </AppShell>
  );
}

function Asset({ symbol, score, bias }: { symbol: string; score: string; bias: string }) {
  return (
    <div className="bg-background p-5">
      <p className="font-mono text-xs text-muted-foreground">{symbol}</p>
      <p className="mt-4 font-mono text-4xl tabular">{score}</p>
      <p className="mt-1 font-mono text-[11px] uppercase tracking-[0.18em] text-muted-foreground">Signal</p>
      <p className="mt-6 text-xl font-semibold">{bias}</p>
    </div>
  );
}
