import type { Metadata } from 'next'
import UseCaseSection from '@/components/marketing/UseCaseSection'

export const metadata: Metadata = {
  title: 'Use Cases | Megin',
  description:
    'Whether you train 10 clients or 100, Megin adapts to how you work. Built for independent trainers, gyms, and online coaches.',
}

export default function UseCasesPage() {
  return (
    <>
      {/* Page header */}
      <section className="mkt-section pt-32 pb-16 text-center bg-white">
        <div className="mkt-container">
          <h1 className="mkt-heading-xl text-4xl sm:text-5xl md:text-6xl text-[#0A0A0A]">
            BUILT FOR HOW YOU TRAIN
          </h1>
          <p className="text-[#6B7280] mt-4 max-w-2xl mx-auto leading-relaxed">
            Whether you train 10 clients or 100, Megin adapts to your workflow.
          </p>
        </div>
      </section>

      {/* Independent PT */}
      <UseCaseSection
        label="Independent PT"
        title="YOU TRAIN 10-30 CLIENTS"
        description="Stop juggling spreadsheets. Start scaling your business."
        features={[
          'Client packages',
          'Workout programming',
          'Progress tracking',
          'Automated reminders',
        ]}
        dark={false}
        ctaVariant="primary"
      />

      {/* Gym / Studio */}
      <UseCaseSection
        label="Gym / Studio"
        title="YOU MANAGE MULTIPLE TRAINERS"
        description="Give your team the tools. Keep the oversight."
        features={[
          'Multi-trainer management',
          'Client handoff',
          'Revenue tracking',
          'Centralized data',
        ]}
        dark={true}
        ctaVariant="primary"
      />

      {/* Online Coach */}
      <UseCaseSection
        label="Online Coach"
        title="YOUR CLIENTS ARE REMOTE"
        description="Keep them accountable from anywhere."
        features={[
          'Nutrition tracking with photos',
          'Weekly reports',
          'Badge motivation',
          'PWA mobile app',
        ]}
        dark={false}
        ctaVariant="ghost"
      />
    </>
  )
}
