import { IMG } from "@/lib/images";
import { createFileRoute, Link } from "@tanstack/react-router";
import { GraduationCap, HeartPulse, Laptop, MapPin, Plane, Sparkles } from "lucide-react";
import { ContentPage, FeatureGrid, ImageCards, Photo, SampleNote, Section, Split, Testimonials, pageHead } from "@/components/site/Sections";
import { Button } from "@/components/ui/button";

export const Route = createFileRoute("/careers")({
  head: () => pageHead("Careers", "Join the team building the next generation of trading tools.", "/careers"),
  component: Page,
});

const JOBS = [
  ["Senior Frontend Engineer", "Engineering", "London · Hybrid"],
  ["Market Data Engineer", "Engineering", "Remote (EU)"],
  ["Product Designer, Trading", "Design", "London · Hybrid"],
  ["Education Content Lead", "Education", "Remote"],
  ["Customer Success Manager", "Operations", "New York · Hybrid"],
  ["Security Engineer", "Engineering", "Remote"],
];

function Page() {
  return (
    <ContentPage image={IMG.teamOffice} eyebrow="Careers" title="Build the tools traders learn on" sub="We're a small, focused team that cares about craft, clarity and doing right by users." cta={false}>
      <Section title="Life on the team">
        <FeatureGrid items={[
          { icon: Laptop, title: "Flexible work", body: "Hybrid and remote roles with core collaboration hours." },
          { icon: HeartPulse, title: "Health cover", body: "Comprehensive health, dental and wellbeing support." },
          { icon: GraduationCap, title: "Learning budget", body: "An annual allowance for courses, books and conferences." },
          { icon: Plane, title: "Time off", body: "Generous holiday plus your birthday off." },
          { icon: Sparkles, title: "Real ownership", body: "Ship features end to end and see them in users' hands fast." },
          { icon: MapPin, title: "Team offsites", body: "Get together in person twice a year." },
        ]} />
      </Section>
      <Section title="Open roles" muted>
        <div className="panel divide-y">
          {JOBS.map(([t, d, l]) => (
            <div key={t} className="flex flex-col justify-between gap-2 p-5 md:flex-row md:items-center">
              <div><div className="font-semibold">{t}</div><div className="text-sm text-muted-foreground">{d} · {l}</div></div>
              <Button asChild variant="outline" size="sm"><Link to="/contact">Apply</Link></Button>
            </div>
          ))}
        </div>
        <SampleNote>Sample openings for the pilot. Real roles will be added by the client.</SampleNote>
      </Section>
    <Section><Split title="How we hire" body="A short intro call, a practical exercise that reflects real work, and a conversation with the team. We aim to give every candidate a decision within two weeks." visual={<Photo src={IMG.teamOffice} alt="Team meeting" />} /><Split reverse title="Grow with us" body="Every team member gets a learning budget, mentorship and the chance to lead projects early." visual={<Photo src={IMG.pressStage} alt="Speaker on stage" />} /></Section>
      <Section title="From the team" muted><Testimonials items={[["I shipped a feature to users in my second week. The pace is incredible.", "Engineer", "Joined 2026 (sample)"],["Design has a real seat at the table here.", "Product Designer", "Joined 2026 (sample)"],["I love that education is part of the product, not an afterthought.", "Content Lead", "Joined 2026 (sample)"]]} /></Section>
    </ContentPage>
  );
}
