import { createFileRoute } from "@tanstack/react-router";
import { Cell, Pie, PieChart, ResponsiveContainer, Tooltip } from "recharts";
import { useAccount, useTransactions } from "@/hooks/use-account";
import { Card, PageTitle } from "@/components/portal/Portal";
import { fmt } from "@/lib/market";

export const Route = createFileRoute("/_authenticated/portfolio")({
  head: () => ({ meta: [{ title: "Client portal — Portfolio" }, { name: "description", content: "Balance breakdown and account statement summary." }] }),
  component: Portfolio,
});

const COLORS = ["var(--chart-1)", "var(--chart-2)"];

function Portfolio() {
  const { data } = useAccount();
  const { data: tx = [] } = useTransactions();
  const bal = Number(data?.profile?.virtual_balance ?? 0);
  const bonus = Number(data?.profile?.bonus ?? 0);
  const total = bal + bonus;
  const parts = [{ name: "Account balance", value: bal }, { name: "Bonus", value: bonus }];
  const sum = (f: (k: string, a: number) => boolean) => tx.filter((t) => f(t.kind, Number(t.amount))).reduce((s, t) => s + Number(t.amount), 0);
  const credits = sum((k, a) => k !== "admin_bonus" && a > 0);
  const debits = sum((k, a) => k !== "admin_bonus" && a < 0);
  const bonusIn = sum((k, a) => k === "admin_bonus" && a > 0);
  const bonusOut = sum((k, a) => k === "admin_bonus" && a < 0);
  const row = (l: string, v: number, strong?: boolean) => (
    <div key={l} className={`flex justify-between px-5 py-3 text-sm ${strong ? "bg-muted font-semibold" : "border-t"}`}><span className={strong ? "" : "text-muted-foreground"}>{l}</span><span className="num">{fmt(v)}</span></div>
  );

  return (
    <div>
      <PageTitle title="Portfolio" sub="How your account equity is made up. Trading positions are held in MetaTrader 4 / 5." />
      <div className="grid gap-6 lg:grid-cols-3">
        <Card title="Equity breakdown">
          <div className="h-56 p-4">
            <ResponsiveContainer>
              <PieChart>
                <Pie data={parts} dataKey="value" nameKey="name" innerRadius={60} outerRadius={90} stroke="none">{parts.map((_, i) => <Cell key={i} fill={COLORS[i]} />)}</Pie>
                <Tooltip formatter={(v: number) => fmt(v)} />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="space-y-2 px-5 pb-5 text-sm">
            {parts.map((p, i) => <div key={p.name} className="flex justify-between"><span className="flex items-center gap-2"><span className="h-2.5 w-2.5 rounded-full" style={{ background: COLORS[i] }} />{p.name}</span><span className="num">{((p.value / (total || 1)) * 100).toFixed(1)}%</span></div>)}
          </div>
        </Card>
        <Card title="Statement summary" className="lg:col-span-2">
          {row("Total credits", credits)}
          {row("Total debits", debits)}
          {row("Bonus added", bonusIn)}
          {row("Bonus removed", bonusOut)}
          {row("Account balance", bal)}
          {row("Bonus balance", bonus)}
          {row("Total equity", total, true)}
        </Card>
      </div>
    </div>
  );
}
