import { createFileRoute } from "@tanstack/react-router";
import { AlertTriangle, CheckCircle2, Gauge, Percent, ShieldCheck, Wallet } from "lucide-react";
import { ContentPage, FeatureGrid, KeyValueTable, Section, Split, MockPanel, pageHead } from "@/components/site/Sections";

export const Route = createFileRoute("/platform_/risk-tools")({
  head: () => pageHead("Risk tools", "Margin, buying power, position checks and order confirmations in the simulator.", "/platform/risk-tools"),
  component: Page,
});

function Page() {
  return (
    <ContentPage eyebrow="Platform · Risk tools" title="Understand risk before it matters" sub="Learn how professional platforms protect traders — with checks that run on every simulated order." crumbs={["Platform", "Risk tools"]}>
      <Section title="Built-in protections">
        <FeatureGrid items={[
          { icon: Wallet, title: "Cash checks", body: "A buy order can't exceed your available virtual cash. The check runs before and after you confirm." },
          { icon: ShieldCheck, title: "Position checks", body: "You can't sell more units than you hold. Short selling is disabled in the demo." },
          { icon: CheckCircle2, title: "Order confirmation", body: "Every order shows instrument, quantity, price and estimated total before it's sent." },
          { icon: Percent, title: "Margin view", body: "Illustrative initial and maintenance margin, excess liquidity and leverage on the Account page." },
          { icon: Gauge, title: "Buying power", body: "A simulated 2x buying power figure shows how leverage would expand exposure." },
          { icon: AlertTriangle, title: "Clear errors", body: "Rejected orders explain why — insufficient funds, not enough units, or invalid price." },
        ]} />
      </Section>
      <Section muted>
        <Split title="Margin, explained with your own numbers" body="The Account page calculates illustrative margin figures from your live virtual positions, so you can see how exposure, leverage and excess liquidity relate." visual={<MockPanel title="Margin (sample)" rows={[["Initial margin", "$12,480.00"], ["Maintenance margin", "$9,984.00"], ["Excess liquidity", "$94,016.00"], ["Leverage", "0.48x"]]} />} />
      </Section>
      <Section title="Illustrative margin rates">
        <KeyValueTable head={["Asset class", "Initial", "Maintenance"]} rows={[["Stocks", "25%", "20%"], ["ETFs", "25%", "20%"], ["Forex", "3%", "2%"], ["Crypto", "50%", "40%"]]} note="Educational illustration only. Margin isn't extended in the demo." />
      </Section>
    </ContentPage>
  );
}
