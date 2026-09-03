import { createAnthropic } from "@ai-sdk/anthropic";
import { VercelAIProvider } from "./vercel";

export function createAnthropicProvider(apiKey: string, model = "claude-haiku-4-5-20251001") {
  const anthropic = createAnthropic({ apiKey });
  return new VercelAIProvider(anthropic(model), "anthropic", model);
}
