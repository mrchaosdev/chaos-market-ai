"use client";

import { useState } from "react";
import { ThumbsDown, ThumbsUp } from "lucide-react";
import type { PersistenceStatus } from "@/lib/db/queries";

type RunFeedbackProps = {
  runId: string;
  persistence: PersistenceStatus;
};

export function RunFeedback({ runId, persistence }: RunFeedbackProps) {
  const [state, setState] = useState<"idle" | "sending" | "sent" | "failed">("idle");

  async function send(helpful: boolean) {
    setState("sending");

    try {
      const response = await fetch("/api/feedback", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ runId, helpful }),
      });

      setState(response.ok ? "sent" : "failed");
    } catch {
      setState("failed");
    }
  }

  return (
    <div className="cm-run-feedback border border-border bg-background p-4">
      <p className="cm-run-feedback__title font-mono text-[11px] uppercase tracking-[0.18em] text-muted-foreground">Run feedback</p>
      <p className="cm-run-feedback__message mt-2 text-xs leading-5 text-subtle-foreground">{persistence.message}</p>

      {persistence.persisted ? (
        <div className="cm-run-feedback__actions mt-4 flex items-center gap-2">
          <button
            className="cm-run-feedback__button cm-run-feedback__button--useful flex items-center gap-2 border border-border px-3 py-2 font-mono text-[11px] uppercase tracking-[0.14em] text-muted-foreground transition-colors hover:bg-surface-hover disabled:opacity-50"
            disabled={state === "sending" || state === "sent"}
            onClick={() => send(true)}
            type="button"
          >
            <ThumbsUp aria-hidden className="size-3.5" />
            Useful
          </button>
          <button
            className="cm-run-feedback__button cm-run-feedback__button--not-useful flex items-center gap-2 border border-border px-3 py-2 font-mono text-[11px] uppercase tracking-[0.14em] text-muted-foreground transition-colors hover:bg-surface-hover disabled:opacity-50"
            disabled={state === "sending" || state === "sent"}
            onClick={() => send(false)}
            type="button"
          >
            <ThumbsDown aria-hidden className="size-3.5" />
            Not useful
          </button>
          {state === "sent" ? <span className="cm-run-feedback__status cm-run-feedback__status--sent font-mono text-[11px] uppercase tracking-[0.14em] text-positive">Recorded</span> : null}
          {state === "failed" ? <span className="cm-run-feedback__status cm-run-feedback__status--failed font-mono text-[11px] uppercase tracking-[0.14em] text-negative">Not recorded</span> : null}
        </div>
      ) : null}
    </div>
  );
}
