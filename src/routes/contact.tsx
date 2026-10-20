import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { CheckCircle2, Mail, MapPin, Phone } from "lucide-react";
import { ContentPage, Section, SampleNote, pageHead } from "@/components/site/Sections";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

export const Route = createFileRoute("/contact")({
  head: () => pageHead("Contact", "Get in touch about demos, partnerships or support.", "/contact"),
  component: Page,
});

function Page() {
  const [sent, setSent] = useState(false);
  return (
    <ContentPage eyebrow="Contact" title="Talk to our team" sub="Questions about the platform, a white-label pilot or your demo account? We'd love to hear from you." cta={false}>
      <Section>
        <div className="grid gap-10 md:grid-cols-[1.3fr_1fr]">
          <div className="panel p-8">
            {sent ? (
              <div className="py-10 text-center"><CheckCircle2 className="mx-auto h-10 w-10 text-gain" /><h3 className="mt-4 text-xl font-semibold">Thanks — message received</h3><p className="mt-2 text-sm text-muted-foreground">In this pilot, messages aren't stored or sent. In production, our team would reply within one business day.</p></div>
            ) : (
              <form className="space-y-4" onSubmit={(e) => { e.preventDefault(); setSent(true); }}>
                <div className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-1.5"><Label htmlFor="n">Name</Label><Input id="n" required maxLength={100} /></div>
                  <div className="space-y-1.5"><Label htmlFor="e">Email</Label><Input id="e" type="email" required maxLength={255} /></div>
                </div>
                <div className="space-y-1.5"><Label htmlFor="c">Company</Label><Input id="c" maxLength={100} /></div>
                <div className="space-y-1.5"><Label htmlFor="m">Message</Label><Textarea id="m" required rows={5} maxLength={1000} /></div>
                <Button type="submit">Send message</Button>
              </form>
            )}
          </div>
          <div className="space-y-4">
            {[[Mail, "Email", "hello@example.com"], [Phone, "Phone", "+44 20 0000 0000"], [MapPin, "Office", "1 Example Street, London"]].map(([I, l, v]) => {
              const Icon = I as typeof Mail;
              return <div key={l as string} className="panel flex gap-4 p-5"><Icon className="h-5 w-5 text-primary" /><div><div className="text-sm font-semibold">{l as string}</div><div className="text-sm text-muted-foreground">{v as string}</div></div></div>;
            })}
            <SampleNote>Contact details are placeholders for the pilot.</SampleNote>
          </div>
        </div>
      </Section>
    </ContentPage>
  );
}
