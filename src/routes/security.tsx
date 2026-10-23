import { IMG } from "@/lib/images";
import { createFileRoute } from "@tanstack/react-router";
import { AlertTriangle, Database, Eye, KeyRound, Lock, ScrollText } from "lucide-react";
import { ContentPage, Faq, FeatureGrid, ImageCards, Photo, Section, Split, Testimonials, pageHead } from "@/components/site/Sections";
import { BRAND } from "@/lib/brand";

export const Route = createFileRoute("/security")({
  head: () => pageHead("Security", "How accounts and data are protected in the trading platform.", "/security"),
  component: Page,
});

function Page() {
  return (
    <ContentPage image={IMG.securityLock} eyebrow="Support" title="Security and data protection" sub="How we keep accounts safe, and what you can do to help." crumbs={["Support", "Security"]}>
      <Section title="Account protection">
        <FeatureGrid items={[
          { icon: KeyRound, title: "Secure passwords", body: "Passwords are hashed and never visible to anyone — including administrators." },
          { icon: Lock, title: "Email confirmation", body: "New accounts must confirm their email before they can sign in." },
          { icon: Eye, title: "Temporary passwords", body: "If support issues a temporary password, you must change it at your next login." },
        ]} />
      </Section>
      <Section title="Data handling" muted>
        <FeatureGrid items={[
          { icon: Database, title: "Row-level access", body: "Every database request is checked so users can only read their own records." },
          { icon: ScrollText, title: "Audit logging", body: "Each admin adjustment to funds, bonuses or passwords is logged with author and reason." },
          { icon: Lock, title: "Server-side controls", body: "Balances can only change through protected server functions, never directly from the browser." },
        ]} />
      </Section>
      <Section>
        <div className="panel flex gap-4 border-warning p-6">
          <AlertTriangle className="h-6 w-6 shrink-0 text-warning-foreground" />
          <div><div className="font-semibold">Important notice</div><p className="mt-1 text-sm text-muted-foreground">{BRAND.disclaimer} We will never ask you to deposit money or share bank details. If anyone does, it isn't us.</p></div>
        </div>
      </Section>
      <Section title="Security FAQs" muted>
        <Faq items={[
          ["Can an administrator see my password?", "No. Administrators can send a reset link or set a temporary password, but they can never view your existing one."],
          ["How do I report a security issue?", "Use the contact page and mark your message as a security report."],
          ["Is my data shared?", "No. Account data is used only to run the platform."],
        ]} />
      </Section>
    <Section><Split title="Defence in depth" body="Protection happens at every layer: secure sign-in, server-side checks on every request, database-level access rules and an audit trail for admin actions." visual={<Photo src={IMG.securityLock} alt="Glowing padlock" />} /></Section>
    </ContentPage>
  );
}
