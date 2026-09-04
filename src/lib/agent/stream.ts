import { executeAgentCommand } from "./execute";
import { routeAgentIntent } from "./router";
import { encodeStreamMessage, type AgentStreamMessage } from "./stream-protocol";

export { agentStreamContentType, createStreamParser, encodeStreamMessage } from "./stream-protocol";
export type { AgentStreamMessage } from "./stream-protocol";

/**
 * Runs the command and emits each real trace event as the workflow produces it,
 * then a final `done` message carrying the same `AgentExecution` the non-streaming
 * route returns. Callers that ignore the intermediate events still get the whole
 * result, so both transports stay on one code path.
 *
 * Server only — it pulls in the workflow and persistence layers.
 */
export function streamAgentCommand(command: string): ReadableStream<Uint8Array> {
  const encoder = new TextEncoder();

  return new ReadableStream({
    async start(controller) {
      let closed = false;

      const send = (message: AgentStreamMessage) => {
        if (closed) {
          return;
        }

        try {
          controller.enqueue(encoder.encode(encodeStreamMessage(message)));
        } catch {
          // The client disconnected; the workflow finishes but stops emitting.
          closed = true;
        }
      };

      send({ type: "intent", intent: routeAgentIntent(command), command });

      const execution = await executeAgentCommand(command, {
        onEvent: (event) => send({ type: "trace", event }),
      });

      send({ type: "done", execution });

      if (!closed) {
        controller.close();
      }
    },
  });
}
