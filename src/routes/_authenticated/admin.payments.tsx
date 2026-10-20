import { createFileRoute } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { toast } from "sonner";
import { Bitcoin, Landmark, Pencil, Plus, Trash2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { PageTitle, Card } from "@/components/portal/Portal";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";

export const Route = createFileRoute("/_authenticated/admin/payments")({
  head: () => ({ meta: [{ title: "Back office — Payment settings" }, { name: "description", content: "Crypto wallets and bank details shown to clients." }] }),
  component: Payments,
});

type PM = { id?: string; kind: "crypto" | "wire"; label: string; network: string | null; details: Record<string, string>; active: boolean; sort: number };

const FIELDS: Record<PM["kind"], { k: string; l: string }[]> = {
  crypto: [{ k: "address", l: "Wallet address" }, { k: "notes", l: "Note for clients (optional)" }],
  wire: [{ k: "bank", l: "Bank name" }, { k: "holder", l: "Account holder" }, { k: "iban", l: "IBAN / Account no." }, { k: "swift", l: "SWIFT / BIC" }, { k: "address", l: "Bank address" }, { k: "notes", l: "Note for clients (optional)" }],
};

function Payments() {
  const qc = useQueryClient();
  const [edit, setEdit] = useState<PM | null>(null);
  const { data } = useQuery({
    queryKey: ["payment-methods-all"],
    queryFn: async () => ((await supabase.from("payment_methods").select("*").order("sort")).data ?? []) as unknown as (PM & { id: string })[],
  });
  const refresh = () => { qc.invalidateQueries({ queryKey: ["payment-methods-all"] }); qc.invalidateQueries({ queryKey: ["payment-methods-active"] }); };

  async function toggle(p: PM & { id: string }) {
    const { error } = await supabase.from("payment_methods").update({ active: !p.active }).eq("id", p.id);
    if (error) toast.error(error.message); else refresh();
  }
  async function remove(id: string) {
    if (!confirm("Remove this payment method?")) return;
    const { error } = await supabase.from("payment_methods").delete().eq("id", id);
    if (error) toast.error(error.message); else refresh();
  }

  const section = (kind: PM["kind"], title: string) => (
    <Card title={title} right={<Button size="sm" onClick={() => setEdit({ kind, label: kind === "crypto" ? "USDT" : "Bank wire", network: "", details: {}, active: true, sort: (data?.length ?? 0) })}><Plus className="mr-1 h-4 w-4" />Add</Button>}>
      <div className="divide-y">
        {(data ?? []).filter((p) => p.kind === kind).map((p) => (
          <div key={p.id} className="flex items-center gap-4 px-5 py-4">
            <span className="grid h-9 w-9 shrink-0 place-items-center rounded-lg bg-accent text-accent-foreground">{kind === "crypto" ? <Bitcoin className="h-4 w-4" /> : <Landmark className="h-4 w-4" />}</span>
            <div className="min-w-0 flex-1">
              <div className="font-medium">{p.label}{p.network ? ` · ${p.network}` : ""}</div>
              <div className="num truncate text-xs text-muted-foreground">{kind === "crypto" ? p.details.address : `${p.details.bank ?? ""} · ${p.details.iban ?? ""}`}</div>
            </div>
            <Switch checked={p.active} onCheckedChange={() => toggle(p)} aria-label="Shown to clients" />
            <Button size="icon" variant="ghost" onClick={() => setEdit(p)}><Pencil className="h-4 w-4" /></Button>
            <Button size="icon" variant="ghost" onClick={() => remove(p.id)}><Trash2 className="h-4 w-4" /></Button>
          </div>
        ))}
        {(data ?? []).filter((p) => p.kind === kind).length === 0 && <div className="px-5 py-8 text-center text-sm text-muted-foreground">None set up yet</div>}
      </div>
    </Card>
  );

  return (
    <>
      <PageTitle title="Payment settings" sub="These details are shown to clients when they click Top up. Switch off to hide." />
      <div className="grid gap-6 lg:grid-cols-2">{section("crypto", "Crypto wallets")}{section("wire", "Bank wire details")}</div>
      {edit && <Editor pm={edit} onClose={() => setEdit(null)} onSaved={() => { setEdit(null); refresh(); }} />}
    </>
  );
}

function Editor({ pm, onClose, onSaved }: { pm: PM; onClose: () => void; onSaved: () => void }) {
  const [f, setF] = useState<PM>(pm);
  async function save() {
    if (!f.label.trim()) return toast.error("Name required");
    if (f.kind === "crypto" && !f.details.address) return toast.error("Wallet address required");
    if (f.kind === "wire" && (!f.details.holder || !f.details.iban)) return toast.error("Account holder and IBAN required");
    const row = { kind: f.kind, label: f.label.trim(), network: f.network || null, details: f.details, active: f.active, sort: f.sort };
    const { error } = pm.id ? await supabase.from("payment_methods").update(row).eq("id", pm.id) : await supabase.from("payment_methods").insert(row);
    if (error) return toast.error(error.message);
    toast.success("Saved"); onSaved();
  }
  return (
    <Dialog open onOpenChange={(o) => !o && onClose()}>
      <DialogContent>
        <DialogHeader><DialogTitle>{pm.id ? "Edit" : "Add"} {f.kind === "crypto" ? "crypto wallet" : "bank account"}</DialogTitle></DialogHeader>
        <div className="grid gap-3">
          <div className="grid grid-cols-2 gap-3">
            <div><Label className="text-xs">{f.kind === "crypto" ? "Coin (e.g. USDT, BTC)" : "Display name"}</Label><Input value={f.label} onChange={(e) => setF({ ...f, label: e.target.value })} /></div>
            <div><Label className="text-xs">{f.kind === "crypto" ? "Network (e.g. TRC20)" : "Currency (e.g. USD)"}</Label><Input value={f.network ?? ""} onChange={(e) => setF({ ...f, network: e.target.value })} /></div>
          </div>
          {FIELDS[f.kind].map(({ k, l }) => (
            <div key={k}><Label className="text-xs">{l}</Label><Input value={f.details[k] ?? ""} onChange={(e) => setF({ ...f, details: { ...f.details, [k]: e.target.value } })} /></div>
          ))}
          <Button onClick={save}>Save</Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
