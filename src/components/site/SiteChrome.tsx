import { Link } from "@tanstack/react-router";
import { Globe, Menu, X } from "lucide-react";
import { useState } from "react";
import { Brand } from "@/components/Brand";
import { Button } from "@/components/ui/button";
import { BRAND } from "@/lib/brand";
import { TICKERS, useQuotes, quoteOf, fmtP, pct, signed, dpOf } from "@/lib/market";

const NAV = [
  { to: "/platform", label: "Platform" },
  { to: "/markets", label: "Markets" },
  { to: "/pricing", label: "Pricing" },
  { to: "/about", label: "About" },
] as const;

const SUBNAV: Partial<Record<string, readonly (readonly [string, "/platform/workstation" | "/platform/mobile" | "/platform/risk-tools" | "/platform/api" | "/markets/stocks" | "/markets/etfs" | "/markets/forex" | "/markets/crypto"])[]>> = {
  "/platform": [["Workstation", "/platform/workstation"], ["Mobile", "/platform/mobile"], ["Risk tools", "/platform/risk-tools"], ["API (sim)", "/platform/api"]],
  "/markets": [["Stocks", "/markets/stocks"], ["ETFs", "/markets/etfs"], ["Forex", "/markets/forex"], ["Crypto", "/markets/crypto"]],
};

export function SiteHeader() {
  const [open, setOpen] = useState(false);
  return (
    <header className="sticky top-0 z-30 bg-card">
      <div className="hidden border-b bg-navy text-navy-muted md:block">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-1.5 text-xs">
          <div className="flex gap-5">
            {([["Individuals", "/individuals"], ["Advisors", "/advisors"], ["Institutions", "/institutions"], ["Education", "/education"]] as const).map(([l, to]) => (
              <Link key={to} to={to} className="hover:text-navy-foreground" activeProps={{ className: "text-navy-foreground" }}>{l}</Link>
            ))}
          </div>
          <div className="flex items-center gap-4">
            <span className="inline-flex items-center gap-1"><Globe className="h-3 w-3" />English</span>
          </div>
        </div>
      </div>
      <div className="border-b">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-3">
          <div className="flex items-center gap-10">
            <Link to="/"><Brand /></Link>
            <nav className="hidden gap-7 text-sm font-medium md:flex">
              {NAV.map((n) => {
                const subs = SUBNAV[n.to];
                return (
                  <div key={n.to} className="group relative py-2">
                    <Link to={n.to} className="text-foreground/80 hover:text-primary" activeProps={{ className: "text-primary" }}>{n.label}</Link>
                    {subs && (
                      <div className="invisible absolute left-0 top-full z-40 min-w-52 rounded-md border bg-popover p-2 text-popover-foreground opacity-0 shadow-lg transition group-hover:visible group-hover:opacity-100 group-focus-within:visible group-focus-within:opacity-100">
                        <Link to={n.to} activeOptions={{ exact: true }} className="block rounded px-3 py-2 hover:bg-muted" activeProps={{ className: "text-primary" }}>{n.label} overview</Link>
                        {subs.map(([l, to]) => (
                          <Link key={to} to={to} className="block rounded px-3 py-2 hover:bg-muted" activeProps={{ className: "text-primary" }}>{l}</Link>
                        ))}
                      </div>
                    )}
                  </div>
                );
              })}
            </nav>
          </div>
          <div className="hidden items-center gap-2 md:flex">
            <Button asChild variant="ghost"><Link to="/auth">Log in</Link></Button>
            <Button asChild><Link to="/auth" search={{ mode: "signup" }}>Open an account</Link></Button>
          </div>
          <button className="md:hidden" onClick={() => setOpen(!open)} aria-label="Menu">{open ? <X /> : <Menu />}</button>
        </div>
        {open && (
          <div className="space-y-1 border-t px-6 py-3 md:hidden">
            {NAV.map((n) => <Link key={n.to} to={n.to} className="block py-2 text-sm">{n.label}</Link>)}
            <Link to="/auth" className="block py-2 text-sm text-primary">Log in</Link>
          </div>
        )}
      </div>
      <TickerTape />
    </header>
  );
}

export function TickerTape() {
  const q = useQuotes();
  const items = TICKERS.slice(0, 16);
  const row = items.map((t) => {
    const x = quoteOf(q, t.symbol);
    const c = pct(x.price, x.open);
    return (
      <span key={t.symbol} className="inline-flex items-center gap-2 px-5">
        <span className="font-sans font-semibold text-foreground">{t.symbol}</span>
        <span>{fmtP(x.price, dpOf(t.symbol))}</span>
        <span className={c >= 0 ? "text-gain" : "text-loss"}>{signed(c)}%</span>
      </span>
    );
  });
  return (
    <div className="overflow-hidden border-b bg-muted py-1.5 text-xs num text-muted-foreground">
      <div className="flex w-max animate-ticker whitespace-nowrap">{row}{row}</div>
    </div>
  );
}

export function SiteFooter() {
  const cols = {
    Platform: [["Workstation", "/platform/workstation"], ["Mobile", "/platform/mobile"], ["Risk tools", "/platform/risk-tools"], ["API (sim)", "/platform/api"]],
    Markets: [["Stocks", "/markets/stocks"], ["ETFs", "/markets/etfs"], ["Forex", "/markets/forex"], ["Crypto", "/markets/crypto"]],
    Company: [["About", "/about"], ["Careers", "/careers"], ["Press", "/press"], ["Contact", "/contact"]],
    Support: [["Help centre", "/help"], ["Education", "/education"], ["Status", "/status"], ["Security", "/security"]],
  } as const;
  return (
    <footer className="bg-navy text-navy-muted">
      <div className="mx-auto grid max-w-7xl gap-10 px-6 py-14 md:grid-cols-5">
        <div className="md:col-span-1"><Brand className="text-navy-foreground" /><p className="mt-4 text-xs leading-relaxed">{BRAND.tagline}.</p></div>
        {Object.entries(cols).map(([h, ls]) => (
          <div key={h}>
            <div className="text-sm font-semibold text-navy-foreground">{h}</div>
            <ul className="mt-3 space-y-2 text-sm">{ls.map(([l, to]) => <li key={l}><Link to={to} className="hover:text-navy-foreground">{l}</Link></li>)}</ul>
          </div>
        ))}
      </div>
      <div className="border-t border-sidebar-border">
        <div className="mx-auto max-w-7xl space-y-3 px-6 py-8 text-xs leading-relaxed">
          <p className="font-semibold text-navy-foreground">Important information</p>
          <p>{BRAND.disclaimer} Nothing on this site is an offer, solicitation or recommendation to buy or sell any security.</p>
          <p>Risk warning: trading involves substantial risk of loss. Past performance does not indicate future results.</p>
          <p>© {BRAND.name} {BRAND.suffix}. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
}

export function PageHero({ eyebrow, title, sub }: { eyebrow: string; title: string; sub: string }) {
  return (
    <section className="bg-hero text-navy-foreground">
      <div className="mx-auto max-w-7xl px-6 py-16">
        <p className="num text-xs uppercase tracking-[0.2em] text-navy-muted">{eyebrow}</p>
        <h1 className="mt-3 max-w-3xl text-4xl font-semibold md:text-5xl">{title}</h1>
        <p className="mt-4 max-w-2xl text-lg text-navy-muted">{sub}</p>
      </div>
    </section>
  );
}
