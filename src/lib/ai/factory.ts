import type { AIProvider } from "./provider";
import { createAnthropicProvider } from "./providers/anthropic";
import { createGeminiProvider } from "./providers/gemini";
import { LocalProvider } from "./providers/local";
import { createOpenAIProvider } from "./providers/openai";

export type AIProviderName = "local" | "openai" | "gemini" | "anthropic";

export function createAIProvider(): AIProvider {
  const provider = parseProvider(process.env.AI_PROVIDER);
  const apiKey = process.env.AI_API_KEY;
  const model = process.env.AI_MODEL;

  if (!apiKey || provider === "local") {
    return new LocalProvider();
  }

  if (provider === "openai") {
    return createOpenAIProvider(apiKey, model);
  }

  if (provider === "gemini") {
    return createGeminiProvider(apiKey, model);
  }

  if (provider === "anthropic") {
    return createAnthropicProvider(apiKey, model);
  }

  return new LocalProvider();
}

function parseProvider(value: string | undefined): AIProviderName {
  if (value === "openai" || value === "gemini" || value === "anthropic" || value === "local") {
    return value;
  }

  return "local";
}
