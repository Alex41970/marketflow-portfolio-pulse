import { IMG } from "@/lib/images";
import { createFileRoute } from "@tanstack/react-router";
import { CheckCircle2 } from "lucide-react";
import { ContentPage, ImageCards, Photo, SampleNote, Section, Split, Testimonials, pageHead } from "@/components/site/Sections";

export const Route = createFileRoute("/status")({
  head: () => pageHead("System status", "Current status of the simulator's services.", "/status"),
  component: Page,
});

const COMPONENTS = ["Website", "Workstation", "Simulated market data", "Order handling", "Accounts & login", "Back-office console", "Email delivery"];

function Bars() {
  return <div className="flex gap-[2px]">{Array.from({ length: 60 }, (_, i) => <span key={i} className="h-6 w-1 rounded-sm bg-gain opacity-80" />)}</div>;
}

function Page() {
  return (
    <ContentPage image={IMG.marketsGlobe} eyebrow="Support" title="System status" sub="Live view of the services that power the demo platform." crumbs={["Support", "Status"]} cta={false}>
      <Section>
        <div className="panel mb-8 flex items-center gap-3 border-gain p-5"><CheckCircle2 className="h-6 w-6 text-gain" /><div><div className="font-semibold">All systems operational</div><div className="text-sm text-muted-foreground">No incidents reported.</div></div></div>
        <div className="panel divide-y">
          {COMPONENTS.map((c) => (
            <div key={c} className="flex flex-col gap-3 p-5 md:flex-row md:items-center md:justify-between">
              <div className="flex items-center gap-2"><span className="h-2 w-2 rounded-full bg-gain" /><span className="font-medium">{c}</span></div>
              <div className="flex items-center gap-4"><div className="hidden md:block"><Bars /></div><span className="num text-sm text-gain">Operational</span></div>
            </div>
          ))}
        </div>
        <p className="mt-3 text-xs text-muted-foreground">Bars represent the last 60 days.</p>
        <SampleNote>Status shown is illustrative for the pilot. In production this page would connect to real monitoring.</SampleNote>
      </Section>
      <Section title="Past incidents" muted><p className="text-sm text-muted-foreground">No incidents in the last 90 days.</p></Section>
    
    </ContentPage>
  );
}
