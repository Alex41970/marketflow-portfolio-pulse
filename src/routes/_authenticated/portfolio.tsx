import { createFileRoute } from "@tanstack/react-router";
import { Cell, Pie, PieChart, ResponsiveContainer, Tooltip, Area, AreaChart, XAxis, YAxis } from "recharts";
import { useAccount, useHoldings, useTransactions } from "@/hooks/use-account";
import { PanelHead } from "@/components/ws/Panels";
import { useQuotes, quoteOf, fmt, fmtP, dpOf, tickerOf } from "@/lib/market";

export const Route = createFileRoute("/_authenticated/portfolio")({
  head: () => ({ meta: [{ title: "Workstation — Portfolio" }, { name: "description", content: "Virtual portfolio analytics." }] }),
  component: Portfolio,
});

const COLORS = ["var(--chart-1)", "var(--chart-2)", "var(--chart-4)", "var(--chart-5)", "var(--chart-3)"];

function Portfolio() {
  const { data = [] } = useHoldings();
  const { data: acct } = useAccount();
  const { data: tx = [] } = useTransactions();
  const quotes = useQuotes();
  const cash = Number(acct?.profile?.virtual_balance ?? 0);
  const rows = data.map((h) => {
    const p = quoteOf(quotes, h.symbol).price;
    return { ...h, last: p, value: p * Number(h.quantity), pnl: (p - Number(h.avg_cost)) * Number(h.quantity) };
  });
  const mv = rows.reduce((s, r) => s + r.value, 0);
  const byClass = Object.entries(rows.reduce<Record<string, number>>((a, r) => { const c = tickerOf(r.symbol).cls; a[c] = (a[c] ?? 0) + r.value; return a; }, { Cash: cash }))
    .map(([name, value]) => ({ name, value }));
  // cash balance curve from history
  let bal = 0;
  const curve = [...tx].reverse().map((t, i) => { bal += Number(t.amount); return { i, v: bal }; });

  return (
    <div className="grid gap-2 lg:grid-cols-3">
      <div className="ws-panel">
        <PanelHead title="Allocation" />
        <div className="h-64 p-2">
          <ResponsiveContainer>
            <PieChart>
              <Pie data={byClass} dataKey="value" nameKey="name" innerRadius={55} outerRadius={90} stroke="none">
                {byClass.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
              </Pie>
              <Tooltip formatter={(v: number) => fmt(v)} />
            </PieChart>
          </ResponsiveContainer>
        </div>
        <div className="space-y-1 px-3 pb-3 text-xs">
          {byClass.map((b, i) => <div key={b.name} className="flex justify-between"><span className="flex items-center gap-2"><span className="h-2 w-2 rounded-full" style={{ background: COLORS[i % COLORS.length] }} />{b.name}</span><span className="num">{(((b.value) / (mv + cash || 1)) * 100).toFixed(1)}%</span></div>)}
        </div>
      </div>
      <div className="ws-panel lg:col-span-2">
        <PanelHead title="Cash balance history" />
        <div className="h-72 p-2">
          <ResponsiveContainer>
            <AreaChart data={curve}>
              <XAxis dataKey="i" hide />
              <YAxis width={70} tick={{ fontSize: 10, fill: "var(--muted-foreground)" }} tickFormatter={(v) => `$${(v / 1000).toFixed(0)}k`} domain={["auto", "auto"]} />
              <Tooltip formatter={(v: number) => fmt(v)} labelFormatter={() => ""} />
              <Area dataKey="v" stroke="var(--primary)" fill="var(--primary)" fillOpacity={0.15} />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>
      <div className="ws-panel overflow-x-auto lg:col-span-3">
        <PanelHead title={`Holdings · Market value ${fmt(mv)}`} />
        <table className="w-full text-xs">
          <thead className="text-left text-[10px] uppercase text-muted-foreground">
            <tr><th className="px-3 py-2">Instrument</th><th>Class</th><th>Qty</th><th>Avg cost</th><th>Last</th><th>Value</th><th>Weight</th><th className="pr-3">P&L</th></tr>
          </thead>
          <tbody className="num">
            {rows.map((r) => (
              <tr key={r.id} className="border-t">
                <td className="px-3 py-2 font-sans"><span className="font-semibold">{r.symbol}</span> <span className="text-muted-foreground">{tickerOf(r.symbol).name}</span></td>
                <td className="font-sans">{tickerOf(r.symbol).cls}</td>
                <td>{Number(r.quantity)}</td><td>{fmtP(Number(r.avg_cost), dpOf(r.symbol))}</td><td>{fmtP(r.last, dpOf(r.symbol))}</td>
                <td>{fmt(r.value)}</td><td>{((r.value / (mv || 1)) * 100).toFixed(1)}%</td>
                <td className={`pr-3 ${r.pnl >= 0 ? "text-gain" : "text-loss"}`}>{fmt(r.pnl)}</td>
              </tr>
            ))}
            {rows.length === 0 && <tr><td colSpan={8} className="py-8 text-center font-sans text-muted-foreground">No holdings yet. Place a trade from the Trade screen.</td></tr>}
          </tbody>
        </table>
      </div>
    </div>
  );
}
