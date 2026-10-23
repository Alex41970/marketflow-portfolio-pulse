import { createFileRoute } from "@tanstack/react-router";
import { MarketClassPage } from "@/components/site/MarketClassPage";
import { pageHead } from "@/components/site/Sections";

export const Route = createFileRoute("/markets_/stocks")({
  head: () => pageHead("Stocks", "Indicative Stocks quotes, trading hours and illustrative pricing.", "/markets/stocks"),
  component: () => <MarketClassPage cls="Stocks" />,
});
