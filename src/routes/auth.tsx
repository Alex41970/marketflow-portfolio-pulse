import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { z } from "zod";
import { toast } from "sonner";
import { Building2, Eye, EyeOff, UserRound } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { Brand } from "@/components/Brand";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { registrationSchema, registrationMetadata } from "@/lib/registration";

export const Route = createFileRoute("/auth")({
  validateSearch: z.object({ mode: z.enum(["login", "signup", "forgot"]).optional() }),
  head: ({ match }) => {
    const title = `${match.search.mode === "signup" ? "Open an account" : match.search.mode === "forgot" ? "Reset password" : "Sign in"} — Ledgerline Markets`;
    const description = "Secure access and registration for your Ledgerline Markets euro client account.";
    return { meta: [{ title }, { name: "description", content: description }, { property: "og:title", content: title }, { property: "og:description", content: description }, { property: "og:type", content: "website" }, { name: "twitter:card", content: "summary_large_image" }] };
  },
  component: AuthPage,
});

const CODES = [
  ["+44", "United Kingdom"], ["+353", "Ireland"], ["+49", "Germany"], ["+33", "France"], ["+34", "Spain"], ["+39", "Italy"], ["+31", "Netherlands"], ["+32", "Belgium"], ["+43", "Austria"], ["+41", "Switzerland"], ["+351", "Portugal"], ["+30", "Greece"], ["+48", "Poland"], ["+46", "Sweden"], ["+45", "Denmark"], ["+47", "Norway"], ["+358", "Finland"], ["+40", "Romania"], ["+420", "Czechia"], ["+36", "Hungary"], ["+359", "Bulgaria"], ["+385", "Croatia"], ["+357", "Cyprus"], ["+356", "Malta"], ["+352", "Luxembourg"], ["+370", "Lithuania"], ["+371", "Latvia"], ["+372", "Estonia"], ["+386", "Slovenia"], ["+421", "Slovakia"], ["+1", "United States / Canada"], ["+90", "Türkiye"], ["+971", "United Arab Emirates"], ["+91", "India"], ["+61", "Australia"], ["+65", "Singapore"], ["+27", "South Africa"], ["+234", "Nigeria"], ["+92", "Pakistan"], ["+880", "Bangladesh"], ["+966", "Saudi Arabia"], ["+86", "China"], ["+81", "Japan"], ["+55", "Brazil"], ["+52", "Mexico"], ["+64", "New Zealand"], ["+20", "Egypt"], ["+972", "Israel"], ["+63", "Philippines"], ["+62", "Indonesia"],
];

function AuthPage() {
  const { mode = "login" } = Route.useSearch();
  const navigate = useNavigate();
  const [busy, setBusy] = useState(false);
  const [sent, setSent] = useState<string | null>(null);
  const [accountType, setAccountType] = useState<"personal" | "business">("personal");
  const [callingCode, setCallingCode] = useState("+44");
  const [termsAccepted, setTermsAccepted] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const signup = mode === "signup";
  const changeMode = () => { setSent(null); setTermsAccepted(false); };

  async function submit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    const read = (key: string) => String(fd.get(key) ?? "");
    setBusy(true);
    try {
      const email = read("email").trim();
      const password = read("password");
      if (signup) {
        const parsed = registrationSchema.safeParse({ accountType, callingCode, termsAccepted, firstName: read("firstName"), lastName: read("lastName"), email, phone: read("phone"), password, confirmPassword: read("confirmPassword") });
        if (!parsed.success) throw new Error(parsed.error.issues[0]?.message ?? "Check your details");
        const { data, error } = await supabase.auth.signUp({ email, password, options: { emailRedirectTo: window.location.origin + "/auth", data: registrationMetadata(parsed.data) } });
        if (error) throw error;
        if (data.session) await navigate({ to: "/dashboard" });
        else setSent("Check your email to confirm your account, then log in.");
      } else if (mode === "forgot") {
        const { error } = await supabase.auth.resetPasswordForEmail(email, { redirectTo: window.location.origin + "/reset-password" });
        if (error) throw error;
        setSent("If that email has an account, a reset link is on its way.");
      } else {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
        await navigate({ to: "/dashboard" });
      }
    } catch (error) { toast.error(error instanceof Error ? error.message : "Please try again"); }
    finally { setBusy(false); }
  }

  const passwordField = (confirm = false) => {
    const show = confirm ? showConfirm : showPassword;
    return <div className="space-y-1.5">
      <Label htmlFor={confirm ? "confirmPassword" : "password"}>{confirm ? "Confirm password" : signup ? "Password (min. 8 characters)" : "Password"}</Label>
      <div className="relative">
        <Input id={confirm ? "confirmPassword" : "password"} name={confirm ? "confirmPassword" : "password"} type={show ? "text" : "password"} autoComplete={signup ? "new-password" : "current-password"} required minLength={8} className="pr-11" />
        <Button type="button" size="icon" variant="ghost" className="absolute right-0 top-0 h-9 w-9" title={show ? "Hide password" : "Show password"} aria-label={`${show ? "Hide" : "Show"} ${confirm ? "confirm password" : "password"}`} onClick={() => confirm ? setShowConfirm(!show) : setShowPassword(!show)}>{show ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}</Button>
      </div>
    </div>;
  };

  return <div className="grid min-h-screen md:grid-cols-[0.85fr_1.15fr]">
    <div className="hidden bg-hero p-10 text-navy-foreground md:flex md:flex-col md:justify-between">
      <Link to="/"><Brand /></Link>
      <div><p className="max-w-sm text-3xl font-medium leading-snug">Your account.<br />A clearer view.</p><p className="mt-5 text-sm text-navy-muted">Ledgerline Markets · EUR client accounts</p></div>
      <p className="text-xs text-navy-muted">Secure client portal</p>
    </div>
    <div className="flex items-center justify-center px-6 py-10">
      <div className={`w-full ${signup ? "max-w-lg" : "max-w-sm"}`}>
        <Link to="/" className="md:hidden"><Brand /></Link>
        <h1 className="mt-6 text-2xl font-semibold">{signup ? "Open an account" : mode === "forgot" ? "Reset your password" : "Log in"}</h1>
        {sent ? <p role="status" className="mt-6 rounded-md bg-accent p-4 text-sm text-accent-foreground">{sent}</p> :
          <form key={mode} onSubmit={submit} className="mt-6 space-y-5">
            {signup && <>
              <div className="space-y-2"><Label>Account type</Label><div className="grid grid-cols-2 gap-2" role="group" aria-label="Account type">
                {(["personal", "business"] as const).map((type) => <Button key={type} type="button" variant={accountType === type ? "default" : "outline"} aria-pressed={accountType === type} onClick={() => setAccountType(type)}>{type === "personal" ? <UserRound className="mr-2 h-4 w-4" /> : <Building2 className="mr-2 h-4 w-4" />}{type === "personal" ? "Personal" : "Business"}</Button>)}
              </div></div>
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-1.5"><Label htmlFor="firstName">First name</Label><Input id="firstName" name="firstName" autoComplete="given-name" required maxLength={100} /></div>
                <div className="space-y-1.5"><Label htmlFor="lastName">Last name</Label><Input id="lastName" name="lastName" autoComplete="family-name" required maxLength={100} /></div>
              </div>
            </>}
            <div className="space-y-1.5"><Label htmlFor="email">Email address</Label><Input id="email" name="email" type="email" autoComplete="email" required /></div>
            {signup && <div className="space-y-1.5"><Label htmlFor="phone">Phone number</Label><div className="grid grid-cols-[115px_minmax(0,1fr)] gap-2">
              <Select value={callingCode} onValueChange={setCallingCode}><SelectTrigger aria-label="Country calling code"><SelectValue /></SelectTrigger><SelectContent>{CODES.map(([code, country]) => <SelectItem key={code} value={code} textValue={code}>{country} ({code})</SelectItem>)}</SelectContent></Select>
              <Input id="phone" name="phone" type="tel" autoComplete="tel-national" placeholder="Phone number" required />
            </div></div>}
            {mode !== "forgot" && passwordField()}
            {signup && passwordField(true)}
            {signup && <div className="flex items-start gap-3"><Checkbox id="terms" checked={termsAccepted} onCheckedChange={(v) => setTermsAccepted(v === true)} required className="mt-0.5" /><Label htmlFor="terms" className="block text-sm font-normal leading-relaxed">I agree to the <Link to="/terms" target="_blank" className="text-primary underline">Terms and Conditions</Link> and <Link to="/privacy" target="_blank" className="text-primary underline">Privacy Notice</Link>.</Label></div>}
            <Button type="submit" className="w-full" disabled={busy}>{busy ? "Please wait…" : signup ? "Create account" : mode === "forgot" ? "Send reset link" : "Log in"}</Button>
          </form>}
        <div className="mt-6 space-y-2 text-sm text-muted-foreground">
          {mode !== "login" && <p>Have an account? <Link to="/auth" search={{ mode: "login" }} onClick={changeMode} className="text-primary">Log in</Link></p>}
          {!signup && <p>New here? <Link to="/auth" search={{ mode: "signup" }} onClick={changeMode} className="text-primary">Open an account</Link></p>}
          {mode === "login" && <p><Link to="/auth" search={{ mode: "forgot" }} onClick={changeMode} className="text-primary">Forgot password?</Link></p>}
        </div>
      </div>
    </div>
  </div>;
}
