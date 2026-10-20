import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { useAccount } from "@/hooks/use-account";
import { setTemporaryPassword } from "@/lib/admin.functions";
import { applyAdjustment } from "@/lib/rules";
import { fmt } from "@/lib/market";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import type { Tables } from "@/integrations/supabase/types";

export const Route = createFileRoute("/_authenticated/admin")({
  head: () => ({ meta: [{ title: "Admin — Ledgerline Paper Trading" }, { name: "description", content: "Manage practice accounts." }] }),
  component: Admin,
});

type Profile = Tables<"profiles">;

function Admin() {
  const { data: acct, isLoading } = useAccount();
  const [q, setQ] = useState("");
  const [target, setTarget] = useState<Profile | null>(null);
  const users = useQuery({
    queryKey: ["admin-users"],
    enabled: !!acct?.isAdmin,
    queryFn: async () => (await supabase.from("profiles").select("*").order("created_at", { ascending: false })).data ?? [],
  });
  if (isLoading) return null;
  if (!acct?.isAdmin) return <div className="panel p-8 text-center text-muted-foreground">You don't have access to this page.</div>;

  const rows = (users.data ?? []).filter((u) => (u.username + u.email).toLowerCase().includes(q.toLowerCase()));

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-xl font-semibold">Practice accounts</h1>
        <Input placeholder="Search username or email" className="max-w-xs" value={q} onChange={(e) => setQ(e.target.value)} />
      </div>
      <div className="panel overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="text-left text-xs text-muted-foreground">
            <tr><th className="px-4 py-2">Username</th><th>Email</th><th>Virtual balance</th><th>Bonus</th><th>Joined</th><th className="pr-4" /></tr>
          </thead>
          <tbody>
            {rows.map((u) => (
              <tr key={u.id} className="border-t">
                <td className="px-4 py-2.5 font-medium">{u.username}</td>
                <td className="text-muted-foreground">{u.email}</td>
                <td className="num">{fmt(Number(u.virtual_balance))}</td>
                <td className="num">{Number(u.bonus) > 0 ? fmt(Number(u.bonus)) : <span className="text-muted-foreground">None</span>}</td>
                <td className="num text-muted-foreground">{new Date(u.created_at).toLocaleDateString()}</td>
                <td className="pr-4 text-right"><Button size="sm" variant="outline" onClick={() => setTarget(u)}>Manage</Button></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {target && <ManageDialog user={target} onClose={() => setTarget(null)} />}
    </div>
  );
}

function ManageDialog({ user, onClose }: { user: Profile; onClose: () => void }) {
  const qc = useQueryClient();
  const setTemp = useServerFn(setTemporaryPassword);
  const [amount, setAmount] = useState("");
  const [reason, setReason] = useState("");
  const [temp, setTempPw] = useState("");
  const [busy, setBusy] = useState(false);

  async function adjust(field: "balance" | "bonus", sign: 1 | -1) {
    const delta = sign * Number(amount);
    const current = Number(field === "balance" ? user.virtual_balance : user.bonus);
    const check = applyAdjustment(current, delta, reason);
    if (!check.ok) { toast.error(check.error); return; }
    setBusy(true);
    const { error } = await supabase.rpc("admin_adjust", { _target: user.id, _field: field, _delta: delta, _reason: reason });
    setBusy(false);
    if (error) { toast.error(error.message); return; }
    toast.success("Updated");
    qc.invalidateQueries();
    onClose();
  }

  async function sendReset() {
    const { error } = await supabase.auth.resetPasswordForEmail(user.email, { redirectTo: window.location.origin + "/reset-password" });
    if (error) { toast.error(error.message); return; }
    toast.success(`Reset link sent to ${user.email}`);
  }

  async function issueTemp() {
    if (temp.length < 8) { toast.error("Temporary password needs 8+ characters"); return; }
    setBusy(true);
    try {
      await setTemp({ data: { userId: user.id, password: temp } });
      toast.success("Temporary password set. The user must change it at next login.");
      setTempPw("");
    } catch (e) {
      toast.error((e as Error).message);
    } finally {
      setBusy(false);
    }
  }

  return (
    <Dialog open onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="max-w-lg">
        <DialogHeader><DialogTitle>Manage {user.username}</DialogTitle></DialogHeader>
        <div className="num grid grid-cols-2 gap-3 text-sm">
          <div className="rounded-md bg-muted p-3"><div className="font-sans text-xs text-muted-foreground">Virtual balance</div>{fmt(Number(user.virtual_balance))}</div>
          <div className="rounded-md bg-muted p-3"><div className="font-sans text-xs text-muted-foreground">Bonus</div>{fmt(Number(user.bonus))}</div>
        </div>
        <div className="space-y-3">
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5"><Label>Amount</Label><Input type="number" min={0} value={amount} onChange={(e) => setAmount(e.target.value)} /></div>
            <div className="space-y-1.5"><Label>Reason (logged)</Label><Input value={reason} onChange={(e) => setReason(e.target.value)} /></div>
          </div>
          <div className="grid grid-cols-2 gap-2">
            <Button disabled={busy} onClick={() => adjust("balance", 1)}>Add credits</Button>
            <Button disabled={busy} variant="outline" onClick={() => adjust("balance", -1)}>Remove credits</Button>
            <Button disabled={busy} variant="secondary" onClick={() => adjust("bonus", 1)}>Add bonus</Button>
            <Button disabled={busy} variant="outline" onClick={() => adjust("bonus", -1)}>Remove bonus</Button>
          </div>
        </div>
        <div className="space-y-2 border-t pt-4">
          <Label>Password</Label>
          <Button variant="outline" className="w-full" onClick={sendReset}>Email a reset link</Button>
          <div className="flex gap-2">
            <Input type="text" placeholder="Temporary password" value={temp} onChange={(e) => setTempPw(e.target.value)} />
            <Button disabled={busy} onClick={issueTemp}>Set</Button>
          </div>
          <p className="text-xs text-muted-foreground">The user will be asked to choose a new password after signing in.</p>
        </div>
      </DialogContent>
    </Dialog>
  );
}
