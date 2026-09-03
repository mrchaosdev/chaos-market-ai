export type TraceStatus = "queued" | "running" | "success" | "warning" | "error";

export type AgentEvent = {
  id: string;
  label: string;
  detail: string;
  status: TraceStatus;
  latencyMs?: number;
};
