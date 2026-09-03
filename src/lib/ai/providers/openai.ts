import { createOpenAI } from "@ai-sdk/openai";
import { VercelAIProvider } from "./vercel";

export function createOpenAIProvider(apiKey: string, model = "gpt-4o-mini") {
  const openai = createOpenAI({ apiKey });
  return new VercelAIProvider(openai(model), "openai");
}
