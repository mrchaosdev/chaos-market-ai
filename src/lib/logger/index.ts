export type RunLogEvent = {
  runId: string | null;
  workflow: string;
  intent: string;
  status: "success" | "error" | "not_routed";
  latencyMs: number;
  errorCode?: string;
  persisted?: boolean;
};

export function logRun(event: RunLogEvent) {
  if (process.env.NODE_ENV !== "production") {
    console.info("chaos:run", event);
  }
}
