import { AgentTrace } from "@/components/agent/agent-trace";
import { ChaosMetric } from "@/components/chaos/chaos-metric";
import { MarketAnalysisPanel } from "@/components/market/market-analysis-panel";
import { MarketWatch } from "@/components/market/market-watch";
import { BinanceDemoAdapter } from "@/lib/market/binance/adapter";
import { analyzeAssetWorkflow } from "@/lib/workflows/analyze-asset";

export default async function Home() {
  const result = await analyzeAssetWorkflow(new BinanceDemoAdapter(), { symbol: "BTCUSDT", timeframe: "4h" });

  return (
    <main className="min-h-screen bg-background text-foreground">
      <div className="grid min-h-screen grid-cols-1 lg:grid-cols-[64px_1fr]">
        <aside className="hidden border-r border-border bg-surface lg:flex lg:flex-col lg:items-center lg:justify-between lg:py-5">
          <div className="font-mono text-xs font-semibold tracking-[0.24em] text-primary">CM</div>
          <nav className="flex flex-col gap-5 text-[10px] uppercase tracking-[0.18em] text-muted-foreground [writing-mode:vertical-rl]">
            <span>Overview</span>
            <span>Analyze</span>
            <span>Agent</span>
          </nav>
          <div className="h-2 w-2 border border-border-strong bg-positive" />
        </aside>

        <section className="chaos-grid flex min-h-screen flex-col">
          <header className="flex flex-col gap-4 border-b border-border bg-background/95 px-5 py-4 md:flex-row md:items-center md:justify-between lg:px-8">
            <div>
              <p className="font-mono text-[11px] uppercase tracking-[0.22em] text-muted-foreground">Binance Agent OS Mini Hackathon</p>
              <h1 className="mt-2 text-2xl font-semibold tracking-tight md:text-3xl">Chaos Market AI</h1>
            </div>
            <div className="grid grid-cols-3 gap-3 tabular">
              <ChaosMetric label="Track" value="A / B" />
              <ChaosMetric label="Deadline" value="SEP 08" />
              <ChaosMetric label="Mode" value="READ ONLY" />
            </div>
          </header>

          <div className="grid flex-1 grid-cols-1 gap-px bg-border xl:grid-cols-[1.08fr_0.92fr]">
            <section className="bg-background p-5 lg:p-8">
              <div className="max-w-4xl">
                <p className="font-mono text-xs uppercase tracking-[0.24em] text-primary">AI market analysis without the guessing</p>
                <h2 className="mt-5 max-w-3xl text-4xl font-semibold leading-tight tracking-[-0.04em] md:text-6xl">
                  A financial intelligence terminal where the agent exposes every market decision.
                </h2>
                <p className="mt-5 max-w-2xl text-base leading-7 text-muted-foreground">
                  Chaos Market AI connects Binance market data, deterministic signals, MCP workflows, and evidence-first AI reasoning into one execution canvas.
                </p>
                <div className="mt-8 flex flex-wrap gap-3">
                  <a className="border border-primary bg-primary px-4 py-3 text-sm font-medium text-primary-foreground" href="/app/agent">Run Analysis</a>
                  <a className="border border-border-strong bg-surface px-4 py-3 text-sm font-medium text-foreground" href="/app/analyze">Inspect Evidence</a>
                </div>
              </div>

              <div className="mt-12" id="product">
                <MarketAnalysisPanel result={result} />
              </div>
            </section>

            <section id="agent" className="bg-surface p-5 lg:p-8">
              <AgentTrace state="complete" runId={result.runId} />
              <div className="mt-8">
                <MarketWatch />
              </div>
            </section>
          </div>
        </section>
      </div>
    </main>
  );
}
