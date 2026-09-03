export type AgentIntent = "MARKET_OVERVIEW" | "ANALYZE_ASSET" | "COMPARE_ASSETS" | "ENTRY_ANALYSIS" | "UNKNOWN";

export function routeAgentIntent(command: string): AgentIntent {
  const normalized = command.toLowerCase();

  if (normalized.includes("compare") || normalized.includes(" vs ")) {
    return "COMPARE_ASSETS";
  }

  if (normalized.includes("entry") || normalized.includes("good entry")) {
    return "ENTRY_ANALYSIS";
  }

  if (normalized.includes("today") || normalized.includes("overview")) {
    return "MARKET_OVERVIEW";
  }

  if (normalized.includes("analyze") || normalized.includes("inspect")) {
    return "ANALYZE_ASSET";
  }

  return "UNKNOWN";
}
