import { maxSignalScore } from "@/lib/analysis/comparison";
import type { AIProvider, AIProviderDescriptor } from "../provider";
import type { AIAnalysis, AnalysisContext } from "../types";

export class LocalProvider implements AIProvider {
  readonly descriptor: AIProviderDescriptor = { name: "local", model: "chaos-deterministic", isFallback: true };

  async analyze(input: AnalysisContext): Promise<AIAnalysis> {
    return {
      summary: `${input.symbol} shows ${input.signal.bias} structure with ${input.signal.score} / ${maxSignalScore} signal alignment.`,
      bias: input.signal.bias.replace("-", "_") as AIAnalysis["bias"],
      observations: [
        "Market data was retrieved before AI interpretation.",
        "Indicators and signal score were computed deterministically.",
        `Trend is ${input.structure.trend}, momentum is ${input.structure.momentum}, volume is ${input.structure.volume}.`,
      ],
      bullishFactors: input.structure.trend === "bullish" ? ["Trend structure is bullish."] : [],
      bearishFactors: input.structure.trend === "bearish" ? ["Trend structure is bearish."] : [],
      risks: [
        "Market conditions can change after this analysis window.",
        "Signal alignment describes agreement between components, not a probability of outcome.",
      ],
      conclusion: "Market analysis only. Not a trading instruction.",
    };
  }
}
