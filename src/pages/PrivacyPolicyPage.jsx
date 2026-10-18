import LegalLayout, { LegalSection } from "../components/LegalLayout";

// This mailbox must exist and receive mail before you publish.
// Sending domain verification in Resend does not give you an inbox.
const CONTACT_EMAIL = "johnpaulthedev@gemail.com";

const SECTIONS = [
  {
    title: "1. Information We Collect",
    blocks: [
      { type: "p", text: "We collect the following information when you use Nudge:" },
      { type: "ul", items: [
        "Email address: collected at signup for account creation and login.",
        "Display name: provided by you when creating your account.",
        "Task and productivity data: tasks, categories, completion records, streaks, and XP that you create within the App.",
        "GitHub username and public pull request details (repository, PR number, title, merge date): collected only if you choose to link your GitHub account in Settings. We read public data only.",
        "Push notification subscription details (browser endpoint and encryption keys): collected only if you enable notifications.",
        "Usage analytics: anonymized behavioral data such as which features you use, click patterns, and session duration, collected via PostHog.",
        "Device and browser information: collected automatically for security and performance purposes.",
      ]},
      { type: "p", text: "We do not collect payment data, phone numbers, or physical location information at this time." },
    ],
  },
  {
    title: "2. How We Use Your Information",
    blocks: [
      { type: "p", text: "We use your information to:" },
      { type: "ul", items: [
        "Create and manage your account.",
        "Deliver and improve the features of the App.",
        "Track your productivity data (streaks, XP, badges) to provide the App's core experience.",
        "Award XP for merged pull requests on public repositories, if you link your GitHub account.",
        "Understand how users interact with the App through aggregated analytics.",
        "Send important service-related communications (e.g. account updates, policy changes).",
      ]},
      { type: "p", text: "We do not sell your personal information to third parties. We do not use your data for advertising." },
    ],
  },
  {
    title: "3. Legal Basis for Processing (GDPR)",
    blocks: [
      { type: "p", text: "For users in the European Economic Area (EEA), we process your personal data under the following legal bases:" },
      { type: "ul", items: [
        "Contractual necessity: to provide you with the App's services.",
        "Legitimate interests: to improve App performance and prevent abuse.",
        "Consent: where we ask for your explicit permission, such as for optional notifications or for linking your GitHub account.",
      ]},
      { type: "p", text: "You may withdraw consent at any time without affecting the lawfulness of prior processing." },
    ],
  },
  {
    title: "4. Your Rights",
    blocks: [
      { type: "p", text: "Depending on your location, you may have the following rights regarding your personal data:" },
      { type: "ul", items: [
        "Access: request a copy of the data we hold about you.",
        "Correction: request that inaccurate data be corrected.",
        "Deletion: request that your account and associated data be permanently deleted (available via Settings > Delete Account).",
        "Portability: request your data in a machine-readable format.",
        "Objection: object to certain types of processing.",
        "Opt-out of sale (CCPA): we do not sell personal data. California residents may still submit a request to confirm this.",
      ]},
      { type: "p", text: `To exercise any of these rights, contact us at ${CONTACT_EMAIL}. We will respond within 30 days.` },
    ],
  },
  {
    title: "5. Data Retention",
    blocks: [
      { type: "p", text: "We retain your personal data for as long as your account is active. If you delete your account, we will delete your personal data within 30 days, except where we are required to retain it by law." },
      { type: "p", text: "Anonymized analytics data may be retained indefinitely." },
    ],
  },
  {
    title: "6. Data Security",
    blocks: [
      { type: "p", text: "We take reasonable technical and organizational measures to protect your personal data, including:" },
      { type: "ul", items: [
        "Encryption of data in transit using TLS.",
        "Supabase row-level security (RLS) to ensure users can only access their own data.",
        "Hashed authentication credentials managed by Supabase Auth.",
      ]},
      { type: "p", text: "No method of transmission over the internet is 100% secure. We cannot guarantee absolute security, and we encourage you to use a strong password." },
    ],
  },
  {
    title: "7. Third-Party Processors",
    blocks: [
      { type: "p", text: "We share your data with the following third-party service providers, who process it on our behalf:" },
      { type: "ul", items: [
        "Supabase (supabase.com): database storage, authentication, and real-time services. Data is stored on Supabase infrastructure.",
        "Vercel (vercel.com): application hosting.",
        "Resend (resend.com): email delivery for service messages and weekly summaries.",
        "PostHog (posthog.com): product analytics. PostHog receives anonymized usage data. We have configured PostHog to minimize personal data exposure.",
        "GitHub (github.com): if you link your account, we send your GitHub username to GitHub's public API to look up your public pull requests.",
      ]},
      { type: "p", text: "These providers are contractually obligated to protect your data and may not use it for their own purposes beyond what is necessary to provide us their services." },
    ],
  },
  {
    title: "8. International Data Transfers",
    blocks: [
      { type: "p", text: "Nudge is operated from Nigeria. If you are located in the EU or California, your data may be transferred to and processed in jurisdictions with different data protection laws. Where required, we rely on appropriate safeguards (such as standard contractual clauses) to protect your data during such transfers." },
    ],
  },
  {
    title: "9. Children's Privacy",
    blocks: [
      { type: "p", text: "Nudge is not directed to children under 13. We do not knowingly collect personal information from children under 13. If we become aware that we have inadvertently collected such information, we will delete it promptly. If you believe a child has provided us with personal data, contact us at the address below." },
    ],
  },
  {
    title: "10. Cookies and Tracking",
    blocks: [
      { type: "p", text: "The Nudge web app may use browser local storage and session storage for functional purposes (e.g. remembering your accent color preference). We do not use third-party advertising cookies. PostHog may set a cookie or use local storage for analytics session tracking." },
    ],
  },
  {
    title: "11. Changes to This Policy",
    blocks: [
      { type: "p", text: "We may update this Privacy Policy from time to time. We will notify you of material changes via the App or email and update the Effective Date. Continued use of the App after changes are posted constitutes your acceptance." },
    ],
  },
];

export default function PrivacyPolicyPage() {
  return (
    <LegalLayout
      title="Privacy Policy"
      effectiveDate="October 16, 2026"
      intro={`This Privacy Policy describes how Nudge ("we," "us," or "our") collects, uses, and protects your personal information when you use the Nudge application. By using the App, you agree to the practices described in this Policy.`}
      notice={`Nudge is operated from Nigeria. This policy is designed to comply with Nigeria's NDPR, the EU's GDPR, and California's CCPA, reflecting our intent to serve a global audience.`}
      otherPageLabel="Terms and Conditions"
      otherPageHref="/terms"
    >
      {SECTIONS.map(s => <LegalSection key={s.title} title={s.title} blocks={s.blocks}/>)}

      <section className="mb-8">
        <h2 className="text-lg font-bold mb-3" style={{ fontFamily: "'Syne',sans-serif", color: "var(--text-primary)" }}>
          12. Contact and Complaints
        </h2>
        <p className="text-sm leading-relaxed mb-3" style={{ color: "var(--text-muted)" }}>
          For privacy-related questions, requests, or complaints, contact:{" "}
          <a href={`mailto:${CONTACT_EMAIL}`} className="font-semibold hover:underline" style={{ color: "var(--accent)" }}>
            {CONTACT_EMAIL}
          </a>
        </p>
        <p className="text-sm leading-relaxed" style={{ color: "var(--text-muted)" }}>
          EU users have the right to lodge a complaint with your local data protection authority. Nigerian users may contact the Nigeria Data Protection Commission (NDPC).
        </p>
      </section>
    </LegalLayout>
  );
}