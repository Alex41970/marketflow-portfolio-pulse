import { useEffect, useRef } from "react";
import { createChart, CandlestickSeries, HistogramSeries, LineSeries, ColorType, type IChartApi, type ISeriesApi, type UTCTimestamp } from "lightweight-charts";
import { candles, type Range } from "@/lib/market";

function cssVar(el: HTMLElement, name: string) {
  return getComputedStyle(el).getPropertyValue(name).trim();
}

export default function CandleChart({ symbol, range, price, height = 360 }: { symbol: string; range: Range; price: number; height?: number }) {
  const ref = useRef<HTMLDivElement>(null);
  const chartRef = useRef<IChartApi | null>(null);
  const seriesRef = useRef<ISeriesApi<"Candlestick"> | null>(null);
  const lastRef = useRef<{ time: number; open: number; high: number; low: number; close: number } | null>(null);

  useEffect(() => {
    const el = ref.current!;
    const fg = cssVar(el, "--muted-foreground");
    const grid = cssVar(el, "--border");
    const gain = cssVar(el, "--gain");
    const loss = cssVar(el, "--loss");
    const chart = createChart(el, {
      autoSize: true,
      layout: { background: { type: ColorType.Solid, color: "transparent" }, textColor: fg, fontFamily: "IBM Plex Mono", fontSize: 11 },
      grid: { vertLines: { color: grid }, horzLines: { color: grid } },
      rightPriceScale: { borderColor: grid },
      timeScale: { borderColor: grid, timeVisible: range === "1D" || range === "5D" },
      crosshair: { mode: 1 },
    });
    const data = candles(symbol, range, price);
    const s = chart.addSeries(CandlestickSeries, { upColor: gain, downColor: loss, borderVisible: false, wickUpColor: gain, wickDownColor: loss });
    s.setData(data.map((c) => ({ ...c, time: c.time as UTCTimestamp })));
    const v = chart.addSeries(HistogramSeries, { priceFormat: { type: "volume" }, priceScaleId: "" });
    v.priceScale().applyOptions({ scaleMargins: { top: 0.82, bottom: 0 } });
    v.setData(data.map((c) => ({ time: c.time as UTCTimestamp, value: c.volume, color: c.close >= c.open ? gain + "55" : loss + "55" })));
    const ma = chart.addSeries(LineSeries, { color: cssVar(el, "--primary"), lineWidth: 1, priceLineVisible: false, lastValueVisible: false });
    ma.setData(data.slice(19).map((c, i) => ({ time: c.time as UTCTimestamp, value: data.slice(i, i + 20).reduce((a, b) => a + b.close, 0) / 20 })));
    chart.timeScale().fitContent();
    chartRef.current = chart;
    seriesRef.current = s;
    lastRef.current = data.at(-1) ?? null;
    return () => { chart.remove(); chartRef.current = null; };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [symbol, range]);

  useEffect(() => {
    const l = lastRef.current;
    if (!l || !seriesRef.current) return;
    const n = { ...l, close: price, high: Math.max(l.high, price), low: Math.min(l.low, price) };
    lastRef.current = n;
    seriesRef.current.update({ ...n, time: n.time as UTCTimestamp });
  }, [price]);

  return <div ref={ref} style={{ height }} className="w-full" />;
}
