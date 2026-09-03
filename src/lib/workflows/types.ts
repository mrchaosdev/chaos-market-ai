import type { analyzeAssetWorkflow } from "@/lib/workflows/analyze-asset";

export type AnalyzeAssetResult = Awaited<ReturnType<typeof analyzeAssetWorkflow>>;
