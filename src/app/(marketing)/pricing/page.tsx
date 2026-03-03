import type { Metadata } from 'next'
import PricingCards from '@/components/marketing/PricingCards'
import FAQAccordion from '@/components/marketing/FAQAccordion'

export const metadata: Metadata = {
  title: 'Pricing | Megin',
  description:
    'Simple, honest pricing for personal trainers. Free for up to 5 clients. No hidden fees, no contracts, cancel anytime.',
}

const faqItems = [
  {
    question: 'What happens when I hit the client limit?',
    answer:
      "You'll be prompted to upgrade to the next plan. Your existing clients and data are never affected — you just won't be able to add new clients until you upgrade or remove an existing one.",
  },
  {
    question: 'Can I switch plans anytime?',
    answer:
      'Yes, upgrade or downgrade anytime. When you upgrade, you get access to new features immediately. When you downgrade, the change takes effect at the end of your current billing period.',
  },
  {
    question: 'Is there a contract?',
    answer:
      'No contracts. Cancel anytime with no questions asked. We believe if our product is good, you should want to stay — not be locked in.',
  },
  {
    question: 'What payment methods do you accept?',
    answer:
      'Credit cards via Stripe — Visa, Mastercard, and American Express. All payments are processed securely and your card details are never stored on our servers.',
  },
  {
    question: 'Can I cancel anytime?',
    answer:
      'Yes, cancel with one click from your account settings. No cancellation fees, no retention flows designed to trap you. Your data remains accessible for 30 days after cancellation.',
  },
  {
    question: 'Is my data safe?',
    answer:
      'We use Supabase with Row Level Security — your data is isolated and never shared between trainers. All data is encrypted at rest and in transit.',
  },
]

export default function PricingPage() {
  return (
    <>
      {/* Page header */}
      <section className="mkt-section pt-32 pb-16 text-center bg-white">
        <div className="mkt-container">
          <h1 className="mkt-heading-xl text-4xl sm:text-5xl md:text-6xl text-[#0A0A0A]">
            SIMPLE, HONEST PRICING
          </h1>
          <p className="text-[#6B7280] mt-4 max-w-2xl mx-auto leading-relaxed">
            No hidden fees. No surprises. Cancel anytime.
          </p>
        </div>
      </section>

      {/* Pricing cards */}
      <section className="mkt-section pb-20 bg-white">
        <div className="mkt-container">
          <PricingCards />
        </div>
      </section>

      {/* FAQ */}
      <section className="mkt-section py-20 bg-[#F5F5F5]">
        <div className="mkt-container max-w-3xl mx-auto">
          <h2 className="mkt-heading-lg text-2xl sm:text-3xl text-[#0A0A0A] text-center mb-12">
            Frequently Asked Questions
          </h2>
          <FAQAccordion items={faqItems} />
        </div>
      </section>
    </>
  )
}
