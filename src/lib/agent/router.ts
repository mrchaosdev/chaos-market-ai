export type AgentIntent = "MARKET_OVERVIEW" | "ANALYZE_ASSET" | "COMPARE_ASSETS" | "ENTRY_ANALYSIS" | "UNKNOWN";

type IntentRule = {
  intent: AgentIntent;
  patterns: RegExp[];
};

const intentRules: IntentRule[] = [
  {
    intent: "COMPARE_ASSETS",
    patterns: [/\bcompare\b/, /\bversus\b/, /\bvs\.?\b/, /\bstronger\b/, /\brelative strength\b/],
  },
  {
    intent: "ENTRY_ANALYSIS",
    patterns: [/\bentry\b/, /\bentries\b/, /\bgood (?:time|level|area|spot)\b/, /\bnear support\b/, /\bpullback\b/],
  },
  {
    intent: "MARKET_OVERVIEW",
    patterns: [/\bmarket (?:today|overview|regime|state|condition)\b/, /\boverview\b/, /\bhow is the market\b/, /\bmarket now\b/],
  },
  {
    intent: "ANALYZE_ASSET",
    patterns: [/\banaly[sz]e\b/, /\banaly[sz]is\b/, /\binspect\b/, /\bbreak ?down\b/, /\bstructure of\b/],
  },
];

export function routeAgentIntent(command: string): AgentIntent {
  const normalized = command.trim().toLowerCase();

  if (normalized.length === 0) {
    return "UNKNOWN";
  }

  const matched = intentRules.find((rule) => rule.patterns.some((pattern) => pattern.test(normalized)));

  return matched?.intent ?? "UNKNOWN";
}

export const routedCommandExamples = [
  "How is the market today?",
  "Analyze BTC on 4H",
  "Compare BTC and ETH on 4H",
  "Is BTC near a good entry area?",
];
