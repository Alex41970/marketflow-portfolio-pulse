import { useState } from "react";
import { Sparkline, SimTag } from "@/components/Brand";
import { CLASSES, TICKERS, useQuotes, quoteOf, fmtP, pct, signed, dpOf, spark, type AssetClass } from "@/lib/market";

export function MarketsTable({ limit }: { limit?: number }) {
  const [cls, setCls] = useState<AssetClass>("Stocks");
  const q = useQuotes();
  const rows = TICKERS.filter((t) => t.cls === cls).slice(0, limit);
  return (
    <div className="panel overflow-hidden">
      <div className="flex items-center justify-between border-b px-4">
        <div className="flex">
          {CLASSES.map((c) => (
            <button key={c} onClick={() => setCls(c)} className={`border-b-2 px-4 py-3 text-sm font-medium ${cls === c ? "border-primary text-primary" : "border-transparent text-muted-foreground hover:text-foreground"}`}>{c}</button>
          ))}
        </div>
        <SimTag />
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="text-left text-xs text-muted-foreground">
            <tr><th className="px-4 py-2 font-medium">Instrument</th><th className="text-right font-medium">Last</th><th className="text-right font-medium">Change</th><th className="text-right font-medium">Change %</th><th className="hidden text-right font-medium md:table-cell">High</th><th className="hidden text-right font-medium md:table-cell">Low</th><th className="hidden px-4 text-right font-medium sm:table-cell">Intraday</th></tr>
          </thead>
          <tbody className="num">
            {rows.map((t) => {
              const x = quoteOf(q, t.symbol);
              const d = x.price - x.open, dp = dpOf(t.symbol);
              return (
                <tr key={t.symbol} className="border-t">
                  <td className="px-4 py-3 font-sans"><div className="font-semibold">{t.symbol}</div><div className="text-xs text-muted-foreground">{t.name}</div></td>
                  <td key={x.seq} className={`text-right ${x.tick > 0 ? "flash-up" : x.tick < 0 ? "flash-down" : ""}`}>{fmtP(x.price, dp)}</td>
                  <td className={`text-right ${d >= 0 ? "text-gain" : "text-loss"}`}>{signed(d, dp)}</td>
                  <td className="text-right"><span className={`rounded-sm px-1.5 py-0.5 ${d >= 0 ? "bg-gain-soft text-gain" : "bg-loss-soft text-loss"}`}>{signed(pct(x.price, x.open))}%</span></td>
                  <td className="hidden text-right md:table-cell">{fmtP(x.high, dp)}</td>
                  <td className="hidden text-right md:table-cell">{fmtP(x.low, dp)}</td>
                  <td className="hidden px-4 sm:table-cell"><div className="flex justify-end"><Sparkline data={spark(t.symbol)} up={d >= 0} /></div></td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
