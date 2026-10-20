import { createFileRoute } from "@tanstack/react-router";
import { MarketClassPage } from "@/components/site/MarketClassPage";
import { pageHead } from "@/components/site/Sections";

export const Route = createFileRoute("/markets_/forex")({
  head: () => pageHead("Forex", "Simulated Forex quotes, trading hours and illustrative pricing.", "/markets/forex"),
  component: () => <MarketClassPage cls="FX" />,
});
