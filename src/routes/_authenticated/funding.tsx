import type { Det } from "@/lib/funding";
import { createFileRoute } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { toast } from "sonner";
import { QRCodeSVG } from "qrcode.react";
import { ArrowDownToLine, ArrowUpFromLine, Clock, Wallet, CheckCircle2, Bitcoin, Copy, Landmark } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAccount } from "@/hooks/use-account";
import { PageTitle, Card, StatCard, accountNo }
import { FundingFlow, FundingGauge, MethodSplit } from "@/components/portal/OverviewCharts"; from "@/components/portal/Portal";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { fmt } from "@/lib/market";
import { canWithdraw, STATUS_STYLE } from "@/lib/funding";

export const Route = createFileRoute("/_authenticated/funding")({
  head: () => ({ meta: [{ title: "Funding — Top up & withdraw" }, { name: "description", content: "Top up or withdraw via crypto or bank wire." }] }),
  component: Funding,
});

type Method = "crypto" | "wire";
type PM = { id: string; kind: string; label: string; network: string | null; details: Det };

export function useFundingRequests() {
  return useQuery({
    queryKey: ["funding-mine"],
    queryFn: async () => (await supabase.from("funding_requests").select("*").order("created_at", { ascending: false })).data ?? [],
  });
}

function Funding() {
  const { data: acct } = useAccount();
  const { data: reqs } = useFundingRequests();
  const [mode, setMode] = useState<null | "deposit" | "withdrawal">(null);
  const uid = acct?.user.id;
  const mine = (reqs ?? []).filter((r) => r.user_id === uid);
  const bal = Number(acct?.profile?.virtual_balance ?? 0);
  const pending = mine.filter((r) => r.kind === "withdrawal" && r.status === "pending").reduce((s, r) => s + Number(r.amount), 0);

  return (
    <>
      <PageTitle title="Funding" sub="Top up your account or request a withdrawal." right={
        <div className="flex gap-2">
          <Button onClick={() => setMode("deposit")}><ArrowDownToLine className="mr-2 h-4 w-4" />Top up</Button>
          <Button variant="outline" onClick={() => setMode("withdrawal")}><ArrowUpFromLine className="mr-2 h-4 w-4" />Withdraw</Button>
        </div>} />
      <div className="mb-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard accent icon={Wallet} label="Balance" value={fmt(bal)} hint="Current account balance" />
        <StatCard icon={ArrowUpFromLine} label="Available to withdraw" value={fmt(Math.max(0, bal - pending))} hint={pending > 0 ? `${fmt(pending)} in pending withdrawals` : "No pending withdrawals"} />
        <StatCard icon={Clock} label="Pending requests" value={String(mine.filter((r) => r.status === "pending").length)} hint="Awaiting review" />
        <StatCard icon={CheckCircle2} label="Approved top-ups" value={fmt(mine.filter((r) => r.kind === "deposit" && r.status === "approved").reduce((s, r) => s + Number(r.amount), 0))} hint="All time" />
      </div>
      <div className="mb-6 grid gap-6 lg:grid-cols-3">
        <FundingFlow reqs={mine} />
        <div className="grid gap-6"><MethodSplit reqs={mine} /></div>
      </div>
      <div className="mb-6 grid gap-6 lg:grid-cols-3">
        <FundingGauge reqs={mine} />
        <Card title="How funding works" className="lg:col-span-2">
          <ol className="grid gap-px bg-border sm:grid-cols-3">
            {[["1", "Submit a request", "Choose top up or withdraw, then crypto or bank wire."], ["2", "We review it", "Our team checks the payment or withdrawal details."], ["3", "Balance updates", "Once approved, your balance changes instantly."]].map(([n, t, d]) => (
              <li key={n} className="bg-card p-5"><span className="grid h-8 w-8 place-items-center rounded-full bg-accent text-sm font-semibold text-accent-foreground">{n}</span><div className="mt-3 text-sm font-semibold">{t}</div><p className="mt-1 text-xs text-muted-foreground">{d}</p></li>
            ))}
          </ol>
        </Card>
      </div>
      <Card title="Your requests">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="text-left text-xs text-muted-foreground"><tr><th className="px-5 py-3 font-medium">Date</th><th className="font-medium">Type</th><th className="font-medium">Method</th><th className="font-medium">Amount</th><th className="font-medium">Status</th><th className="px-5 font-medium">Note</th></tr></thead>
            <tbody>
              {mine.map((r) => (
                <tr key={r.id} className="border-t">
                  <td className="num px-5 py-3 text-muted-foreground">{new Date(r.created_at).toLocaleString("en-GB", { dateStyle: "medium", timeStyle: "short" })}</td>
                  <td>{r.kind === "deposit" ? "Top-up" : "Withdrawal"}</td>
                  <td className="capitalize">{r.method}{r.network ? ` · ${r.network}` : ""}</td>
                  <td className="num font-medium">{fmt(Number(r.amount))}</td>
                  <td><span className={`rounded-full px-2 py-0.5 text-xs font-medium capitalize ${STATUS_STYLE[r.status]}`}>{r.status}</span></td>
                  <td className="px-5 text-muted-foreground">{r.admin_note ?? ""}</td>
                </tr>
              ))}
              {mine.length === 0 && <tr><td colSpan={6} className="py-10 text-center text-muted-foreground">No requests yet</td></tr>}
            </tbody>
          </table>
        </div>
      </Card>
      {mode && <RequestDialog kind={mode} onClose={() => setMode(null)} balance={bal} pending={pending} reference={accountNo(uid)} />}
    </>
  );
}

function RequestDialog({ kind, onClose, balance, pending, reference }: { kind: "deposit" | "withdrawal"; onClose: () => void; balance: number; pending: number; reference: string }) {
  const qc = useQueryClient();
  const [method, setMethod] = useState<Method>("crypto");
  const [pmId, setPmId] = useState<string>("");
  const [amount, setAmount] = useState("");
  const [ref, setRef] = useState("");
  const [d, setD] = useState<Det>({});
  const [busy, setBusy] = useState(false);
  const { data: pms } = useQuery({
    queryKey: ["payment-methods-active"],
    queryFn: async () => ((await supabase.from("payment_methods").select("*").eq("active", true).order("sort")).data ?? []) as unknown as PM[],
  });
  const options = (pms ?? []).filter((p) => p.kind === method);
  const pm = options.find((p) => p.id === pmId) ?? options[0];
  const isDep = kind === "deposit";

  async function submit() {
    const amt = Number(amount);
    if (!(amt > 0)) return void toast.error("Enter a valid amount");
    if (!isDep && !canWithdraw(balance, pending, amt)) return void toast.error("Amount exceeds available balance");
    if (!isDep && method === "crypto" && !d.address) return void toast.error("Enter your wallet address");
    if (!isDep && method === "wire" && (!d.holder || !d.iban)) return void toast.error("Enter account holder and IBAN / account number");
    setBusy(true);
    const { error } = await supabase.rpc("create_funding_request", {
      _kind: kind, _method: method, _amount: amt,
      _network: isDep ? (pm ? `${pm.label}${pm.network ? " " + pm.network : ""}` : "") : (d.network ?? ""),
      _details: isDep ? {} : d, _reference: ref,
    });
    setBusy(false);
    if (error) return void toast.error(error.message);
    toast.success(isDep ? "Top-up submitted — we'll credit it once confirmed" : "Withdrawal request submitted");
    qc.invalidateQueries({ queryKey: ["funding-mine"] });
    onClose();
  }

  const copy = (v: string) => { void navigator.clipboard.writeText(v); toast.success("Copied"); };
  const Row = ({ k, v }: { k: string; v?: string | undefined }) => v ? (
    <div className="flex items-center justify-between gap-3 border-t py-2 text-sm first:border-t-0"><span className="text-muted-foreground">{k}</span><button onClick={() => copy(v)} className="num flex items-center gap-1.5 break-all text-right font-medium hover:text-primary">{v}<Copy className="h-3 w-3 shrink-0" /></button></div>
  ) : null;

  return (
    <Dialog open onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>{isDep ? "Top up" : "Withdraw"}</DialogTitle>
          <DialogDescription>{isDep ? "Choose how you'd like to send funds." : "Choose where we should send your funds."}</DialogDescription>
        </DialogHeader>
        <div className="grid grid-cols-2 gap-2">
          {(["crypto", "wire"] as const).map((m) => (
            <button key={m} onClick={() => { setMethod(m); setPmId(""); setD({}); }} className={`flex items-center justify-center gap-2 rounded-lg border p-3 text-sm font-medium ${method === m ? "border-primary bg-accent text-accent-foreground" : "hover:bg-muted"}`}>
              {m === "crypto" ? <Bitcoin className="h-4 w-4" /> : <Landmark className="h-4 w-4" />}{m === "crypto" ? "Crypto" : "Bank wire"}
            </button>
          ))}
        </div>

        {isDep && (
          options.length === 0 ? <p className="rounded-lg bg-muted p-4 text-sm text-muted-foreground">No {method === "crypto" ? "crypto wallets" : "bank details"} have been set up yet. Please contact support.</p> : (
            <div className="space-y-3">
              {options.length > 1 && (
                <div className="flex flex-wrap gap-2">{options.map((o) => <button key={o.id} onClick={() => setPmId(o.id)} className={`rounded-full border px-3 py-1 text-xs ${pm?.id === o.id ? "border-primary bg-accent" : ""}`}>{o.label}{o.network ? ` · ${o.network}` : ""}</button>)}</div>
              )}
              {pm && method === "crypto" && (
                <div className="flex gap-4 rounded-lg border p-4">
                  {pm.details.address && <div className="shrink-0 rounded bg-card p-2"><QRCodeSVG value={pm.details.address} size={104} /></div>}
                  <div className="min-w-0 flex-1"><Row k="Coin" v={pm.label} /><Row k="Network" v={pm.network ?? undefined} /><Row k="Address" v={pm.details.address} /></div>
                </div>
              )}
              {pm && method === "wire" && (
                <div className="rounded-lg border px-4 py-2">
                  <Row k="Bank" v={pm.details.bank} /><Row k="Account holder" v={pm.details.holder} /><Row k="IBAN / Account" v={pm.details.iban} /><Row k="SWIFT / BIC" v={pm.details.swift} /><Row k="Bank address" v={pm.details.address} /><Row k="Reference" v={reference} />
                </div>
              )}
              {pm?.details.notes && <p className="text-xs text-muted-foreground">{pm.details.notes}</p>}
            </div>
          )
        )}

        {!isDep && method === "crypto" && (
          <div className="grid gap-3">
            <F label="Coin & network (e.g. USDT TRC20)" v={d.network} on={(v) => setD({ ...d, network: v })} />
            <F label="Your wallet address" v={d.address} on={(v) => setD({ ...d, address: v })} />
          </div>
        )}
        {!isDep && method === "wire" && (
          <div className="grid gap-3 sm:grid-cols-2">
            <F label="Account holder" v={d.holder} on={(v) => setD({ ...d, holder: v })} />
            <F label="Bank name" v={d.bank} on={(v) => setD({ ...d, bank: v })} />
            <F label="IBAN / Account no." v={d.iban} on={(v) => setD({ ...d, iban: v })} />
            <F label="SWIFT / BIC" v={d.swift} on={(v) => setD({ ...d, swift: v })} />
          </div>
        )}

        <div className="grid gap-3 sm:grid-cols-2">
          <div><Label className="text-xs">Amount (USD)</Label><Input type="number" min="0" step="0.01" value={amount} onChange={(e) => setAmount(e.target.value)} placeholder="0.00" /></div>
          {isDep && <div><Label className="text-xs">Transaction ID / reference (optional)</Label><Input value={ref} onChange={(e) => setRef(e.target.value)} /></div>}
        </div>
        {!isDep && <p className="text-xs text-muted-foreground">Available: {fmt(Math.max(0, balance - pending))}</p>}
        <Button disabled={busy || (isDep && options.length === 0)} onClick={submit}>{isDep ? "I've sent the funds" : "Request withdrawal"}</Button>
      </DialogContent>
    </Dialog>
  );
}

function F({ label, v, on }: { label: string; v?: string | undefined; on: (v: string) => void }) {
  return <div><Label className="text-xs">{label}</Label><Input value={v ?? ""} onChange={(e) => on(e.target.value)} /></div>;
}
