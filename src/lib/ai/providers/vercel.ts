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
    private readonly providerOptions?: Parameters<typeof generateObject>[0]["providerOptions"],
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
          providerOptions: this.providerOptions,
          // The retry loop around this call is the one source of truth for
          // retry/backoff policy — it knows to skip 429s outright, which the
          // SDK's own default (2 retries here too) does not, so left on it
          // silently doubled every retryable failure's latency.
          maxRetries: 0,
        });

        return result.object;
      } catch (error) {
        lastError = error;

        // A 429 here means quota, not a brief queueing hiccup — the API's own
        // retry-after runs tens of seconds, and this loop's backoff tops out
        // under a second. Retrying it can only ever burn the request budget on
        // its way to the same fallback, so skip straight there.
        if (!isTransient(error) || isRateLimited(error) || attempt === maxTransientRetries) {
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

  const status = statusOf(error);

  if (typeof status === "number") {
    return status === 408 || status === 409 || status === 429 || status >= 500;
  }

  return /fetch failed|network|ECONNRESET|ETIMEDOUT/i.test(error.message);
}

function isRateLimited(error: unknown) {
  return error instanceof Error && statusOf(error) === 429;
}

function statusOf(error: Error) {
  return (error as { statusCode?: number; status?: number }).statusCode ?? (error as { status?: number }).status;
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
