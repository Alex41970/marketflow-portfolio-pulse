import { createFileRoute, Link, Outlet, redirect, useNavigate } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { CreditCard, History, Inbox, LayoutDashboard, LogOut, Moon, PieChart, Shield, Sun, User, ScrollText, Wallet, Palette } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAccount } from "@/hooks/use-account";
import { useBrand } from "@/lib/useBrand";
import { accountNo } from "@/components/portal/Portal";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";

export const Route = createFileRoute("/_authenticated")({
  ssr: false,
  beforeLoad: async () => {
    const { data } = await supabase.auth.getUser();
    if (!data.user) throw redirect({ to: "/auth" });
  },
  component: Shell,
});

function Shell() {
  const { data } = useAccount();
  const [dark, setDark] = useState(false);
  const qc = useQueryClient();
  const navigate = useNavigate();

  useEffect(() => {
    if (localStorage.getItem("portal-theme") === "dark") setDark(true);
    void supabase.rpc("touch_seen");
  }, []);
  const toggle = () => { setDark(!dark); localStorage.setItem("portal-theme", dark ? "light" : "dark"); };

  async function signOut() {
    await qc.cancelQueries();
    qc.clear();
    await supabase.auth.signOut();
    navigate({ to: "/auth", replace: true });
  }

  const links = [
    { to: "/dashboard", label: "Overview", icon: LayoutDashboard },
    { to: "/portfolio", label: "Portfolio", icon: PieChart },
    { to: "/funding", label: "Funding", icon: Wallet },
    { to: "/history", label: "Transactions", icon: History },
    { to: "/account", label: "Account", icon: User },
  ] as const;
  const adminLinks = [
    { to: "/admin", label: "Users & funds", icon: Shield },
    { to: "/admin/requests", label: "Funding requests", icon: Inbox },
    { to: "/admin/payments", label: "Payment settings", icon: CreditCard },
    { to: "/admin/audit", label: "Audit log", icon: ScrollText },
    { to: "/admin/branding", label: "Branding", icon: Palette },
  ] as const;
  const { data: pendingCount } = useQuery({
    queryKey: ["funding-pending-count"],
    enabled: !!data?.isAdmin,
    refetchInterval: 30000,
    queryFn: async () => (await supabase.from("funding_requests").select("id", { count: "exact", head: true }).eq("status", "pending")).count ?? 0,
  });
  const navCls = "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm text-navy-muted transition-colors hover:bg-navy-accent hover:text-navy-foreground";
  const name = [data?.profile?.first_name, data?.profile?.last_name].filter(Boolean).join(" ") || data?.profile?.username || "";
  const BRAND = useBrand();

  return (
    <div className={`${dark ? "dark" : ""} flex h-screen flex-col bg-background text-foreground`}>
      <div className="flex min-h-0 flex-1">
        <aside className="flex w-16 shrink-0 flex-col bg-navy text-navy-foreground md:w-64">
          <Link to="/" className="flex h-16 items-center gap-3 border-b border-navy-accent px-4">
            <span className="grid h-8 w-8 shrink-0 place-items-center rounded-lg bg-primary font-semibold text-primary-foreground">{BRAND.mark}</span>
            <span className="hidden leading-tight md:block"><span className="block text-sm font-semibold">{BRAND.name}</span><span className="block text-[11px] text-navy-muted">Client portal</span></span>
          </Link>
          <nav className="flex flex-1 flex-col gap-1 p-3">
            {links.map(({ to, label, icon: I }) => (
              <Link key={to} to={to} activeOptions={{ exact: true }} className={navCls} activeProps={{ className: "bg-navy-accent !text-navy-foreground" }}>
                <I className="h-4 w-4 shrink-0" /><span className="hidden md:inline">{label}</span>
              </Link>
            ))}
            {data?.isAdmin && (
              <>
                <div className="mt-6 hidden px-3 pb-1 text-[10px] font-semibold uppercase tracking-widest text-navy-muted md:block">Administration</div>
                {adminLinks.map(({ to, label, icon: I }) => (
                  <Link key={to} to={to} activeOptions={{ exact: true }} className={navCls} activeProps={{ className: "bg-navy-accent !text-navy-foreground" }}>
                    <I className="h-4 w-4 shrink-0" /><span className="hidden md:inline">{label}</span>
                    {to === "/admin/requests" && !!pendingCount && <span className="ml-auto hidden rounded-full bg-primary px-1.5 text-[11px] font-semibold text-primary-foreground md:inline">{pendingCount}</span>}
                  </Link>
                ))}
              </>
            )}
          </nav>
          <button onClick={signOut} className={`${navCls} m-3`}><LogOut className="h-4 w-4 shrink-0" /><span className="hidden md:inline">Sign out</span></button>
        </aside>
        <div className="flex min-w-0 flex-1 flex-col">
          <header className="flex h-16 shrink-0 items-center justify-between border-b bg-card px-6">
            <div className="text-sm text-muted-foreground">Account <span className="num font-medium text-foreground">{accountNo(data?.user.id)}</span></div>
            <div className="flex items-center gap-3">
              <button onClick={toggle} aria-label="Toggle theme" className="rounded-lg p-2 text-muted-foreground hover:bg-muted">{dark ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}</button>
              <div className="flex items-center gap-2">
                <span className="grid h-8 w-8 place-items-center rounded-full bg-accent text-sm font-semibold uppercase text-accent-foreground">{name.slice(0, 1) || "?"}</span>
                <span className="hidden text-sm font-medium sm:inline">{name}</span>
              </div>
            </div>
          </header>
          <main className="min-w-0 flex-1 overflow-auto bg-muted/40 p-4 md:p-8"><div className="mx-auto max-w-7xl"><Outlet /></div></main>
        </div>
      </div>
      {data?.profile?.must_change_password && <ForceChange />}
    </div>
  );
}

function ForceChange() {
  const [pw, setPw] = useState("");
  const [open, setOpen] = useState(true);
  const qc = useQueryClient();
  async function save() {
    if (pw.length < 8) { toast.error("At least 8 characters"); return; }
    const { error } = await supabase.auth.updateUser({ password: pw });
    if (error) { toast.error(error.message); return; }
    await supabase.rpc("clear_password_flag");
    qc.invalidateQueries({ queryKey: ["account"] });
    toast.success("Password updated");
    setOpen(false);
  }
  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Choose a new password</DialogTitle>
          <DialogDescription>You signed in with a temporary password set by an administrator. We recommend setting your own.</DialogDescription>
        </DialogHeader>
        <Input type="password" value={pw} onChange={(e) => setPw(e.target.value)} placeholder="New password" />
        <div className="flex gap-2"><Button variant="outline" className="flex-1" onClick={() => setOpen(false)}>Later</Button><Button className="flex-1" onClick={save}>Save password</Button></div>
      </DialogContent>
    </Dialog>
  );
}
