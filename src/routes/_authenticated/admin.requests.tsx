import type { Det } from "@/lib/funding";
import { createFileRoute } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { PageTitle, Card } from "@/components/portal/Portal";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { fmt } from "@/lib/market";
import { STATUS_STYLE } from "@/lib/funding";

export const Route = createFileRoute("/_authenticated/admin/requests")({
  head: () => ({ meta: [{ title: "Back office — Funding requests" }, { name: "description", content: "Approve or decline top-ups and withdrawals." }] }),
  component: Requests,
});

function Requests() {
  const qc = useQueryClient();
  const [kind, setKind] = useState<"withdrawal" | "deposit">("withdrawal");
  const [status, setStatus] = useState("pending");
  const [notes, setNotes] = useState<Det>({});
  const { data } = useQuery({
    queryKey: ["funding-admin"],
    queryFn: async () => {
      const [{ data: r }, { data: u }] = await Promise.all([
        supabase.from("funding_requests").select("*").order("created_at", { ascending: false }).limit(1000),
        supabase.from("profiles").select("id, username, email, virtual_balance"),
      ]);
      const by = Object.fromEntries((u ?? []).map((x) => [x.id, x]));
      return (r ?? []).map((x) => ({ ...x, user: by[x.user_id] }));
    },
  });
  const rows = (data ?? []).filter((r) => r.kind === kind && (status === "all" || r.status === status));
  const pendingCount = (k: string) => (data ?? []).filter((r) => r.kind === k && r.status === "pending").length;

  async function decide(id: string, approve: boolean) {
    const { error } = await supabase.rpc("decide_funding_request", { _id: id, _approve: approve, _note: notes[id] ?? "" });
    if (error) return void toast.error(error.message);
    toast.success(approve ? "Approved" : "Declined");
    qc.invalidateQueries({ queryKey: ["funding-admin"] });
    qc.invalidateQueries({ queryKey: ["admin-users"] });
  }

  const tab = (k: "withdrawal" | "deposit", label: string) => (
    <button onClick={() => setKind(k)} className={`rounded-lg px-4 py-2 text-sm font-medium ${kind === k ? "bg-card shadow-sm" : "text-muted-foreground"}`}>
      {label}{pendingCount(k) > 0 && <span className="ml-2 rounded-full bg-primary px-1.5 text-[11px] text-primary-foreground">{pendingCount(k)}</span>}
    </button>
  );

  return (
    <>
      <PageTitle title="Funding requests" sub="Review client top-ups and withdrawals." />
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <div className="flex gap-1 rounded-xl bg-muted p-1">{tab("withdrawal", "Withdrawals")}{tab("deposit", "Top-ups")}</div>
        <div className="flex gap-1 rounded-xl bg-muted p-1">
          {["pending", "approved", "declined", "all"].map((s) => <button key={s} onClick={() => setStatus(s)} className={`rounded-lg px-3 py-1.5 text-xs font-medium capitalize ${status === s ? "bg-card shadow-sm" : "text-muted-foreground"}`}>{s}</button>)}
        </div>
      </div>
      <Card>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="text-left text-xs text-muted-foreground"><tr><th className="px-5 py-3 font-medium">Date</th><th className="font-medium">Client</th><th className="font-medium">Amount</th><th className="font-medium">Method & details</th><th className="font-medium">Status</th><th className="px-5 font-medium">Action</th></tr></thead>
            <tbody>
              {rows.map((r) => {
                const d = (r.details ?? {}) as Det;
                return (
                  <tr key={r.id} className="border-t align-top">
                    <td className="num px-5 py-3 text-muted-foreground">{new Date(r.created_at).toLocaleString("en-GB", { dateStyle: "medium", timeStyle: "short" })}</td>
                    <td className="py-3"><div className="font-medium">{r.user?.username ?? "—"}</div><div className="text-xs text-muted-foreground">{r.user?.email}</div>{r.user && <div className="num text-xs text-muted-foreground">Bal {fmt(Number(r.user.virtual_balance))}</div>}</td>
                    <td className="num py-3 font-semibold">{fmt(Number(r.amount))}</td>
                    <td className="py-3 text-xs">
                      <div className="font-medium capitalize">{r.method}{r.network ? ` · ${r.network}` : ""}</div>
                      {Object.entries(d).filter(([, v]) => v).map(([k, v]) => <div key={k} className="break-all text-muted-foreground"><span className="capitalize">{k}</span>: <span className="num">{v}</span></div>)}
                      {r.reference && <div className="text-muted-foreground">Ref: <span className="num">{r.reference}</span></div>}
                    </td>
                    <td className="py-3"><span className={`rounded-full px-2 py-0.5 text-xs font-medium capitalize ${STATUS_STYLE[r.status]}`}>{r.status}</span>{r.admin_note && <div className="mt-1 text-xs text-muted-foreground">{r.admin_note}</div>}</td>
                    <td className="px-5 py-3">
                      {r.status === "pending" ? (
                        <div className="flex min-w-56 flex-col gap-2">
                          <Input className="h-8 text-xs" placeholder="Note (optional)" value={notes[r.id] ?? ""} onChange={(e) => setNotes({ ...notes, [r.id]: e.target.value })} />
                          <div className="flex gap-2"><Button size="sm" className="flex-1" onClick={() => decide(r.id, true)}>Approve</Button><Button size="sm" variant="outline" className="flex-1" onClick={() => decide(r.id, false)}>Decline</Button></div>
                        </div>
                      ) : <span className="text-xs text-muted-foreground">{r.decided_at ? new Date(r.decided_at).toLocaleDateString("en-GB") : ""}</span>}
                    </td>
                  </tr>
                );
              })}
              {rows.length === 0 && <tr><td colSpan={6} className="py-10 text-center text-muted-foreground">Nothing here</td></tr>}
            </tbody>
          </table>
        </div>
      </Card>
    </>
  );
}
