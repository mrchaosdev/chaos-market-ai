import { createGoogleGenerativeAI } from "@ai-sdk/google";
import { VercelAIProvider } from "./vercel";

export function createGeminiProvider(apiKey: string, model = "gemini-3.6-flash") {
  const google = createGoogleGenerativeAI({ apiKey });

  // Flash now reasons by default, and a plain 7-word prompt measured ~5s with
  // 300 thinking tokens for a 4-word answer. The analyst call needs one
  // schema-shaped object from data that is already computed, not deliberation,
  // so the budget is off rather than tuned down.
  return new VercelAIProvider(google(model), "gemini", model, {
    google: { thinkingConfig: { thinkingBudget: 0 } },
  });
}
