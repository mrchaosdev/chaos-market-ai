import { createGoogleGenerativeAI } from "@ai-sdk/google";
import { VercelAIProvider } from "./vercel";

export function createGeminiProvider(apiKey: string, model = "gemini-3.6-flash") {
  const google = createGoogleGenerativeAI({ apiKey });

  // Flash reasons by default, and a plain 7-word prompt measured ~5s and 300
  // thinking tokens for a 4-word answer. The analyst call needs one
  // schema-shaped object from data that is already computed, not deliberation.
  //
  // `thinkingBudget: 0` is the obvious way to say that and this model rejects
  // it outright — HTTP 400, which the provider then degraded to the local
  // interpretation, so the cloud path silently never ran at all. `minimal` is
  // the setting it accepts, and it measures 0 thinking tokens all the same.
  return new VercelAIProvider(google(model), "gemini", model, {
    google: { thinkingConfig: { thinkingLevel: "minimal" } },
  });
}
