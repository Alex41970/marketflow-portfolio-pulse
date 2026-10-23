import { createFileRoute, Outlet, useMatchRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { toast } from "sonner";
import { ArrowUpDown } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAccount } from "@/hooks/use-account";
import { setTemporaryPassword } from "@/lib/admin.functions";
import { applyAdjustment } from "@/lib/rules";
import { fmt } from "@/lib/market";
import { PanelHead } from "@/components/ws/Panels";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import type { Tables } from "@/integrations/supabase/types";

export const Route = createFileRoute("/_authenticated/admin")({
  head: () => ({ meta: [{ title: "Client portal — Users & funds" }, { name: "description", content: "Manage client accounts." }] }),
  component: AdminLayout,
});

type Profile = Tables<"profiles">;

function AdminLayout() {
  const match = useMatchRoute();
  const { data: acct, isLoading } = useAccount();
  if (isLoading) return null;
  if (!acct?.isAdmin) return <div className="ws-panel p-8 text-center text-sm text-muted-foreground">You don't have access to this page.</div>;
  const isChild = match({ to: "/admin/audit" }) || match({ to: "/admin/requests" }) || match({ to: "/admin/payments" }) || match({ to: "/admin/branding" });
  return isChild ? <Outlet /> : <Admin />;
}

type SortKey = "username" | "virtual_balance" | "bonus" | "created_at";
const PAGE = 15;

function Admin() {
  const [q, setQ] = useState("");
  const [sort, setSort] = useState<{ k: SortKey; asc: boolean }>({ k: "created_at", asc: false });
  const [page, setPage] = useState(0);
  const [target, setTarget] = useState<Profile | null>(null);
  const users = useQuery({
    queryKey: ["admin-users"],
    queryFn: async () => (await supabase.from("profiles").select("*")).data ?? [],
  });
  const all = users.data ?? [];
  const rows = useMemo(() => {
    const f = all.filter((u) => ([u.username, u.email, u.first_name, u.last_name, u.phone].join(" ")).toLowerCase().includes(q.toLowerCase()));
    f.sort((a, b) => {
      const x = a[sort.k], y = b[sort.k];
      const r = typeof x === "number" || sort.k === "virtual_balance" || sort.k === "bonus" ? Number(x) - Number(y) : String(x).localeCompare(String(y));
      return sort.asc ? r : -r;
    });
    return f;
  }, [all, q, sort]);
  const pages = Math.max(1, Math.ceil(rows.length / PAGE));
  const view = rows.slice(page * PAGE, page * PAGE + PAGE);
  const dayAgo = Date.now() - 864e5;
  const kpis = [
    ["Total users", String(all.length)],
    ["Client funds outstanding", fmt(all.reduce((s, u) => s + Number(u.virtual_balance), 0))],
    ["Active (24h)", String(all.filter((u) => u.last_seen_at && new Date(u.last_seen_at).getTime() > dayAgo).length)],
    ["Bonuses issued", fmt(all.reduce((s, u) => s + Number(u.bonus), 0))],
  ];
  const H = ({ k, children }: { k: SortKey; children: React.ReactNode }) => (
    <th className="px-3 py-2 text-left font-medium">
      <button onClick={() => setSort({ k, asc: sort.k === k ? !sort.asc : true })} className="inline-flex items-center gap-1 hover:text-foreground">{children}<ArrowUpDown className="h-3 w-3" /></button>
    </th>
  );

  return (
    <div className="space-y-6">
      <div><h1 className="text-2xl font-semibold tracking-tight">Users & funds</h1><p className="mt-1 text-sm text-muted-foreground">Manage balances, bonuses and passwords for every registered account.</p></div>
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        {kpis.map(([l, v]) => <div key={l} className="ws-panel p-5"><div className="text-xs font-medium uppercase tracking-wider text-muted-foreground">{l}</div><div className="num mt-2 text-2xl font-semibold">{v}</div></div>)}
      </div>
      <div className="ws-panel overflow-x-auto">
        <PanelHead title="Registered users" right={<Input placeholder="Search name, email or phone" className="h-8 w-64" value={q} onChange={(e) => { setQ(e.target.value); setPage(0); }} />} />
        <table className="w-full text-sm">
          <thead className="text-xs text-muted-foreground">
            <tr><H k="username">User</H><th className="px-3 text-left font-medium">Email</th><H k="virtual_balance">Balance</H><H k="bonus">Bonus</H><th className="px-3 text-left font-medium">Status</th><H k="created_at">Joined</H><th /></tr>
          </thead>
          <tbody>
            {view.map((u) => {
              const active = u.last_seen_at && new Date(u.last_seen_at).getTime() > dayAgo;
              return (
                <tr key={u.id} className="cursor-pointer border-t hover:bg-muted" onClick={() => setTarget(u)}>
                  <td className="px-3 py-3 font-semibold">{u.username}</td>
                  <td className="px-3 text-muted-foreground">{u.email}</td>
                  <td className="num px-3">{fmt(Number(u.virtual_balance))}</td>
                  <td className="px-3">{Number(u.bonus) > 0 ? <Badge className="num">{fmt(Number(u.bonus))}</Badge> : <span className="text-muted-foreground">None</span>}</td>
                  <td className="px-3"><Badge variant={active ? "default" : "secondary"}>{u.must_change_password ? "Temp password" : active ? "Active" : "Idle"}</Badge></td>
                  <td className="num px-3 text-muted-foreground">{new Date(u.created_at).toLocaleDateString("en-GB")}</td>
                  <td className="px-3 text-right"><Button size="sm" variant="outline" className="h-6 text-xs">Manage</Button></td>
                </tr>
              );
            })}
            {view.length === 0 && <tr><td colSpan={7} className="py-8 text-center text-muted-foreground">No users found</td></tr>}
          </tbody>
        </table>
        <div className="flex items-center justify-between border-t px-3 py-2 text-xs text-muted-foreground">
          <span>{rows.length} users</span>
          <div className="flex items-center gap-2">
            <Button size="sm" variant="outline" className="h-6" disabled={page === 0} onClick={() => setPage(page - 1)}>Prev</Button>
            <span className="num">{page + 1} / {pages}</span>
            <Button size="sm" variant="outline" className="h-6" disabled={page >= pages - 1} onClick={() => setPage(page + 1)}>Next</Button>
          </div>
        </div>
      </div>
      <UserDrawer user={target} onClose={() => setTarget(null)} />
    </div>
  );
}

function UserDrawer({ user, onClose }: { user: Profile | null; onClose: () => void }) {
  const qc = useQueryClient();
  const setTemp = useServerFn(setTemporaryPassword);
  const [amount, setAmount] = useState("");
  const [reason, setReason] = useState("");
  const [temp, setTempPw] = useState("");
  const [busy, setBusy] = useState(false);
  const log = useQuery({
    queryKey: ["audit", user?.id],
    enabled: !!user,
    queryFn: async () => (await supabase.from("admin_audit_log").select("*").eq("target_user_id", user!.id).order("created_at", { ascending: false })).data ?? [],
  });

  if (!user) return null;

  async function adjust(field: "balance" | "bonus", sign: 1 | -1) {
    const delta = sign * Number(amount);
    const current = Number(field === "balance" ? user!.virtual_balance : user!.bonus);
    const check = applyAdjustment(current, delta, reason);
    if (!check.ok) { toast.error(check.error); return; }
    setBusy(true);
    const { error } = await supabase.rpc("admin_adjust", { _target: user!.id, _field: field, _delta: delta, _reason: reason });
    setBusy(false);
    if (error) { toast.error(error.message); return; }
    toast.success("Account updated");
    setAmount(""); setReason("");
    qc.invalidateQueries();
    onClose();
  }
  async function sendReset() {
    const { error } = await supabase.auth.resetPasswordForEmail(user!.email, { redirectTo: window.location.origin + "/reset-password" });
    if (error) { toast.error(error.message); return; }
    toast.success(`Reset link sent to ${user!.email}`);
  }
  async function issueTemp() {
    if (temp.length < 8) { toast.error("Temporary password needs 8+ characters"); return; }
    setBusy(true);
    try {
      await setTemp({ data: { userId: user!.id, password: temp } });
      toast.success("Temporary password set. User must change it at next login.");
      setTempPw("");
      qc.invalidateQueries();
    } catch (e) {
      toast.error((e as Error).message);
    } finally { setBusy(false); }
  }

  return (
    <Sheet open onOpenChange={(o) => !o && onClose()}>
      <SheetContent className="w-full overflow-auto sm:max-w-md">
        <SheetHeader><SheetTitle>{user.username}</SheetTitle><p className="text-xs text-muted-foreground">{user.email}</p></SheetHeader>
        <Tabs defaultValue="overview" className="mt-4">
          <TabsList className="grid w-full grid-cols-4"><TabsTrigger value="overview">Overview</TabsTrigger><TabsTrigger value="funds">Funds</TabsTrigger><TabsTrigger value="password">Password</TabsTrigger><TabsTrigger value="audit">Audit</TabsTrigger></TabsList>
          <TabsContent value="overview" className="space-y-2 pt-2 text-sm">
            {[["Full name", [user.first_name, user.last_name].filter(Boolean).join(" ") || "—"], ["Account type", user.account_type === "business" ? "Business" : "Personal"], ["Phone", user.phone ?? "—"], ["Terms accepted", user.terms_accepted_at ? new Date(user.terms_accepted_at).toLocaleString("en-GB") : "Not recorded"], ["Base currency", "EUR"], ["Balance", fmt(Number(user.virtual_balance))], ["Bonus", fmt(Number(user.bonus))], ["Joined", new Date(user.created_at).toLocaleString("en-GB")], ["Last seen", user.last_seen_at ? new Date(user.last_seen_at).toLocaleString("en-GB") : "Never"], ["Disclaimer accepted", user.disclaimer_accepted_at ? "Yes" : "No"]].map(([l, v]) => (
              <div key={l} className="flex justify-between gap-4 border-b py-2"><span className="text-muted-foreground">{l}</span><span className="num break-words text-right">{v}</span></div>
            ))}
          </TabsContent>
          <TabsContent value="funds" className="space-y-3 pt-2">
            <div className="space-y-1.5"><Label>Amount (EUR)</Label><Input type="number" min={0} value={amount} onChange={(e) => setAmount(e.target.value)} /></div>
            <div className="space-y-1.5"><Label>Reason (recorded in audit log)</Label><Input value={reason} onChange={(e) => setReason(e.target.value)} /></div>
            <div className="grid grid-cols-2 gap-2">
              <Button disabled={busy} onClick={() => adjust("balance", 1)}>Add credits</Button>
              <Button disabled={busy} variant="outline" onClick={() => adjust("balance", -1)}>Remove credits</Button>
              <Button disabled={busy} variant="secondary" onClick={() => adjust("bonus", 1)}>Add bonus</Button>
              <Button disabled={busy} variant="outline" onClick={() => adjust("bonus", -1)}>Remove bonus</Button>
            </div>
          </TabsContent>
          <TabsContent value="password" className="space-y-3 pt-2">
            <Button variant="outline" className="w-full" onClick={sendReset}>Email a reset link</Button>
            <div className="space-y-1.5">
              <Label>Or set a temporary password</Label>
              <div className="flex gap-2"><Input value={temp} onChange={(e) => setTempPw(e.target.value)} /><Button disabled={busy} onClick={issueTemp}>Set</Button></div>
              <p className="text-xs text-muted-foreground">The user must choose a new password after signing in.</p>
            </div>
          </TabsContent>
          <TabsContent value="audit" className="pt-2">
            {(log.data ?? []).map((a) => (
              <div key={a.id} className="border-b py-2 text-xs">
                <div className="flex justify-between"><span className="font-medium capitalize">{a.action.replace("_", " ")}</span><span className="num">{a.amount != null ? fmt(Number(a.amount)) : ""}</span></div>
                <div className="text-muted-foreground">{a.reason} · {new Date(a.created_at).toLocaleString("en-GB")}</div>
              </div>
            ))}
            {log.data?.length === 0 && <p className="py-6 text-center text-xs text-muted-foreground">No admin actions yet</p>}
          </TabsContent>
        </Tabs>
      </SheetContent>
    </Sheet>
  );
}
