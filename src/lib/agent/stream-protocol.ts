import type { AgentTraceEvent } from "@/lib/agent/events";
import type { AgentExecution } from "./execute";
import type { AgentIntent } from "./router";

export const agentStreamContentType = "application/x-ndjson";

/**
 * The wire format for `/api/chat?stream`. One JSON object per line — newline
 * delimited rather than SSE because the payload is already structured events and
 * NDJSON survives a plain `fetch` reader without an EventSource.
 *
 * This module holds only the shape and the codec. It must stay free of runtime
 * imports from the server side: the browser bundle imports the parser, and a value
 * import of the workflow layer would drag the Postgres driver into the client.
 */
export type AgentStreamMessage =
  | { type: "intent"; intent: AgentIntent; command: string }
  | { type: "trace"; event: AgentTraceEvent }
  | { type: "done"; execution: AgentExecution };

export function encodeStreamMessage(message: AgentStreamMessage) {
  return `${JSON.stringify(message)}\n`;
}

/** Parses an NDJSON chunk stream into messages, holding back any partial trailing line. */
export function createStreamParser() {
  let buffer = "";

  return {
    push(chunk: string): AgentStreamMessage[] {
      buffer += chunk;
      const lines = buffer.split("\n");
      buffer = lines.pop() ?? "";

      return lines.flatMap(parseLine);
    },
    flush(): AgentStreamMessage[] {
      const remaining = buffer;
      buffer = "";

      return parseLine(remaining);
    },
  };
}

function parseLine(line: string): AgentStreamMessage[] {
  const trimmed = line.trim();

  if (trimmed.length === 0) {
    return [];
  }

  try {
    return [JSON.parse(trimmed) as AgentStreamMessage];
  } catch {
    return [];
  }
}
