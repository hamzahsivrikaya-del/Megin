import type { Metadata } from 'next'
import Link from 'next/link'

export const metadata: Metadata = {
  title: 'Privacy Policy — Megin',
  description:
    'Learn how Megin collects, uses, and protects your personal data. We are committed to transparency and your privacy.',
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="space-y-4">
      <h2 className="heading-display text-lg sm:text-xl text-[#0A0A0A]">{title}</h2>
      <div className="space-y-3 text-[#374151] text-sm sm:text-base leading-relaxed">
        {children}
      </div>
    </section>
  )
}

export default function PrivacyPolicyPage() {
  return (
    <>
      {/* Header */}
      <section className="mkt-section pt-32 pb-12 bg-white border-b border-[#E5E7EB]">
        <div className="mkt-container">
          <nav className="mb-6">
            <Link
              href="/"
              className="text-xs text-[#9CA3AF] hover:text-[#DC2626] transition-colors"
            >
              Home
            </Link>
            <span className="text-[#9CA3AF] mx-2">/</span>
            <span className="text-xs text-[#0A0A0A]">Privacy Policy</span>
          </nav>
          <p className="text-xs font-bold tracking-widest uppercase text-[#DC2626] mb-3">
            Legal
          </p>
          <h1 className="heading-display-xl text-3xl sm:text-4xl md:text-5xl text-[#0A0A0A]">
            PRIVACY POLICY
          </h1>
          <p className="text-sm text-[#9CA3AF] mt-4">Last updated: March 2026</p>
        </div>
      </section>

      {/* Content */}
      <section className="mkt-section py-16 bg-white">
        <div className="max-w-3xl mx-auto space-y-12">

          <Section title="1. Information We Collect">
            <p>
              We collect information you provide directly when you create an account, use our services, or contact us. This includes:
            </p>
            <ul className="list-disc pl-6 space-y-2">
              <li>
                <strong className="text-[#0A0A0A]">Account information:</strong> Full name, email address, password, and optionally your gym or studio name.
              </li>
              <li>
                <strong className="text-[#0A0A0A]">Client data:</strong> Information you enter about your clients, including body measurements, workout history, nutrition logs, and progress photos. This data is entered by you as the trainer.
              </li>
              <li>
                <strong className="text-[#0A0A0A]">Usage data:</strong> How you interact with the platform — pages visited, features used, and actions taken — collected automatically.
              </li>
              <li>
                <strong className="text-[#0A0A0A]">Device and technical data:</strong> IP address, browser type, operating system, and cookies.
              </li>
            </ul>
          </Section>

          <Section title="2. How We Use Your Information">
            <p>We use the information we collect to:</p>
            <ul className="list-disc pl-6 space-y-2">
              <li>Provide, maintain, and improve the Megin platform.</li>
              <li>Process payments and manage subscriptions.</li>
              <li>Send transactional emails (account confirmations, password resets, billing receipts).</li>
              <li>Send product updates and announcements (you may unsubscribe at any time).</li>
              <li>Respond to support requests and inquiries.</li>
              <li>Detect and prevent fraud, abuse, and security incidents.</li>
              <li>Comply with legal obligations.</li>
            </ul>
            <p>
              We do not sell your personal data or your clients&apos; data to third parties. Ever.
            </p>
          </Section>

          <Section title="3. Data Sharing">
            <p>
              We share your information only in the following limited circumstances:
            </p>
            <ul className="list-disc pl-6 space-y-2">
              <li>
                <strong className="text-[#0A0A0A]">Service providers:</strong> We work with trusted third-party vendors (e.g., Supabase for database hosting, Stripe for payments, and email delivery providers) who process data on our behalf under strict confidentiality agreements.
              </li>
              <li>
                <strong className="text-[#0A0A0A]">Legal requirements:</strong> We may disclose information when required by law, court order, or to protect the rights and safety of Megin, our users, or others.
              </li>
              <li>
                <strong className="text-[#0A0A0A]">Business transfers:</strong> If Megin is acquired or merges with another company, your information may be transferred as part of that transaction. We will notify you before that happens.
              </li>
            </ul>
          </Section>

          <Section title="4. Data Retention">
            <p>
              We retain your account data for as long as your account is active. If you close your account, we delete your personal data within 30 days, except where we are required to retain it for legal or compliance purposes (typically up to 7 years for billing records).
            </p>
            <p>
              Client data you have entered remains in your account until you delete it or close your account. We do not retain client data after account deletion.
            </p>
          </Section>

          <Section title="5. Your Rights">
            <p>
              Depending on your location, you may have the following rights regarding your personal data:
            </p>
            <ul className="list-disc pl-6 space-y-2">
              <li>
                <strong className="text-[#0A0A0A]">Access:</strong> Request a copy of the personal data we hold about you.
              </li>
              <li>
                <strong className="text-[#0A0A0A]">Correction:</strong> Request that we correct inaccurate or incomplete data.
              </li>
              <li>
                <strong className="text-[#0A0A0A]">Deletion:</strong> Request that we delete your personal data. You can do this directly from your account settings.
              </li>
              <li>
                <strong className="text-[#0A0A0A]">Portability:</strong> Request your data in a machine-readable format.
              </li>
              <li>
                <strong className="text-[#0A0A0A]">Objection:</strong> Object to certain processing of your data, including direct marketing.
              </li>
            </ul>
            <p>
              To exercise any of these rights, email us at{' '}
              <a
                href="mailto:hello@megin.io"
                className="text-[#DC2626] underline hover:no-underline"
              >
                hello@megin.io
              </a>
              . We will respond within 30 days.
            </p>
          </Section>

          <Section title="6. Contact">
            <p>
              If you have questions about this Privacy Policy or how we handle your data, contact us at:
            </p>
            <div className="bg-[#F5F5F5] p-5 space-y-1">
              <p>
                <strong className="text-[#0A0A0A]">Email:</strong>{' '}
                <a
                  href="mailto:hello@megin.io"
                  className="text-[#DC2626] underline hover:no-underline"
                >
                  hello@megin.io
                </a>
              </p>
              <p>
                <strong className="text-[#0A0A0A]">Website:</strong> megin.io
              </p>
            </div>
          </Section>

          {/* Navigation to other legal pages */}
          <div className="border-t border-[#E5E7EB] pt-8 flex flex-col sm:flex-row gap-4">
            <Link
              href="/legal/terms"
              className="text-sm font-semibold text-[#57534E] hover:text-[#DC2626] transition-colors"
            >
              Terms of Service
            </Link>
            <Link
              href="/legal/refund"
              className="text-sm font-semibold text-[#57534E] hover:text-[#DC2626] transition-colors"
            >
              Refund Policy
            </Link>
          </div>
        </div>
      </section>
    </>
  )
}
