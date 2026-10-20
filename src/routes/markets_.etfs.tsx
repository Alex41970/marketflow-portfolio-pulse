import { createFileRoute } from "@tanstack/react-router";
import { MarketClassPage } from "@/components/site/MarketClassPage";
import { pageHead } from "@/components/site/Sections";

export const Route = createFileRoute("/markets_/etfs")({
  head: () => pageHead("ETFs", "Simulated ETFs quotes, trading hours and illustrative pricing.", "/markets/etfs"),
  component: () => <MarketClassPage cls="ETFs" />,
});
