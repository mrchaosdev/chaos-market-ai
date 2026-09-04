"use client";

import { useEffect, useRef } from "react";
import {
  CandlestickSeries,
  ColorType,
  CrosshairMode,
  HistogramSeries,
  LineSeries,
  LineStyle,
  createChart,
  type IChartApi,
  type UTCTimestamp,
} from "lightweight-charts";
import { calculateEMA } from "@/lib/indicators/ema";
import { resolveToken } from "@/lib/utils/css-color";
import type { Candle } from "@/lib/market/types";

type MarketChartProps = {
  candles: Candle[];
  support?: number | null;
  resistance?: number | null;
  height?: number;
};

export function MarketChart({ candles, support = null, resistance = null, height = 340 }: MarketChartProps) {
  const container = useRef<HTMLDivElement>(null);
  const chartRef = useRef<IChartApi | null>(null);

  useEffect(() => {
    const element = container.current;

    if (!element || candles.length === 0) {
      return;
    }

    const palette = readChartPalette(element);
    const chart = createChart(element, {
      height,
      layout: {
        background: { type: ColorType.Solid, color: palette.background },
        textColor: palette.muted,
        fontFamily: getComputedStyle(element).fontFamily,
        attributionLogo: false,
      },
      grid: {
        vertLines: { color: palette.grid },
        horzLines: { color: palette.grid },
      },
      rightPriceScale: { borderColor: palette.grid },
      timeScale: { borderColor: palette.grid, timeVisible: true, secondsVisible: false },
      crosshair: {
        mode: CrosshairMode.Normal,
        vertLine: { color: palette.crosshair, labelBackgroundColor: palette.primary },
        horzLine: { color: palette.crosshair, labelBackgroundColor: palette.primary },
      },
    });

    chartRef.current = chart;

    const candleSeries = chart.addSeries(CandlestickSeries, {
      upColor: palette.positive,
      downColor: palette.negative,
      wickUpColor: palette.positiveMuted,
      wickDownColor: palette.negativeMuted,
      borderVisible: false,
    });

    candleSeries.setData(
      candles.map((candle) => ({
        time: toChartTime(candle.timestamp),
        open: candle.open,
        high: candle.high,
        low: candle.low,
        close: candle.close,
      })),
    );

    const volumeSeries = chart.addSeries(HistogramSeries, { priceFormat: { type: "volume" }, priceScaleId: "volume", color: palette.volume });
    chart.priceScale("volume").applyOptions({ scaleMargins: { top: 0.82, bottom: 0 } });
    volumeSeries.setData(
      candles.map((candle) => ({
        time: toChartTime(candle.timestamp),
        value: candle.volume,
        color: candle.close >= candle.open ? palette.positiveMuted : palette.negativeMuted,
      })),
    );

    addEmaSeries(chart, candles, 20, palette.primary);
    addEmaSeries(chart, candles, 50, palette.highlight);

    if (support !== null) {
      candleSeries.createPriceLine({ price: support, color: palette.positive, lineWidth: 1, lineStyle: LineStyle.Dashed, axisLabelVisible: true, title: "SUPPORT" });
    }

    if (resistance !== null) {
      candleSeries.createPriceLine({ price: resistance, color: palette.negative, lineWidth: 1, lineStyle: LineStyle.Dashed, axisLabelVisible: true, title: "RESISTANCE" });
    }

    chart.timeScale().fitContent();

    const observer = new ResizeObserver(([entry]) => chart.applyOptions({ width: entry.contentRect.width }));
    observer.observe(element);

    return () => {
      observer.disconnect();
      chart.remove();
      chartRef.current = null;
    };
  }, [candles, support, resistance, height]);

  return (
    <div className="cm-market-chart border border-border bg-background">
      <div className="cm-market-chart__legend flex flex-wrap items-center gap-4 border-b border-border px-4 py-2">
        <Legend label="EMA20" tone="primary" />
        <Legend label="EMA50" tone="highlight" />
        <Legend label="Support" tone="positive" />
        <Legend label="Resistance" tone="negative" />
        <span className="cm-market-chart__volume-label ml-auto font-mono text-[11px] uppercase tracking-[0.16em] text-subtle-foreground">Volume overlay</span>
      </div>
      <div className="cm-market-chart__canvas w-full" ref={container} style={{ height }} />
    </div>
  );
}

function Legend({ label, tone }: { label: string; tone: "primary" | "highlight" | "positive" | "negative" }) {
  const toneClass = {
    primary: "bg-primary",
    highlight: "bg-highlight",
    positive: "bg-positive",
    negative: "bg-negative",
  }[tone];

  return (
    <span className={`cm-market-chart__legend-item cm-market-chart__legend-item--${tone} flex items-center gap-2 font-mono text-[11px] uppercase tracking-[0.16em] text-muted-foreground`}>
      <span className={`cm-market-chart__legend-line inline-block h-px w-4 ${toneClass}`} />
      {label}
    </span>
  );
}

function addEmaSeries(chart: IChartApi, candles: Candle[], period: number, color: string) {
  if (candles.length < period) {
    return;
  }

  const values = calculateEMA(
    candles.map((candle) => candle.close),
    period,
  );
  const series = chart.addSeries(LineSeries, { color, lineWidth: 1, priceLineVisible: false, lastValueVisible: false });

  series.setData(
    candles.slice(period - 1).map((candle, index) => ({
      time: toChartTime(candle.timestamp),
      value: values[index + period - 1],
    })),
  );
}

function toChartTime(timestamp: number) {
  return Math.floor(timestamp / 1000) as UTCTimestamp;
}

function readChartPalette(element: HTMLElement) {
  return {
    background: resolveToken(element, "--background"),
    grid: resolveToken(element, "--chart-grid"),
    crosshair: resolveToken(element, "--chart-crosshair"),
    muted: resolveToken(element, "--foreground-muted"),
    primary: resolveToken(element, "--primary"),
    highlight: resolveToken(element, "--highlight"),
    positive: resolveToken(element, "--positive"),
    positiveMuted: resolveToken(element, "--positive-muted"),
    negative: resolveToken(element, "--negative"),
    negativeMuted: resolveToken(element, "--negative-muted"),
    volume: resolveToken(element, "--chart-volume"),
  };
}
