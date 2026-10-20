import { useState } from "react";
import { Link, useNavigate } from "@tanstack/react-router";
import { Sparkline, SimTag } from "@/components/Brand";
import { CLASSES, TICKERS, useQuotes, quoteOf, fmtP, pct, signed, dpOf, spark, type AssetClass } from "@/lib/market";

export const CLASS_ROUTE = {
  Stocks: "/markets/stocks",
  ETFs: "/markets/etfs",
  FX: "/markets/forex",
  Crypto: "/markets/crypto",
} as const satisfies Record<AssetClass, string>;

const tabCls = (on: boolean) => `border-b-2 px-4 py-3 text-sm font-medium ${on ? "border-primary text-primary" : "border-transparent text-muted-foreground hover:text-foreground"}`;

export function MarketsTable({ limit, fixedClass, exclude }: { limit?: number; fixedClass?: AssetClass; exclude?: string }) {
  const [picked, setCls] = useState<AssetClass>("Stocks");
  const cls = fixedClass ?? picked;
  const q = useQuotes();
  const navigate = useNavigate();
  const rows = TICKERS.filter((t) => t.cls === cls && t.symbol !== exclude).slice(0, limit);
  return (
    <div className="panel overflow-hidden">
      <div className="flex items-center justify-between border-b px-4">
        <div className="flex overflow-x-auto">
          {CLASSES.map((c) =>
            fixedClass ? (
              <Link key={c} to={CLASS_ROUTE[c]} className={tabCls(cls === c)}>{c}</Link>
            ) : (
              <button key={c} onClick={() => setCls(c)} className={tabCls(cls === c)}>{c}</button>
            ),
          )}
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
                <tr key={t.symbol} onClick={() => navigate({ to: "/markets/quote/$symbol", params: { symbol: t.symbol } })} className="cursor-pointer border-t transition-colors hover:bg-muted/60">
                  <td className="px-4 py-3 font-sans">
                    <Link to="/markets/quote/$symbol" params={{ symbol: t.symbol }} className="font-semibold text-primary hover:underline" onClick={(e) => e.stopPropagation()}>{t.symbol}</Link>
                    <div className="text-xs text-muted-foreground">{t.name}</div>
                  </td>
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
