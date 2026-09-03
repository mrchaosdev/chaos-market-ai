import { describe, expect, it } from "vitest";
import routerCases from "../../evals/router.json";
import { parseSymbols, parseTimeframe } from "../../src/lib/agent/parse-command";
import { routeAgentIntent, type AgentIntent } from "../../src/lib/agent/router";

type RouterCase = {
  query: string;
  expectedIntent: AgentIntent;
  expectedWorkflow: string | null;
  expectedSymbols?: string[];
  expectedTimeframe?: string;
  requiredTools: string[];
};

const workflowByIntent: Record<AgentIntent, string | null> = {
  MARKET_OVERVIEW: "MarketOverviewWorkflow",
  ANALYZE_ASSET: "AnalyzeAssetWorkflow",
  COMPARE_ASSETS: "CompareAssetsWorkflow",
  ENTRY_ANALYSIS: "EntryAnalysisWorkflow",
  UNKNOWN: null,
};

describe("router eval", () => {
  const cases = routerCases as RouterCase[];

  it.each(cases)("routes $query", (testCase) => {
    const intent = routeAgentIntent(testCase.query);

    expect(intent).toBe(testCase.expectedIntent);
    expect(workflowByIntent[intent]).toBe(testCase.expectedWorkflow);

    if (testCase.expectedSymbols) {
      expect(parseSymbols(testCase.query)).toEqual(testCase.expectedSymbols);
    }

    if (testCase.expectedTimeframe) {
      expect(parseTimeframe(testCase.query)).toBe(testCase.expectedTimeframe);
    }
  });

  it("covers every supported intent", () => {
    const covered = new Set(cases.map((testCase) => testCase.expectedIntent));

    expect([...covered].sort()).toEqual(["ANALYZE_ASSET", "COMPARE_ASSETS", "ENTRY_ANALYSIS", "MARKET_OVERVIEW", "UNKNOWN"]);
  });
});
