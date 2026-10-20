import { createFileRoute, Link } from "@tanstack/react-router";
import { Area, AreaChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { Apple, ArrowRight, Clock, Gift, Landmark, Monitor, Smartphone, Wallet } from "lucide-react";
import { useAccount, useTransactions } from "@/hooks/use-account";
import { Card, PageTitle, StatCard, TX_LABELS, accountNo, balanceCurve } from "@/components/portal/Portal";
import { Button } from "@/components/ui/button";
import { fmt } from "@/lib/market";

export const Route = createFileRoute("/_authenticated/dashboard")({
  head: () => ({ meta: [{ title: "Client portal — Overview" }, { name: "description", content: "Account overview: balance, bonus and recent activity." }] }),
  component: Overview,
});

const DOWNLOADS = [
  { label: "MT5 for Windows", href: "https://www.metatrader5.com/en/download", icon: Monitor },
  { label: "MT5 for Mac", href: "https://www.metatrader5.com/en/download", icon: Apple },
  { label: "MT5 for iOS / Android", href: "https://www.metatrader5.com/en/mobile-trading", icon: Smartphone },
  { label: "MT4 (all platforms)", href: "https://www.metatrader4.com/en/download", icon: Monitor },
];

function Overview() {
  const { data } = useAccount();
  const { data: tx = [] } = useTransactions();
  const p = data?.profile;
  const bal = Number(p?.virtual_balance ?? 0);
  const bonus = Number(p?.bonus ?? 0);
  const curve = balanceCurve(tx);
  const last = tx[0];
  const hour = new Date().getHours();
  const greet = hour < 12 ? "Good morning" : hour < 18 ? "Good afternoon" : "Good evening";

  return (
    <div>
      <PageTitle title={`${greet}${p?.username ? `, ${p.username}` : ""}`} sub={`Account ${accountNo(data?.user.id)} · USD · Demo funds`} />
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard accent icon={Landmark} label="Total equity" value={fmt(bal + bonus)} hint="Balance + bonus" />
        <StatCard icon={Wallet} label="Account balance" value={fmt(bal)} hint="Available funds" />
        <StatCard icon={Gift} label="Bonus" value={fmt(bonus)} hint={bonus > 0 ? "Active bonus" : "No active bonus"} />
        <StatCard icon={Clock} label="Last activity" value={last ? new Date(last.created_at).toLocaleDateString("en-GB", { day: "2-digit", month: "short" }) : "—"} hint={last ? TX_LABELS[last.kind] ?? last.kind : "No activity yet"} />
      </div>

      <div className="mt-6 grid gap-6 xl:grid-cols-3">
        <Card title="Balance history" className="xl:col-span-2">
          <div className="h-72 p-4">
            {curve.length > 1 ? (
              <ResponsiveContainer>
                <AreaChart data={curve}>
                  <defs><linearGradient id="bal" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="var(--primary)" stopOpacity={0.25} /><stop offset="100%" stopColor="var(--primary)" stopOpacity={0} /></linearGradient></defs>
                  <XAxis dataKey="d" tick={{ fontSize: 11, fill: "var(--muted-foreground)" }} axisLine={false} tickLine={false} />
                  <YAxis width={64} tick={{ fontSize: 11, fill: "var(--muted-foreground)" }} axisLine={false} tickLine={false} tickFormatter={(v) => `$${(v / 1000).toFixed(0)}k`} domain={["auto", "auto"]} />
                  <Tooltip formatter={(v: number) => fmt(v)} contentStyle={{ background: "var(--popover)", border: "1px solid var(--border)", borderRadius: 8 }} />
                  <Area dataKey="v" type="monotone" stroke="var(--primary)" strokeWidth={2} fill="url(#bal)" />
                </AreaChart>
              </ResponsiveContainer>
            ) : (
              <div className="grid h-full place-items-center text-sm text-muted-foreground">Your balance history will appear here after your first account movement.</div>
            )}
          </div>
        </Card>

        <Card title="Trading platforms">
          <div className="space-y-4 p-5">
            <p className="text-sm text-muted-foreground">All trading takes place in <span className="font-medium text-foreground">MetaTrader 4</span> or <span className="font-medium text-foreground">MetaTrader 5</span>. Log in with your trading credentials to place and manage orders.</p>
            <div className="rounded-lg bg-muted p-3 text-xs">
              <div className="flex justify-between"><span className="text-muted-foreground">Server (illustrative)</span><span className="num">Ledgerline-Demo</span></div>
              <div className="mt-1 flex justify-between"><span className="text-muted-foreground">Login</span><span className="num">{accountNo(data?.user.id)}</span></div>
            </div>
            <div className="grid gap-2">
              {DOWNLOADS.map(({ label, href, icon: I }) => (
                <Button key={label} asChild variant="outline" className="justify-start"><a href={href} target="_blank" rel="noreferrer"><I className="mr-2 h-4 w-4" />{label}</a></Button>
              ))}
            </div>
          </div>
        </Card>
      </div>

      <Card title="Recent transactions" className="mt-6" right={<Link to="/history" className="inline-flex items-center gap-1 text-sm text-primary hover:underline">View all <ArrowRight className="h-3.5 w-3.5" /></Link>}>
        <TxTable rows={tx.slice(0, 5)} />
      </Card>
    </div>
  );
}

export function TxTable({ rows }: { rows: { id: string; created_at: string; kind: string; note: string | null; amount: number | string }[] }) {
  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead className="text-left text-xs text-muted-foreground"><tr><th className="px-5 py-3 font-medium">Date</th><th className="font-medium">Type</th><th className="font-medium">Reference</th><th className="px-5 text-right font-medium">Amount</th></tr></thead>
        <tbody>
          {rows.map((t) => (
            <tr key={t.id} className="border-t">
              <td className="num px-5 py-3 text-muted-foreground">{new Date(t.created_at).toLocaleString("en-GB", { dateStyle: "medium", timeStyle: "short" })}</td>
              <td>{TX_LABELS[t.kind] ?? t.kind}</td>
              <td className="max-w-xs truncate text-muted-foreground">{t.note ?? "—"}</td>
              <td className={`num px-5 text-right font-medium ${Number(t.amount) >= 0 ? "text-gain" : "text-loss"}`}>{Number(t.amount) >= 0 ? "+" : ""}{fmt(Number(t.amount))}</td>
            </tr>
          ))}
          {rows.length === 0 && <tr><td colSpan={4} className="py-10 text-center text-muted-foreground">No transactions yet.</td></tr>}
        </tbody>
      </table>
    </div>
  );
}
