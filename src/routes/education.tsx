import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { Clock, PlayCircle } from "lucide-react";
import { ContentPage, Section, pageHead } from "@/components/site/Sections";
import { Input } from "@/components/ui/input";

export const Route = createFileRoute("/education")({
  head: () => pageHead("Education", "Free trading courses, glossary and articles, with hands-on practice in the simulator.", "/education"),
  component: Page,
});

const COURSES = [
  { lvl: "Beginner", t: "How markets work", d: "Exchanges, bids and asks, and what moves a price.", m: 20 },
  { lvl: "Beginner", t: "Your first order", d: "Market vs limit orders and how to read a confirmation.", m: 15 },
  { lvl: "Beginner", t: "Reading a candlestick chart", d: "Open, high, low, close and volume explained.", m: 25 },
  { lvl: "Intermediate", t: "Building a diversified portfolio", d: "Allocation across stocks, ETFs, FX and crypto.", m: 35 },
  { lvl: "Intermediate", t: "Understanding margin", d: "Buying power, maintenance margin and leverage.", m: 30 },
  { lvl: "Intermediate", t: "Order book and time & sales", d: "What Level 2 depth tells you about liquidity.", m: 25 },
  { lvl: "Advanced", t: "Position sizing and risk", d: "How much to trade, and how to cap your downside.", m: 40 },
  { lvl: "Advanced", t: "Trading currencies", d: "Pips, pairs and how FX quotes are structured.", m: 30 },
  { lvl: "Advanced", t: "Volatility and crypto", d: "Why digital assets move differently and how to adapt.", m: 30 },
];
const GLOSSARY: [string, string][] = [
  ["Ask", "The lowest price a seller is willing to accept."], ["Bid", "The highest price a buyer is willing to pay."],
  ["Spread", "The difference between the bid and the ask."], ["Limit order", "An order to trade only at a set price or better."],
  ["Market order", "An order to trade immediately at the best available price."], ["Net liquidation", "The total value of your account if every position were closed."],
  ["Unrealized P&L", "Profit or loss on open positions that haven't been sold."], ["Margin", "Borrowed buying power, secured by your account's value."],
  ["Volatility", "How much and how quickly a price moves."], ["ETF", "A fund that trades on an exchange like a single stock."],
];
const ARTICLES = ["5 habits of disciplined traders", "Why limit orders protect you from slippage", "What your allocation says about your risk tolerance", "A beginner's guide to reading market depth"];

function Page() {
  const [lvl, setLvl] = useState("All");
  const [q, setQ] = useState("");
  return (
    <ContentPage eyebrow="Education" title="Learn it. Then practise it." sub="Short, practical lessons paired with a simulator where you can try every concept straight away.">
      <Section title="Course library" sub="Nine free courses from first principles to advanced risk.">
        <div className="mb-6 flex gap-2">{["All", "Beginner", "Intermediate", "Advanced"].map((l) => <button key={l} onClick={() => setLvl(l)} className={`rounded-full px-4 py-1.5 text-sm ${lvl === l ? "bg-primary text-primary-foreground" : "border text-muted-foreground hover:text-foreground"}`}>{l}</button>)}</div>
        <div className="grid gap-6 md:grid-cols-3">
          {COURSES.filter((c) => lvl === "All" || c.lvl === lvl).map((c) => (
            <div key={c.t} className="panel flex flex-col p-6">
              <span className="w-fit rounded-sm bg-accent px-2 py-0.5 text-xs font-medium text-accent-foreground">{c.lvl}</span>
              <h3 className="mt-3 font-semibold">{c.t}</h3>
              <p className="mt-1 flex-1 text-sm text-muted-foreground">{c.d}</p>
              <div className="mt-4 flex items-center justify-between text-xs text-muted-foreground"><span className="flex items-center gap-1"><Clock className="h-3.5 w-3.5" />{c.m} min</span><span className="flex items-center gap-1 text-primary"><PlayCircle className="h-4 w-4" />Start</span></div>
            </div>
          ))}
        </div>
      </Section>
      <Section title="Glossary" muted>
        <Input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search terms" className="mb-6 max-w-sm" />
        <dl className="grid gap-x-10 gap-y-4 md:grid-cols-2">
          {GLOSSARY.filter(([t]) => t.toLowerCase().includes(q.toLowerCase())).map(([t, d]) => (
            <div key={t} className="border-b pb-3"><dt className="font-semibold">{t}</dt><dd className="mt-1 text-sm text-muted-foreground">{d}</dd></div>
          ))}
        </dl>
      </Section>
      <Section title="Latest articles">
        <div className="grid gap-4 md:grid-cols-2">
          {ARTICLES.map((a, i) => <div key={a} className="panel p-5"><div className="text-xs text-muted-foreground">{4 + i} min read · Sample article</div><div className="mt-1 font-medium">{a}</div></div>)}
        </div>
      </Section>
    </ContentPage>
  );
}
