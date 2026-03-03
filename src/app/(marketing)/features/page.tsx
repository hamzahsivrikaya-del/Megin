import Link from 'next/link'
import type { Metadata } from 'next'
import FeatureShowcase from '@/components/marketing/FeatureShowcase'

export const metadata: Metadata = {
  title: 'Features | Megin',
  description:
    'Everything you need to manage clients, deliver programs, and grow your training business.',
}

const features = [
  {
    title: 'Client Management',
    description: 'Never lose track of a client again',
    bullets: [
      'Package tracking',
      'Lesson history',
      'Body measurements',
      'Payment status',
    ],
  },
  {
    title: 'Workout Programs',
    description: 'Programs that build themselves',
    bullets: [
      'Weekly builder',
      'Superset support',
      'Warmup & cardio sections',
      'Day-by-day scheduling',
    ],
  },
  {
    title: 'Nutrition Tracking',
    description: 'Know what your clients eat',
    bullets: [
      'Daily meal logging',
      'Photo proof',
      'Compliance percentages',
      'Custom meal plans',
    ],
  },
  {
    title: 'Progress Reports',
    description: 'Show clients their transformation',
    bullets: [
      'Body measurement charts',
      'Before/after photos',
      'PDF exports',
      'Goal tracking',
    ],
  },
  {
    title: 'Badge System',
    description: 'Gamify the grind',
    bullets: [
      '27 achievement badges',
      'Phase-based progression',
      'Share cards',
      'Push celebrations',
    ],
  },
  {
    title: 'Push Notifications',
    description: 'Be there without being there',
    bullets: [
      'Renewal reminders',
      'Meal logging nudges',
      'Weekly motivation',
      'Badge alerts',
    ],
  },
  {
    title: 'Parent-Child Accounts',
    description: 'Train families together',
    bullets: [
      'Link family members',
      'Shared visibility',
      'Individual tracking',
      'Parent notifications',
    ],
  },
  {
    title: 'Client Onboarding',
    description: 'First impressions that stick',
    bullets: [
      '4-step guided flow',
      'Goal setting',
      'Notification setup',
      'Welcome experience',
    ],
  },
  {
    title: 'Fitness Tools',
    description: 'Attract clients with free tools',
    bullets: [
      '7 calculators',
      'SEO traffic magnet',
      'BMI/calories/1RM/more',
      'Brand awareness',
    ],
  },
]

export default function FeaturesPage() {
  return (
    <>
      {/* Page header */}
      <section className="mkt-section pt-32 pb-16 text-center bg-white">
        <div className="mkt-container">
          <h1 className="mkt-heading-xl text-4xl sm:text-5xl md:text-6xl text-[#0A0A0A]">
            EVERYTHING YOU NEED
          </h1>
          <p className="text-[#6B7280] mt-4 max-w-2xl mx-auto leading-relaxed">
            Everything you need to manage clients, deliver programs, and grow your training business.
          </p>
        </div>
      </section>

      {/* Feature sections */}
      {features.map((feature, index) => (
        <section
          key={feature.title}
          className={`mkt-section py-16 sm:py-20 ${
            index % 2 === 0 ? 'bg-white' : 'bg-[#F5F5F5]'
          }`}
        >
          <div className="mkt-container">
            <FeatureShowcase
              title={feature.title}
              description={feature.description}
              bullets={feature.bullets}
              reversed={index % 2 !== 0}
            />
          </div>
        </section>
      ))}

      {/* Final CTA */}
      <section className="mkt-section py-20 text-center bg-white">
        <div className="mkt-container">
          <h2 className="mkt-heading-lg text-3xl sm:text-4xl md:text-5xl text-[#0A0A0A]">
            Ready to simplify your workflow?
          </h2>
          <div className="mt-8">
            <Link href="/signup" className="mkt-cta-primary">
              Get Started Free
              <svg
                width="16"
                height="16"
                viewBox="0 0 16 16"
                fill="none"
                aria-hidden="true"
              >
                <path
                  d="M3 8h10M9 4l4 4-4 4"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </Link>
          </div>
        </div>
      </section>
    </>
  )
}
