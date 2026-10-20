import { fmt } from "@/lib/market";
import type { ReactNode } from "react";
import type { LucideIcon } from "lucide-react";

export function PageTitle({ title, sub, right }: { title: string; sub?: string; right?: ReactNode }) {
  return (
    <div className="mb-6 flex flex-wrap items-end justify-between gap-4">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">{title}</h1>
        {sub && <p className="mt-1 text-sm text-muted-foreground">{sub}</p>}
      </div>
      {right}
    </div>
  );
}

export function Card({ title, right, children, className = "" }: { title?: string; right?: ReactNode; children: ReactNode; className?: string }) {
  return (
    <section className={`rounded-xl border bg-card shadow-sm ${className}`}>
      {title && (
        <div className="flex items-center justify-between border-b px-5 py-4">
          <h2 className="text-sm font-semibold">{title}</h2>
          {right}
        </div>
      )}
      {children}
    </section>
  );
}

export function StatCard({ label, value, hint, icon: I, accent }: { label: string; value: string; hint?: string; icon: LucideIcon; accent?: boolean }) {
  return (
    <div className={`rounded-xl border p-5 shadow-sm ${accent ? "bg-navy text-navy-foreground" : "bg-card"}`}>
      <div className="flex items-center justify-between">
        <span className={`text-xs font-medium uppercase tracking-wider ${accent ? "text-navy-muted" : "text-muted-foreground"}`}>{label}</span>
        <span className={`grid h-8 w-8 place-items-center rounded-lg ${accent ? "bg-navy-accent" : "bg-accent text-accent-foreground"}`}><I className="h-4 w-4" /></span>
      </div>
      <div className="num mt-3 text-2xl font-semibold">{value}</div>
      {hint && <div className={`mt-1 text-xs ${accent ? "text-navy-muted" : "text-muted-foreground"}`}>{hint}</div>}
    </div>
  );
}

export const TX_LABELS: Record<string, string> = {
  deposit: "Opening balance",
  topup: "Top-up",
  withdrawal: "Withdrawal",
  admin_balance: "Balance adjustment",
  admin_bonus: "Bonus adjustment",
  buy: "Legacy trade",
  sell: "Legacy trade",
};

export const accountNo = (id?: string) => "LL-" + (id ?? "").replace(/-/g, "").slice(0, 8).toUpperCase();

/** Balance history: running total of balance-affecting transactions (bonus excluded). */
export function balanceCurve(tx: { kind: string; amount: number | string; created_at: string }[]) {
  let bal = 0;
  return [...tx]
    .sort((a, b) => a.created_at.localeCompare(b.created_at))
    .filter((t) => t.kind !== "admin_bonus")
    .map((t) => { bal += Number(t.amount); return { d: new Date(t.created_at).toLocaleDateString("en-GB", { day: "2-digit", month: "short" }), v: bal }; });
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
