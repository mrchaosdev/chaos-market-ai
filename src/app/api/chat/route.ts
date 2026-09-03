import { NextResponse } from "next/server";
import { routeAgentIntent } from "@/lib/agent/router";

export async function POST(request: Request) {
  const body = (await request.json()) as Partial<{ command: string }>;
  const command = body.command ?? "";

  return NextResponse.json({
    intent: routeAgentIntent(command),
    command,
  });
}
