import { generateObject, type LanguageModel } from "ai";
import { AIAnalysisSchema } from "../schemas";
import type { AIProvider } from "../provider";
import type { AIAnalysis, AnalysisContext } from "../types";
import { analystSystemPrompt } from "../prompts/analyst";

export class VercelAIProvider implements AIProvider {
  constructor(
    private readonly model: LanguageModel,
    private readonly providerName: string,
  ) {}

  async analyze(input: AnalysisContext): Promise<AIAnalysis> {
    const result = await generateObject({
      model: this.model,
      schema: AIAnalysisSchema,
      system: analystSystemPrompt,
      prompt: JSON.stringify({
        instruction: "Analyze this structured market context. Explain only supplied observed data and deterministic calculations.",
        context: input,
      }),
    });

    return {
      ...result.object,
      observations: [`AI provider: ${this.providerName}`, ...result.object.observations],
    };
  }
}
