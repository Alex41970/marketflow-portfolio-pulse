import { createFileRoute } from "@tanstack/react-router";
import { ContentPage, Section, pageHead } from "@/components/site/Sections";

export const Route = createFileRoute("/terms")({
  head: () => pageHead("Terms and Conditions", "Client account terms for Ledgerline Markets.", "/terms"),
  component: () => <ContentPage eyebrow="Legal" title="Terms and Conditions" sub="Client account terms" cta={false}>
    <Section>
      <div className="max-w-3xl space-y-6 leading-relaxed text-muted-foreground">
        <p className="border-l-2 border-primary pl-4">Draft for operator review. The account operator must supply its legal identity, contact details, applicable jurisdiction and final service terms before accepting registrations from customers.</p>
        <h2 className="text-xl font-semibold text-foreground">Your account</h2><p>Provide accurate account details and keep your password confidential. Personal and business accounts use euros as their account currency.</p>
        <h2 className="text-xl font-semibold text-foreground">Funding and account records</h2><p>Top-ups and withdrawals are requests subject to administrator review. Submitting a request does not automatically change your balance. The portal records approved movements and administrative adjustments.</p>
        <h2 className="text-xl font-semibold text-foreground">Market information</h2><p>Market prices shown on this website are generated, indicative only and not live exchange data. The client portal does not execute trades; any external trading service is subject to its separate terms.</p>
        <h2 className="text-xl font-semibold text-foreground">Final service terms</h2><p>The operator must confirm funding procedures, charges, cancellation rights, complaints procedures and any external trading arrangements in the final agreement.</p>
      </div>
    </Section>
  </ContentPage>,
});