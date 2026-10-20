import { useMemo, useState } from "react";
import {
  Area, AreaChart, Bar, BarChart, CartesianGrid, Cell, Legend, Pie, PieChart, PolarAngleAxis,
  RadialBar, RadialBarChart, ResponsiveContainer, Tooltip, XAxis, YAxis,
} from "recharts";
import { fmt } from "@/lib/market";
import { Card, TX_LABELS } from "./Portal";

type Tx = { kind: string; amount: number | string; created_at: string };
type Req = { kind: string; status: string; amount: number | string };

const tip = { background: "var(--popover)", border: "1px solid var(--border)", borderRadius: 10, fontSize: 12, boxShadow: "0 8px 24px -12px rgba(0,0,0,.25)" };
const axis = { fontSize: 11, fill: "var(--muted-foreground)" };
const k = (v: number) => (Math.abs(v) >= 1000 ? `$${(v / 1000).toFixed(0)}k` : `$${v.toFixed(0)}`);
const empty = (msg: string) => <div className="grid h-full place-items-center px-6 text-center text-sm text-muted-foreground">{msg}</div>;

const RANGES = [{ l: "7D", d: 7 }, { l: "30D", d: 30 }, { l: "90D", d: 90 }, { l: "All", d: 0 }] as const;

export function BalanceHistory({ tx }: { tx: Tx[] }) {
  const [range, setRange] = useState(0);
  const data = useMemo(() => {
    let bal = 0;
    const pts = [...tx].sort((a, b) => a.created_at.localeCompare(b.created_at)).filter((t) => t.kind !== "admin_bonus")
      .map((t) => { bal += Number(t.amount); return { t: new Date(t.created_at).getTime(), v: bal }; });
    const cutoff = range ? Date.now() - range * 864e5 : 0;
    const before = pts.filter((p) => p.t < cutoff).at(-1);
    const out = pts.filter((p) => p.t >= cutoff);
    if (before) out.unshift({ t: cutoff, v: before.v });
    if (out.length) out.push({ t: Date.now(), v: out.at(-1)!.v });
    return out.map((p) => ({ ...p, d: new Date(p.t).toLocaleDateString("en-GB", { day: "2-digit", month: "short" }) }));
  }, [tx, range]);
  const change = data.length > 1 ? data.at(-1)!.v - data[0]!.v : 0;
  return (
    <Card title="Balance history" className="xl:col-span-2" right={
      <div className="flex rounded-lg bg-muted p-0.5 text-xs">
        {RANGES.map((r) => <button key={r.l} onClick={() => setRange(r.d)} className={`rounded-md px-2.5 py-1 font-medium transition ${range === r.d ? "bg-card text-foreground shadow-sm" : "text-muted-foreground hover:text-foreground"}`}>{r.l}</button>)}
      </div>}>
      <div className="flex items-baseline gap-3 px-5 pt-4">
        <span className="num text-2xl font-semibold">{fmt(data.at(-1)?.v ?? 0)}</span>
        <span className={`num rounded-md px-1.5 py-0.5 text-xs font-medium ${change >= 0 ? "bg-gain-soft text-gain" : "bg-loss-soft text-loss"}`}>{change >= 0 ? "+" : ""}{fmt(change)}</span>
        <span className="text-xs text-muted-foreground">in period</span>
      </div>
      <div className="h-64 p-3">
        {data.length > 1 ? (
          <ResponsiveContainer>
            <AreaChart data={data} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
              <defs><linearGradient id="balg" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="var(--chart-1)" stopOpacity={0.35} /><stop offset="100%" stopColor="var(--chart-1)" stopOpacity={0} /></linearGradient></defs>
              <CartesianGrid vertical={false} stroke="var(--border)" strokeDasharray="3 3" />
              <XAxis dataKey="d" tick={axis} axisLine={false} tickLine={false} minTickGap={24} />
              <YAxis width={56} tick={axis} axisLine={false} tickLine={false} tickFormatter={k} domain={["auto", "auto"]} />
              <Tooltip formatter={(v: number) => [fmt(v), "Balance"]} contentStyle={tip} />
              <Area dataKey="v" type="stepAfter" stroke="var(--chart-1)" strokeWidth={2.5} fill="url(#balg)" animationDuration={900} />
            </AreaChart>
          </ResponsiveContainer>
        ) : empty("Your balance history will appear after your first account movement.")}
      </div>
    </Card>
  );
}

export function EquityDonut({ balance, bonus }: { balance: number; bonus: number }) {
  const data = [{ name: "Balance", v: Math.max(balance, 0), c: "var(--chart-1)" }, { name: "Bonus", v: Math.max(bonus, 0), c: "var(--chart-4)" }];
  const total = balance + bonus;
  return (
    <Card title="Equity composition">
      <div className="relative h-56">
        {total > 0 ? (
          <>
            <ResponsiveContainer>
              <PieChart>
                <Pie data={data} dataKey="v" innerRadius="68%" outerRadius="92%" paddingAngle={bonus > 0 ? 3 : 0} stroke="none" startAngle={90} endAngle={-270}>
                  {data.map((d) => <Cell key={d.name} fill={d.c} />)}
                </Pie>
                <Tooltip formatter={(v: number) => fmt(v)} contentStyle={tip} />
              </PieChart>
            </ResponsiveContainer>
            <div className="pointer-events-none absolute inset-0 grid place-items-center text-center">
              <div><div className="text-[11px] uppercase tracking-wider text-muted-foreground">Total</div><div className="num text-lg font-semibold">{fmt(total)}</div></div>
            </div>
          </>
        ) : empty("No funds yet.")}
      </div>
      <div className="grid grid-cols-2 gap-px border-t bg-border">
        {data.map((d) => (
          <div key={d.name} className="bg-card px-5 py-3">
            <div className="flex items-center gap-2 text-xs text-muted-foreground"><span className="h-2 w-2 rounded-full" style={{ background: d.c }} />{d.name}</div>
            <div className="num mt-1 text-sm font-semibold">{fmt(d.v)} <span className="font-normal text-muted-foreground">{total > 0 ? `${((d.v / total) * 100).toFixed(1)}%` : ""}</span></div>
          </div>
        ))}
      </div>
    </Card>
  );
}

export function CashFlow({ tx }: { tx: Tx[] }) {
  const data = useMemo(() => {
    const months = Array.from({ length: 6 }, (_, i) => { const d = new Date(); d.setDate(1); d.setMonth(d.getMonth() - (5 - i)); return { key: `${d.getFullYear()}-${d.getMonth()}`, m: d.toLocaleDateString("en-GB", { month: "short" }), in: 0, out: 0, net: 0 }; });
    for (const t of tx) {
      const d = new Date(t.created_at); const row = months.find((m) => m.key === `${d.getFullYear()}-${d.getMonth()}`);
      if (!row) continue; const a = Number(t.amount);
      if (a >= 0) row.in += a; else row.out += a; row.net += a;
    }
    return months;
  }, [tx]);
  const has = data.some((d) => d.in || d.out);
  return (
    <Card title="Monthly cash flow" className="xl:col-span-2" right={<span className="text-xs text-muted-foreground">Last 6 months</span>}>
      <div className="h-64 p-3">
        {has ? (
          <ResponsiveContainer>
            <BarChart data={data} stackOffset="sign" margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
              <CartesianGrid vertical={false} stroke="var(--border)" strokeDasharray="3 3" />
              <XAxis dataKey="m" tick={axis} axisLine={false} tickLine={false} />
              <YAxis width={56} tick={axis} axisLine={false} tickLine={false} tickFormatter={k} />
              <Tooltip formatter={(v: number, n) => [fmt(v), n === "in" ? "Credits" : n === "out" ? "Debits" : n]} contentStyle={tip} cursor={{ fill: "var(--muted)" }} />
              <Legend iconType="circle" iconSize={8} formatter={(v) => <span className="text-xs text-muted-foreground">{v === "in" ? "Credits" : "Debits"}</span>} />
              <Bar dataKey="in" stackId="a" fill="var(--gain)" radius={[6, 6, 0, 0]} maxBarSize={36} />
              <Bar dataKey="out" stackId="a" fill="var(--loss)" radius={[6, 6, 0, 0]} maxBarSize={36} />
            </BarChart>
          </ResponsiveContainer>
        ) : empty("Credits and debits will be charted here month by month.")}
      </div>
    </Card>
  );
}

export function ActivityMix({ tx }: { tx: Tx[] }) {
  const data = useMemo(() => {
    const m = new Map<string, number>();
    for (const t of tx) { const l = TX_LABELS[t.kind] ?? t.kind; m.set(l, (m.get(l) ?? 0) + 1); }
    return [...m.entries()].map(([name, n]) => ({ name, n })).sort((a, b) => b.n - a.n).slice(0, 6);
  }, [tx]);
  const colors = ["var(--chart-1)", "var(--chart-2)", "var(--chart-4)", "var(--chart-5)", "var(--chart-3)", "var(--muted-foreground)"];
  return (
    <Card title="Activity by type">
      <div className="h-64 p-3">
        {data.length ? (
          <ResponsiveContainer>
            <BarChart data={data} layout="vertical" margin={{ top: 4, right: 16, left: 8, bottom: 4 }}>
              <XAxis type="number" hide allowDecimals={false} />
              <YAxis type="category" dataKey="name" width={118} tick={axis} axisLine={false} tickLine={false} />
              <Tooltip formatter={(v: number) => [v, "Transactions"]} contentStyle={tip} cursor={{ fill: "var(--muted)" }} />
              <Bar dataKey="n" radius={[0, 6, 6, 0]} barSize={16}>{data.map((_, i) => <Cell key={i} fill={colors[i]} />)}</Bar>
            </BarChart>
          </ResponsiveContainer>
        ) : empty("No activity yet.")}
      </div>
    </Card>
  );
}

export function FundingGauge({ reqs }: { reqs: Req[] }) {
  const c: Record<string, number> = { approved: 0, pending: 0, declined: 0 };
  for (const r of reqs) c[r.status] = (c[r.status] ?? 0) + 1;
  const total = reqs.length;
  const rate = total ? Math.round(((c["approved"] ?? 0) / total) * 100) : 0;
  const sum = (kind: string) => reqs.filter((r) => r.kind === kind && r.status === "approved").reduce((s, r) => s + Number(r.amount), 0);
  return (
    <Card title="Funding requests">
      <div className="relative h-44">
        <ResponsiveContainer>
          <RadialBarChart innerRadius="72%" outerRadius="100%" data={[{ v: rate }]} startAngle={210} endAngle={-30}>
            <PolarAngleAxis type="number" domain={[0, 100]} tick={false} />
            <RadialBar dataKey="v" cornerRadius={10} fill="var(--chart-2)" background={{ fill: "var(--muted)" }} />
          </RadialBarChart>
        </ResponsiveContainer>
        <div className="pointer-events-none absolute inset-0 grid place-items-center text-center">
          <div><div className="num text-2xl font-semibold">{total ? `${rate}%` : "—"}</div><div className="text-[11px] text-muted-foreground">approved</div></div>
        </div>
      </div>
      <div className="grid grid-cols-3 border-t text-center text-xs">
        {(["pending", "approved", "declined"] as const).map((s) => (
          <div key={s} className="px-2 py-3"><div className="num text-base font-semibold">{c[s]}</div><div className="capitalize text-muted-foreground">{s}</div></div>
        ))}
      </div>
      <div className="space-y-1.5 border-t px-5 py-3 text-xs">
        <div className="flex justify-between"><span className="text-muted-foreground">Approved top-ups</span><span className="num font-medium text-gain">{fmt(sum("topup"))}</span></div>
        <div className="flex justify-between"><span className="text-muted-foreground">Approved withdrawals</span><span className="num font-medium text-loss">{fmt(sum("withdrawal"))}</span></div>
      </div>
    </Card>
  );
}

export function Sparkline({ values, color = "var(--chart-1)" }: { values: number[]; color?: string }) {
  if (values.length < 2) return null;
  const data = values.map((v, i) => ({ i, v }));
  const id = `sp${color.replace(/[^a-z0-9]/gi, "")}`;
  return (
    <div className="h-10">
      <ResponsiveContainer>
        <AreaChart data={data} margin={{ top: 2, right: 0, left: 0, bottom: 0 }}>
          <defs><linearGradient id={id} x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor={color} stopOpacity={0.4} /><stop offset="100%" stopColor={color} stopOpacity={0} /></linearGradient></defs>
          <YAxis hide domain={["dataMin", "dataMax"]} />
          <Area dataKey="v" type="monotone" stroke={color} strokeWidth={1.75} fill={`url(#${id})`} isAnimationActive={false} />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}
