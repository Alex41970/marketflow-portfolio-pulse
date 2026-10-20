import { createFileRoute, Link } from "@tanstack/react-router";
import { Award, Download, FileText, Mail, Mic, Newspaper } from "lucide-react";
import { ContentPage, FeatureGrid, ImageCards, KeyValueTable, Photo, Quote, Section, SampleNote, Split, Stats, pageHead } from "@/components/site/Sections";
import { Brand } from "@/components/Brand";
import { Button } from "@/components/ui/button";
import { BRAND } from "@/lib/brand";
import { IMG } from "@/lib/images";

export const Route = createFileRoute("/press")({
  head: () => pageHead("Press", "Press releases, media coverage, executive bios and brand assets.", "/press"),
  component: Page,
});

const RELEASES = [
  { d: "20 Oct 2026", t: "Pilot launches with a multi-asset simulated workstation", b: "The new platform brings candlestick charting, Level 2 depth, time & sales and limit orders to a free, risk-free demo environment for stocks, ETFs, forex and crypto." },
  { d: "29 Sep 2026", t: "Back-office console adds full audit logging", b: "Every administrative change to virtual balances, bonuses and passwords is now recorded with author, reason and timestamp, giving operators a complete history." },
  { d: "14 Aug 2026", t: "Education library expands to nine free courses", b: "New intermediate and advanced modules cover margin, order-book reading, position sizing and currency trading, each linked to hands-on simulator exercises." },
  { d: "02 Jul 2026", t: "White-label programme opens to institutional partners", b: "Firms can now run the simulator under their own brand, with their colours, name and domain, as a training or customer-engagement tool." },
  { d: "18 May 2026", t: "Mobile-first workstation layout released", b: "The workstation now adapts fully to phones and tablets, keeping the order ticket, watchlists and blotter within easy reach." },
  { d: "03 Apr 2026", t: "Company announces seed funding to build next-generation trading education", b: "The round will fund product, engineering and education teams as the company prepares its first institutional pilots." },
];

const COVERAGE = [
  { img: IMG.traderDesk, tag: "Fintech Weekly (sample)", title: "The simulator that looks like a real trading desk", body: "A hands-on review of the workstation's charting, depth and order flow.", meta: "Oct 2026 · 6 min read" },
  { img: IMG.educationStudy, tag: "Learning Markets (sample)", title: "Why practice accounts are the new trading classroom", body: "Educators explain how simulated capital changes how beginners learn.", meta: "Sep 2026 · 8 min read" },
  { img: IMG.institutionTower, tag: "Capital Tech Review (sample)", title: "White-label demos are winning over brokers", body: "How firms use branded simulators to onboard and train customers.", meta: "Aug 2026 · 5 min read" },
];

function Page() {
  return (
    <ContentPage eyebrow="Press" title="Newsroom" sub="The latest announcements, media coverage, executive bios and brand assets for journalists and partners." image={IMG.pressStage} cta={false}>
      <Stats items={[["6", "Press releases (sample)"], ["12", "Media mentions (sample)"], ["3", "Industry awards (sample)"], ["24h", "Media response time"]]} />

      <Section title="Press releases" sub="Our most recent announcements.">
        <div className="panel divide-y">
          {RELEASES.map((r) => (
            <article key={r.t} className="grid gap-2 p-6 md:grid-cols-[160px_1fr_auto] md:items-start md:gap-8">
              <div className="num text-sm text-muted-foreground">{r.d}</div>
              <div><h3 className="font-semibold">{r.t}</h3><p className="mt-1 text-sm leading-relaxed text-muted-foreground">{r.b}</p></div>
              <span className="w-fit rounded-sm border px-2 py-0.5 text-[10px] uppercase tracking-wider text-muted-foreground">Sample</span>
            </article>
          ))}
        </div>
      </Section>

      <Section title="In the news" sub="Selected coverage of the platform." muted>
        <ImageCards items={COVERAGE} />
      </Section>

      <Section>
        <Quote text="We wanted to give everyone access to the kind of workstation that used to sit only on professional trading desks — and let them learn on it without risking a cent." by="A. Morgan, Chief Executive (sample quote)" />
      </Section>

      <Section title="Leadership bios" muted>
        <div className="grid gap-6 md:grid-cols-2">
          {[
            ["A. Morgan", "Chief Executive", "Previously led product at a multi-asset brokerage and spent a decade on institutional trading desks. Focused on making professional tools accessible."],
            ["R. Patel", "Head of Product", "Designed trading interfaces used by thousands of active traders. Leads the workstation and back-office experience."],
            ["J. Kim", "Head of Engineering", "Built real-time market data systems at scale. Responsible for platform performance, reliability and security."],
            ["L. Duarte", "Head of Education", "Former financial literacy lecturer who has taught over 5,000 students. Leads the course library and learning paths."],
          ].map(([n, r, b]) => (
            <div key={n} className="panel flex gap-5 p-6">
              <div className="grid h-14 w-14 shrink-0 place-items-center rounded-full bg-accent font-semibold text-accent-foreground">{n!.split(" ").map((x) => x[0]).join("")}</div>
              <div><div className="font-semibold">{n}</div><div className="text-sm text-primary">{r}</div><p className="mt-2 text-sm text-muted-foreground">{b}</p></div>
            </div>
          ))}
        </div>
        <SampleNote>Names and biographies are placeholders for the pilot.</SampleNote>
      </Section>

      <Section title="Awards and recognition">
        <FeatureGrid cols={3} items={[
          { icon: Award, title: "Best Trading Education Tool", body: "Fintech Innovation Awards 2026 (sample)." },
          { icon: Award, title: "Design Excellence — Finance", body: "Interface Design Awards 2026 (sample)." },
          { icon: Award, title: "Top 20 Fintech to Watch", body: "Capital Tech Review 2026 (sample)." },
        ]} />
      </Section>

      <Section title="Media kit" sub="Logos, colours, product imagery and fact sheets." muted>
        <div className="grid gap-6 md:grid-cols-3">
          <div className="panel grid place-items-center p-10"><Brand /></div>
          <div className="dark panel grid place-items-center bg-background p-10 text-foreground"><Brand /></div>
          <div className="panel flex flex-col justify-center gap-3 p-6">
            <div className="text-sm font-semibold">Brand colours</div>
            <div className="flex gap-2"><span className="h-10 w-10 rounded bg-navy" /><span className="h-10 w-10 rounded bg-primary" /><span className="h-10 w-10 rounded border bg-card" /><span className="h-10 w-10 rounded bg-gain" /></div>
            <div className="text-xs text-muted-foreground">Typeface: IBM Plex Sans / IBM Plex Mono</div>
          </div>
        </div>
        <div className="mt-6 grid gap-4 md:grid-cols-4">
          {[[Download, "Logo pack", "SVG & PNG"], [FileText, "Fact sheet", "PDF, 2 pages"], [Newspaper, "Product screenshots", "High resolution"], [Mic, "Executive headshots", "Print ready"]].map(([I, t, d]) => {
            const Icon = I as typeof Download;
            return <div key={t as string} className="panel flex items-center gap-4 p-5"><Icon className="h-5 w-5 text-primary" /><div><div className="text-sm font-semibold">{t as string}</div><div className="text-xs text-muted-foreground">{d as string} · coming soon</div></div></div>;
          })}
        </div>
      </Section>

      <Section>
        <Split title="Company fact sheet" body="Key facts about the company and product for reference in coverage." visual={<Photo src={IMG.teamOffice} alt="Team collaborating in the office" />} />
        <KeyValueTable head={["", ""]} rows={[["Name", `${BRAND.name} ${BRAND.suffix}`], ["Product", "Multi-asset trading simulator and white-label platform"], ["Founded", "2026 (sample)"], ["Headquarters", "London (placeholder)"], ["Asset classes", "Stocks, ETFs, forex, crypto (all simulated)"], ["Media contact", "press@example.com (placeholder)"]]} />
      </Section>

      <Section muted>
        <div className="panel flex flex-col items-start justify-between gap-4 p-8 md:flex-row md:items-center">
          <div className="flex items-center gap-4"><Mail className="h-10 w-10 text-primary" /><div><h3 className="text-xl font-semibold">Media enquiries</h3><p className="text-sm text-muted-foreground">Interviews, comment requests and product demos. We reply within 24 hours.</p></div></div>
          <Button asChild size="lg"><Link to="/contact">Contact press team</Link></Button>
        </div>
      </Section>
    </ContentPage>
  );
}
