import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { Download } from "lucide-react";
import { useTransactions } from "@/hooks/use-account";
import { Card, PageTitle, TxTable } from "@/components/portal/Portal";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export const Route = createFileRoute("/_authenticated/history")({
  head: () => ({ meta: [{ title: "Client portal — Transactions" }, { name: "description", content: "Full transaction history with filters and CSV export." }] }),
  component: HistoryPage,
});

const FILTERS = { all: "All", credits: "Credits", debits: "Debits", bonus: "Bonus" } as const;
type F = keyof typeof FILTERS;

function HistoryPage() {
  const { data = [] } = useTransactions();
  const [f, setF] = useState<F>("all");
  const [s, setS] = useState("");
  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");
  const rows = data.filter((t) => {
    const a = Number(t.amount);
    const okType = f === "all" || (f === "bonus" ? t.kind === "admin_bonus" : t.kind !== "admin_bonus" && (f === "credits" ? a > 0 : a < 0));
    const d = t.created_at.slice(0, 10);
    return okType && (!from || d >= from) && (!to || d <= to) && (!s || (t.note ?? "").toLowerCase().includes(s.toLowerCase()));
  });

  function exportCsv() {
    const q = (v: unknown) => `"${String(v ?? "").replace(/"/g, '""')}"`;
    const lines = [["date", "type", "reference", "amount"], ...rows.map((t) => [t.created_at, t.kind, t.note ?? "", t.amount])];
    const blob = new Blob([lines.map((l) => l.map(q).join(",")).join("\n")], { type: "text/csv" });
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = "transactions.csv";
    a.click();
  }

  return (
    <div>
      <PageTitle title="Transactions" sub="Every movement on your account." right={<Button variant="outline" onClick={exportCsv}><Download className="mr-2 h-4 w-4" />Download CSV</Button>} />
      <Card>
        <div className="flex flex-wrap items-center gap-3 border-b p-4">
          <div className="flex rounded-lg bg-muted p-1">
            {(Object.keys(FILTERS) as F[]).map((x) => <button key={x} onClick={() => setF(x)} className={`rounded-md px-3 py-1.5 text-sm ${f === x ? "bg-card font-medium shadow-sm" : "text-muted-foreground hover:text-foreground"}`}>{FILTERS[x]}</button>)}
          </div>
          <Input type="date" value={from} onChange={(e) => setFrom(e.target.value)} className="w-40" aria-label="From date" />
          <Input type="date" value={to} onChange={(e) => setTo(e.target.value)} className="w-40" aria-label="To date" />
          <Input value={s} onChange={(e) => setS(e.target.value)} placeholder="Search reference" className="ml-auto w-56" />
        </div>
        <TxTable rows={rows} />
      </Card>
    </div>
  );
}
