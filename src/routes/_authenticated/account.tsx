import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { useAccount } from "@/hooks/use-account";
import { Card, PageTitle, accountNo } from "@/components/portal/Portal";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export const Route = createFileRoute("/_authenticated/account")({
  head: () => ({ meta: [{ title: "Client portal — Account" }, { name: "description", content: "Profile details and security settings." }] }),
  component: AccountPage,
});

function AccountPage() {
  const { data } = useAccount();
  const [pw, setPw] = useState("");
  const [cur, setCur] = useState("");
  const p = data?.profile;

  async function change() {
    if (pw.length < 8) { toast.error("At least 8 characters"); return; }
    const { error } = await supabase.auth.updateUser({ password: pw, current_password: cur } as { password: string });
    if (error) { toast.error(error.message); return; }
    toast.success("Password changed");
    setPw(""); setCur("");
  }

  const kv = (l: string, v: string) => <div key={l} className="flex justify-between border-t px-5 py-3 text-sm first:border-0"><span className="text-muted-foreground">{l}</span><span className="font-medium">{v}</span></div>;

  return (
    <div>
      <PageTitle title="Account" sub="Your profile and security settings." />
      <div className="grid gap-6 lg:grid-cols-2">
        <Card title="Profile">
          {kv("Name", [p?.first_name, p?.last_name].filter(Boolean).join(" ") || p?.username || "—")}
          {kv("Phone number", p?.phone ?? "—")}
          {kv("Email", p?.email ?? "")}
          {kv("Account number", accountNo(data?.user.id))}
          {kv("Account type", p?.account_type === "business" ? "Business" : "Personal")}
          {kv("Base currency", "EUR")}
          {kv("Member since", p ? new Date(p.created_at).toLocaleDateString("en-GB", { dateStyle: "long" }) : "")}
        </Card>
        <Card title="Change password">
          <div className="space-y-4 p-5">
            <div className="space-y-1.5"><Label>Current password</Label><Input type="password" value={cur} onChange={(e) => setCur(e.target.value)} /></div>
            <div className="space-y-1.5"><Label>New password</Label><Input type="password" value={pw} onChange={(e) => setPw(e.target.value)} /></div>
            <Button onClick={change}>Update password</Button>
          </div>
        </Card>
      </div>
    </div>
  );
}
