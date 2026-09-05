import { ChaosLoadingPanel } from "@/components/chaos/chaos-loading-panel";

export default function Loading() {
  return (
    <section className="cm-page cm-page--analyze cm-page--loading bg-background p-5 lg:p-8">
      <ChaosLoadingPanel />
    </section>
  );
}
