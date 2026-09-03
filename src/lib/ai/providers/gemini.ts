import { createGoogleGenerativeAI } from "@ai-sdk/google";
import { VercelAIProvider } from "./vercel";

export function createGeminiProvider(apiKey: string, model = "gemini-2.0-flash") {
  const google = createGoogleGenerativeAI({ apiKey });
  return new VercelAIProvider(google(model), "gemini");
}
