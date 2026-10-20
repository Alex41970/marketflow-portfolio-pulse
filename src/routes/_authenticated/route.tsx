import { createFileRoute, Link, Outlet, redirect, useNavigate } from "@tanstack/react-router";
import { useQueryClient } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { History, LayoutDashboard, LogOut, Moon, PieChart, Shield, Sun, User, ScrollText } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { Brand, DemoBanner } from "@/components/Brand";
import { useAccount, useHoldings } from "@/hooks/use-account";
import { useQuotes, quoteOf, fmt } from "@/lib/market";
import { BRAND } from "@/lib/brand";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";

export const Route = createFileRoute("/_authenticated")({
  ssr: false,
  beforeLoad: async () => {
    const { data } = await supabase.auth.getUser();
    if (!data.user) throw redirect({ to: "/auth" });
  },
  component: Shell,
});

function Clock() {
  const [t, setT] = useState(() => new Date());
  useEffect(() => { const i = setInterval(() => setT(new Date()), 1000); return () => clearInterval(i); }, []);
  return <span className="num">{t.toLocaleTimeString("en-GB")}</span>;
}

function Metric({ label, value, tone }: { label: string; value: string; tone?: number }) {
  return (
    <div className="hidden px-4 lg:block">
      <div className="text-[10px] uppercase tracking-wider text-muted-foreground">{label}</div>
      <div className={`num text-sm ${tone === undefined ? "" : tone >= 0 ? "text-gain" : "text-loss"}`}>{value}</div>
    </div>
  );
}

function Shell() {
  const { data } = useAccount();
  const { data: holdings = [] } = useHoldings();
  const q = useQuotes();
  const [dark, setDark] = useState(true);
  const qc = useQueryClient();
  const navigate = useNavigate();

  useEffect(() => {
    const v = localStorage.getItem("ws-theme");
    if (v === "light") setDark(false);
    void supabase.rpc("touch_seen");
  }, []);
  const toggle = () => { setDark(!dark); localStorage.setItem("ws-theme", dark ? "light" : "dark"); };

  async function signOut() {
    await qc.cancelQueries();
    qc.clear();
    await supabase.auth.signOut();
    navigate({ to: "/auth", replace: true });
  }

  const cash = Number(data?.profile?.virtual_balance ?? 0);
  const mv = holdings.reduce((s, h) => s + Number(h.quantity) * quoteOf(q, h.symbol).price, 0);
  const dayPnl = holdings.reduce((s, h) => { const x = quoteOf(q, h.symbol); return s + Number(h.quantity) * (x.price - x.open); }, 0);

  const links = [
    { to: "/dashboard", label: "Trade", icon: LayoutDashboard },
    { to: "/portfolio", label: "Portfolio", icon: PieChart },
    { to: "/history", label: "Activity", icon: History },
    { to: "/account", label: "Account", icon: User },
    ...(data?.isAdmin ? [{ to: "/admin", label: "Admin", icon: Shield }, { to: "/admin/audit", label: "Audit", icon: ScrollText }] : []),
  ] as const;

  return (
    <div className={`${dark ? "dark" : ""} flex h-screen flex-col bg-background text-foreground`}>
      <DemoBanner />
      <header className="flex h-12 shrink-0 items-center border-b bg-card">
        <div className="flex w-14 justify-center md:w-48 md:justify-start md:px-4">
          <Link to="/" className="hidden md:block"><Brand /></Link>
          <span className="grid h-7 w-7 place-items-center rounded-sm bg-primary num text-sm text-primary-foreground md:hidden">{BRAND.mark}</span>
        </div>
        <div className="hidden items-center gap-2 border-l px-4 text-xs md:flex">
          <span className="text-muted-foreground">Account</span>
          <span className="num rounded-sm bg-muted px-2 py-1">DU{(data?.user.id ?? "").slice(0, 6).toUpperCase()} · SIM</span>
        </div>
        <div className="flex divide-x border-l">
          <Metric label="Net liq." value={fmt(cash + mv)} />
          <Metric label="Day P&L" value={fmt(dayPnl)} tone={dayPnl} />
          <Metric label="Buying power" value={fmt(cash * 2)} />
          <Metric label="Cash" value={fmt(cash)} />
        </div>
        <div className="ml-auto flex items-center gap-3 px-4 text-xs text-muted-foreground">
          <Clock />
          <button onClick={toggle} aria-label="Toggle theme" className="rounded-sm p-1.5 hover:bg-muted">{dark ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}</button>
          <span className="hidden sm:inline">{data?.profile?.username}</span>
          <button onClick={signOut} aria-label="Sign out" className="rounded-sm p-1.5 hover:bg-muted"><LogOut className="h-4 w-4" /></button>
        </div>
      </header>
      <div className="flex min-h-0 flex-1">
        <nav className="flex w-14 shrink-0 flex-col gap-1 border-r bg-card py-2 md:w-48">
          {links.map(({ to, label, icon: I }) => (
            <Link key={to} to={to} activeOptions={{ exact: true }}
              className="mx-2 flex items-center gap-3 rounded-sm px-2.5 py-2 text-sm text-muted-foreground hover:bg-muted hover:text-foreground"
              activeProps={{ className: "bg-accent text-accent-foreground" }}>
              <I className="h-4 w-4 shrink-0" /><span className="hidden md:inline">{label}</span>
            </Link>
          ))}
        </nav>
        <main className="min-w-0 flex-1 overflow-auto p-2 md:p-3"><Outlet /></main>
      </div>
      {data?.profile && !data.profile.disclaimer_accepted_at && <DisclaimerGate />}
      {data?.profile?.disclaimer_accepted_at && data.profile.must_change_password && <ForceChange />}
    </div>
  );
}

function DisclaimerGate() {
  const [ok, setOk] = useState(false);
  const qc = useQueryClient();
  async function accept() {
    await supabase.rpc("accept_disclaimer");
    qc.invalidateQueries({ queryKey: ["account"] });
  }
  return (
    <Dialog open>
      <DialogContent onInteractOutside={(e) => e.preventDefault()} className="[&>button]:hidden">
        <DialogHeader>
          <DialogTitle>Before you start: this is a simulator</DialogTitle>
          <DialogDescription>{BRAND.disclaimer}</DialogDescription>
        </DialogHeader>
        <ul className="list-disc space-y-1 pl-5 text-sm text-muted-foreground">
          <li>Your $100,000 balance is virtual and has no cash value.</li>
          <li>Instruments, prices and news are generated by software.</li>
          <li>No deposits or withdrawals are possible.</li>
        </ul>
        <label className="flex items-center gap-2 text-sm"><Checkbox checked={ok} onCheckedChange={(v) => setOk(!!v)} />I understand this is a demo with virtual funds only.</label>
        <Button disabled={!ok} onClick={accept}>Enter workstation</Button>
      </DialogContent>
    </Dialog>
  );
}

function ForceChange() {
  const [pw, setPw] = useState("");
  const qc = useQueryClient();
  async function save() {
    if (pw.length < 8) { toast.error("At least 8 characters"); return; }
    const { error } = await supabase.auth.updateUser({ password: pw });
    if (error) { toast.error(error.message); return; }
    await supabase.rpc("clear_password_flag");
    qc.invalidateQueries({ queryKey: ["account"] });
    toast.success("Password updated");
  }
  return (
    <Dialog open>
      <DialogContent onInteractOutside={(e) => e.preventDefault()} className="[&>button]:hidden">
        <DialogHeader>
          <DialogTitle>Choose a new password</DialogTitle>
          <DialogDescription>You signed in with a temporary password. Set your own to continue.</DialogDescription>
        </DialogHeader>
        <Input type="password" value={pw} onChange={(e) => setPw(e.target.value)} placeholder="New password" />
        <Button onClick={save}>Save password</Button>
      </DialogContent>
    </Dialog>
  );
}
