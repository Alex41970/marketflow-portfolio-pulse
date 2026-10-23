import { useState } from "react";
import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { ChevronRight, LineChart, Star } from "lucide-react";
import { toast } from "sonner";
import { SiteFooter, SiteHeader } from "@/components/site/SiteChrome";
import { MarketsTable, CLASS_ROUTE } from "@/components/site/MarketsTable";
import { MARKET_INFO } from "@/components/site/MarketClassPage";
import { LazyChart } from "@/components/ws/LazyChart";
import { SimTag } from "@/components/Brand";
import { Button } from "@/components/ui/button";
import { BRAND } from "@/lib/brand";
import { RANGES, TICKERS, useQuotes, quoteOf, fmtP, pct, signed, dpOf, type Range } from "@/lib/market";

export const Route = createFileRoute("/markets_/quote/$symbol")({
  loader: ({ params }) => {
    const t = TICKERS.find((x) => x.symbol === params.symbol);
    if (!t) throw notFound();
    return { symbol: t.symbol, name: t.name, cls: t.cls };
  },
  head: ({ loaderData }) => {
    const title = loaderData ? `${loaderData.symbol} — ${loaderData.name} — ${BRAND.name}` : `Instrument unavailable — ${BRAND.name}`;
    const desc = loaderData ? `Indicative quote, chart and stats for ${loaderData.symbol}.` : "This instrument could not be found.";
    return {
      meta: [
        { title },
        { name: "description", content: desc },
        { property: "og:title", content: title },
        { property: "og:description", content: desc },
        { property: "og:type", content: "website" },
        { name: "twitter:card", content: "summary" },
        ...(loaderData ? [] : [{ name: "robots", content: "noindex" }]),
      ],
    };
  },
  notFoundComponent: () => (
    <div className="min-h-screen bg-background">
      <SiteHeader />
      <div className="mx-auto max-w-3xl px-6 py-24 text-center">
        <h1 className="text-3xl font-semibold">Instrument not found</h1>
        <p className="mt-3 text-muted-foreground">That symbol isn't part of the platform.</p>
        <Button asChild className="mt-6"><Link to="/markets">Back to Markets</Link></Button>
      </div>
      <SiteFooter />
    </div>
  ),
  component: Quote,
});

function Quote() {
  const { symbol, name, cls } = Route.useLoaderData();
  const [range, setRange] = useState<Range>("1M");
  const x = quoteOf(useQuotes(), symbol);
  const dp = dpOf(symbol);
  const d = x.price - x.open;
  const spread = x.price * 0.0002;
  const up = d >= 0;
  const stats: [string, string][] = [
    ["Open", fmtP(x.open, dp)], ["Previous close", fmtP(x.prev, dp)],
    ["Day high", fmtP(x.high, dp)], ["Day low", fmtP(x.low, dp)],
    ["Bid (indicative)", fmtP(x.price - spread, dp)], ["Ask (indicative)", fmtP(x.price + spread, dp)],
    ["Volume (indicative)", Math.round(x.volume).toLocaleString("en-US")], ["Asset class", cls],
  ];
  return (
    <div className="min-h-screen bg-background">
      <SiteHeader />
      <section className="bg-hero text-navy-foreground">
        <div className="mx-auto max-w-7xl px-6 py-12">
          <div className="mb-6 flex items-center gap-1 text-xs text-navy-muted">
            <Link to="/" className="hover:text-navy-foreground">Home</Link><ChevronRight className="h-3 w-3" />
            <Link to="/markets" className="hover:text-navy-foreground">Markets</Link><ChevronRight className="h-3 w-3" />
            <Link to={CLASS_ROUTE[cls]} className="hover:text-navy-foreground">{cls}</Link><ChevronRight className="h-3 w-3" />
            <span>{symbol}</span>
          </div>
          <div className="flex flex-wrap items-end justify-between gap-6">
            <div>
              <p className="num text-xs uppercase tracking-[0.2em] text-navy-muted">{cls} · indicative instrument</p>
              <h1 className="mt-2 text-4xl font-semibold md:text-5xl">{symbol}</h1>
              <p className="mt-1 text-lg text-navy-muted">{name}</p>
            </div>
            <div className="text-right">
              <div key={x.seq} className="num text-4xl font-semibold">{fmtP(x.price, dp)}</div>
              <div className={`num mt-1 text-lg ${up ? "text-gain" : "text-loss"}`}>{signed(d, dp)} ({signed(pct(x.price, x.open))}%)</div>
              <p className="mt-1 text-xs text-navy-muted">Indicative price</p>
            </div>
          </div>
        </div>
      </section>

      <section className="mx-auto grid max-w-7xl gap-8 px-6 py-10 lg:grid-cols-[1fr_320px]">
        <div className="panel p-4">
          <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
            <div className="flex gap-1">
              {(Object.keys(RANGES) as Range[]).map((r) => (
                <Button key={r} size="sm" variant={r === range ? "default" : "ghost"} onClick={() => setRange(r)}>{r}</Button>
              ))}
            </div>
            <SimTag />
          </div>
          <LazyChart key={range} symbol={symbol} range={range} price={x.price} height={380} />
        </div>
        <aside className="space-y-4">
          <div className="panel p-4">
            <h2 className="mb-3 font-semibold">Key stats</h2>
            <dl className="num divide-y text-sm">
              {stats.map(([k, v]) => (
                <div key={k} className="flex justify-between py-2"><dt className="font-sans text-muted-foreground">{k}</dt><dd>{v}</dd></div>
              ))}
            </dl>
          </div>
          <div className="panel space-y-2 p-4">
            <Button asChild className="w-full"><Link to="/dashboard"><LineChart className="mr-2 h-4 w-4" />Client portal</Link></Button>
            <Button variant="outline" className="w-full" onClick={() => toast.success(`${symbol} added to your watchlist`)}><Star className="mr-2 h-4 w-4" />Add to watchlist</Button>
            <p className="pt-1 text-xs text-muted-foreground">Trading takes place in MetaTrader 4 / 5. Use the client portal to view your balance and history.</p>
          </div>
        </aside>
      </section>

      <section className="mx-auto max-w-7xl px-6 pb-10">
        <h2 className="text-xl font-semibold">About {cls}</h2>
        <p className="mt-2 max-w-3xl leading-relaxed text-muted-foreground">{MARKET_INFO[cls].about}</p>
      </section>

      <section className="mx-auto max-w-7xl px-6 pb-20">
        <h2 className="mb-4 text-xl font-semibold">More {cls}</h2>
        <MarketsTable fixedClass={cls} exclude={symbol} />
      </section>
      <SiteFooter />
    </div>
  );
}
