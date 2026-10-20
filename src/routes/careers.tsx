import { createFileRoute, Link } from "@tanstack/react-router";
import { GraduationCap, HeartPulse, Laptop, MapPin, Plane, Sparkles } from "lucide-react";
import { ContentPage, FeatureGrid, Section, SampleNote, pageHead } from "@/components/site/Sections";
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
    <ContentPage eyebrow="Careers" title="Build the tools traders learn on" sub="We're a small, focused team that cares about craft, clarity and doing right by users." cta={false}>
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
    </ContentPage>
  );
}
