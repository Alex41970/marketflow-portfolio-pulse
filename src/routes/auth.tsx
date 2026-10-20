import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { z } from "zod";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { Brand, DemoBanner } from "@/components/Brand";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export const Route = createFileRoute("/auth")({
  validateSearch: z.object({ mode: z.enum(["login", "signup", "forgot"]).optional() }),
  head: () => ({
    meta: [
      { title: "Sign in — Ledgerline Paper Trading" },
      { name: "description", content: "Log in or open a free practice trading account." },
      { property: "og:title", content: "Sign in — Ledgerline Paper Trading" },
      { property: "og:description", content: "Log in or open a free practice trading account." },
    ],
  }),
  component: AuthPage,
});

function AuthPage() {
  const search = Route.useSearch();
  const mode = search.mode ?? "login";
  const navigate = useNavigate();
  const [busy, setBusy] = useState(false);
  const [sent, setSent] = useState<string | null>(null);
  const [f, setF] = useState({ username: "", email: "", password: "" });

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    try {
      const fd = new FormData(e.currentTarget as HTMLFormElement);
      const email = String(fd.get("email") ?? f.email).trim();
      const password = String(fd.get("password") ?? f.password);
      if (mode === "signup") {
        if (!/^[a-zA-Z0-9_]{3,20}$/.test(f.username)) throw new Error("Username: 3–20 letters, numbers or _");
        const { error } = await supabase.auth.signUp({
          email,
          password,
          options: { emailRedirectTo: window.location.origin + "/dashboard", data: { username: f.username } },
        });
        if (error) throw error;
        setSent("Check your email to confirm your account, then log in.");
      } else if (mode === "forgot") {
        const { error } = await supabase.auth.resetPasswordForEmail(email, {
          redirectTo: window.location.origin + "/reset-password",
        });
        if (error) throw error;
        setSent("If that email has an account, a reset link is on its way.");
      } else {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
        navigate({ to: "/dashboard" });
      }
    } catch (err) {
      toast.error((err as Error).message);
    } finally {
      setBusy(false);
    }
  }

  const title = mode === "signup" ? "Open a practice account" : mode === "forgot" ? "Reset your password" : "Log in";

  return (
    <div className="flex min-h-screen flex-col">
      <DemoBanner />
      <div className="grid flex-1 md:grid-cols-2">
        <div className="hidden bg-hero p-10 text-navy-foreground md:flex md:flex-col md:justify-between">
          <Link to="/"><Brand /></Link>
          <p className="max-w-sm text-2xl font-medium leading-snug">$100,000 in virtual capital is waiting. Practice without consequences.</p>
          <p className="text-xs text-navy-muted">Educational simulator · not a brokerage</p>
        </div>
        <div className="flex items-center justify-center p-6">
          <div className="w-full max-w-sm">
            <Link to="/" className="md:hidden"><Brand /></Link>
            <h1 className="mt-6 text-2xl font-semibold">{title}</h1>
            {sent ? (
              <p className="mt-6 rounded-md bg-accent p-4 text-sm text-accent-foreground">{sent}</p>
            ) : (
              <form onSubmit={submit} className="mt-6 space-y-4">
                {mode === "signup" && (
                  <div className="space-y-1.5">
                    <Label htmlFor="u">Username</Label>
                    <Input id="u" name="username" autoComplete="username" required value={f.username} onChange={(e) => setF({ ...f, username: e.target.value })} />
                  </div>
                )}
                <div className="space-y-1.5">
                  <Label htmlFor="e">Email</Label>
                  <Input id="e" name="email" type="email" autoComplete="email" required value={f.email} onChange={(e) => setF({ ...f, email: e.target.value })} />
                </div>
                {mode !== "forgot" && (
                  <div className="space-y-1.5">
                    <Label htmlFor="p">Password</Label>
                    <Input id="p" name="password" type="password" autoComplete={mode === "signup" ? "new-password" : "current-password"} required minLength={8} value={f.password} onChange={(e) => setF({ ...f, password: e.target.value })} />
                  </div>
                )}
                <Button type="submit" className="w-full" disabled={busy}>
                  {busy ? "Please wait…" : mode === "signup" ? "Create account" : mode === "forgot" ? "Send reset link" : "Log in"}
                </Button>
              </form>
            )}
            <div className="mt-6 space-y-2 text-sm text-muted-foreground">
              {mode !== "login" && <p>Have an account? <Link to="/auth" search={{ mode: "login" }} className="text-primary">Log in</Link></p>}
              {mode !== "signup" && <p>New here? <Link to="/auth" search={{ mode: "signup" }} className="text-primary">Open a practice account</Link></p>}
              {mode === "login" && <p><Link to="/auth" search={{ mode: "forgot" }} className="text-primary">Forgot password?</Link></p>}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
