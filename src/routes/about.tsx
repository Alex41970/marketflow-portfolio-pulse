import { IMG } from "@/lib/images";
import { createFileRoute } from "@tanstack/react-router";
import { Compass, Eye, Lock, Users } from "lucide-react";
import { ContentPage, FeatureGrid, ImageCards, MockPanel, Photo, SampleNote, Section, Split, Stats, Testimonials, pageHead } from "@/components/site/Sections";
import { BRAND } from "@/lib/brand";

export const Route = createFileRoute("/about")({
  head: () => pageHead("About", "Our mission, values and the team behind this professional trading platform.", "/about"),
  component: Page,
});

function Page() {
  return (
    <ContentPage image={IMG.teamOffice} eyebrow="About" title="Making professional trading tools accessible to everyone" sub={`${BRAND.name} ${BRAND.suffix} brings the depth of an institutional platform to anyone who wants to learn — without putting a single real dollar at risk.`}>
      <Stats items={[["2026", "Founded (sample)"], ["4", "Asset classes"], ["24", "Instruments"], ["0", "Real dollars at risk"]]} />
      <Section>
        <Split title="Our story" body="We started with a simple observation: the best way to learn trading is to do it, but the cost of mistakes in real markets is high. So we built a platform that looks and behaves like the platforms professionals use, and made it free to practise on." bullets={["Professional-grade interface", "Realistic, live-moving indicative markets", "Transparent, educational by design"]} visual={<MockPanel title="Milestones (sample)" rows={[["Q1", "Pilot design"], ["Q2", "Workstation launch"], ["Q3", "Back-office console"], ["Q4", "White-label partners"]]} />} />
      </Section>
      <Section title="What we value" muted>
        <FeatureGrid cols={4} items={[
          { icon: Eye, title: "Transparency", body: "We label every indicative price, fee and headline clearly." },
          { icon: Lock, title: "Security", body: "Data access is locked down by design, and admin actions are audited." },
          { icon: Compass, title: "Clarity", body: "Dense information, presented so it's easy to read." },
          { icon: Users, title: "Education", body: "Every feature should teach something about real markets." },
        ]} />
      </Section>
      <Section title="Leadership (sample)">
        <div className="grid gap-6 md:grid-cols-4">
          {[["A. Morgan", "Chief Executive"], ["R. Patel", "Head of Product"], ["J. Kim", "Head of Engineering"], ["L. Duarte", "Head of Education"]].map(([n, r]) => (
            <div key={n} className="panel p-6 text-center">
              <div className="mx-auto grid h-16 w-16 place-items-center rounded-full bg-accent text-lg font-semibold text-accent-foreground">{(n ?? "").split(" ").map((x) => x[0]).join("")}</div>
              <div className="mt-3 font-semibold">{n}</div><div className="text-sm text-muted-foreground">{r}</div>
            </div>
          ))}
        </div>
        <SampleNote>Names and milestones are placeholders for the pilot and will be replaced with the client's real details.</SampleNote>
      </Section>
    <Section muted><Split title="How we work" body="Small, cross-functional teams own features end to end — from design and engineering to education content — so every part of the platform feels consistent." visual={<Photo src={IMG.teamOffice} alt="Team collaborating" />} /><Split reverse title="Where we're going" body="Next up: certificates, classroom competitions and deeper analytics, plus white-label rollouts with institutional partners." visual={<Photo src={IMG.pressStage} alt="Executive speaking at a conference" />} /></Section>
      <Section title="What people say"><Testimonials items={[["The most professional-looking trading platform I've used.", "Chris L.", "Learner"],["A genuinely useful training tool for our analysts.", "Operations Lead", "Partner firm (sample)"],["Clear, honest and beautifully designed.", "Nadia F.", "Educator"]]} /></Section>
    </ContentPage>
  );
}
