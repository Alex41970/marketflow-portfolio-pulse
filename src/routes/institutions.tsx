import { createFileRoute, Link } from "@tanstack/react-router";
import { Building2, KeyRound, Lock, Palette, ScrollText, ServerCog, GraduationCap, Shield } from "lucide-react";
import { ContentPage, FeatureGrid, Section, Split, Stats, MockPanel, KeyValueTable, pageHead } from "@/components/site/Sections";
import { Button } from "@/components/ui/button";

export const Route = createFileRoute("/institutions")({
  head: () => pageHead("For institutions", "White-label trading simulator with back-office console, audit logs and team training for firms.", "/institutions"),
  component: Page,
});

function Page() {
  return (
    <ContentPage eyebrow="Institutions" title="A white-label trading platform, ready to pilot" sub="Give your customers or staff a polished brokerage experience under your brand, backed by a full back-office console and audit trail.">
      <Stats items={[["4", "Asset classes"], ["100%", "Admin actions logged"], ["1 file", "To rebrand"], ["24/7", "Simulated markets"]]} />
      <Section title="What's included">
        <FeatureGrid cols={4} items={[
          { icon: Building2, title: "Back-office console", body: "KPIs, user management, fund and bonus adjustments and password controls." },
          { icon: ScrollText, title: "Audit log", body: "Every adjustment recorded with admin, user, amount, reason and time." },
          { icon: Palette, title: "White-label branding", body: "Your name, logo and colours across the website and workstation." },
          { icon: GraduationCap, title: "Team training", body: "Onboard sales, support and trading staff on a realistic platform." },
        ]} />
      </Section>
      <Section muted>
        <Split title="Back-office console" body="Your operations team gets a single place to oversee every account: totals at the top, a sortable user table, and a detail drawer for adjustments and access controls." bullets={["Add or remove virtual credits with a mandatory reason", "Issue or revoke practice bonuses", "Send reset links or set temporary passwords"]} visual={<MockPanel title="Back office (sample)" rows={[["Total users", "1,284"], ["Virtual funds outstanding", "$128.9M"], ["Active (24h)", "412"], ["Bonuses issued", "$86,500"]]} />} />
      </Section>
      <Section title="Security and controls">
        <FeatureGrid items={[
          { icon: Lock, title: "Row-level access", body: "Users can only ever read their own data. Admin access is checked on the server for every request." },
          { icon: KeyRound, title: "Role-based permissions", body: "Admin roles are stored separately from profiles and can't be self-assigned." },
          { icon: Shield, title: "Protected balances", body: "Balances can only change through controlled server-side functions — never directly from the browser." },
        ]} />
      </Section>
      <Section title="Deployment options" muted>
        <KeyValueTable head={["", "Pilot", "Production (illustrative)"]} rows={[["Hosting", "Managed cloud", "Your cloud or ours"], ["Branding", "Included", "Included"], ["Data", "Simulated", "Integrations on request"], ["Support", "Email", "Dedicated team"]]} note="Illustrative only. Final scope is agreed per engagement." />
      </Section>
      <Section>
        <div className="panel flex flex-col items-start justify-between gap-4 p-8 md:flex-row md:items-center">
          <div className="flex items-center gap-4"><ServerCog className="h-10 w-10 text-primary" /><div><h3 className="text-xl font-semibold">Talk to us about a pilot</h3><p className="text-sm text-muted-foreground">Tell us about your users and we'll tailor a demo.</p></div></div>
          <Button asChild size="lg"><Link to="/contact">Contact us</Link></Button>
        </div>
      </Section>
    </ContentPage>
  );
}
