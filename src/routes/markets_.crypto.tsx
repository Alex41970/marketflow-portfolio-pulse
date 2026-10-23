import { createFileRoute } from "@tanstack/react-router";
import { MarketClassPage } from "@/components/site/MarketClassPage";
import { pageHead } from "@/components/site/Sections";

export const Route = createFileRoute("/markets_/crypto")({
  head: () => pageHead("Crypto", "Indicative Crypto quotes, trading hours and illustrative pricing.", "/markets/crypto"),
  component: () => <MarketClassPage cls="Crypto" />,
});
