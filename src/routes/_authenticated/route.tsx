import { createFileRoute, Link, Outlet, redirect, useNavigate } from "@tanstack/react-router";
import { useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { toast } from "sonner";
import { History, LayoutDashboard, LogOut, Menu, PieChart, Shield } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { Brand, DemoBanner } from "@/components/Brand";
import { useAccount } from "@/hooks/use-account";
import { fmt } from "@/lib/market";
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
  const [open, setOpen] = useState(false);
  const qc = useQueryClient();
  const navigate = useNavigate();

  async function signOut() {
    await qc.cancelQueries();
    qc.clear();
    await supabase.auth.signOut();
    navigate({ to: "/auth", replace: true });
  }

  const links = [
    { to: "/dashboard", label: "Trade", icon: LayoutDashboard },
    { to: "/portfolio", label: "Portfolio", icon: PieChart },
    { to: "/history", label: "History", icon: History },
    ...(data?.isAdmin ? [{ to: "/admin", label: "Admin", icon: Shield }] : []),
  ] as const;

  const nav = (
    <nav className="flex flex-col gap-1 px-3">
      {links.map(({ to, label, icon: I }) => (
        <Link key={to} to={to} onClick={() => setOpen(false)}
          className="flex items-center gap-3 rounded-md px-3 py-2 text-sm text-navy-muted transition-colors hover:bg-navy-accent hover:text-navy-foreground"
          activeProps={{ className: "bg-navy-accent text-navy-foreground" }}>
          <I className="h-4 w-4" />{label}
        </Link>
      ))}
    </nav>
  );

  return (
    <div className="flex min-h-screen flex-col">
      <DemoBanner />
      <div className="flex flex-1">
        <aside className={`${open ? "fixed inset-y-0 left-0 z-40 flex" : "hidden"} w-60 flex-col bg-navy py-5 text-navy-foreground md:static md:flex`}>
          <div className="px-6 pb-6"><Brand /></div>
          {nav}
          <div className="mt-auto px-6 pt-6 text-xs text-navy-muted">
            <div className="truncate">{data?.profile?.username}</div>
            <button onClick={signOut} className="mt-2 flex items-center gap-2 hover:text-navy-foreground"><LogOut className="h-3.5 w-3.5" />Sign out</button>
          </div>
        </aside>
        <div className="flex min-w-0 flex-1 flex-col">
          <header className="flex items-center justify-between border-b bg-card px-4 py-3 md:px-6">
            <button className="md:hidden" onClick={() => setOpen(!open)} aria-label="Menu"><Menu className="h-5 w-5" /></button>
            <div className="text-sm text-muted-foreground">Virtual account</div>
            <div className="num text-sm">
              <span className="text-muted-foreground">Cash </span>{fmt(Number(data?.profile?.virtual_balance ?? 0))}
            </div>
          </header>
          <main className="flex-1 p-4 md:p-6"><Outlet /></main>
        </div>
      </div>
      {data?.profile?.must_change_password && <ForceChange />}
    </div>
  );
}

function ForceChange() {
  const [pw, setPw] = useState("");
  const qc = useQueryClient();
  async function save() {
    if (pw.length < 8) return toast.error("At least 8 characters");
    const { error } = await supabase.auth.updateUser({ password: pw });
    if (error) return toast.error(error.message);
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
