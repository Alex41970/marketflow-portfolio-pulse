import { createFileRoute } from "@tanstack/react-router";
import { PageHero, SiteFooter, SiteHeader } from "@/components/site/SiteChrome";
import { BRAND } from "@/lib/brand";

export const Route = createFileRoute("/about")({
  head: () => ({
    meta: [
      { title: `About — ${BRAND.name} ${BRAND.suffix}` },
      { name: "description", content: "About this trading simulator pilot." },
      { property: "og:title", content: `About — ${BRAND.name}` },
      { property: "og:description", content: "About this trading simulator pilot." },
    ],
  }),
  component: () => (
    <div className="min-h-screen bg-background">
      <SiteHeader />
      <PageHero eyebrow="About" title="Built to show what a modern trading platform can be" sub="This pilot demonstrates the look, speed and depth of a professional brokerage experience, using simulated data only." />
      <section className="mx-auto grid max-w-7xl gap-10 px-6 py-16 md:grid-cols-3">
        {[["Our approach", "Dense, legible interfaces built on a clear design system, so traders can find what matters in seconds."], ["Security first", "Account data is protected with row-level access rules, and every admin action is logged."], ["Demo only", BRAND.disclaimer]].map(([t, d]) => (
          <div key={t} className="panel p-6"><h3 className="font-semibold">{t}</h3><p className="mt-2 text-sm text-muted-foreground">{d}</p></div>
        ))}
      </section>
      <SiteFooter />
    </div>
  ),
});
