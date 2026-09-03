import type { AnalysisContext } from "../types";

export function buildComparePrompt(contexts: AnalysisContext[]) {
  return `Compare structured market contexts only. Symbols: ${contexts.map((context) => context.symbol).join(", ")}.`;
}
