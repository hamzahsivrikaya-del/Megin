import type { Metadata } from 'next'
import Link from 'next/link'

export const metadata: Metadata = {
  title: 'Terms of Service — Megin',
  description:
    'Read the Megin Terms of Service. These terms govern your use of the Megin platform and services.',
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="space-y-4">
      <h2 className="mkt-heading-lg text-lg sm:text-xl text-[#0A0A0A]">{title}</h2>
      <div className="space-y-3 text-[#374151] text-sm sm:text-base leading-relaxed">
        {children}
      </div>
    </section>
  )
}

export default function TermsOfServicePage() {
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
            <span className="text-xs text-[#0A0A0A]">Terms of Service</span>
          </nav>
          <p className="text-xs font-bold tracking-widest uppercase text-[#DC2626] mb-3">
            Legal
          </p>
          <h1 className="mkt-heading-xl text-3xl sm:text-4xl md:text-5xl text-[#0A0A0A]">
            TERMS OF SERVICE
          </h1>
          <p className="text-sm text-[#9CA3AF] mt-4">Last updated: March 2026</p>
        </div>
      </section>

      {/* Content */}
      <section className="mkt-section py-16 bg-white">
        <div className="max-w-3xl mx-auto space-y-12">

          <Section title="1. Acceptance of Terms">
            <p>
              By accessing or using Megin (&quot;the Service&quot;), you agree to be bound by these Terms of Service (&quot;Terms&quot;). If you do not agree to these Terms, do not use the Service.
            </p>
            <p>
              These Terms apply to all users of the Service, including personal trainers and coaches who create accounts (&quot;Trainers&quot;) and any clients managed through the platform.
            </p>
          </Section>

          <Section title="2. Account Registration">
            <p>
              To use Megin, you must create an account with a valid email address. You are responsible for:
            </p>
            <ul className="list-disc pl-6 space-y-2">
              <li>Providing accurate and complete registration information.</li>
              <li>Maintaining the security and confidentiality of your password.</li>
              <li>All activities that occur under your account.</li>
              <li>Notifying us immediately of any unauthorized access to your account.</li>
            </ul>
            <p>
              You must be at least 18 years old to create an account. By creating an account, you represent that you meet this requirement.
            </p>
          </Section>

          <Section title="3. Use License">
            <p>
              Megin grants you a limited, non-exclusive, non-transferable, revocable license to use the Service for your personal training business, subject to these Terms.
            </p>
            <p>You agree not to:</p>
            <ul className="list-disc pl-6 space-y-2">
              <li>Copy, modify, or distribute any part of the Service without prior written consent.</li>
              <li>Use the Service for any illegal or unauthorized purpose.</li>
              <li>Attempt to reverse-engineer, decompile, or extract source code from the Service.</li>
              <li>Use automated tools (bots, scrapers) to access the Service.</li>
              <li>Transmit viruses, malware, or any harmful code through the Service.</li>
              <li>Use the Service to store or transmit content that is unlawful, defamatory, or infringes third-party rights.</li>
            </ul>
          </Section>

          <Section title="4. Payments and Subscriptions">
            <p>
              Megin offers a free plan and paid subscription plans. By subscribing to a paid plan:
            </p>
            <ul className="list-disc pl-6 space-y-2">
              <li>You authorize us to charge your payment method on a recurring basis (monthly or annually).</li>
              <li>Subscription fees are charged in advance at the start of each billing period.</li>
              <li>Prices may change with 30 days&apos; notice. Continued use after a price change constitutes acceptance.</li>
              <li>All payments are processed securely through Stripe. We do not store your full card details.</li>
            </ul>
            <p>
              The free plan includes access to core features for up to 5 clients. Feature availability may differ between plans.
            </p>
          </Section>

          <Section title="5. Termination">
            <p>
              You may cancel your account at any time from your account settings. Cancellation takes effect at the end of your current billing period.
            </p>
            <p>
              We reserve the right to suspend or terminate your account without notice if you violate these Terms, engage in fraudulent activity, or for any other reason we deem necessary to protect the Service and its users.
            </p>
            <p>
              Upon termination, your right to use the Service ceases. You may export your data for 30 days after cancellation, after which it will be permanently deleted.
            </p>
          </Section>

          <Section title="6. Disclaimers">
            <p>
              The Service is provided &quot;as is&quot; and &quot;as available&quot; without warranties of any kind, either express or implied, including but not limited to implied warranties of merchantability, fitness for a particular purpose, or non-infringement.
            </p>
            <p>
              Megin does not warrant that the Service will be uninterrupted, error-free, or free from security vulnerabilities. We are not responsible for any data loss resulting from technical failures.
            </p>
            <p>
              Megin is a software platform for personal trainers. We are not a healthcare provider and do not provide medical advice. Trainers are solely responsible for the fitness and nutrition guidance they provide to their clients.
            </p>
          </Section>

          <Section title="7. Limitation of Liability">
            <p>
              To the maximum extent permitted by applicable law, Megin shall not be liable for any indirect, incidental, special, consequential, or punitive damages, including loss of profits, data, or goodwill, arising from your use of or inability to use the Service.
            </p>
            <p>
              Our total liability to you for any claims arising from these Terms or your use of the Service shall not exceed the amount you paid us in the 12 months preceding the claim.
            </p>
          </Section>

          <Section title="8. Contact">
            <p>
              If you have questions about these Terms of Service, contact us at:
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
              href="/legal/privacy"
              className="text-sm font-semibold text-[#57534E] hover:text-[#DC2626] transition-colors"
            >
              Privacy Policy
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
