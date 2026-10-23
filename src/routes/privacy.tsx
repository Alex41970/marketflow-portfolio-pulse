import { createFileRoute } from "@tanstack/react-router";
import { ContentPage, Section, pageHead } from "@/components/site/Sections";

export const Route = createFileRoute("/privacy")({
  head: () => pageHead("Privacy Notice", "Registration and account data information for Ledgerline Markets.", "/privacy"),
  component: () => <ContentPage eyebrow="Legal" title="Privacy Notice" sub="Your account information" cta={false}>
    <Section>
      <div className="max-w-3xl space-y-6 leading-relaxed text-muted-foreground">
        <p className="border-l-2 border-primary pl-4">Draft for operator review. The operator must supply the data controller's legal identity and contact, legal bases, retention periods, service providers, international transfer details and applicable privacy rights before customer registration.</p>
        <h2 className="text-xl font-semibold text-foreground">Information collected</h2><p>Registration collects account type, first and last name, email address and phone number, plus a record of terms acceptance. Passwords are handled by the authentication service and are not stored in your visible profile.</p>
        <h2 className="text-xl font-semibold text-foreground">Account administration</h2><p>Your details support account access and administration. Authorized administrators can view client profiles, funding requests and account records. Funding requests may contain wallet or bank details supplied by you.</p>
        <h2 className="text-xl font-semibold text-foreground">Access and security</h2><p>Clients can read their own account information. Administrative privileges are managed separately from registration information. Administrative balance adjustments are recorded in an audit log.</p>
        <h2 className="text-xl font-semibold text-foreground">Privacy requests</h2><p>The final notice must identify the operator's privacy contact and explain how to request access, correction, deletion and other applicable rights.</p>
      </div>
    </Section>
  </ContentPage>,
});