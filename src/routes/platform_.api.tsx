import { IMG } from "@/lib/images";
import { createFileRoute } from "@tanstack/react-router";
import { Code2, KeyRound, Radio, Webhook } from "lucide-react";
import { ContentPage, FeatureGrid, ImageCards, KeyValueTable, Photo, SampleNote, Section, Split, Testimonials, pageHead } from "@/components/site/Sections";

export const Route = createFileRoute("/platform_/api")({
  head: () => pageHead("API (indicative)", "Illustrative overview of a trading API for the platform.", "/platform/api"),
  component: Page,
});

const CODE = `// Illustrative only — not a live endpoint
const res = await fetch("https://api.example.com/v1/orders", {
  method: "POST",
  headers: { Authorization: "Bearer <token>" },
  body: JSON.stringify({
    symbol: "NOVA",
    side: "buy",
    type: "limit",
    quantity: 25,
    limit_price: 180.5,
  }),
});
const order = await res.json(); // { id, status: "working" }`;

const STREAM = `{ "type": "quote", "symbol": "EUR.USD",
  "bid": 1.0841, "ask": 1.0843, "ts": 1792540800 }`;

function Page() {
  return (
    <ContentPage image={IMG.marketsGlobe} eyebrow="Platform · API" title="Automate your strategies (indicative)" sub="A preview of how programmatic access could work. Endpoints shown here are illustrative and not live in the pilot." crumbs={["Platform", "API"]}>
      <Section title="Capabilities">
        <FeatureGrid cols={4} items={[
          { icon: Code2, title: "REST orders", body: "Place, modify and cancel indicative orders." },
          { icon: Radio, title: "Streaming quotes", body: "Subscribe to indicative quotes over a socket." },
          { icon: Webhook, title: "Webhooks", body: "Get notified when orders fill." },
          { icon: KeyRound, title: "Scoped keys", body: "Read-only or trading permissions per key." },
        ]} />
      </Section>
      <Section title="Example: place a limit order" muted>
        <pre className="dark overflow-x-auto rounded-lg border bg-background p-5 text-xs leading-relaxed text-foreground"><code className="num">{CODE}</code></pre>
        <h3 className="mb-3 mt-8 font-semibold">Example quote message</h3>
        <pre className="dark overflow-x-auto rounded-lg border bg-background p-5 text-xs text-foreground"><code className="num">{STREAM}</code></pre>
        <SampleNote>Indicative documentation. These endpoints don't exist in the pilot and no real orders can be placed.</SampleNote>
      </Section>
      <Section title="Endpoints (illustrative)">
        <KeyValueTable head={["Method", "Path", "Description"]} rows={[["GET", "/v1/account", "Balances and buying power"], ["GET", "/v1/positions", "Open positions"], ["POST", "/v1/orders", "Submit an order"], ["DELETE", "/v1/orders/:id", "Cancel a working order"], ["GET", "/v1/quotes/:symbol", "Latest indicative quote"]]} />
      </Section>
    <Section muted><Split title="Built for developers (roadmap)" body="In a production rollout, a documented API would let firms connect their own tools, dashboards and learning platforms to the platform." visual={<Photo src={IMG.teamOffice} alt="Engineering team at a whiteboard" />} /></Section>
    </ContentPage>
  );
}
