"use client";

import { maxSignalScore } from "@/lib/analysis/comparison";
import { useEffect, useRef } from "react";
import { derivePulse, heartbeat, type PulseInput } from "@/lib/analysis/pulse";
import { resolveTokenChannels, type RgbChannels } from "@/lib/utils/css-color";

type MarketPulseProps = PulseInput & {
  points?: number;
  height?: number;
};

/** How much of one cycle the beat takes to travel from the pacemaker to the far side. */
const waveTravel = 0.26;
const tiltRadians = -0.38;
const driftPerSecond = 0.19;

/**
 * A sphere of points whose contraction is driven entirely by deterministic market
 * state: rate from the volatility class, amplitude from signal alignment, colour
 * from trend. The beat propagates from a fixed pacemaker across the surface rather
 * than scaling the whole sphere in lockstep, which is what makes it read as tissue
 * instead of as a throbbing button.
 *
 * Canvas 2D on purpose. The dot-matrix look needs projection and depth fade, not
 * geometry or lighting, so Three.js would be ~150KB for nothing.
 */
export function MarketPulse({ points = 950, height = 300, ...state }: MarketPulseProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const pulse = derivePulse(state);

  useEffect(() => {
    const canvas = canvasRef.current;
    const context = canvas?.getContext("2d");

    if (!canvas || !context) {
      return;
    }

    const palette = {
      tone: resolveTokenChannels(canvas.parentElement ?? canvas, tokenForTone(pulse.tone)),
      muted: resolveTokenChannels(canvas.parentElement ?? canvas, "--foreground-muted"),
      accent: resolveTokenChannels(canvas.parentElement ?? canvas, "--primary"),
    };

    const lattice = buildLattice(points);
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    let width = 0;
    let viewHeight = 0;
    let frame = 0;
    let visible = true;
    let startedAt = performance.now();

    const resize = () => {
      const ratio = Math.min(window.devicePixelRatio || 1, 2);
      width = canvas.clientWidth;
      viewHeight = canvas.clientHeight;
      canvas.width = Math.round(width * ratio);
      canvas.height = Math.round(viewHeight * ratio);
      context.setTransform(ratio, 0, 0, ratio, 0, 0);
    };

    const render = (now: number) => {
      const elapsed = (now - startedAt) / 1000;
      const cyclePhase = reduced ? 0.5 : (elapsed * 1000) / pulse.cycleMs;
      const spin = reduced ? 0.6 : elapsed * driftPerSecond;
      const radius = Math.min(width, viewHeight) * 0.4;
      const centerX = width / 2;
      const centerY = viewHeight / 2;

      context.clearRect(0, 0, width, viewHeight);

      for (const point of lattice) {
        // Each point beats on its own delayed copy of the cycle, so the
        // contraction sweeps across the surface as a wave.
        const localPhase = wrap(cyclePhase - point.delay * waveTravel);
        const beat = reduced ? 0 : heartbeat(localPhase);
        const swell = 1 + pulse.amplitude * beat;

        const cosSpin = Math.cos(spin);
        const sinSpin = Math.sin(spin);
        const spunX = point.x * cosSpin + point.z * sinSpin;
        const spunZ = -point.x * sinSpin + point.z * cosSpin;
        const tiltedY = point.y * Math.cos(tiltRadians) - spunZ * Math.sin(tiltRadians);
        const tiltedZ = point.y * Math.sin(tiltRadians) + spunZ * Math.cos(tiltRadians);

        // Bias depth so the near hemisphere separates hard from the far one.
        // A linear ramp leaves the sphere reading as a flat speckled disc.
        const depth = Math.pow((tiltedZ + 1) / 2, 1.6);
        const screenX = centerX + spunX * radius * swell;
        const screenY = centerY - tiltedY * radius * swell;

        const channels = mixChannels(palette.muted, palette.tone, 0.2 + depth * 0.55 + beat * 0.25);
        const alpha = Math.min(1, (0.08 + depth * 0.92) * (0.7 + beat * 0.3));
        const size = (0.75 + depth * 2.05) * (1 + beat * 0.4);

        context.fillStyle = `rgba(${channels[0]}, ${channels[1]}, ${channels[2]}, ${alpha.toFixed(3)})`;
        context.beginPath();
        context.arc(screenX, screenY, size, 0, Math.PI * 2);
        context.fill();
      }

      drawRing(context, centerX, centerY, radius, pulse.amplitude, cyclePhase, palette.accent, reduced);

      if (!reduced && visible) {
        frame = requestAnimationFrame(render);
      }
    };

    const start = () => {
      cancelAnimationFrame(frame);
      startedAt = performance.now();

      // Reduced motion paints one resting frame synchronously. Scheduling it
      // through rAF would let the IntersectionObserver's first callback cancel
      // it before it ever draws, leaving an empty canvas.
      if (reduced) {
        render(performance.now());
        return;
      }

      frame = requestAnimationFrame(render);
    };

    resize();
    start();

    const resizeObserver = new ResizeObserver(() => {
      resize();
      render(performance.now());
    });
    resizeObserver.observe(canvas);

    // Stop the loop entirely when the sphere is off-screen.
    const intersectionObserver = new IntersectionObserver(([entry]) => {
      visible = entry.isIntersecting;

      if (reduced) {
        return;
      }

      if (visible) {
        start();
      } else {
        cancelAnimationFrame(frame);
      }
    });
    intersectionObserver.observe(canvas);

    return () => {
      cancelAnimationFrame(frame);
      resizeObserver.disconnect();
      intersectionObserver.disconnect();
    };
  }, [points, pulse.amplitude, pulse.cycleMs, pulse.tone]);

  return (
    <section className="border border-border bg-background" data-market-pulse>
      <div className="flex items-center justify-between gap-3 border-b border-border px-4 py-3">
        <p className="font-mono text-xs uppercase tracking-[0.2em] text-muted-foreground">Market Pulse</p>
        <span className="font-mono text-[11px] uppercase tracking-[0.14em] text-subtle-foreground">Derived, not predicted</span>
      </div>

      <div className="relative" style={{ height }}>
        <canvas aria-hidden className="block size-full" ref={canvasRef} />
      </div>

      <dl className="grid grid-cols-3 gap-px border-t border-border bg-border">
        <Readout label="Rate" value={`${pulse.bpm} BPM`} hint={`${state.volatility} volatility`} />
        <Readout label="Amplitude" value={`${state.signalScore} / ${maxSignalScore}`} hint="signal alignment" />
        <Readout label="Rhythm" value={state.trend} hint={`volume ${state.volume}`} tone={pulse.tone} />
      </dl>

      <p className="border-t border-border px-4 py-3 text-xs leading-5 text-subtle-foreground">
        Rate is mapped from the volatility class and volume state, amplitude from signal alignment. The pulse visualises measured market
        structure — it is not a forecast and not a probability.
      </p>
    </section>
  );
}

function Readout({ label, value, hint, tone = "neutral" }: { label: string; value: string; hint: string; tone?: "positive" | "negative" | "neutral" }) {
  const toneClass = tone === "positive" ? "text-positive" : tone === "negative" ? "text-negative" : "text-foreground";

  return (
    <div className="bg-background px-4 py-3">
      <dt className="font-mono text-[11px] uppercase tracking-[0.18em] text-muted-foreground">{label}</dt>
      <dd className={`mt-2 font-mono text-sm capitalize tabular ${toneClass}`}>{value}</dd>
      <dd className="mt-1 font-mono text-[10px] uppercase tracking-[0.14em] text-subtle-foreground">{hint}</dd>
    </div>
  );
}

type LatticePoint = {
  x: number;
  y: number;
  z: number;
  delay: number;
};

/**
 * Fibonacci sphere — even density with no clustering at the poles. `delay` is the
 * angular distance from the pacemaker, normalised to [0,1], so the beat can travel.
 */
function buildLattice(count: number): LatticePoint[] {
  const goldenAngle = Math.PI * (3 - Math.sqrt(5));
  const pacemaker = normalize([0.35, 0.62, 0.7]);

  return Array.from({ length: count }).map((_, index) => {
    const y = 1 - (index / Math.max(count - 1, 1)) * 2;
    const ringRadius = Math.sqrt(Math.max(1 - y * y, 0));
    const theta = goldenAngle * index;
    const x = Math.cos(theta) * ringRadius;
    const z = Math.sin(theta) * ringRadius;
    const dot = x * pacemaker[0] + y * pacemaker[1] + z * pacemaker[2];

    return { x, y, z, delay: (1 - dot) / 2 };
  });
}

/** A single thin ring that contracts with the beat, giving the sphere an outline to read against. */
function drawRing(
  context: CanvasRenderingContext2D,
  centerX: number,
  centerY: number,
  radius: number,
  amplitude: number,
  cyclePhase: number,
  accent: RgbChannels,
  reduced: boolean,
) {
  const beat = reduced ? 0 : heartbeat(wrap(cyclePhase));
  const ringRadius = radius * (1 + amplitude * beat) * 1.08;

  context.strokeStyle = `rgba(${accent[0]}, ${accent[1]}, ${accent[2]}, ${(0.1 + beat * 0.22).toFixed(3)})`;
  context.lineWidth = 1;
  context.beginPath();
  context.arc(centerX, centerY, ringRadius, 0, Math.PI * 2);
  context.stroke();
}

function tokenForTone(tone: "positive" | "negative" | "neutral") {
  if (tone === "positive") {
    return "--positive";
  }

  return tone === "negative" ? "--negative" : "--foreground-muted";
}

function mixChannels(from: RgbChannels, to: RgbChannels, ratio: number): RgbChannels {
  const amount = Math.min(1, Math.max(0, ratio));

  return [
    Math.round(from[0] + (to[0] - from[0]) * amount),
    Math.round(from[1] + (to[1] - from[1]) * amount),
    Math.round(from[2] + (to[2] - from[2]) * amount),
  ];
}

function normalize(vector: [number, number, number]): [number, number, number] {
  const length = Math.hypot(vector[0], vector[1], vector[2]) || 1;
  return [vector[0] / length, vector[1] / length, vector[2] / length];
}

function wrap(value: number) {
  return value - Math.floor(value);
}
