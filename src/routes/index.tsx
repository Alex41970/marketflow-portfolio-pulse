import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowRight, BarChart3, BookOpen, Check, Gauge, ShieldCheck, Smartphone } from "lucide-react";
import { SiteFooter, SiteHeader } from "@/components/site/SiteChrome";
import { MarketsTable } from "@/components/site/MarketsTable";
import { LazyChart } from "@/components/ws/LazyChart";
import { Button } from "@/components/ui/button";
import { SimTag } from "@/components/Brand";
import { BRAND } from "@/lib/brand";
import { useQuotes, quoteOf, fmtP, pct, signed } from "@/lib/market";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: `${BRAND.name} ${BRAND.suffix} — Professional trading simulator` },
      { name: "description", content: "A professional-grade trading workstation with simulated markets and virtual capital." },
      { property: "og:title", content: `${BRAND.name} ${BRAND.suffix}` },
      { property: "og:description", content: "Professional trading workstation with simulated markets and virtual capital." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Index,
});

function HeroWidget() {
  const q = quoteOf(useQuotes(), "NOVA");
  const c = pct(q.price, q.open);
  return (
    <div className="dark rounded-lg border border-sidebar-border bg-background p-2 text-foreground shadow-2xl">
      <div className="flex items-center gap-1.5 px-2 pb-2">
        <span className="h-2.5 w-2.5 rounded-full bg-loss" /><span className="h-2.5 w-2.5 rounded-full bg-warning" /><span className="h-2.5 w-2.5 rounded-full bg-gain" />
        <span className="ml-3 text-[11px] text-muted-foreground">{BRAND.name} Workstation</span>
      </div>
      <div className="ws-panel p-3">
        <div className="flex items-baseline justify-between">
          <div><span className="font-semibold">NOVA</span> <span className="text-xs text-muted-foreground">Nova Robotics</span></div>
          <SimTag />
        </div>
        <div className="num mt-1 flex items-baseline gap-3"><span className="text-2xl">{fmtP(q.price)}</span><span className={c >= 0 ? "text-gain" : "text-loss"}>{signed(c)}%</span></div>
        <LazyChart symbol="NOVA" range="1M" price={q.price} height={240} />
      </div>
    </div>
  );
}

function Index() {
  return (
    <div className="min-h-screen bg-background">
      <SiteHeader />
      <section className="bg-hero text-navy-foreground">
        <div className="mx-auto grid max-w-7xl items-center gap-12 px-6 py-20 lg:grid-cols-[1.05fr_1fr]">
          <div>
            <p className="num text-xs uppercase tracking-[0.2em] text-navy-muted">Simulated global markets</p>
            <h1 className="mt-4 text-4xl font-semibold leading-[1.1] md:text-6xl">The professional's trading desk. Without the risk.</h1>
            <p className="mt-6 max-w-xl text-lg text-navy-muted">Trade stocks, ETFs, forex and crypto on a workstation built like the ones institutions use, with virtual capital.</p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Button asChild size="lg"><Link to="/auth" search={{ mode: "signup" }}>Open demo account <ArrowRight className="ml-1 h-4 w-4" /></Link></Button>
              <Button asChild size="lg" variant="outline" className="border-navy-muted bg-transparent text-navy-foreground hover:bg-navy-accent hover:text-navy-foreground"><Link to="/platform">Explore the platform</Link></Button>
            </div>
            <ul className="mt-8 grid gap-2 text-sm text-navy-muted sm:grid-cols-2">
              {["Live simulated quotes", "Candlestick charts and depth", "Market and limit orders", "Full portfolio analytics"].map((x) => <li key={x} className="flex items-center gap-2"><Check className="h-4 w-4 text-primary" />{x}</li>)}
            </ul>
          </div>
          <HeroWidget />
        </div>
      </section>

      <section className="border-b bg-card">
        <div className="mx-auto grid max-w-7xl grid-cols-2 divide-x px-6 md:grid-cols-4">
          {[["24", "Simulated instruments"], ["4", "Asset classes"], ["24/7", "Client portal"], ["0", "Real money at risk"]].map(([n, l]) => (
            <div key={l} className="px-6 py-8 text-center"><div className="num text-3xl font-medium text-primary">{n}</div><div className="mt-1 text-sm text-muted-foreground">{l}</div></div>
          ))}
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-6 py-20">
        <div className="mb-6 flex items-end justify-between">
          <div><h2 className="text-3xl font-semibold">Markets at a glance</h2><p className="mt-2 text-muted-foreground">Quotes refresh every 1.5 seconds. All prices are simulated.</p></div>
          <Link to="/markets" className="hidden text-sm font-medium text-primary md:block">View all markets →</Link>
        </div>
        <MarketsTable />
      </section>

      <section className="bg-card py-20">
        <div className="mx-auto grid max-w-7xl gap-6 px-6 md:grid-cols-2 lg:grid-cols-4">
          {[
            { i: Gauge, t: "Pro workstation", d: "Multi-panel layout with watchlists, charts, order ticket, depth and time & sales." },
            { i: BarChart3, t: "Portfolio analytics", d: "Allocation, unrealized P&L and account summary, updated live." },
            { i: ShieldCheck, t: "Risk-free practice", d: "Every dollar is virtual. Nothing is deposited, withdrawn or invested." },
            { i: Smartphone, t: "Works on any device", d: "A layout that adapts from a trading desk monitor to a phone." },
          ].map(({ i: I, t, d }) => (
            <div key={t} className="rounded-lg border p-6 transition-colors hover:border-primary">
              <I className="h-6 w-6 text-primary" /><h3 className="mt-4 font-semibold">{t}</h3><p className="mt-2 text-sm text-muted-foreground">{d}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="mx-auto grid max-w-7xl items-center gap-12 px-6 py-20 md:grid-cols-2">
        <div>
          <BookOpen className="h-7 w-7 text-primary" />
          <h2 className="mt-4 text-3xl font-semibold">Learn by doing</h2>
          <p className="mt-3 text-muted-foreground">Place orders, watch limit orders fill as prices move, and review every trade in your history. It's the fastest way to understand how a professional platform works.</p>
          <Button asChild className="mt-6"><Link to="/auth" search={{ mode: "signup" }}>Start practising</Link></Button>
        </div>
        <div className="panel p-6">
          <div className="text-sm font-semibold">Illustrative pricing</div>
          <table className="mt-4 w-full text-sm">
            <tbody className="divide-y">
              {[["Stocks & ETFs", "$0.005 / share (sim)"], ["Forex", "0.2 bps (sim)"], ["Crypto", "0.18% (sim)"], ["Account minimum", "$0"]].map(([a, b]) => (
                <tr key={a}><td className="py-3 text-muted-foreground">{a}</td><td className="num py-3 text-right">{b}</td></tr>
              ))}
            </tbody>
          </table>
          <p className="mt-3 text-xs text-muted-foreground">Demo only. No fees are charged in this simulator.</p>
        </div>
      </section>
      <SiteFooter />
    </div>
  );
}
