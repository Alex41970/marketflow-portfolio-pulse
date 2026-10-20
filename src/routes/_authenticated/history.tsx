import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { Download } from "lucide-react";
import { useTransactions } from "@/hooks/use-account";
import { PanelHead } from "@/components/ws/Panels";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { fmt, fmtP, dpOf } from "@/lib/market";

export const Route = createFileRoute("/_authenticated/history")({
  head: () => ({ meta: [{ title: "Workstation — Activity" }, { name: "description", content: "Virtual transaction history." }] }),
  component: HistoryPage,
});

const LABELS: Record<string, string> = { deposit: "Opening balance", buy: "Buy", sell: "Sell", admin_balance: "Credit adjustment", admin_bonus: "Bonus adjustment" };
const FILTERS = ["all", "buy", "sell", "adjustments"] as const;

function HistoryPage() {
  const { data = [] } = useTransactions();
  const [f, setF] = useState<(typeof FILTERS)[number]>("all");
  const [s, setS] = useState("");
  const rows = data.filter((t) =>
    (f === "all" || (f === "adjustments" ? t.kind.startsWith("admin") || t.kind === "deposit" : t.kind === f)) &&
    (!s || (t.symbol ?? "").toLowerCase().includes(s.toLowerCase())));

  function exportCsv() {
    const lines = [["date", "type", "symbol", "quantity", "price", "amount", "note"], ...rows.map((t) => [t.created_at, t.kind, t.symbol ?? "", t.quantity ?? "", t.price ?? "", t.amount, (t.note ?? "").replace(/,/g, " ")])];
    const blob = new Blob([lines.map((l) => l.join(",")).join("\n")], { type: "text/csv" });
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = "activity-simulated.csv";
    a.click();
  }

  return (
    <div className="ws-panel overflow-x-auto">
      <PanelHead title="Account activity" right={<Button size="sm" variant="outline" className="h-6 text-xs" onClick={exportCsv}><Download className="mr-1 h-3 w-3" />CSV</Button>} />
      <div className="flex flex-wrap items-center gap-2 border-b p-2">
        {FILTERS.map((x) => <button key={x} onClick={() => setF(x)} className={`rounded-sm px-2.5 py-1 text-xs capitalize ${f === x ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:bg-muted"}`}>{x}</button>)}
        <Input value={s} onChange={(e) => setS(e.target.value)} placeholder="Filter symbol" className="ml-auto h-7 w-40 text-xs" />
      </div>
      <table className="w-full text-xs">
        <thead className="text-left text-[10px] uppercase text-muted-foreground">
          <tr><th className="px-3 py-2">Date</th><th>Type</th><th>Details</th><th className="pr-3 text-right">Amount</th></tr>
        </thead>
        <tbody>
          {rows.map((t) => (
            <tr key={t.id} className="border-t">
              <td className="num px-3 py-2 text-muted-foreground">{new Date(t.created_at).toLocaleString("en-GB")}</td>
              <td>{LABELS[t.kind] ?? t.kind}</td>
              <td className="text-muted-foreground">{t.symbol ? `${Number(t.quantity)} ${t.symbol} @ ${fmtP(Number(t.price), dpOf(t.symbol))}` : t.note}</td>
              <td className={`num pr-3 text-right ${Number(t.amount) >= 0 ? "text-gain" : "text-loss"}`}>{fmt(Number(t.amount))}</td>
            </tr>
          ))}
          {rows.length === 0 && <tr><td colSpan={4} className="py-8 text-center text-muted-foreground">No activity</td></tr>}
        </tbody>
      </table>
    </div>
  );
}
