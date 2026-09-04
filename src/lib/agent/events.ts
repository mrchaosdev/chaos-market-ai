import { toChaosError, type ChaosErrorCode } from "@/lib/utils/errors";

export type TraceStatus = "queued" | "running" | "success" | "warning" | "error";

export type TracePhase = "intent" | "market_data" | "analytics" | "signal" | "ai" | "persistence";

export type AgentTraceEvent = {
  id: string;
  runId: string;
  workflow: string;
  phase: TracePhase;
  toolName?: string;
  inputSummary?: string;
  outputSummary?: string;
  errorCode?: ChaosErrorCode;
  status: TraceStatus;
  latencyMs?: number;
  createdAt: number;
};

export type TraceStep = {
  phase: TracePhase;
  toolName?: string;
  inputSummary?: string;
};

export type TrackOptions<T> = {
  summarize?: (value: T) => string;
  errorCode?: ChaosErrorCode;
};

export type TraceListener = (event: AgentTraceEvent) => void;

export class TraceRecorder {
  private readonly events: AgentTraceEvent[] = [];
  private sequence = 0;

  constructor(
    readonly runId: string,
    readonly workflow: string,
    private readonly onEvent?: TraceListener,
  ) {}

  record(step: TraceStep, status: TraceStatus, extra: Partial<AgentTraceEvent> = {}): AgentTraceEvent {
    this.sequence += 1;
    const event: AgentTraceEvent = {
      id: String(this.sequence).padStart(2, "0"),
      runId: this.runId,
      workflow: this.workflow,
      phase: step.phase,
      toolName: step.toolName,
      inputSummary: step.inputSummary,
      status,
      createdAt: Date.now(),
      ...extra,
    };

    this.events.push(event);
    // A listener must never be able to fail the workflow it is only observing.
    try {
      this.onEvent?.({ ...event });
    } catch {
      // ignored on purpose
    }

    return event;
  }

  async track<T>(step: TraceStep, run: () => Promise<T> | T, options: TrackOptions<T> = {}): Promise<T> {
    const startedAt = Date.now();

    try {
      const value = await run();
      this.record(step, "success", {
        latencyMs: Date.now() - startedAt,
        outputSummary: options.summarize?.(value),
      });

      return value;
    } catch (error) {
      const chaosError = toChaosError(error, options.errorCode);
      this.record(step, "error", {
        latencyMs: Date.now() - startedAt,
        outputSummary: truncateSummary(chaosError.message),
        errorCode: chaosError.code,
      });

      throw chaosError;
    }
  }

  warn(step: TraceStep, message: string, errorCode?: ChaosErrorCode) {
    return this.record(step, "warning", { outputSummary: truncateSummary(message), errorCode });
  }

  snapshot(): AgentTraceEvent[] {
    return this.events.map((event) => ({ ...event }));
  }
}

export function createRunId(prefix: string) {
  return `${prefix}_${Date.now().toString(36)}${Math.random().toString(36).slice(2, 6)}`;
}

const traceSummaryMaxLength = 160;

/**
 * A trace row is a fixed-height compact log line, but the text landing here can
 * come from a third-party provider's error response — a Gemini quota failure
 * runs to several hundred characters across multiple lines and blew the row
 * layout budget on narrow viewports. The full message still reaches the caller
 * uncut (`ChaosError.message`, `aiWarning` on the analysis result); only what
 * gets logged into the trace itself is bounded.
 */
function truncateSummary(message: string | undefined): string | undefined {
  if (!message) {
    return message;
  }

  const collapsed = message.replace(/\s+/g, " ").trim();

  return collapsed.length > traceSummaryMaxLength ? `${collapsed.slice(0, traceSummaryMaxLength - 1)}…` : collapsed;
}
