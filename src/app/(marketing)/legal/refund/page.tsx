import type { Metadata } from 'next'
import Link from 'next/link'

export const metadata: Metadata = {
  title: 'Refund Policy — Megin',
  description:
    'Megin refund policy. Understand our eligibility criteria, the refund process, timelines, and exceptions.',
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

export default function RefundPolicyPage() {
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
            <span className="text-xs text-[#0A0A0A]">Refund Policy</span>
          </nav>
          <p className="text-xs font-bold tracking-widest uppercase text-[#DC2626] mb-3">
            Legal
          </p>
          <h1 className="heading-display-xl text-3xl sm:text-4xl md:text-5xl text-[#0A0A0A]">
            REFUND POLICY
          </h1>
          <p className="text-sm text-[#9CA3AF] mt-4">Last updated: March 2026</p>
        </div>
      </section>

      {/* Content */}
      <section className="mkt-section py-16 bg-white">
        <div className="max-w-3xl mx-auto space-y-12">

          <Section title="1. Eligibility">
            <p>
              We want you to be satisfied with Megin. Refunds are available under the following conditions:
            </p>
            <ul className="list-disc pl-6 space-y-2">
              <li>
                <strong className="text-[#0A0A0A]">14-day money-back guarantee:</strong> If you are on a paid plan and are not satisfied, you may request a full refund within 14 days of your initial subscription payment.
              </li>
              <li>
                <strong className="text-[#0A0A0A]">Annual plans:</strong> If you subscribed to an annual plan and request a refund within 30 days of payment, you are eligible for a full refund.
              </li>
              <li>
                <strong className="text-[#0A0A0A]">Billing errors:</strong> If you were charged incorrectly (e.g., charged twice for the same period), you are eligible for a full refund of the erroneous charge at any time.
              </li>
            </ul>
            <p>
              Free plan users are not eligible for refunds as no payment is collected.
            </p>
          </Section>

          <Section title="2. How to Request a Refund">
            <p>
              To request a refund, contact us by email within the applicable eligibility window:
            </p>
            <div className="bg-[#F5F5F5] p-5 space-y-2">
              <p>
                <strong className="text-[#0A0A0A]">Email:</strong>{' '}
                <a
                  href="mailto:hello@megin.io"
                  className="text-[#DC2626] underline hover:no-underline"
                >
                  hello@megin.io
                </a>
              </p>
              <p className="text-sm text-[#6B7280]">
                Subject line: &quot;Refund Request — [your account email]&quot;
              </p>
            </div>
            <p>
              Please include your account email address and the reason for your refund request. We may ask a few follow-up questions to understand your experience — your feedback helps us improve.
            </p>
          </Section>

          <Section title="3. Timeline">
            <p>
              Once your refund request is approved:
            </p>
            <ul className="list-disc pl-6 space-y-2">
              <li>We will process the refund within 3 business days of approval.</li>
              <li>Refunds are returned to the original payment method.</li>
              <li>Depending on your bank or card issuer, it may take 5–10 business days for the funds to appear in your account.</li>
            </ul>
            <p>
              We will email you confirmation when the refund has been processed on our end.
            </p>
          </Section>

          <Section title="4. Exceptions">
            <p>
              Refunds will not be issued in the following circumstances:
            </p>
            <ul className="list-disc pl-6 space-y-2">
              <li>Requests made after the 14-day window (monthly plans) or 30-day window (annual plans) have passed.</li>
              <li>Accounts that have been terminated for violations of our Terms of Service.</li>
              <li>Partial refunds for unused portions of a monthly subscription period.</li>
              <li>Subscription renewals — you are responsible for cancelling before the renewal date. We will send a reminder email 7 days before each annual renewal.</li>
            </ul>
            <p>
              We handle edge cases on a case-by-case basis. If your situation is not covered above, email us and we will do our best to find a fair resolution.
            </p>
          </Section>

          <Section title="5. Contact">
            <p>
              For any questions about this Refund Policy or to request a refund:
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
                <strong className="text-[#0A0A0A]">Response time:</strong> Within 1–2 business days
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
              href="/legal/terms"
              className="text-sm font-semibold text-[#57534E] hover:text-[#DC2626] transition-colors"
            >
              Terms of Service
            </Link>
          </div>
        </div>
      </section>
    </>
  )
}
