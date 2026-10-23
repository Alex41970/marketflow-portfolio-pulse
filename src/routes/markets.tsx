import { createFileRoute } from "@tanstack/react-router";
import { PageHero, SiteFooter, SiteHeader } from "@/components/site/SiteChrome";
import { MarketsTable } from "@/components/site/MarketsTable";
import { BRAND } from "@/lib/brand";

export const Route = createFileRoute("/markets")({
  head: () => ({
    meta: [
      { title: `Markets — ${BRAND.name} ${BRAND.suffix}` },
      { name: "description", content: "Indicative quotes across stocks, ETFs, forex and crypto." },
      { property: "og:title", content: `Markets — ${BRAND.name}` },
      { property: "og:description", content: "Indicative quotes across stocks, ETFs, forex and crypto." },
    ],
  }),
  component: () => (
    <div className="min-h-screen bg-background">
      <SiteHeader />
      <PageHero eyebrow="Markets" title="Four asset classes. One workstation." sub="Explore indicative quotes across stocks, index funds, currency pairs and digital assets." />
      <section className="mx-auto max-w-7xl px-6 py-14"><MarketsTable /></section>
      <SiteFooter />
    </div>
  ),
});
