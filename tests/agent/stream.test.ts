import { beforeEach, describe, expect, it } from "vitest";
import { createStreamParser, encodeStreamMessage, streamAgentCommand, type AgentStreamMessage } from "../../src/lib/agent/stream";
import { TraceRecorder } from "../../src/lib/agent/events";
import { analyzeAssetWorkflow } from "../../src/lib/workflows/analyze-asset";
import type { AgentTraceEvent } from "../../src/lib/agent/events";
import { FakeMarketDataProvider } from "../fixtures/market-provider";

beforeEach(() => {
  // Restored every test: one case below points the client at a dead port, and
  // leaking that base URL would fail unrelated tests in the same worker.
  delete process.env.BINANCE_PUBLIC_BASE_URL;
  process.env.AI_PROVIDER = "local";
  process.env.AI_API_KEY = "";
  process.env.MARKET_PROVIDER = "demo";
  delete process.env.DATABASE_URL;
});

async function collect(stream: ReadableStream<Uint8Array>) {
  const reader = stream.getReader();
  const decoder = new TextDecoder();
  const parser = createStreamParser();
  const messages: AgentStreamMessage[] = [];

  for (;;) {
    const { done, value } = await reader.read();

    if (done) {
      break;
    }

    messages.push(...parser.push(decoder.decode(value, { stream: true })));
  }

  messages.push(...parser.flush());

  return messages;
}

describe("trace recorder listener", () => {
  it("emits each event as it is recorded, in order", () => {
    const seen: AgentTraceEvent[] = [];
    const recorder = new TraceRecorder("run_test", "AnalyzeAssetWorkflow", (event) => seen.push(event));

    recorder.record({ phase: "market_data", toolName: "getTicker" }, "success");
    recorder.record({ phase: "analytics", toolName: "indicatorEngine" }, "success");

    expect(seen.map((event) => event.toolName)).toEqual(["getTicker", "indicatorEngine"]);
    expect(seen.map((event) => event.id)).toEqual(["01", "02"]);
  });

  it("never lets a failing listener break the workflow", async () => {
    const provider = new FakeMarketDataProvider();

    const result = await analyzeAssetWorkflow(
      provider,
      { symbol: "BTCUSDT", timeframe: "4h" },
      {
        onEvent: () => {
          throw new Error("listener exploded");
        },
      },
    );

    expect(result.signal.score).toBeGreaterThan(0);
    expect(result.trace.length).toBeGreaterThan(5);
  });

  it("streams the same events the final snapshot contains", async () => {
    const streamed: AgentTraceEvent[] = [];
    const result = await analyzeAssetWorkflow(
      new FakeMarketDataProvider(),
      { symbol: "BTCUSDT", timeframe: "4h" },
      { onEvent: (event) => streamed.push(event) },
    );

    expect(streamed.map((event) => event.id)).toEqual(result.trace.map((event) => event.id));
  });
});

describe("agent command stream", () => {
  it("emits intent, then real trace events, then the finished execution", async () => {
    const messages = await collect(streamAgentCommand("Analyze BTC on 4H"));

    expect(messages[0]).toEqual({ type: "intent", intent: "ANALYZE_ASSET", command: "Analyze BTC on 4H" });
    expect(messages.at(-1)?.type).toBe("done");

    const traceMessages = messages.filter((message) => message.type === "trace");
    expect(traceMessages.length).toBeGreaterThanOrEqual(8);

    const phases = traceMessages.map((message) => (message.type === "trace" ? message.event.phase : ""));
    expect(phases.filter((phase) => phase === "market_data")).toHaveLength(4);
    expect(phases.indexOf("ai")).toBeGreaterThan(phases.indexOf("signal"));
  });

  it("carries the same execution the non-streaming route returns", async () => {
    const messages = await collect(streamAgentCommand("Analyze BTC on 4H"));
    const done = messages.at(-1);

    expect(done?.type).toBe("done");

    if (done?.type === "done" && done.execution.status === "success") {
      expect(done.execution.intent).toBe("ANALYZE_ASSET");
      expect(done.execution.result.workflow).toBe("AnalyzeAssetWorkflow");
      expect(done.execution.trace.some((event) => event.phase === "intent")).toBe(true);
      expect(done.execution.trace.some((event) => event.phase === "persistence")).toBe(true);
    } else {
      throw new Error(`expected a successful execution, saw ${JSON.stringify(done)}`);
    }
  });

  it("streams an unrouted command without inventing a workflow", async () => {
    const messages = await collect(streamAgentCommand("tell me a joke"));

    expect(messages.filter((message) => message.type === "trace")).toHaveLength(0);

    const done = messages.at(-1);
    expect(done?.type === "done" && done.execution.status).toBe("not_routed");
  });

  it("reports a domain error through the stream instead of tearing it down", async () => {
    process.env.MARKET_PROVIDER = "binance-public";
    process.env.BINANCE_PUBLIC_BASE_URL = "http://127.0.0.1:9";

    const messages = await collect(streamAgentCommand("Analyze BTC on 4H"));
    const done = messages.at(-1);

    expect(done?.type).toBe("done");

    if (done?.type === "done" && done.execution.status === "error") {
      expect(done.execution.error.code).toBe("BINANCE_UNAVAILABLE");
      expect(messages.some((message) => message.type === "trace" && message.event.status === "error")).toBe(true);
    } else {
      throw new Error(`expected a domain error, saw ${JSON.stringify(done)}`);
    }
  });
});

describe("ndjson parser", () => {
  it("reassembles a message split across chunks", () => {
    const parser = createStreamParser();
    const line = encodeStreamMessage({ type: "intent", intent: "ANALYZE_ASSET", command: "Analyze BTC on 4H" });
    const split = Math.floor(line.length / 2);

    expect(parser.push(line.slice(0, split))).toHaveLength(0);
    expect(parser.push(line.slice(split))).toHaveLength(1);
  });

  it("handles several messages arriving in one chunk", () => {
    const parser = createStreamParser();
    const chunk =
      encodeStreamMessage({ type: "intent", intent: "MARKET_OVERVIEW", command: "How is the market today?" }) +
      encodeStreamMessage({ type: "intent", intent: "ANALYZE_ASSET", command: "Analyze BTC on 4H" });

    expect(parser.push(chunk)).toHaveLength(2);
  });

  it("drops malformed lines rather than throwing", () => {
    const parser = createStreamParser();

    expect(parser.push("{not json}\n")).toHaveLength(0);
    expect(parser.flush()).toHaveLength(0);
  });
});
