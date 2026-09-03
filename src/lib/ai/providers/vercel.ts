import { generateObject, type LanguageModel } from "ai";
import { ChaosError } from "@/lib/utils/errors";
import { AIAnalysisSchema } from "../schemas";
import { findUnsupportedNumbers } from "../guard";
import type { AIProvider, AIProviderDescriptor, AIProviderName } from "../provider";
import type { AIAnalysis, AnalysisContext } from "../types";
import { analystSystemPrompt, buildAnalystPrompt, buildNumericCorrectionPrompt } from "../prompts/analyst";

const requestTimeoutMs = 20_000;
const maxTransientRetries = 2;
const retryDelayMs = 400;

export class VercelAIProvider implements AIProvider {
  readonly descriptor: AIProviderDescriptor;

  constructor(
    private readonly model: LanguageModel,
    providerName: AIProviderName,
    modelId: string,
  ) {
    this.descriptor = { name: providerName, model: modelId, isFallback: false };
  }

  async analyze(input: AnalysisContext): Promise<AIAnalysis> {
    const analysis = await this.generate(buildAnalystPrompt(input));
    const unsupported = findUnsupportedNumbers(analysis, input);

    if (unsupported.length === 0) {
      return analysis;
    }

    const corrected = await this.generate(buildNumericCorrectionPrompt(input, unsupported));

    if (findUnsupportedNumbers(corrected, input).length > 0) {
      throw new ChaosError("AI_PROVIDER_ERROR", `${this.descriptor.name} produced market numbers that are not present in the analysis context.`);
    }

    return corrected;
  }

  private async generate(prompt: string): Promise<AIAnalysis> {
    let lastError: unknown = null;

    for (let attempt = 0; attempt <= maxTransientRetries; attempt += 1) {
      try {
        const result = await generateObject({
          model: this.model,
          schema: AIAnalysisSchema,
          system: analystSystemPrompt,
          prompt,
          abortSignal: AbortSignal.timeout(requestTimeoutMs),
        });

        return result.object;
      } catch (error) {
        lastError = error;

        if (!isTransient(error) || attempt === maxTransientRetries) {
          break;
        }

        await delay(retryDelayMs * (attempt + 1));
      }
    }

    throw new ChaosError("AI_PROVIDER_ERROR", describeFailure(this.descriptor.name, lastError), lastError);
  }
}

function isTransient(error: unknown) {
  if (!(error instanceof Error)) {
    return false;
  }

  if (error.name === "TimeoutError" || error.name === "AbortError") {
    return true;
  }

  const status = (error as { statusCode?: number; status?: number }).statusCode ?? (error as { status?: number }).status;

  if (typeof status === "number") {
    return status === 408 || status === 409 || status === 429 || status >= 500;
  }

  return /fetch failed|network|ECONNRESET|ETIMEDOUT/i.test(error.message);
}

function describeFailure(providerName: string, error: unknown) {
  if (error instanceof Error && (error.name === "TimeoutError" || error.name === "AbortError")) {
    return `${providerName} did not return an interpretation within ${requestTimeoutMs}ms.`;
  }

  if (error instanceof Error) {
    return `${providerName} interpretation failed: ${error.message}`;
  }

  return `${providerName} interpretation failed.`;
}

function delay(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}
