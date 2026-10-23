import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { BookOpen, Clock, CreditCard, KeyRound, LineChart, Mail, MessageCircle, PlayCircle, Search, ShieldCheck, UserCircle } from "lucide-react";
import { ContentPage, Faq, ImageCards, Photo, Section, Split, Steps, pageHead } from "@/components/site/Sections";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { IMG } from "@/lib/images";

export const Route = createFileRoute("/help")({
  head: () => pageHead("Help centre", "Guides, FAQs and support for accounts, trading, passwords and the platform.", "/help"),
  component: Page,
});

const CATS = [
  { i: UserCircle, t: "Account", d: "Sign-up, profile and preview balances", n: 8 },
  { i: LineChart, t: "Trading", d: "Orders, positions and charts", n: 14 },
  { i: KeyRound, t: "Login & passwords", d: "Resets and temporary passwords", n: 6 },
  { i: CreditCard, t: "Virtual funds", d: "Balances, bonuses and adjustments", n: 7 },
  { i: ShieldCheck, t: "Security", d: "How your data is protected", n: 5 },
];

const FAQ: [string, string, string][] = [
  ["Account", "How do I open a account?", "Click 'Open account', enter a username, email and password, then confirm your email address using the link we send you."],
  ["Account", "Why do I have to accept a disclaimer?", "To make sure everyone understands that all funds, prices and news are indicative before they start trading."],
  ["Account", "Can I change my username?", "Not in the pilot. Contact support if you need it changed."],
  ["Account", "How do I switch between dark and light mode?", "Use the sun/moon icon in the top bar of the workstation. Your choice is remembered on that device."],
  ["Trading", "What's the difference between a market and a limit order?", "A market order fills immediately at the current indicative price. A limit order waits until the price reaches your limit, then fills automatically."],
  ["Trading", "How do I cancel a limit order?", "Open the Orders tab at the bottom of the Trade screen and click Cancel next to any working order."],
  ["Trading", "Why was my order rejected?", "Usually because there wasn't enough virtual cash for a buy, or you tried to sell more units than you hold."],
  ["Trading", "What do the green and red flashes mean?", "A green flash means the price just ticked up; red means it ticked down."],
  ["Trading", "How is profit and loss calculated?", "Unrealized P&L is the difference between the live price and your average cost, multiplied by your position size."],
  ["Trading", "Can I short sell?", "Not in the preview. You can only sell units you already hold."],
  ["Login & passwords", "I forgot my password.", "Use 'Forgot password?' on the login page to receive a reset link by email."],
  ["Login & passwords", "I was given a temporary password.", "Sign in with it and you'll be asked to choose a new password straight away."],
  ["Login & passwords", "I didn't receive my confirmation email.", "Check your spam folder. If it's not there, sign up again with the same email to resend it."],
  ["Virtual funds", "Can I withdraw my balance?", "No. Balances are virtual and have no cash value."],
  ["Virtual funds", "Can my balance be topped up?", "An administrator can add virtual credits or practice bonuses to your account."],
  ["Virtual funds", "What is a practice bonus?", "Extra virtual credit awarded by an administrator, for example for competitions or classes."],
  ["Security", "Who can see my data?", "Only you, and administrators for support purposes. Every admin change is recorded in an audit log."],
  ["Security", "Can support see my password?", "No. Passwords are hashed. Support can only send a reset link or set a temporary password."],
];

const GUIDES = [
  { img: IMG.traderDesk, tag: "Getting started", title: "A 5-minute tour of the workstation", body: "Learn where everything is: watchlists, chart, order ticket, depth and the blotter.", meta: "Video guide · 5 min" },
  { img: IMG.mobileHand, tag: "Trading", title: "Placing your first limit order", body: "Set a price, confirm the order, and watch it fill as the indicative market moves.", meta: "Step-by-step · 4 min" },
  { img: IMG.educationStudy, tag: "Portfolio", title: "Reading your portfolio analytics", body: "Understand allocation, weights, unrealized P&L and your activity history.", meta: "Article · 6 min" },
];

function Page() {
  const [q, setQ] = useState("");
  const [cat, setCat] = useState<string | null>(null);
  const rows = FAQ.filter(([c, a, b]) => (!cat || c === cat) && (a + b).toLowerCase().includes(q.toLowerCase()));
  return (
    <ContentPage eyebrow="Support" title="How can we help?" sub="Search guides and answers, browse by topic, or get in touch with our support team." crumbs={["Support", "Help centre"]} image={IMG.supportAgent} cta={false}>
      <Section>
        <div className="relative mx-auto mb-10 max-w-2xl">
          <Search className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-muted-foreground" />
          <Input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search for answers, e.g. 'limit order'" className="h-14 pl-12 text-base" />
        </div>
        <div className="grid gap-4 md:grid-cols-5">
          {CATS.map(({ i: I, t, d, n }) => (
            <button key={t} onClick={() => setCat(cat === t ? null : t)} className={`panel p-5 text-left transition-colors ${cat === t ? "ring-2 ring-primary" : "hover:border-primary"}`}>
              <I className="h-5 w-5 text-primary" /><div className="mt-3 text-sm font-semibold">{t}</div><div className="mt-1 text-xs text-muted-foreground">{d}</div>
              <div className="mt-3 text-xs text-primary">{n} articles</div>
            </button>
          ))}
        </div>
      </Section>

      <Section title={cat ? `${cat} questions` : "Popular questions"} sub={`${rows.length} answers`} muted>
        {rows.length ? <Faq items={rows.map(([, a, b]) => [a, b])} /> : <p className="text-muted-foreground">No results. Try another search or <Link to="/contact" className="text-primary">contact us</Link>.</p>}
      </Section>

      <Section title="Featured guides" sub="Hands-on walkthroughs for the most common tasks.">
        <ImageCards items={GUIDES} />
      </Section>

      <Section title="Getting started checklist" muted>
        <Steps items={[
          { title: "Create and confirm your account", body: "Sign up, then click the link in your confirmation email to activate your account." },
          { title: "Accept the disclaimer", body: "Confirm you understand that all funds and prices are indicative before entering the workstation." },
          { title: "Place your first trade", body: "Pick an instrument from the watchlist, review the order ticket and transmit your order." },
        ]} />
      </Section>

      <Section>
        <Split title="Still need help?" body="Our support team can help with account access, virtual balance adjustments and anything else about the platform." bullets={["Email support, Mon–Fri 08:00–18:00 GMT (sample hours)", "Typical response within one business day", "Priority support for institutional partners"]} visual={<Photo src={IMG.supportAgent} alt="Support specialist with headset" />} />
        <div className="grid gap-4 md:grid-cols-4">
          {[[Mail, "Email us", "support@example.com"], [MessageCircle, "Live chat", "Coming soon"], [BookOpen, "Education", "Free courses"], [Clock, "Status", "All systems operational"]].map(([I, t, d]) => {
            const Icon = I as typeof Mail;
            return <div key={t as string} className="panel flex items-center gap-4 p-5"><Icon className="h-5 w-5 text-primary" /><div><div className="text-sm font-semibold">{t as string}</div><div className="text-xs text-muted-foreground">{d as string}</div></div></div>;
          })}
        </div>
        <div className="mt-8 flex flex-wrap gap-3">
          <Button asChild><Link to="/contact">Contact support</Link></Button>
          <Button asChild variant="outline"><Link to="/education"><PlayCircle className="mr-1 h-4 w-4" />Browse courses</Link></Button>
        </div>
      </Section>
    </ContentPage>
  );
}
