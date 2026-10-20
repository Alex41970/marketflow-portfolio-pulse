import { createFileRoute } from "@tanstack/react-router";
import { Activity, Layers, LineChart, ListOrdered, Newspaper, Table2 } from "lucide-react";
import { ContentPage, FeatureGrid, Section, Split, MockPanel, pageHead } from "@/components/site/Sections";
import { LazyChart } from "@/components/ws/LazyChart";
import { useQuotes, quoteOf } from "@/lib/market";

export const Route = createFileRoute("/platform_/workstation")({
  head: () => pageHead("Workstation", "Tour the multi-panel trading workstation: watchlists, charts, order ticket, depth and blotter.", "/platform/workstation"),
  component: Page,
});

function Page() {
  const q = quoteOf(useQuotes(), "QNTM");
  return (
    <ContentPage eyebrow="Platform · Workstation" title="A desk-grade workstation in your browser" sub="Every panel a professional trader expects, arranged for speed and updating live with simulated data." crumbs={["Platform", "Workstation"]}>
      <Section>
        <div className="dark rounded-lg border bg-background p-3 text-foreground shadow-2xl"><LazyChart symbol="QNTM" range="5D" price={q.price} height={400} /></div>
      </Section>
      <Section title="Panel by panel" muted>
        <FeatureGrid items={[
          { icon: Table2, title: "Watchlists", body: "Tabbed by asset class, with sparklines and green/red price flashes on every tick." },
          { icon: LineChart, title: "Candlestick charts", body: "1D, 5D, 1M, 6M and 1Y ranges with volume bars and a 20-period moving average." },
          { icon: ListOrdered, title: "Order ticket", body: "Buy/sell toggle, market or limit, quantity steps, estimated cost and a confirm step." },
          { icon: Layers, title: "Depth (Level 2)", body: "Eight levels of simulated bids and asks with size bars and the live spread." },
          { icon: Activity, title: "Time & sales", body: "A rolling tape of simulated prints showing price, size and direction." },
          { icon: Newspaper, title: "News", body: "Simulated headlines that follow the instrument you're viewing." },
        ]} />
      </Section>
      <Section>
        <Split title="The blotter keeps you in control" body="Tabs along the bottom show open positions with live P&L, working limit orders you can cancel, recent trades and a full account summary." visual={<MockPanel title="Positions (sample)" rows={[["NOVA · 50", "+$412.50"], ["WLD500 · 20", "+$188.20"], ["EUR.USD · 10,000", "−$34.00"], ["BTC.SIM · 0.4", "+$1,096.00"]]} />} />
        <Split reverse title="Top bar metrics" body="Net liquidation, day P&L, buying power and cash are always visible, alongside your account ID and a live clock." visual={<MockPanel title="Top bar (sample)" rows={[["Net liq.", "$103,920.15"], ["Day P&L", "+$662.70"], ["Buying power", "$158,410.00"], ["Cash", "$79,205.00"]]} />} />
      </Section>
    </ContentPage>
  );
}
