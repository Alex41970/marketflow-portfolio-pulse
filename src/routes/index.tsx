import { createFileRoute, Link } from "@tanstack/react-router";
import { Brand, DemoBanner } from "@/components/Brand";
import { Button } from "@/components/ui/button";
import { LineChart, ShieldCheck, Trophy } from "lucide-react";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Ledgerline Paper Trading — Practice trading with virtual money" },
      { name: "description", content: "Learn to trade risk-free with a $100,000 virtual account, simulated markets and a pro-grade dashboard." },
      { property: "og:title", content: "Ledgerline Paper Trading" },
      { property: "og:description", content: "Practice trading risk-free with a $100,000 virtual account." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Index,
});

function Index() {
  return (
    <div className="min-h-screen">
      <DemoBanner />
      <header className="bg-hero text-navy-foreground">
        <nav className="mx-auto flex max-w-6xl items-center justify-between px-6 py-5">
          <Brand />
          <div className="flex gap-2">
            <Button asChild variant="ghost" className="text-navy-foreground hover:bg-navy-accent hover:text-navy-foreground">
              <Link to="/auth">Log in</Link>
            </Button>
            <Button asChild><Link to="/auth" search={{ mode: "signup" }}>Open practice account</Link></Button>
          </div>
        </nav>
        <section className="mx-auto max-w-6xl px-6 pb-24 pt-16">
          <p className="num text-xs uppercase tracking-[0.2em] text-navy-muted">Simulated markets · Virtual capital</p>
          <h1 className="mt-4 max-w-3xl text-4xl font-semibold leading-tight md:text-6xl">
            Trade like a professional.<br />Risk nothing.
          </h1>
          <p className="mt-6 max-w-xl text-lg text-navy-muted">
            Start with $100,000 in virtual funds. Build a portfolio, test strategies and track every trade on a desk-grade dashboard.
          </p>
          <div className="mt-8 flex gap-3">
            <Button asChild size="lg"><Link to="/auth" search={{ mode: "signup" }}>Get started free</Link></Button>
          </div>
        </section>
      </header>
      <section className="mx-auto grid max-w-6xl gap-6 px-6 py-16 md:grid-cols-3">
        {[
          { icon: LineChart, t: "Live simulated prices", d: "Watchlists and charts that move every few seconds." },
          { icon: ShieldCheck, t: "Zero real risk", d: "Every dollar is virtual. Nothing is ever deposited or withdrawn." },
          { icon: Trophy, t: "Track your progress", d: "Portfolio value, profit and loss, and full trade history." },
        ].map(({ icon: I, t, d }) => (
          <div key={t} className="panel p-6">
            <I className="h-6 w-6 text-primary" />
            <h3 className="mt-4 font-semibold">{t}</h3>
            <p className="mt-1 text-sm text-muted-foreground">{d}</p>
          </div>
        ))}
      </section>
      <footer className="border-t py-8 text-center text-xs text-muted-foreground">
        Ledgerline Paper Trading is an educational simulator. It is not a broker and offers no investment services.
      </footer>
    </div>
  );
}
