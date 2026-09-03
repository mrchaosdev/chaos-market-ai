import { AgentTrace } from "@/components/agent/agent-trace";
import { ChaosDomainError } from "@/components/chaos/chaos-domain-error";
import { ChaosField } from "@/components/chaos/chaos-field";
import { ChaosLogo } from "@/components/chaos/chaos-logo";
import { ChaosMetric } from "@/components/chaos/chaos-metric";
import { ChaosTerminalSurface } from "@/components/chaos/chaos-terminal-surface";
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
    <main className="relative min-h-screen overflow-hidden bg-background text-foreground">
      <ChaosField />
      <div className="relative grid min-h-screen grid-cols-1 lg:grid-cols-[72px_1fr]">
        <aside className="hidden border-r border-border bg-background/90 lg:grid lg:grid-rows-[96px_1fr_120px]">
          <div className="grid place-items-center border-b border-border">
            <ChaosLogo size={34} />
          </div>
          <nav className="grid place-items-center py-8 font-mono text-[10px] uppercase tracking-[0.2em] text-muted-foreground [writing-mode:vertical-rl]">
            <div className="flex gap-8">
              <span>Data</span>
              <span>Signals</span>
              <span>Evidence</span>
              <span>Agent</span>
            </div>
          </nav>
          <div className="grid place-items-center border-t border-border">
            <div className="h-8 w-px bg-positive" />
          </div>
        </aside>

        <section className="grid min-h-screen grid-rows-[auto_1fr]">
          <header className="grid gap-px border-b border-border bg-border md:grid-cols-[1fr_420px]">
            <div className="bg-background/95 px-5 py-5 lg:px-8">
              <p className="font-mono text-[11px] uppercase tracking-[0.24em] text-muted-foreground">Binance Agent OS Mini Hackathon / Read Only Intelligence</p>
              <h1 className="mt-2 text-2xl font-semibold tracking-tight md:text-3xl">Chaos Market AI</h1>
            </div>
            <div className="grid grid-cols-3 gap-px bg-border">
              <ChaosMetric label="Track" value="A / B" />
              <ChaosMetric label="Deadline" value="SEP 08" />
              <ChaosMetric label="Signal" value={result ? `${result.signal.score}/100` : "UNAVAILABLE"} />
            </div>
          </header>

          <div className="grid grid-cols-1 gap-px bg-border xl:grid-cols-[minmax(0,1.15fr)_minmax(420px,0.85fr)]">
            <section className="bg-background/94 p-5 lg:p-8">
              <div className="grid gap-8 xl:grid-cols-[0.92fr_1fr] xl:items-end">
                <div>
                  <p className="font-mono text-xs uppercase tracking-[0.26em] text-primary">Data first / Code second / AI last</p>
                  <h2 className="mt-6 max-w-4xl text-5xl font-semibold leading-[0.9] tracking-[-0.075em] md:text-7xl xl:text-8xl">
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
