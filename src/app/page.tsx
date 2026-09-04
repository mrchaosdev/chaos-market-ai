import { maxSignalScore } from "@/lib/analysis/comparison";
import { AgentTrace } from "@/components/agent/agent-trace";
import { ChaosDomainError } from "@/components/chaos/chaos-domain-error";
import { ChaosField } from "@/components/chaos/chaos-field";
import { ChaosScrollbar } from "@/components/chaos/chaos-scrollbar";
import { ChaosMetric } from "@/components/chaos/chaos-metric";
import { ChaosTerminalSurface } from "@/components/chaos/chaos-terminal-surface";
import { AppTopNav } from "@/components/layout/app-top-nav";
import { MarketAnalysisPanel } from "@/components/market/market-analysis-panel";
import { MarketPulse } from "@/components/market/market-pulse";
import { createMarketDataProvider } from "@/lib/market/factory";
import { analyzeAssetWorkflow } from "@/lib/workflows/analyze-asset";
import { runSafely } from "@/lib/workflows/safe-run";

export const dynamic = "force-dynamic";

export default async function Home() {
  const outcome = await runSafely(() => analyzeAssetWorkflow(createMarketDataProvider(), { symbol: "BTCUSDT", timeframe: "4h" }));
  const result = outcome.ok ? outcome.data : null;
  const error = outcome.ok ? null : outcome.error;

  return (
    <main className="relative min-h-screen bg-background text-foreground">
      <ChaosField />
      <ChaosScrollbar />
      <div className="relative min-h-screen">
        <section className="flex min-h-screen flex-col">
          <AppTopNav />

          <div className="border-b border-border sm:pl-[70px]" data-market-header>
            <div className="grid gap-px bg-border md:grid-cols-[1fr_420px]">
              <div className="flex items-center bg-background/95 px-5 py-5 lg:px-8">
                <div>
                  <p className="font-mono text-[11px] uppercase tracking-[0.24em] text-muted-foreground">
                    Binance Agent OS Mini Hackathon / Read Only Intelligence
                  </p>
                  <h1 className="mt-2 text-2xl font-semibold tracking-tight md:text-3xl">Chaos Market AI</h1>
                </div>
              </div>
              <div className="grid grid-cols-3 gap-px bg-border">
                <ChaosMetric label="Track" value="A" />
                <ChaosMetric label="Deadline" value="SEP 08" />
                <ChaosMetric label="Signal" value={result ? `${result.signal.score}/${maxSignalScore}` : "UNAVAILABLE"} />
              </div>
            </div>
          </div>

          <div className="grid flex-1 grid-cols-1 gap-px bg-border sm:pl-[70px] xl:grid-cols-[minmax(0,1.15fr)_minmax(420px,0.85fr)]">
            <section className="bg-background/94 p-5 lg:p-8">
              <div className="grid gap-8 xl:grid-cols-[0.92fr_1fr] xl:items-end">
                <div>
                  <p className="font-mono text-xs uppercase tracking-[0.26em] text-primary">Data first / Code second / AI last</p>
                  {/* Capped at 72px: DESIGN_SYSTEM.md §5 puts the hero at 48-72, and 96px wrapped
                      this line into nine words stacked down the whole viewport. */}
                  <h2 className="mt-6 max-w-3xl text-4xl font-semibold leading-[0.95] tracking-[-0.05em] md:text-6xl xl:text-7xl">
                    Do not ask AI what BTC is doing.
                    <span className="block text-muted-foreground">Make it inspect the market.</span>
                  </h2>
                </div>

                <ChaosTerminalSurface>
                  <div className="grid gap-px bg-border p-px">
                    <div className="bg-background p-5">
                      <p className="font-mono text-[11px] uppercase tracking-[0.2em] text-muted-foreground">Execution Path</p>
                      <div className="mt-6 grid grid-cols-[86px_1fr] gap-y-4 font-mono text-xs">
                        <span className="text-subtle-foreground">01</span><span>BINANCE MARKET DATA</span>
                        <span className="text-subtle-foreground">02</span><span>EMA / RSI / ATR ENGINE</span>
                        <span className="text-subtle-foreground">03</span><span>SIGNAL ALIGNMENT</span>
                        <span className="text-subtle-foreground">04</span><span>EVIDENCE-FIRST INTERPRETATION</span>
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-px bg-border">
                      <a className="bg-primary px-5 py-4 text-sm font-medium text-primary-foreground" href="/app/agent">Run Analysis</a>
                      <a className="bg-surface px-5 py-4 text-sm font-medium text-foreground" href="/app/analyze">Inspect Evidence</a>
                    </div>
                  </div>
                </ChaosTerminalSurface>
              </div>

              <div className="mt-12" id="product">
                {result ? <MarketAnalysisPanel analysis={result} /> : null}
                {error ? <ChaosDomainError error={error} /> : null}
              </div>
            </section>

            <section className="bg-surface p-5 lg:p-8">
              {result ? (
                <div className="mb-8">
                  <MarketPulse
                    signalScore={result.signal.score}
                    trend={result.structure.trend}
                    volatility={result.structure.volatility}
                    volume={result.structure.volume}
                  />
                </div>
              ) : null}
              <AgentTrace events={result?.trace ?? []} isRunning={false} runId={result?.runId ?? null} />
            </section>
          </div>
        </section>
      </div>
    </main>
  );
}
