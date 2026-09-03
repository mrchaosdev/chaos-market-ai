import type { AIProvider, AIProviderName } from "./provider";
import { createAnthropicProvider } from "./providers/anthropic";
import { createGeminiProvider } from "./providers/gemini";
import { LocalProvider } from "./providers/local";
import { createOpenAIProvider } from "./providers/openai";

export type { AIProviderName } from "./provider";

export function createAIProvider(): AIProvider {
  const provider = parseProvider(process.env.AI_PROVIDER);
  const apiKey = process.env.AI_API_KEY;
  const model = process.env.AI_MODEL || undefined;

  if (!apiKey || provider === "local") {
    return new LocalProvider();
  }

  if (provider === "openai") {
    return createOpenAIProvider(apiKey, model);
  }

  if (provider === "gemini") {
    return createGeminiProvider(apiKey, model);
  }

  return createAnthropicProvider(apiKey, model);
}

export function createFallbackAIProvider(): AIProvider {
  return new LocalProvider();
}

function parseProvider(value: string | undefined): AIProviderName {
  if (value === "openai" || value === "gemini" || value === "anthropic" || value === "local") {
    return value;
  }

  return "local";
}
