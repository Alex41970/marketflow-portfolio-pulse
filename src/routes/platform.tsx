import { createFileRoute, Link } from "@tanstack/react-router";
import { Activity, Layers, LineChart, ListOrdered, Newspaper, PieChart } from "lucide-react";
import { PageHero, SiteFooter, SiteHeader } from "@/components/site/SiteChrome";
import { LazyChart } from "@/components/ws/LazyChart";
import { Button } from "@/components/ui/button";
import { BRAND } from "@/lib/brand";
import { useQuotes, quoteOf } from "@/lib/market";
import { IMG } from "@/lib/images";

export const Route = createFileRoute("/platform")({
  head: () => ({
    meta: [
      { title: `Platform — ${BRAND.name} ${BRAND.suffix}` },
      { name: "description", content: "Tour the multi-panel trading workstation: charts, depth, order ticket and analytics." },
      { property: "og:title", content: `Platform — ${BRAND.name}` },
      { property: "og:description", content: "Tour the multi-panel trading workstation." },
    ],
  }),
  component: Platform,
});

function Platform() {
  const q = quoteOf(useQuotes(), "LUMA");
  return (
    <div className="min-h-screen bg-background">
      <SiteHeader />
      <PageHero eyebrow="Workstation" title="Everything on one screen" sub="A desk-grade layout designed for speed and clarity, with every price simulated." />
      <section className="mx-auto grid max-w-7xl items-center gap-10 px-6 py-14 lg:grid-cols-2">
        <img src={IMG.traderDesk} alt="Illustrative trading desk with multiple screens" className="aspect-[4/3] w-full rounded-lg object-cover shadow-xl" loading="lazy" />
        <div>
          <p className="num text-xs uppercase tracking-[0.2em] text-primary">Live preview · LUMA (simulated)</p>
          <h2 className="mt-2 text-2xl font-semibold">Charts that update every tick</h2>
          <div className="mt-4 rounded-lg border bg-card p-3 shadow-sm">
            <LazyChart symbol="LUMA" range="6M" price={q.price} height={300} />
          </div>
        </div>
      </section>
      <section className="mx-auto grid max-w-7xl gap-8 px-6 pb-20 md:grid-cols-3">
        {[
          { i: LineChart, t: "Candlestick charts", d: "Five time ranges, volume and a moving-average overlay." },
          { i: Layers, t: "Market depth", d: "Simulated Level 2 bid/ask ladder updated with every tick." },
          { i: Activity, t: "Time & sales", d: "A live tape of simulated prints." },
          { i: ListOrdered, t: "Order management", d: "Market and limit orders with confirmation and a working-orders blotter." },
          { i: PieChart, t: "Portfolio analytics", d: "Allocation, P&L and account summary." },
          { i: Newspaper, t: "News feed", d: "Simulated headlines tied to each instrument." },
        ].map(({ i: I, t, d }) => (
          <div key={t}><I className="h-6 w-6 text-primary" /><h3 className="mt-3 font-semibold">{t}</h3><p className="mt-1 text-sm text-muted-foreground">{d}</p></div>
        ))}
      </section>
      <div className="pb-20 text-center"><Button asChild size="lg"><Link to="/auth" search={{ mode: "signup" }}>Launch the workstation</Link></Button></div>
      <SiteFooter />
    </div>
  );
}
