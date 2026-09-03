import { NextResponse } from "next/server";
import { z } from "zod";
import { executeAgentCommand } from "@/lib/agent/execute";
import { badRequestResponse, chaosErrorResponse } from "@/lib/api/response";
import { chaosErrorStatus } from "@/lib/utils/errors";

export const dynamic = "force-dynamic";

const ChatRequestSchema = z.object({
  command: z.string().min(1).max(300),
});

export async function POST(request: Request) {
  const parsed = ChatRequestSchema.safeParse(await request.json().catch(() => null));

  if (!parsed.success) {
    return badRequestResponse("A non-empty command string is required.");
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
