import { createAnthropic } from "@ai-sdk/anthropic";
import { VercelAIProvider } from "./vercel";

export function createAnthropicProvider(apiKey: string, model = "claude-3-5-haiku-latest") {
  const anthropic = createAnthropic({ apiKey });
  return new VercelAIProvider(anthropic(model), "anthropic");
}
