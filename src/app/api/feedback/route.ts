import { NextResponse } from "next/server";
import { z } from "zod";
import { badRequestResponse, chaosErrorResponse } from "@/lib/api/response";
import { saveFeedback } from "@/lib/db/queries";

export const dynamic = "force-dynamic";

const FeedbackRequestSchema = z.object({
  runId: z.string().min(1).max(64),
  helpful: z.boolean(),
  rating: z.number().int().min(1).max(5).optional(),
  comment: z.string().max(1000).optional(),
});

export async function POST(request: Request) {
  const parsed = FeedbackRequestSchema.safeParse(await request.json().catch(() => null));

  if (!parsed.success) {
    return badRequestResponse("runId and helpful are required; rating must be 1-5 when supplied.");
  }

  try {
    return NextResponse.json(await saveFeedback(parsed.data));
  } catch (error) {
    return chaosErrorResponse(error);
  }
}
