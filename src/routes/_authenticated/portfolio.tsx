import { createFileRoute } from "@tanstack/react-router";
import { ArrowDownRight, ArrowUpRight, Gift, Landmark } from "lucide-react";
import { CashFlow, EquityDonut, EquityStack } from "@/components/portal/OverviewCharts";
import { useAccount, useTransactions } from "@/hooks/use-account";
import { Card, PageTitle, StatCard } from "@/components/portal/Portal";
import { fmt } from "@/lib/market";

export const Route = createFileRoute("/_authenticated/portfolio")({
  head: () => ({ meta: [{ title: "Client portal — Portfolio — Ledgerline Markets" }, { name: "description", content: "Balance breakdown and account statement summary." }, { property: "og:title", content: "Client portal — Portfolio — Ledgerline Markets" }, { property: "og:description", content: "Balance breakdown and account statement summary." }, { property: "og:type", content: "website" }, { name: "twitter:card", content: "summary_large_image" }] }),
  component: Portfolio,
});


function Portfolio() {
  const { data } = useAccount();
  const { data: tx = [] } = useTransactions();
  const bal = Number(data?.profile?.virtual_balance ?? 0);
  const bonus = Number(data?.profile?.bonus ?? 0);
  const total = bal + bonus;
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
      <div className="mb-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard accent icon={Landmark} label="Total equity" value={fmt(total)} hint="Balance + bonus" />
        <StatCard icon={ArrowUpRight} label="Total credits" value={fmt(credits)} hint="All money in" />
        <StatCard icon={ArrowDownRight} label="Total debits" value={fmt(Math.abs(debits))} hint="All money out" />
        <StatCard icon={Gift} label="Net bonus" value={fmt(bonusIn + bonusOut)} hint={`${fmt(bonusIn)} added · ${fmt(Math.abs(bonusOut))} removed`} />
      </div>
      <div className="mb-6 grid gap-6 lg:grid-cols-3">
        <EquityStack tx={tx} />
        <EquityDonut balance={bal} bonus={bonus} />
      </div>
      <div className="grid gap-6 lg:grid-cols-3">
        <CashFlow tx={tx} />
        <Card title="Statement summary">
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
