import { NextResponse } from "next/server";
import { chaosErrorStatus, toChaosError } from "@/lib/utils/errors";
import { WorkflowFailure } from "@/lib/workflows/context";

export function chaosErrorResponse(error: unknown) {
  const chaosError = toChaosError(error);
  const trace = error instanceof WorkflowFailure ? error.trace : [];
  const runId = error instanceof WorkflowFailure ? error.runId : null;

  return NextResponse.json({ error: chaosError.toPayload(), runId, trace }, { status: chaosErrorStatus[chaosError.code] });
}

export function badRequestResponse(message: string) {
  return NextResponse.json({ error: { code: "INVALID_REQUEST", message, hint: "Check the request body against the API contract." } }, { status: 400 });
}
