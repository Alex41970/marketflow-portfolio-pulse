import { IMG } from "@/lib/images";
import { createFileRoute } from "@tanstack/react-router";
import { AlertTriangle, CheckCircle2, Gauge, Percent, ShieldCheck, Wallet } from "lucide-react";
import { ContentPage, FeatureGrid, ImageCards, KeyValueTable, MockPanel, Photo, Section, Split, Testimonials, pageHead } from "@/components/site/Sections";

export const Route = createFileRoute("/platform_/risk-tools")({
  head: () => pageHead("Risk tools", "Margin, buying power, position checks and order confirmations in the platform.", "/platform/risk-tools"),
  component: Page,
});

function Page() {
  return (
    <ContentPage image={IMG.securityLock} eyebrow="Platform · Risk tools" title="Understand risk before it matters" sub="Learn how professional platforms protect traders — with checks that run on every indicative order." crumbs={["Platform", "Risk tools"]}>
      <Section title="Built-in protections">
        <FeatureGrid items={[
          { icon: Wallet, title: "Cash checks", body: "A buy order can't exceed your available virtual cash. The check runs before and after you confirm." },
          { icon: ShieldCheck, title: "Position checks", body: "You can't sell more units than you hold. Short selling is disabled in the preview." },
          { icon: CheckCircle2, title: "Order confirmation", body: "Every order shows instrument, quantity, price and estimated total before it's sent." },
          { icon: Percent, title: "Margin view", body: "Illustrative initial and maintenance margin, excess liquidity and leverage on the Account page." },
          { icon: Gauge, title: "Buying power", body: "A indicative 2x buying power figure shows how leverage would expand exposure." },
          { icon: AlertTriangle, title: "Clear errors", body: "Rejected orders explain why — insufficient funds, not enough units, or invalid price." },
        ]} />
      </Section>
      <Section muted>
        <Split title="Margin, explained with your own numbers" body="The Account page calculates illustrative margin figures from your live virtual positions, so you can see how exposure, leverage and excess liquidity relate." visual={<MockPanel title="Margin (sample)" rows={[["Initial margin", "€12,480.00"], ["Maintenance margin", "€9,984.00"], ["Excess liquidity", "€94,016.00"], ["Leverage", "0.48x"]]} />} />
      </Section>
      <Section title="Illustrative margin rates">
        <KeyValueTable head={["Asset class", "Initial", "Maintenance"]} rows={[["Stocks", "25%", "20%"], ["ETFs", "25%", "20%"], ["Forex", "3%", "2%"], ["Crypto", "50%", "40%"]]} note="Educational illustration only. Margin isn't extended in the preview." />
      </Section>
    <Section muted><Split title="Learn the habits that protect capital" body="The platform encourages good practice: confirm every order, size positions sensibly, and keep an eye on excess liquidity." visual={<Photo src={IMG.traderDesk} alt="Trader reviewing charts" />} /></Section>
      <Section title="Further reading"><ImageCards items={[{ img: IMG.educationStudy, tag: "Course", title: "Position sizing and risk", body: "How much to trade, and how to cap your downside." },{ img: IMG.marketsGlobe, tag: "Course", title: "Understanding margin", body: "Buying power, maintenance margin and leverage." },{ img: IMG.mobileHand, tag: "Article", title: "Why limit orders protect you", body: "Avoiding unexpected fills in fast markets." }]} /></Section>
    </ContentPage>
  );
}
