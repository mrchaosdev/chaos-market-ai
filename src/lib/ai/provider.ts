import type { AIAnalysis, AnalysisContext } from "./types";

export interface AIProvider {
  analyze(input: AnalysisContext): Promise<AIAnalysis>;
}
