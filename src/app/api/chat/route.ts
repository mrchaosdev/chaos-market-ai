import { NextResponse } from "next/server";
import { z } from "zod";
import { executeAgentCommand } from "@/lib/agent/execute";
import { agentStreamContentType, streamAgentCommand } from "@/lib/agent/stream";
import { badRequestResponse, chaosErrorResponse } from "@/lib/api/response";
import { chaosErrorStatus } from "@/lib/utils/errors";

export const dynamic = "force-dynamic";

const ChatRequestSchema = z.object({
  command: z.string().min(1).max(300),
  stream: z.boolean().optional(),
});

export async function POST(request: Request) {
  const parsed = ChatRequestSchema.safeParse(await request.json().catch(() => null));

  if (!parsed.success) {
    return badRequestResponse("A non-empty command string is required.");
  }

  if (parsed.data.stream) {
    return new Response(streamAgentCommand(parsed.data.command), {
      headers: {
        "Content-Type": agentStreamContentType,
        "Cache-Control": "no-store, no-transform",
        // Stops reverse proxies from buffering the trace into one lump.
        "X-Accel-Buffering": "no",
      },
    });
  }

  try {
    const execution = await executeAgentCommand(parsed.data.command);

    if (execution.status === "error") {
      return NextResponse.json(execution, { status: chaosErrorStatus[execution.error.code] });
    }

    return NextResponse.json(execution);
  } catch (error) {
    return chaosErrorResponse(error);
  }
}
