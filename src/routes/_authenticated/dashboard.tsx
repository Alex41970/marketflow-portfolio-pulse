import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { ActivityMix, BalanceHistory, CashFlow, EquityDonut, FundingGauge, Sparkline } from "@/components/portal/OverviewCharts";
import { Apple, ArrowRight, Clock, Gift, Landmark, Monitor, Smartphone, Wallet } from "lucide-react";
import { useAccount, useTransactions } from "@/hooks/use-account";
import { Card, PageTitle, StatCard, TX_LABELS, TxTable, accountNo, balanceCurve } from "@/components/portal/Portal";
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
  const spark = curve.slice(-20).map((c) => c.v);
  const { data: reqs = [] } = useQuery({
    queryKey: ["my-funding-requests", data?.user.id],
    enabled: !!data?.user.id,
    queryFn: async () => (await supabase.from("funding_requests").select("kind,status,amount").eq("user_id", data!.user.id)).data ?? [],
  });
  const hour = new Date().getHours();
  const greet = hour < 12 ? "Good morning" : hour < 18 ? "Good afternoon" : "Good evening";

  return (
    <div>
      <PageTitle title={`${greet}${p?.username ? `, ${p.username}` : ""}`} sub={`Account ${accountNo(data?.user.id)} · USD`} />
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard accent icon={Landmark} label="Total equity" value={fmt(bal + bonus)} hint="Balance + bonus"><Sparkline values={spark} color="var(--navy-muted)" /></StatCard>
        <StatCard icon={Wallet} label="Account balance" value={fmt(bal)} hint="Available funds"><Sparkline values={spark} /></StatCard>
        <StatCard icon={Gift} label="Bonus" value={fmt(bonus)} hint={bonus > 0 ? "Active bonus" : "No active bonus"} />
        <StatCard icon={Clock} label="Last activity" value={last ? new Date(last.created_at).toLocaleDateString("en-GB", { day: "2-digit", month: "short" }) : "—"} hint={last ? TX_LABELS[last.kind] ?? last.kind : "No activity yet"} />
      </div>

      <div className="mt-6 grid gap-6 xl:grid-cols-3">
        <BalanceHistory tx={tx} />
        <EquityDonut balance={bal} bonus={bonus} />
      </div>

      <div className="mt-6 grid gap-6 xl:grid-cols-3">
        <CashFlow tx={tx} />
        <ActivityMix tx={tx} />
      </div>

      <div className="mt-6 grid gap-6 xl:grid-cols-3">
        <FundingGauge reqs={reqs} />
        <Card title="Trading platforms" className="xl:col-span-2">
          <div className="space-y-4 p-5">
            <p className="text-sm text-muted-foreground">All trading takes place in <span className="font-medium text-foreground">MetaTrader 4</span> or <span className="font-medium text-foreground">MetaTrader 5</span>. Log in with your trading credentials to place and manage orders.</p>
            <div className="rounded-lg bg-muted p-3 text-xs">
              <div className="flex justify-between"><span className="text-muted-foreground">Server</span><span className="num">Ledgerline-Live</span></div>
              <div className="mt-1 flex justify-between"><span className="text-muted-foreground">Login</span><span className="num">{accountNo(data?.user.id)}</span></div>
            </div>
            <div className="grid gap-2 sm:grid-cols-2">
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

