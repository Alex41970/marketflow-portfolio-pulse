import { IMG } from "@/lib/images";
import { createFileRoute } from "@tanstack/react-router";
import { BarChart3, BookOpen, Gauge, LineChart, ShieldCheck, Smartphone } from "lucide-react";
import { ContentPage, Faq, FeatureGrid, ImageCards, MockPanel, Photo, Section, Split, Stats, Steps, Testimonials, pageHead } from "@/components/site/Sections";
import { MarketsTable } from "@/components/site/MarketsTable";

export const Route = createFileRoute("/individuals")({
  head: () => pageHead("For individuals", "Learn to trade stocks, ETFs, forex and crypto risk-free with virtual funds.", "/individuals"),
  component: Page,
});

function Page() {
  return (
    <ContentPage image={IMG.traderDesk} eyebrow="Individuals" title="Build real trading skills with zero real risk" sub="Whether you're placing your first order or testing an advanced strategy, our simulator gives you a professional workstation and a fully funded virtual account.">
      <Stats items={[["4", "Asset classes"], ["24", "Simulated instruments"], ["1.5s", "Quote refresh"], ["$0", "Cost to practise"]]} />
      <Section title="Who it's for">
        <FeatureGrid items={[
          { icon: BookOpen, title: "New investors", body: "Understand how orders, positions and profit and loss work before you ever commit real money elsewhere." },
          { icon: LineChart, title: "Active traders", body: "Rehearse intraday strategies with limit orders, depth of book and a live tape of simulated prints." },
          { icon: BarChart3, title: "Long-term builders", body: "Design a diversified portfolio across asset classes and watch how allocation drives performance." },
        ]} />
      </Section>
      <Section title="How it works" muted>
        <Steps items={[
          { title: "Open a demo account", body: "Sign up with an email address. Fund your account with a top-up once it is approved." },
          { title: "Explore the workstation", body: "Add instruments to your watchlist, study candlestick charts and read the simulated news feed." },
          { title: "Trade and review", body: "Place market or limit orders, then track positions, P&L and every transaction in your activity log." },
        ]} />
      </Section>
      <Section>
        <Split title="A real workstation, not a toy" body="The same panel layout professional desks rely on: watchlists, charts, an order ticket with confirmation, Level 2 depth and time & sales — all updating live with simulated data." bullets={["Five chart ranges from intraday to one year", "Market and limit orders with confirmation", "Dark and light workstation themes"]} visual={<MockPanel title="Account summary" rows={[["Net liquidation", "$104,812.40"], ["Day P&L", "+$1,204.18"], ["Buying power", "$162,330.00"], ["Positions", "6"]]} />} />
        <Split reverse title="Track your progress" body="Portfolio analytics break down your allocation by asset class and show unrealized P&L on every position, so you learn what worked and why." bullets={["Allocation donut and holdings weights", "Exportable activity history", "Account and margin overview"]} visual={<MockPanel title="Allocation" rows={[["Stocks", "48.2%"], ["ETFs", "21.5%"], ["Crypto", "8.1%"], ["Cash", "22.2%"]]} />} />
      </Section>
      <Section title="Markets you can practise" sub="Live simulated quotes across four asset classes." muted><MarketsTable limit={6} /></Section>
      <Section title="Built for any screen">
        <FeatureGrid cols={3} items={[
          { icon: Gauge, title: "Fast", body: "Prices tick every 1.5 seconds and orders settle instantly in your virtual account." },
          { icon: Smartphone, title: "Responsive", body: "Use the workstation on a desktop monitor, a laptop or a phone." },
          { icon: ShieldCheck, title: "Safe", body: "No deposits, no withdrawals, no real securities. Ever." },
        ]} />
      </Section>
      <Section title="Frequently asked questions" muted>
        <Faq items={[
          ["Is any real money involved?", "No. Every balance, order and price in this demo is simulated. You can't deposit or withdraw funds."],
          ["Are these real companies?", "No. All instruments are fictional or simulated representations created for practice."],
          ["Can I reset my balance?", "Contact support from the help centre and an administrator can adjust your virtual balance."],
          ["Does it cost anything?", "No. The demo is free to use."],
        ]} />
      </Section>
    <Section title="What our users say"><Testimonials items={[["I went from not knowing what a limit order was to running a diversified portfolio in a month.", "Daniel K.", "Learner, Manchester"],["The workstation feels exactly like the platforms I see in finance videos. Brilliant for practice.", "Aisha M.", "Student"],["Testing strategies with virtual money took the fear out of learning.", "Tom W.", "Part-time trader"]]} /></Section>
      <Section muted><Split title="Practise on the go" body="Check positions, place orders and follow simulated prices from your phone with the same account." visual={<Photo src={IMG.mobileHand} alt="Phone showing a trading chart" />} /><Split reverse title="Learn alongside the simulator" body="Free courses and articles link straight to exercises in the workstation, so every lesson turns into practice." visual={<Photo src={IMG.educationStudy} alt="Student studying charts on a laptop" />} /></Section>
      <Section title="Explore more"><ImageCards items={[{ img: IMG.marketsGlobe, tag: "Markets", title: "Four asset classes", body: "Stocks, ETFs, forex and crypto — all simulated and live-moving." },{ img: IMG.educationStudy, tag: "Education", title: "Free course library", body: "Nine courses from beginner to advanced." },{ img: IMG.securityLock, tag: "Security", title: "Your account, protected", body: "How we keep demo accounts safe." }]} /></Section>
    </ContentPage>
  );
}
