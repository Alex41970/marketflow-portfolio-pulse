import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { PanelHead } from "@/components/ws/Panels";
import { fmt } from "@/lib/market";

export const Route = createFileRoute("/_authenticated/admin/audit")({
  head: () => ({ meta: [{ title: "Back office — Audit log" }, { name: "description", content: "All admin actions." }] }),
  component: Audit,
});

function Audit() {
  const { data } = useQuery({
    queryKey: ["audit-all"],
    queryFn: async () => {
      const [{ data: log }, { data: users }] = await Promise.all([
        supabase.from("admin_audit_log").select("*").order("created_at", { ascending: false }).limit(500),
        supabase.from("profiles").select("id, username"),
      ]);
      const name = Object.fromEntries((users ?? []).map((u) => [u.id, u.username]));
      return (log ?? []).map((l) => ({ ...l, admin: name[l.admin_id] ?? "—", target: name[l.target_user_id] ?? "—" }));
    },
  });
  return (
    <div className="ws-panel overflow-x-auto">
      <PanelHead title="Admin audit log" />
      <table className="w-full text-xs">
        <thead className="text-left text-[10px] uppercase text-muted-foreground"><tr><th className="px-3 py-2">Time</th><th>Admin</th><th>User</th><th>Action</th><th>Amount</th><th className="pr-3">Reason</th></tr></thead>
        <tbody>
          {(data ?? []).map((a) => (
            <tr key={a.id} className="border-t">
              <td className="num px-3 py-2 text-muted-foreground">{new Date(a.created_at).toLocaleString("en-GB")}</td>
              <td>{a.admin}</td><td className="font-semibold">{a.target}</td><td className="capitalize">{a.action.replace("_", " ")}</td>
              <td className={`num ${Number(a.amount) >= 0 ? "text-gain" : "text-loss"}`}>{a.amount != null ? fmt(Number(a.amount)) : ""}</td>
              <td className="pr-3 text-muted-foreground">{a.reason}</td>
            </tr>
          ))}
          {data?.length === 0 && <tr><td colSpan={6} className="py-8 text-center text-muted-foreground">No admin actions yet</td></tr>}
        </tbody>
      </table>
    </div>
  );
}
