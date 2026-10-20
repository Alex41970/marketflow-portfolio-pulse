import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { CreditCard, KeyRound, LineChart, Search, ShieldCheck, UserCircle } from "lucide-react";
import { ContentPage, Faq, Section, pageHead } from "@/components/site/Sections";
import { Input } from "@/components/ui/input";

export const Route = createFileRoute("/help")({
  head: () => pageHead("Help centre", "Answers about demo accounts, trading, passwords and the simulator.", "/help"),
  component: Page,
});

const CATS = [
  { i: UserCircle, t: "Account", d: "Sign-up, profile and demo balances" },
  { i: LineChart, t: "Trading", d: "Orders, positions and charts" },
  { i: KeyRound, t: "Login & passwords", d: "Resets and temporary passwords" },
  { i: CreditCard, t: "Virtual funds", d: "Balances, bonuses and adjustments" },
  { i: ShieldCheck, t: "Security", d: "How your data is protected" },
];

const FAQ: [string, string, string][] = [
  ["Account", "How do I open a demo account?", "Click 'Open demo account', enter a username, email and password, then confirm your email address."],
  ["Account", "Why do I have to accept a disclaimer?", "To make sure everyone understands that all funds and prices are simulated before they start trading."],
  ["Trading", "What's the difference between a market and a limit order?", "A market order fills immediately at the current simulated price. A limit order waits until the price reaches your limit, then fills."],
  ["Trading", "How do I cancel a limit order?", "Open the Orders tab at the bottom of the Trade screen and click Cancel next to any working order."],
  ["Trading", "Why was my order rejected?", "Usually because there wasn't enough virtual cash for a buy, or you tried to sell more units than you hold."],
  ["Login & passwords", "I forgot my password.", "Use 'Forgot password?' on the login page to receive a reset link by email."],
  ["Login & passwords", "I was given a temporary password.", "Sign in with it and you'll be asked to choose a new password straight away."],
  ["Virtual funds", "Can I withdraw my balance?", "No. Balances are virtual and have no cash value."],
  ["Virtual funds", "Can my balance be topped up?", "An administrator can add virtual credits or practice bonuses to your account."],
  ["Security", "Who can see my data?", "Only you, and administrators for support purposes. Every admin change is recorded in an audit log."],
];

function Page() {
  const [q, setQ] = useState("");
  const [cat, setCat] = useState<string | null>(null);
  const rows = FAQ.filter(([c, a, b]) => (!cat || c === cat) && (a + b).toLowerCase().includes(q.toLowerCase()));
  return (
    <ContentPage eyebrow="Support" title="How can we help?" sub="Search the help centre or browse by topic." crumbs={["Support", "Help centre"]} cta={false}>
      <Section>
        <div className="relative mx-auto mb-10 max-w-xl">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search for answers" className="h-12 pl-10" />
        </div>
        <div className="grid gap-4 md:grid-cols-5">
          {CATS.map(({ i: I, t, d }) => (
            <button key={t} onClick={() => setCat(cat === t ? null : t)} className={`panel p-5 text-left transition-colors ${cat === t ? "ring-2 ring-primary" : "hover:border-primary"}`}>
              <I className="h-5 w-5 text-primary" /><div className="mt-3 text-sm font-semibold">{t}</div><div className="mt-1 text-xs text-muted-foreground">{d}</div>
            </button>
          ))}
        </div>
      </Section>
      <Section title={cat ? `${cat} questions` : "Popular questions"} muted>
        {rows.length ? <Faq items={rows.map(([, a, b]) => [a, b])} /> : <p className="text-muted-foreground">No results. Try another search or <Link to="/contact" className="text-primary">contact us</Link>.</p>}
      </Section>
    </ContentPage>
  );
}
