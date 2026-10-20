import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { Award, BookOpen, Clock, GraduationCap, PlayCircle, Target, Users, Video } from "lucide-react";
import { ContentPage, FeatureGrid, ImageCards, Photo, Section, Split, Stats, Testimonials, pageHead } from "@/components/site/Sections";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { IMG } from "@/lib/images";

export const Route = createFileRoute("/education")({
  head: () => pageHead("Education", "Free trading courses, learning paths, webinars, glossary and articles, with hands-on practice in the simulator.", "/education"),
  component: Page,
});

const COURSES = [
  { lvl: "Beginner", t: "How markets work", d: "Exchanges, bids and asks, and what moves a price.", m: 20, l: 6 },
  { lvl: "Beginner", t: "Your first order", d: "Market vs limit orders and how to read a confirmation.", m: 15, l: 4 },
  { lvl: "Beginner", t: "Reading a candlestick chart", d: "Open, high, low, close and volume explained.", m: 25, l: 7 },
  { lvl: "Intermediate", t: "Building a diversified portfolio", d: "Allocation across stocks, ETFs, FX and crypto.", m: 35, l: 8 },
  { lvl: "Intermediate", t: "Understanding margin", d: "Buying power, maintenance margin and leverage.", m: 30, l: 6 },
  { lvl: "Intermediate", t: "Order book and time & sales", d: "What Level 2 depth tells you about liquidity.", m: 25, l: 5 },
  { lvl: "Advanced", t: "Position sizing and risk", d: "How much to trade, and how to cap your downside.", m: 40, l: 9 },
  { lvl: "Advanced", t: "Trading currencies", d: "Pips, pairs and how FX quotes are structured.", m: 30, l: 7 },
  { lvl: "Advanced", t: "Volatility and crypto", d: "Why digital assets move differently and how to adapt.", m: 30, l: 6 },
];
const GLOSSARY: [string, string][] = [
  ["Ask", "The lowest price a seller is willing to accept."], ["Bid", "The highest price a buyer is willing to pay."],
  ["Spread", "The difference between the bid and the ask."], ["Limit order", "An order to trade only at a set price or better."],
  ["Market order", "An order to trade immediately at the best available price."], ["Net liquidation", "The total value of your account if every position were closed."],
  ["Unrealized P&L", "Profit or loss on open positions that haven't been sold."], ["Margin", "Borrowed buying power, secured by your account's value."],
  ["Volatility", "How much and how quickly a price moves."], ["ETF", "A fund that trades on an exchange like a single stock."],
  ["Pip", "The smallest standard price move in a currency pair, usually 0.0001."], ["Liquidity", "How easily an asset can be bought or sold without moving its price."],
  ["Diversification", "Spreading investments across assets to reduce risk."], ["Moving average", "The average price over a set number of periods, used to smooth a chart."],
  ["Slippage", "The difference between the expected and actual fill price."], ["Allocation", "How your portfolio is split across asset classes."],
];
const PATHS = [
  { icon: Target, t: "Trading foundations", d: "4 courses · 2 hours", b: "From how markets work to placing and reviewing your first trades." },
  { icon: GraduationCap, t: "Portfolio builder", d: "3 courses · 1.5 hours", b: "Diversification, allocation and rebalancing across asset classes." },
  { icon: Award, t: "Active trader", d: "4 courses · 2.5 hours", b: "Order books, margin, position sizing and managing volatility." },
];
const ARTICLES = [
  { img: IMG.traderDesk, tag: "Strategy", title: "5 habits of disciplined traders", body: "Routines that help traders stay consistent, from pre-session plans to post-trade reviews.", meta: "Sample article · 6 min read" },
  { img: IMG.marketsGlobe, tag: "Markets", title: "How global sessions shape price action", body: "Why prices behave differently across Asian, European and US hours.", meta: "Sample article · 7 min read" },
  { img: IMG.mobileHand, tag: "Orders", title: "Why limit orders protect you from slippage", body: "How setting a price can save you from unexpected fills in fast markets.", meta: "Sample article · 4 min read" },
  { img: IMG.advisorMeeting, tag: "Portfolio", title: "What your allocation says about your risk", body: "Reading your own portfolio mix and what it means for volatility.", meta: "Sample article · 5 min read" },
  { img: IMG.educationStudy, tag: "Beginners", title: "A beginner's guide to reading market depth", body: "Bids, asks and size: what the order book is really telling you.", meta: "Sample article · 6 min read" },
  { img: IMG.securityLock, tag: "Safety", title: "Spotting investment scams", body: "Red flags to watch for, and why no legitimate platform asks for upfront deposits by message.", meta: "Sample article · 5 min read" },
];
const WEBINARS = [["28 Oct 2026", "Live: Reading candlestick patterns"], ["04 Nov 2026", "Building your first diversified portfolio"], ["11 Nov 2026", "Q&A: Margin and leverage explained"], ["18 Nov 2026", "Currency trading for beginners"]];

function Page() {
  const [lvl, setLvl] = useState("All");
  const [q, setQ] = useState("");
  return (
    <ContentPage eyebrow="Education" title="Learn it. Then practise it." sub="Free courses, learning paths and live sessions — each paired with a simulator where you can try every concept immediately." image={IMG.educationStudy}>
      <Stats items={[["9", "Free courses"], ["58", "Lessons"], ["16", "Glossary terms"], ["Weekly", "Live webinars (sample)"]]} />

      <Section title="Learning paths" sub="Follow a structured path, or pick individual courses.">
        <div className="grid gap-6 md:grid-cols-3">
          {PATHS.map(({ icon: I, t, d, b }) => (
            <div key={t} className="panel flex flex-col p-6">
              <I className="h-7 w-7 text-primary" /><h3 className="mt-4 text-lg font-semibold">{t}</h3><div className="text-xs text-muted-foreground">{d}</div>
              <p className="mt-3 flex-1 text-sm text-muted-foreground">{b}</p>
              <div className="mt-4 h-1.5 rounded-full bg-muted"><div className="h-full w-0 rounded-full bg-primary" /></div>
              <div className="mt-2 text-xs text-muted-foreground">Not started</div>
            </div>
          ))}
        </div>
      </Section>

      <Section title="Course library" sub="Nine free courses from first principles to advanced risk." muted>
        <div className="mb-6 flex flex-wrap gap-2">{["All", "Beginner", "Intermediate", "Advanced"].map((l) => <button key={l} onClick={() => setLvl(l)} className={`rounded-full px-4 py-1.5 text-sm ${lvl === l ? "bg-primary text-primary-foreground" : "border bg-card text-muted-foreground hover:text-foreground"}`}>{l}</button>)}</div>
        <div className="grid gap-6 md:grid-cols-3">
          {COURSES.filter((c) => lvl === "All" || c.lvl === lvl).map((c) => (
            <div key={c.t} className="panel flex flex-col p-6">
              <span className="w-fit rounded-sm bg-accent px-2 py-0.5 text-xs font-medium text-accent-foreground">{c.lvl}</span>
              <h3 className="mt-3 font-semibold">{c.t}</h3>
              <p className="mt-1 flex-1 text-sm text-muted-foreground">{c.d}</p>
              <div className="mt-4 flex items-center justify-between text-xs text-muted-foreground"><span className="flex items-center gap-3"><span className="flex items-center gap-1"><Clock className="h-3.5 w-3.5" />{c.m} min</span><span className="flex items-center gap-1"><BookOpen className="h-3.5 w-3.5" />{c.l} lessons</span></span><span className="flex items-center gap-1 text-primary"><PlayCircle className="h-4 w-4" />Start</span></div>
            </div>
          ))}
        </div>
      </Section>

      <Section>
        <Split title="Learn by doing, not just reading" body="Every lesson ends with a short exercise in the simulator — place a limit order, rebalance a portfolio, read the depth ladder. You'll remember it because you did it." bullets={["Exercises linked directly to the workstation", "Track your trades against the lesson's goal", "No risk: everything uses virtual funds"]} visual={<Photo src={IMG.traderDesk} alt="Trader at multi-monitor desk" />} />
      </Section>

      <Section title="Upcoming webinars" sub="Live sessions with our education team (sample schedule)." muted>
        <div className="panel divide-y">
          {WEBINARS.map(([d, t]) => (
            <div key={t} className="flex flex-col justify-between gap-2 p-5 md:flex-row md:items-center">
              <div className="flex items-center gap-4"><Video className="h-5 w-5 text-primary" /><div><div className="font-semibold">{t}</div><div className="num text-xs text-muted-foreground">{d} · 18:00 GMT · 45 min</div></div></div>
              <Button variant="outline" size="sm">Save a seat</Button>
            </div>
          ))}
        </div>
      </Section>

      <Section title="Latest articles">
        <ImageCards items={ARTICLES} />
      </Section>

      <Section title="Glossary" sub="Plain-English definitions of common trading terms." muted>
        <Input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search terms" className="mb-6 max-w-sm bg-card" />
        <dl className="grid gap-x-10 gap-y-4 md:grid-cols-2">
          {GLOSSARY.filter(([t]) => t.toLowerCase().includes(q.toLowerCase())).map(([t, d]) => (
            <div key={t} className="border-b pb-3"><dt className="font-semibold">{t}</dt><dd className="mt-1 text-sm text-muted-foreground">{d}</dd></div>
          ))}
        </dl>
      </Section>

      <Section title="What learners say">
        <Testimonials items={[
          ["The limit order lesson finally made it click. Practising it straight away in the simulator was the key.", "Sam T.", "Beginner learner"],
          ["I use the portfolio builder path with my students. Being able to see allocation change live is brilliant.", "Dr. M. Okafor", "University lecturer"],
          ["The depth and time & sales course taught me more in 25 minutes than months of reading.", "Priya R.", "Active trader"],
        ]} />
      </Section>

      <Section muted>
        <FeatureGrid cols={3} items={[
          { icon: Users, title: "For classrooms", body: "Teachers can run trading competitions with practice bonuses awarded by administrators." },
          { icon: GraduationCap, title: "Certificates (coming soon)", body: "Complete a learning path and earn a shareable certificate." },
          { icon: BookOpen, title: "Always free", body: "Every course, article and webinar is free for demo account holders." },
        ]} />
        <div className="mt-8 text-center"><Button asChild size="lg"><Link to="/auth" search={{ mode: "signup" }}>Start learning free</Link></Button></div>
      </Section>
    </ContentPage>
  );
}
