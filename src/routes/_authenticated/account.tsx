import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { toast } from "sonner";
import { FileText } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAccount, useHoldings } from "@/hooks/use-account";
import { PanelHead } from "@/components/ws/Panels";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useQuotes, quoteOf, fmt } from "@/lib/market";

export const Route = createFileRoute("/_authenticated/account")({
  head: () => ({ meta: [{ title: "Workstation — Account" }, { name: "description", content: "Virtual account balances and settings." }] }),
  component: AccountPage,
});

function AccountPage() {
  const { data } = useAccount();
  const { data: holdings = [] } = useHoldings();
  const quotes = useQuotes();
  const [pw, setPw] = useState("");
  const [cur, setCur] = useState("");
  const cash = Number(data?.profile?.virtual_balance ?? 0);
  const mv = holdings.reduce((s, h) => s + Number(h.quantity) * quoteOf(quotes, h.symbol).price, 0);
  const nl = cash + mv;

  async function change() {
    if (pw.length < 8) { toast.error("At least 8 characters"); return; }
    const { error } = await supabase.auth.updateUser({ password: pw, current_password: cur } as { password: string });
    if (error) { toast.error(error.message); return; }
    toast.success("Password changed");
    setPw(""); setCur("");
  }

  const kv = (l: string, v: string) => <div key={l} className="flex justify-between border-b px-3 py-2 text-xs last:border-0"><span className="text-muted-foreground">{l}</span><span className="num">{v}</span></div>;

  return (
    <div className="grid gap-2 lg:grid-cols-3">
      <div className="ws-panel">
        <PanelHead title="Balances (virtual)" />
        {[["Net liquidation", fmt(nl)], ["Cash", fmt(cash)], ["Securities value", fmt(mv)], ["Practice bonus", fmt(Number(data?.profile?.bonus ?? 0))], ["Currency", "USD"]].map(([l, v]) => kv(l!, v!))}
      </div>
      <div className="ws-panel">
        <PanelHead title="Margin (simulated, illustrative)" />
        {[["Initial margin", fmt(mv * 0.25)], ["Maintenance margin", fmt(mv * 0.2)], ["Excess liquidity", fmt(nl - mv * 0.2)], ["Buying power (2x)", fmt(cash * 2)], ["Leverage", (mv / (nl || 1)).toFixed(2) + "x"]].map(([l, v]) => kv(l!, v!))}
      </div>
      <div className="ws-panel">
        <PanelHead title="Statements" />
        <div className="space-y-2 p-3 text-xs">
          {["Daily activity", "Monthly statement", "Annual summary"].map((s) => (
            <div key={s} className="flex items-center justify-between rounded-sm border p-2"><span className="flex items-center gap-2"><FileText className="h-3.5 w-3.5 text-muted-foreground" />{s}</span><span className="text-muted-foreground">Coming soon</span></div>
          ))}
        </div>
      </div>
      <div className="ws-panel lg:col-span-2">
        <PanelHead title="Profile" />
        {kv("Username", data?.profile?.username ?? "")}
        {kv("Email", data?.profile?.email ?? "")}
        {kv("Account type", "Demo · virtual funds")}
        {kv("Opened", data?.profile ? new Date(data.profile.created_at).toLocaleDateString("en-GB") : "")}
      </div>
      <div className="ws-panel">
        <PanelHead title="Security" />
        <div className="space-y-2 p-3">
          <div className="space-y-1"><Label className="text-xs">Current password</Label><Input type="password" value={cur} onChange={(e) => setCur(e.target.value)} className="h-8" /></div>
          <div className="space-y-1"><Label className="text-xs">New password</Label><Input type="password" value={pw} onChange={(e) => setPw(e.target.value)} className="h-8" /></div>
          <Button size="sm" className="w-full" onClick={change}>Change password</Button>
        </div>
      </div>
    </div>
  );
}
