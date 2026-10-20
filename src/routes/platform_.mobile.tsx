import { IMG } from "@/lib/images";
import { createFileRoute } from "@tanstack/react-router";
import { Bell, Fingerprint, LayoutGrid, Moon, Smartphone, Zap } from "lucide-react";
import { ContentPage, FeatureGrid, ImageCards, Photo, Section, Split, Testimonials, pageHead } from "@/components/site/Sections";
import { useQuotes, quoteOf, fmtP, pct, signed } from "@/lib/market";

export const Route = createFileRoute("/platform_/mobile")({
  head: () => pageHead("Mobile", "The trading workstation adapts to phones and tablets.", "/platform/mobile"),
  component: Page,
});

function Phone() {
  const q = useQuotes();
  const syms = ["NOVA", "LUMA", "WLD500", "EUR.USD", "BTC.SIM"];
  return (
    <div className="mx-auto w-64 rounded-[2.5rem] border-8 border-navy bg-navy shadow-2xl">
      <div className="dark overflow-hidden rounded-[2rem] bg-background text-foreground">
        <div className="px-4 pb-2 pt-6 text-xs text-muted-foreground">Watchlist · Simulated</div>
        {syms.map((s) => { const x = quoteOf(q, s); const c = pct(x.price, x.open); return (
          <div key={s} className="flex items-center justify-between border-t px-4 py-3 text-sm">
            <span className="font-semibold">{s}</span>
            <span className="num text-right"><div>{fmtP(x.price, s.includes(".") && !s.endsWith("SIM") ? 4 : 2)}</div><div className={`text-xs ${c >= 0 ? "text-gain" : "text-loss"}`}>{signed(c)}%</div></span>
          </div>); })}
        <div className="grid grid-cols-2 gap-2 p-4"><div className="rounded-md bg-gain py-2 text-center text-xs font-semibold text-primary-foreground">BUY</div><div className="rounded-md bg-loss py-2 text-center text-xs font-semibold text-primary-foreground">SELL</div></div>
      </div>
    </div>
  );
}

function Page() {
  return (
    <ContentPage image={IMG.mobileHand} eyebrow="Platform · Mobile" title="Your desk, in your pocket" sub="The same account, the same live simulated prices — reorganised for a phone or tablet." crumbs={["Platform", "Mobile"]}>
      <Section>
        <Split title="Designed for one hand" body="The workstation collapses into a compact navigation rail, stacks panels vertically and keeps the order ticket within thumb reach." bullets={["Watchlists with live price flashes", "Full order ticket with confirmation", "Positions, orders and activity on the go"]} visual={<Phone />} />
      </Section>
      <Section title="Mobile highlights" muted>
        <FeatureGrid items={[
          { icon: Smartphone, title: "Responsive layout", body: "Works in any modern mobile browser — nothing to install." },
          { icon: Zap, title: "Fast updates", body: "Quotes refresh every 1.5 seconds, just like on desktop." },
          { icon: Moon, title: "Dark mode", body: "Easy on the eyes for late-session practice." },
          { icon: LayoutGrid, title: "Same features", body: "Charts, depth, blotter and analytics are all available." },
          { icon: Bell, title: "Order toasts", body: "Instant confirmation when an order fills or is cancelled." },
          { icon: Fingerprint, title: "Secure sign-in", body: "Protected login with password reset by email." },
        ]} />
      </Section>
    <Section><Split reverse title="Trade from anywhere" body="Commuting, travelling or away from your desk — your watchlists, positions and order ticket go with you." visual={<Photo src={IMG.mobileHand} alt="Phone with trading chart" />} /></Section>
      <Section title="What users say" muted><Testimonials items={[["I check my demo portfolio on the train every morning. It's so smooth.", "Leah P.", "Learner"],["The mobile order ticket is clearer than most real apps I've used.", "Marco D.", "Active trader"],["Perfect for practising during lunch breaks.", "Hannah S.", "Student"]]} /></Section>
    </ContentPage>
  );
}
