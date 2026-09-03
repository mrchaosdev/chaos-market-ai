import { z } from "zod";

export const AIAnalysisSchema = z.object({
  summary: z.string(),
  bias: z.enum(["strong_bullish", "bullish", "neutral", "bearish", "strong_bearish"]),
  observations: z.array(z.string()),
  bullishFactors: z.array(z.string()),
  bearishFactors: z.array(z.string()),
  risks: z.array(z.string()),
  conclusion: z.string(),
});
