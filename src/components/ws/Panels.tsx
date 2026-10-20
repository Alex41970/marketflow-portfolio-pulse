import { useMemo, useRef, useEffect, useState } from "react";
import { SimTag, Sparkline } from "@/components/Brand";
import { CLASSES, TICKERS, quoteOf, fmtP, pct, signed, dpOf, spark, tickerOf, type AssetClass, type Quote } from "@/lib/market";

export function PanelHead({ title, right }: { title: string; right?: React.ReactNode }) {
  return (
    <div className="flex h-8 items-center justify-between border-b px-3">
      <span className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">{title}</span>
      {right}
    </div>
  );
}

export function Watchlist({ quotes, sel, onSel }: { quotes: Record<string, Quote>; sel: string; onSel: (s: string) => void }) {
  const [cls, setCls] = useState<AssetClass>("Stocks");
  return (
    <div className="ws-panel flex min-h-0 flex-col">
      <PanelHead title="Watchlist" right={<SimTag />} />
      <div className="flex border-b text-[11px]">
        {CLASSES.map((c) => (
          <button key={c} onClick={() => setCls(c)} className={`flex-1 border-b-2 py-1.5 ${cls === c ? "border-primary text-foreground" : "border-transparent text-muted-foreground"}`}>{c}</button>
        ))}
      </div>
      <div className="min-h-0 flex-1 overflow-auto">
        {TICKERS.filter((t) => t.cls === cls).map((t) => {
          const q = quoteOf(quotes, t.symbol);
          const c = pct(q.price, q.open);
          return (
            <button key={t.symbol} onClick={() => onSel(t.symbol)} className={`grid w-full grid-cols-[1fr_auto_auto] items-center gap-2 border-b px-3 py-2 text-left text-xs hover:bg-muted ${sel === t.symbol ? "bg-accent" : ""}`}>
              <div className="min-w-0"><div className="font-semibold">{t.symbol}</div><div className="truncate text-[10px] text-muted-foreground">{t.name}</div></div>
              <Sparkline data={spark(t.symbol, 20)} up={c >= 0} w={44} h={18} />
              <div className="text-right num">
                <div key={q.seq} className={`rounded-sm px-1 ${q.tick > 0 ? "flash-up" : q.tick < 0 ? "flash-down" : ""}`}>{fmtP(q.price, dpOf(t.symbol))}</div>
                <div className={`text-[10px] ${c >= 0 ? "text-gain" : "text-loss"}`}>{signed(c)}%</div>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}

export function OrderBook({ q }: { q: Quote }) {
  const dp = dpOf(q.symbol);
  const tickSz = q.price * 0.0004;
  const rows = useMemo(() => {
    const r = (i: number) => 100 * Math.round(5 + Math.abs(Math.sin(q.seq * 1.7 + i * 3.1)) * 60);
    const asks = Array.from({ length: 8 }, (_, i) => ({ p: q.price + tickSz * (i + 1), s: r(i) })).reverse();
    const bids = Array.from({ length: 8 }, (_, i) => ({ p: q.price - tickSz * (i + 1), s: r(i + 9) }));
    return { asks, bids, max: Math.max(...asks.map((a) => a.s), ...bids.map((b) => b.s)) };
  }, [q.seq, q.price, tickSz]);
  const Row = ({ p, s, side }: { p: number; s: number; side: "a" | "b" }) => (
    <div className="relative grid grid-cols-2 px-3 py-[3px] text-[11px] num">
      <div className={`absolute inset-y-0 right-0 ${side === "a" ? "bg-loss-soft" : "bg-gain-soft"}`} style={{ width: `${(s / rows.max) * 100}%` }} />
      <span className={`relative ${side === "a" ? "text-loss" : "text-gain"}`}>{fmtP(p, dp)}</span>
      <span className="relative text-right">{s.toLocaleString()}</span>
    </div>
  );
  return (
    <div className="ws-panel flex min-h-0 flex-col">
      <PanelHead title="Depth · L2" right={<SimTag />} />
      <div className="grid grid-cols-2 px-3 py-1 text-[10px] text-muted-foreground"><span>Price</span><span className="text-right">Size</span></div>
      {rows.asks.map((a, i) => <Row key={"a" + i} p={a.p} s={a.s} side="a" />)}
      <div className="border-y bg-muted px-3 py-1 text-center text-xs num">{fmtP(q.price, dp)} <span className="text-muted-foreground">spread {fmtP(tickSz * 2, dp)}</span></div>
      {rows.bids.map((b, i) => <Row key={"b" + i} p={b.p} s={b.s} side="b" />)}
    </div>
  );
}

export function TimeSales({ q }: { q: Quote }) {
  const [prints, setPrints] = useState<{ t: string; p: number; s: number; up: boolean; id: number }[]>([]);
  const last = useRef(q.symbol);
  useEffect(() => {
    if (last.current !== q.symbol) { last.current = q.symbol; setPrints([]); return; }
    if (!q.seq) return;
    setPrints((p) => [{ t: new Date().toLocaleTimeString("en-GB"), p: q.price, s: 100 * (1 + Math.floor(Math.random() * 30)), up: q.tick > 0, id: q.seq }, ...p].slice(0, 30));
  }, [q.seq, q.symbol, q.price, q.tick]);
  return (
    <div className="ws-panel flex min-h-0 flex-col">
      <PanelHead title="Time & Sales" right={<SimTag />} />
      <div className="min-h-0 flex-1 overflow-auto">
        {prints.length === 0 && <div className="p-3 text-xs text-muted-foreground">Waiting for prints…</div>}
        {prints.map((x) => (
          <div key={x.id} className="grid grid-cols-3 px-3 py-[3px] text-[11px] num">
            <span className="text-muted-foreground">{x.t}</span>
            <span className={`text-right ${x.up ? "text-gain" : "text-loss"}`}>{fmtP(x.p, dpOf(q.symbol))}</span>
            <span className="text-right">{x.s}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

const HEAD = ["{n} shares active as traders rotate into {c}", "Analysts revisit {n} targets after quarterly update", "{n} announces strategic partnership", "Options activity in {n} rises ahead of event", "{c} sector sentiment improves; {n} among leaders", "{n} volatility picks up in afternoon trade"];
export function News({ symbol }: { symbol: string }) {
  const t = tickerOf(symbol);
  const items = HEAD.map((h, i) => ({ h: h.replace("{n}", t.name).replace("{c}", t.cls.toLowerCase()), m: (i + 1) * 7 }));
  return (
    <div className="ws-panel flex min-h-0 flex-col">
      <PanelHead title="News" right={<SimTag />} />
      <div className="min-h-0 flex-1 overflow-auto">
        {items.map((x) => (
          <div key={x.h} className="border-b px-3 py-2 text-xs">
            <div className="text-[10px] text-muted-foreground">{x.m}m ago · Sim Newswire</div>
            <div className="mt-0.5">{x.h}</div>
          </div>
        ))}
      </div>
    </div>
  );
}
