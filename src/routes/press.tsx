import { createFileRoute, Link } from "@tanstack/react-router";
import { Download } from "lucide-react";
import { ContentPage, KeyValueTable, Section, SampleNote, pageHead } from "@/components/site/Sections";
import { Brand } from "@/components/Brand";
import { Button } from "@/components/ui/button";
import { BRAND } from "@/lib/brand";

export const Route = createFileRoute("/press")({
  head: () => pageHead("Press", "Press kit, brand facts and news for media.", "/press"),
  component: Page,
});

const NEWS = [
  ["Oct 2026", "Pilot launches with multi-asset simulated workstation"],
  ["Sep 2026", "Back-office console adds full audit logging"],
  ["Aug 2026", "Education library expands to nine free courses"],
  ["Jul 2026", "White-label programme opens to institutional partners"],
];

function Page() {
  return (
    <ContentPage eyebrow="Press" title="Press and media" sub="Brand assets, company facts and the latest announcements." cta={false}>
      <Section title="Latest news">
        <div className="grid gap-4 md:grid-cols-2">
          {NEWS.map(([d, t]) => <div key={t} className="panel p-6"><div className="num text-xs text-muted-foreground">{d} · Sample release</div><div className="mt-2 font-semibold">{t}</div></div>)}
        </div>
      </Section>
      <Section title="Press kit" muted>
        <div className="grid gap-6 md:grid-cols-3">
          <div className="panel grid place-items-center p-10"><Brand /></div>
          <div className="dark panel grid place-items-center bg-background p-10 text-foreground"><Brand /></div>
          <div className="panel flex flex-col justify-center gap-3 p-6">
            <div className="text-sm font-semibold">Brand colours</div>
            <div className="flex gap-2"><span className="h-10 w-10 rounded bg-navy" /><span className="h-10 w-10 rounded bg-primary" /><span className="h-10 w-10 rounded border bg-card" /><span className="h-10 w-10 rounded bg-gain" /></div>
            <Button variant="outline" size="sm" className="w-fit"><Download className="mr-1 h-4 w-4" />Logo pack (coming soon)</Button>
          </div>
        </div>
      </Section>
      <Section title="Company facts">
        <KeyValueTable head={["", ""]} rows={[["Name", `${BRAND.name} ${BRAND.suffix}`], ["Product", "Multi-asset trading simulator"], ["Founded", "2026 (sample)"], ["Headquarters", "London (placeholder)"], ["Media contact", "press@example.com (placeholder)"]]} />
        <SampleNote>All facts on this page are placeholders until the client provides real details. <Link to="/contact" className="text-primary">Contact us</Link> for media enquiries.</SampleNote>
      </Section>
    </ContentPage>
  );
}
