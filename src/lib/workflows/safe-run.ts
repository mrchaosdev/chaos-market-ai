import { toChaosError, type ChaosErrorPayload } from "@/lib/utils/errors";
import { WorkflowFailure } from "./context";

export type WorkflowOutcome<T> =
  | { ok: true; data: T }
  | { ok: false; error: ChaosErrorPayload; runId: string | null };

export async function runSafely<T>(run: () => Promise<T>): Promise<WorkflowOutcome<T>> {
  try {
    return { ok: true, data: await run() };
  } catch (error) {
    return {
      ok: false,
      error: toChaosError(error).toPayload(),
      runId: error instanceof WorkflowFailure ? error.runId : null,
    };
  }
}
