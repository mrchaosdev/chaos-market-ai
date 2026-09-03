import type { AIProvider } from "../provider";
import type { AIAnalysis, AnalysisContext } from "../types";

export class LocalProvider implements AIProvider {
  async analyze(input: AnalysisContext): Promise<AIAnalysis> {
    return {
      summary: `${input.symbol} shows ${input.signal.bias} structure with ${input.signal.score} / 100 signal alignment.`,
      bias: input.signal.bias.replace("-", "_") as AIAnalysis["bias"],
      observations: [
        "Market data was retrieved before AI interpretation.",
        "Indicators and signal score were computed deterministically.",
      ],
      bullishFactors: input.structure.trend === "bullish" ? ["Trend structure is bullish."] : [],
      bearishFactors: input.structure.trend === "bearish" ? ["Trend structure is bearish."] : [],
      risks: ["Market conditions can change after this analysis window."],
      conclusion: "Market analysis only. Not a trading instruction.",
    };
  }
}
