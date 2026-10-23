import { IMG } from "@/lib/images";
import { createFileRoute } from "@tanstack/react-router";
import { Briefcase, FileBarChart, Layers, RefreshCw, Users, ClipboardCheck } from "lucide-react";
import { ContentPage, Faq, FeatureGrid, ImageCards, MockPanel, Photo, Section, Split, Steps, Testimonials, pageHead } from "@/components/site/Sections";

export const Route = createFileRoute("/advisors")({
  head: () => pageHead("For advisors", "Model portfolios, client accounts and rebalancing practice for financial advisors.", "/advisors"),
  component: Page,
});

function Page() {
  return (
    <ContentPage image={IMG.advisorMeeting} eyebrow="Advisors" title="Show clients what a plan looks like before it's real" sub="Use accounts to model portfolios, walk clients through trade-offs and train new team members — all with virtual funds.">
      <Section title="Tools for advisory practices">
        <FeatureGrid items={[
          { icon: Users, title: "Client accounts", body: "Set up a separate virtual account for each client conversation and keep their scenarios apart." },
          { icon: Layers, title: "Model portfolios", body: "Build conservative, balanced and growth models across stocks, ETFs, FX and crypto." },
          { icon: RefreshCw, title: "Rebalancing practice", body: "Rehearse rebalancing trades and see the impact on allocation and cash in real time." },
          { icon: FileBarChart, title: "Clear reporting", body: "Portfolio allocation, P&L and full activity history that's easy to explain." },
          { icon: ClipboardCheck, title: "Audit trail", body: "Every administrative adjustment is logged with a reason, timestamp and author." },
          { icon: Briefcase, title: "Team onboarding", body: "Give junior staff a safe place to learn the platform before they touch client workflows." },
        ]} />
      </Section>
      <Section muted>
        <Split title="An advisor dashboard at a glance" body="See all of your accounts in one table with balances, bonuses and activity status. Open any account to adjust virtual funds or reset access." bullets={["Sortable, searchable account list", "Per-account audit history", "Password reset without client emails"]} visual={<MockPanel title="Advisor book (sample)" rows={[["Accounts", "38"], ["Virtual AUM", "€4.12M"], ["Active this week", "27"], ["Avg. allocation to equities", "57%"]]} />} />
        <Split reverse title="Model portfolio walkthroughs" body="Build a model live with your client, then let them watch it move with indicative prices. It turns abstract risk conversations into something they can see." visual={<MockPanel title="Balanced model (sample)" rows={[["World 500 Index Fund", "35%"], ["Aggregate Bond Fund", "30%"], ["Global Tech Leaders", "15%"], ["Gold Trust", "10%"], ["Cash", "10%"]]} />} />
      </Section>
      <Section title="Getting started">
        <Steps items={[
          { title: "Request advisor access", body: "Your firm's administrator grants advisor permissions to your login." },
          { title: "Create client scenarios", body: "Open accounts for each client or model you want to present." },
          { title: "Present and review", body: "Walk through trades together and export activity for your notes." },
        ]} />
      </Section>
      <Section title="Advisor FAQs" muted>
        <Faq items={[
          ["Can clients log in themselves?", "Yes. Each client can have their own login, or you can present from yours."],
          ["Is this suitable for real client money?", "No. This is a platform only. It doesn't hold, move or invest real assets."],
          ["Can we brand it for our firm?", "Yes. The pilot is built to be white-labelled with your firm's name and colours."],
        ]} />
      </Section>
    <Section><Split title="Turn conversations into demonstrations" body="Instead of describing risk, show it. Build a model with your client, then let them watch it react to indicative market moves in real time." visual={<Photo src={IMG.advisorMeeting} alt="Advisor meeting with clients" />} /><Split reverse title="Train your team safely" body="New hires learn the order flow, account views and reporting on a realistic platform before working with real client processes." visual={<Photo src={IMG.teamOffice} alt="Team collaborating at a whiteboard" />} /></Section>
      <Section title="What advisors say" muted><Testimonials items={[["My clients finally understand what a balanced portfolio feels like day to day.", "J. Hartley", "Independent advisor"],["We onboard every junior analyst on the platform now. It saves weeks.", "S. Coleman", "Practice manager"],["Being able to model scenarios live in meetings has changed our conversations.", "R. Nguyen", "Wealth planner"]]} /></Section>
    </ContentPage>
  );
}
