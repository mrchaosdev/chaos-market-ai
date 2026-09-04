import type { PulseTone } from "@/lib/analysis/pulse";
import type { AgentTraceEvent, TracePhase } from "./events";

export type AgentActivity = "idle" | "running" | "settled" | "failed" | "not_routed";

export type AgentVitals = {
  bpm: number;
  amplitude: number;
  tone: PulseTone;
  /** Short status word shown next to the sphere. */
  state: string;
  /** What the agent is doing right now, in the workflow's own vocabulary. */
  detail: string;
  busy: boolean;
};

/**
 * The sphere is the agent's body, so its rate has to mean something. Resting is
 * slow; routing quickens it; the tool phase is the fastest because that is where
 * the real latency lives; interpretation settles back down.
 */
const bpmByPhase: Record<TracePhase, number> = {
  intent: 84,
  market_data: 108,
  analytics: 96,
  signal: 92,
  ai: 78,
  persistence: 70,
};

const phaseDetail: Record<TracePhase, string> = {
  intent: "Routing the command to a workflow",
  market_data: "Reading Binance market data",
  analytics: "Calculating indicators and structure",
  signal: "Scoring signal alignment",
  ai: "Interpreting the measured evidence",
  persistence: "Recording the run",
};

export const idleBpm = 52;

export function deriveAgentVitals(activity: AgentActivity, trace: AgentTraceEvent[]): AgentVitals {
  const latest = trace.at(-1);

  if (activity === "running") {
    const phase = latest?.phase ?? "intent";

    return {
      bpm: bpmByPhase[phase],
      amplitude: 0.075,
      tone: "neutral",
      state: "Working",
      detail: phaseDetail[phase],
      busy: true,
    };
  }

  if (activity === "failed") {
    return {
      bpm: 44,
      amplitude: 0.03,
      // A stalled workflow reads as the market's own negative tone, not as an alarm.
      tone: "negative",
      state: "Halted",
      detail: latest?.outputSummary ?? "The workflow stopped before interpretation",
      busy: false,
    };
  }

  if (activity === "not_routed") {
    return { bpm: idleBpm, amplitude: 0.03, tone: "neutral", state: "Not routed", detail: "No workflow matched that command", busy: false };
  }

  if (activity === "settled") {
    return {
      bpm: 64,
      amplitude: 0.06,
      tone: "positive",
      state: "Complete",
      detail: `${trace.length} steps executed`,
      busy: false,
    };
  }

  return { bpm: idleBpm, amplitude: 0.032, tone: "neutral", state: "Resting", detail: "Waiting for a command", busy: false };
}
