import type { AIAnalysis, AnalysisContext } from "./types";

export type AIProviderName = "local" | "openai" | "gemini" | "anthropic";

export type AIProviderDescriptor = {
  name: AIProviderName;
  model: string;
  isFallback: boolean;
};

export interface AIProvider {
  readonly descriptor: AIProviderDescriptor;
  analyze(input: AnalysisContext): Promise<AIAnalysis>;
}
