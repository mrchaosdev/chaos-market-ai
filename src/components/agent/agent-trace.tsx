type AgentTraceProps = {
  state?: "idle" | "running" | "complete" | "error";
  runId?: string;
};

type AgentTraceRow = {
  id: string;
  task: string;
  source: string;
  latency: string;
  state: "DONE" | "RUNNING" | "QUEUED" | "ERROR";
};

export function AgentTrace({ state = "complete", runId = "run_demo" }: AgentTraceProps) {
  const traceRows = getTraceRows(state);

  return (
    <div className="border border-border bg-background">
      <div className="flex items-center justify-between border-b border-border p-4">
        <div>
          <p className="font-mono text-xs uppercase tracking-[0.2em] text-muted-foreground">Chaos / {runId}</p>
          <h3 className="mt-2 text-xl font-semibold">Agent execution stream</h3>
        </div>
        <span className="border border-primary px-2 py-1 font-mono text-[11px] text-primary">{state === "running" ? "RUNNING" : "READ ONLY"}</span>
      </div>

      <div className="divide-y divide-border">
        {traceRows.map((row) => (
          <div className="grid grid-cols-[34px_1fr] gap-3 p-4 md:grid-cols-[34px_1fr_90px_70px_82px]" key={row.id}>
            <span className="font-mono text-xs text-subtle-foreground">{row.id}</span>
            <span className="text-sm">{row.task}</span>
            <span className="font-mono text-[11px] text-muted-foreground">{row.source}</span>
            <span className="font-mono text-[11px] text-muted-foreground tabular">{row.latency}</span>
            <span className={getStateClassName(row.state)}>{row.state}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

function getTraceRows(state: AgentTraceProps["state"]): AgentTraceRow[] {
  if (state === "idle") {
    return [
      { id: "01", task: "Input command", source: "AGENT", latency: "", state: "QUEUED" },
      { id: "02", task: "Market data", source: "BINANCE", latency: "", state: "QUEUED" },
      { id: "03", task: "Indicators", source: "ENGINE", latency: "", state: "QUEUED" },
      { id: "04", task: "Signal alignment", source: "ENGINE", latency: "", state: "QUEUED" },
      { id: "05", task: "Interpretation", source: "AI", latency: "", state: "QUEUED" },
    ];
  }

  if (state === "running") {
    return [
      { id: "01", task: "Input understood", source: "AGENT", latency: "", state: "DONE" },
      { id: "02", task: "BTC ticker / candles / funding", source: "BINANCE", latency: "", state: "RUNNING" },
      { id: "03", task: "EMA / RSI / ATR", source: "ENGINE", latency: "", state: "QUEUED" },
      { id: "04", task: "Signal alignment", source: "ENGINE", latency: "", state: "QUEUED" },
      { id: "05", task: "Evidence interpretation", source: "AI", latency: "", state: "QUEUED" },
    ];
  }

  if (state === "error") {
    return [
      { id: "01", task: "Input understood", source: "AGENT", latency: "", state: "DONE" },
      { id: "02", task: "BTC market data", source: "BINANCE", latency: "", state: "ERROR" },
      { id: "03", task: "Analysis halted", source: "WORKFLOW", latency: "", state: "QUEUED" },
    ];
  }

  return [
    { id: "01", task: "Input understood", source: "AGENT", latency: "", state: "DONE" },
    { id: "02", task: "BTC ticker / candles / funding", source: "BINANCE", latency: "", state: "DONE" },
    { id: "03", task: "EMA / RSI / ATR", source: "ENGINE", latency: "", state: "DONE" },
    { id: "04", task: "Signal alignment", source: "ENGINE", latency: "", state: "DONE" },
    { id: "05", task: "Evidence interpretation", source: "AI", latency: "", state: "DONE" },
  ];
}

function getStateClassName(state: AgentTraceRow["state"]) {
  if (state === "DONE") {
    return "font-mono text-[11px] text-positive";
  }

  if (state === "RUNNING") {
    return "font-mono text-[11px] text-primary";
  }

  if (state === "ERROR") {
    return "font-mono text-[11px] text-negative";
  }

  return "font-mono text-[11px] text-muted-foreground";
}
