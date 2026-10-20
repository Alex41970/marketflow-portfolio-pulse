import { createFileRoute } from "@tanstack/react-router";
import { useTransactions } from "@/hooks/use-account";
import { fmt } from "@/lib/market";

export const Route = createFileRoute("/_authenticated/history")({
  head: () => ({ meta: [{ title: "History — Ledgerline Paper Trading" }, { name: "description", content: "Your virtual transaction history." }] }),
  component: HistoryPage,
});

const LABELS: Record<string, string> = {
  deposit: "Starting balance", buy: "Buy", sell: "Sell", admin_balance: "Credit adjustment", admin_bonus: "Bonus adjustment",
};

function HistoryPage() {
  const { data = [] } = useTransactions();
  return (
    <div className="panel overflow-x-auto">
      <div className="border-b px-4 py-3 font-semibold">Transaction history</div>
      <table className="w-full text-sm">
        <thead className="text-left text-xs text-muted-foreground">
          <tr><th className="px-4 py-2">Date</th><th>Type</th><th>Details</th><th className="pr-4 text-right">Amount</th></tr>
        </thead>
        <tbody>
          {data.map((t) => (
            <tr key={t.id} className="border-t">
              <td className="num px-4 py-2.5 text-muted-foreground">{new Date(t.created_at).toLocaleString()}</td>
              <td>{LABELS[t.kind] ?? t.kind}</td>
              <td className="text-muted-foreground">{t.symbol ? `${Number(t.quantity)} ${t.symbol} @ ${Number(t.price).toFixed(2)}` : t.note}</td>
              <td className={`num pr-4 text-right ${Number(t.amount) >= 0 ? "text-gain" : "text-loss"}`}>{fmt(Number(t.amount))}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
