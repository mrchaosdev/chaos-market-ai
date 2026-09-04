"use client";

import { useRef } from "react";
import { useGSAP } from "@gsap/react";
import gsap from "gsap";
import type { AgentWorkflowResult } from "@/lib/agent/execute";
import { ComparePanel } from "./compare-panel";
import { EntryPanel } from "./entry-panel";
import { MarketAnalysisPanel } from "./market-analysis-panel";
import { OverviewPanel } from "./overview-panel";
import { WorkflowMetaBar } from "./workflow-meta-bar";

export function WorkflowResult({ result }: { result: AgentWorkflowResult }) {
  const container = useRef<HTMLDivElement>(null);

  useGSAP(
    () => {
      const media = gsap.matchMedia();

      media.add("(prefers-reduced-motion: no-preference)", () => {
        gsap
          .timeline()
          .from("[data-reveal-meta]", { opacity: 0, y: -6, duration: 0.24, ease: "power2.out" })
          .from("[data-reveal-body] > *", { opacity: 0, y: 12, duration: 0.38, stagger: 0.07, ease: "power3.out" }, "-=0.08");
      });

      return () => media.revert();
    },
    { scope: container, dependencies: [result.runId] },
  );

  return (
    <div className="cm-workflow-result space-y-4" ref={container}>
      <div className="cm-workflow-result__meta" data-reveal-meta>
        <WorkflowMetaBar meta={result.meta} runId={result.runId} workflow={result.workflow} />
      </div>
      <div className="cm-workflow-result__body" data-reveal-body>{renderBody(result)}</div>
    </div>
  );
}

function renderBody(result: AgentWorkflowResult) {
  if (result.workflow === "MarketOverviewWorkflow") {
    return <OverviewPanel result={result} />;
  }

  if (result.workflow === "CompareAssetsWorkflow") {
    return <ComparePanel result={result} />;
  }

  if (result.workflow === "EntryAnalysisWorkflow") {
    return <EntryPanel result={result} />;
  }

  return <MarketAnalysisPanel analysis={result} />;
}
