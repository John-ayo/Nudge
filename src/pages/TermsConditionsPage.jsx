import LegalLayout, { LegalSection } from "../components/LegalLayout";

const SECTIONS = [
  {
    title: "1. Eligibility",
    blocks: [
      { type: "p", text: "You must be at least 13 years old to use Nudge. By using the App, you represent that you meet this requirement. If you are under 18, you confirm that you have your parent or guardian's permission to use the App." },
    ],
  },
  {
    title: "2. Your Account",
    blocks: [
      { type: "p", text: "To access Nudge, you must create an account using a valid email address. You are responsible for:" },
      { type: "ul", items: [
        "Keeping your login credentials confidential.",
        "All activity that occurs under your account.",
        "Notifying us immediately of any unauthorized access.",
      ]},
      { type: "p", text: "We reserve the right to suspend or terminate accounts that violate these Terms." },
    ],
  },
  {
    title: "3. Use of the App",
    blocks: [
      { type: "p", text: "You agree to use Nudge only for lawful purposes and in a manner that does not infringe the rights of others. You must not:" },
      { type: "ul", items: [
        "Attempt to access other users' accounts or data.",
        "Reverse engineer, decompile, or disassemble any part of the App.",
        "Use the App to distribute malware, spam, or harmful content.",
        "Use automated tools to scrape or extract data from the App.",
      ]},
    ],
  },
  {
    title: "4. Free Tier and Future Paid Features",
    blocks: [
      { type: "p", text: "Nudge is currently free to use. We may introduce paid features or subscription tiers in the future. When we do:" },
      { type: "ul", items: [
        "We will notify existing users clearly before any paid features are required.",
        "Free features will continue to be available unless otherwise communicated.",
        "Pricing, billing terms, and refund policies will be disclosed at the time of any paid offering.",
      ]},
    ],
  },
  {
    title: "5. Intellectual Property",
    blocks: [
      { type: "p", text: "All content, features, and functionality of the Nudge App, including but not limited to its design, text, graphics, and code, are owned by Nudge or its licensors and are protected by applicable intellectual property laws. You may not copy, modify, distribute, or create derivative works without our written permission." },
      { type: "p", text: "Content you create within the App (tasks, categories, notes) remains yours. You grant us a limited, non-exclusive license to store and process that content solely to provide the service." },
    ],
  },
  {
    title: "6. Disclaimers",
    blocks: [
      { type: "p", text: "Nudge is provided \"as is\" and \"as available\" without warranties of any kind, whether express or implied. We do not warrant that:" },
      { type: "ul", items: [
        "The App will be uninterrupted, error-free, or secure.",
        "Any data stored in the App will not be lost.",
        "The App will meet your specific requirements.",
      ]},
      { type: "p", text: "To the fullest extent permitted by law, we disclaim all warranties, including fitness for a particular purpose and non-infringement." },
    ],
  },
  {
    title: "7. Limitation of Liability",
    blocks: [
      { type: "p", text: "To the maximum extent permitted by applicable law, Nudge and its affiliates, officers, and employees will not be liable for:" },
      { type: "ul", items: [
        "Any indirect, incidental, or consequential damages arising from your use of the App.",
        "Loss of data, revenue, or profits.",
        "Any unauthorized access to or alteration of your data.",
      ]},
      { type: "p", text: "Our total liability to you for any claim arising under these Terms shall not exceed the amount you paid us in the twelve months prior to the claim, or USD $50, whichever is greater." },
    ],
  },
  {
    title: "8. Third-Party Services",
    blocks: [
      { type: "p", text: "Nudge integrates with third-party services including Supabase (database and authentication) and PostHog (analytics). Your use of the App is subject to those third parties' own terms of service and privacy policies. We are not responsible for the practices of third-party service providers." },
    ],
  },
  {
    title: "9. Changes to These Terms",
    blocks: [
      { type: "p", text: "We may update these Terms from time to time. When we do, we will update the Effective Date at the top and notify you via the App or email. Continued use of the App after changes are posted constitutes your acceptance of the updated Terms." },
    ],
  },
  {
    title: "10. Governing Law",
    blocks: [
      { type: "p", text: "These Terms are governed by the laws of the Federal Republic of Nigeria. Users in other jurisdictions are subject to local laws that may also apply. Any disputes arising under these Terms shall be resolved in the courts of Nigeria, unless applicable law requires otherwise." },
    ],
  },
];

export default function TermsConditionsPage() {
  return (
    <LegalLayout
      title="Terms and Conditions"
      effectiveDate="June 8, 2025"
      intro={`These Terms and Conditions ("Terms") govern your access to and use of the Nudge application ("App"), operated by Nudge ("we," "us," or "our"). By creating an account or using the App, you agree to be bound by these Terms. If you do not agree, do not use the App.`}
      otherPageLabel="Privacy Policy"
      otherPageHref="/privacy"
    >
      {SECTIONS.map(s => <LegalSection key={s.title} title={s.title} blocks={s.blocks}/>)}

      <section className="mb-8">
        <h2 className="text-lg font-bold mb-3" style={{ fontFamily: "'Syne',sans-serif", color: "var(--text-primary)" }}>
          11. Contact
        </h2>
        <p className="text-sm leading-relaxed" style={{ color: "var(--text-muted)" }}>
          If you have questions about these Terms, contact us at:{" "}
          <a href="mailto:legal@nudgeapp.io" className="font-semibold hover:underline" style={{ color: "var(--accent)" }}>
            legal@nudgeapp.io
          </a>
        </p>
      </section>
    </LegalLayout>
  );
}