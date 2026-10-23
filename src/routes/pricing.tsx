import { createFileRoute, Link } from "@tanstack/react-router";
import { Check } from "lucide-react";
import { PageHero, SiteFooter, SiteHeader } from "@/components/site/SiteChrome";
import { Button } from "@/components/ui/button";
import { BRAND } from "@/lib/brand";

export const Route = createFileRoute("/pricing")({
  head: () => ({
    meta: [
      { title: `Pricing — ${BRAND.name} ${BRAND.suffix}` },
      { name: "description", content: "Illustrative commission schedule for the platform." },
      { property: "og:title", content: `Pricing — ${BRAND.name}` },
      { property: "og:description", content: "Illustrative commission schedule for the platform." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Pricing,
});

const TIERS = [
  { n: "Lite", p: "€0", d: "For new traders", f: ["Commission-free stocks & ETFs", "Standard workstation", "Email support"] },
  { n: "Pro", p: "€0.005/sh", d: "For active traders", f: ["Tiered per-share pricing", "Depth, time & sales", "Advanced order types"], hl: true },
  { n: "Institutional", p: "Custom", d: "For firms", f: ["Volume pricing", "Multi-account admin", "Dedicated coverage"] },
];

function Pricing() {
  return (
    <div className="min-h-screen bg-background">
      <SiteHeader />
      <PageHero eyebrow="Pricing · illustrative" title="Transparent, low-cost pricing" sub="Shown for illustration only. The platform charges nothing." />
      <section className="mx-auto grid max-w-7xl gap-6 px-6 py-14 md:grid-cols-3">
        {TIERS.map((t) => (
          <div key={t.n} className={`panel p-8 ${t.hl ? "ring-2 ring-primary" : ""}`}>
            <div className="text-sm font-semibold text-primary">{t.n}</div>
            <div className="num mt-3 text-3xl">{t.p}</div>
            <div className="text-sm text-muted-foreground">{t.d}</div>
            <ul className="mt-6 space-y-2 text-sm">{t.f.map((x) => <li key={x} className="flex gap-2"><Check className="h-4 w-4 text-gain" />{x}</li>)}</ul>
            <Button asChild className="mt-8 w-full" variant={t.hl ? "default" : "outline"}><Link to="/auth" search={{ mode: "signup" }}>Try it now</Link></Button>
          </div>
        ))}
      </section>
      <section className="mx-auto max-w-7xl px-6 pb-16">
        <div className="panel overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-muted text-left text-xs text-muted-foreground"><tr><th className="px-4 py-3">Product</th><th>Lite</th><th>Pro</th><th className="pr-4">Institutional</th></tr></thead>
            <tbody className="num divide-y">
              {[["US stocks", "€0", "€0.005/sh, min €1", "Custom"], ["ETFs", "€0", "€0.005/sh", "Custom"], ["Forex", "Spread only", "0.2 bps", "Custom"], ["Crypto", "0.25%", "0.18%", "Custom"], ["Market data", "Included", "Included", "Included"]].map((r) => (
                <tr key={r[0]}>{r.map((c, i) => <td key={i} className={i === 0 ? "px-4 py-3 font-sans" : i === 3 ? "pr-4" : ""}>{c}</td>)}</tr>
              ))}
            </tbody>
          </table>
        </div>
        <p className="mt-3 text-xs text-muted-foreground">All figures are illustrative for this pilot and are not an offer of services.</p>
      </section>
      <SiteFooter />
    </div>
  );
}
