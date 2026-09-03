import { NextResponse } from "next/server";
import { chaosErrorResponse } from "@/lib/api/response";
import { isPersistenceEnabled, listAnalysisRuns } from "@/lib/db/queries";

export const dynamic = "force-dynamic";

export async function GET() {
  if (!isPersistenceEnabled()) {
    return NextResponse.json({ persistenceEnabled: false, runs: [] });
  }

  try {
    return NextResponse.json({ persistenceEnabled: true, runs: await listAnalysisRuns() });
  } catch (error) {
    return chaosErrorResponse(error);
  }
}
