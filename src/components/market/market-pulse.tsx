import { ChaosSphere } from "@/components/chaos/chaos-sphere";
import { derivePulse, type PulseInput } from "@/lib/analysis/pulse";
import { maxSignalScore } from "@/lib/analysis/signal-engine";

type MarketPulseProps = PulseInput & {
  points?: number;
  height?: number;
};

/**
 * The sphere reading the market: rate from the volatility class and volume state,
 * amplitude from signal alignment, colour from trend. Every animated parameter is
 * a deterministic measurement, and the readouts below say which.
 */
export function MarketPulse({ points = 950, height = 300, ...state }: MarketPulseProps) {
  const pulse = derivePulse(state);

  return (
    <section className="cm-market-pulse border border-border bg-background" data-market-pulse>
      <div className="cm-market-pulse__header flex items-center justify-between gap-3 border-b border-border px-4 py-3">
        <p className="cm-market-pulse__title font-mono text-xs uppercase tracking-[0.2em] text-muted-foreground">Market Pulse</p>
        <span className="cm-market-pulse__method font-mono text-[11px] uppercase tracking-[0.14em] text-subtle-foreground">Derived, not predicted</span>
      </div>

      <ChaosSphere amplitude={pulse.amplitude} bpm={pulse.bpm} height={height} interactive points={points} tone={pulse.tone} />

      <dl className="cm-market-pulse__readouts grid grid-cols-3 gap-px border-t border-border bg-border">
        <Readout hint={`${state.volatility} volatility`} label="Rate" value={`${pulse.bpm} BPM`} />
        <Readout hint="signal alignment" label="Amplitude" value={`${state.signalScore} / ${maxSignalScore}`} />
        <Readout hint={`volume ${state.volume}`} label="Rhythm" tone={pulse.tone} value={state.trend} />
      </dl>

      <p className="cm-market-pulse__note border-t border-border px-4 py-3 text-xs leading-5 text-subtle-foreground">
        Rate is mapped from the volatility class and volume state, amplitude from signal alignment. The pulse visualises measured market
        structure — it is not a forecast and not a probability.
      </p>
    </section>
  );
}

function Readout({ label, value, hint, tone = "neutral" }: { label: string; value: string; hint: string; tone?: "positive" | "negative" | "neutral" }) {
  const toneClass = tone === "positive" ? "text-positive" : tone === "negative" ? "text-negative" : "text-foreground";

  return (
    <div className="cm-market-pulse__readout bg-background px-4 py-3">
      <dt className="cm-market-pulse__readout-label font-mono text-[11px] uppercase tracking-[0.18em] text-muted-foreground">{label}</dt>
      <dd className={`cm-market-pulse__readout-value mt-2 font-mono text-sm capitalize tabular ${toneClass}`}>{value}</dd>
      <dd className="cm-market-pulse__readout-hint mt-1 font-mono text-[10px] uppercase tracking-[0.14em] text-subtle-foreground">{hint}</dd>
    </div>
  );
}
