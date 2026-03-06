import { en } from '@/lib/i18n/en'
import HeroSection from '@/components/marketing/HeroSection'
import ProblemStrip from '@/components/marketing/ProblemStrip'
import FeaturesGrid from '@/components/marketing/FeaturesGrid'
import TestimonialSection from '@/components/marketing/TestimonialSection'
import StorySection from '@/components/marketing/StorySection'
import BadgeShowcase from '@/components/marketing/BadgeShowcase'
import NumbersStrip from '@/components/marketing/NumbersStrip'
import ComparisonTable from '@/components/marketing/ComparisonTable'
import CTASection from '@/components/marketing/CTASection'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Megin — The Platform for Personal Trainers',
  description:
    'Client tracking, workout programming, nutrition management, and progress reports. Built by a trainer, for trainers. Free for up to 3 clients.',
  openGraph: {
    title: 'Megin — The Platform for Personal Trainers',
    description:
      'Stop losing clients. Start growing. The all-in-one platform for personal trainers.',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Megin — The Platform for Personal Trainers',
    description: 'Stop losing clients. Start growing.',
  },
}

const jsonLdData = {
  '@context': 'https://schema.org',
  '@type': 'SoftwareApplication',
  name: 'Megin',
  applicationCategory: 'BusinessApplication',
  operatingSystem: 'Web',
  description: 'The platform personal trainers use to track clients and grow their business.',
  offers: {
    '@type': 'Offer',
    price: '0',
    priceCurrency: 'USD',
    description: 'Free for up to 3 clients',
  },
}

export default function HomePage() {
  const t = en
  return (
    <>
      <script
        type="application/ld+json"
        // Static data only — no user input, safe for dangerouslySetInnerHTML
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLdData) }}
      />
      <HeroSection t={t} locale="en" />
      <ProblemStrip t={t} />
      <FeaturesGrid t={t} />
      <TestimonialSection t={t} />
      <StorySection t={t} />
      <ComparisonTable t={t} />
      <BadgeShowcase t={t} locale="en" />
      <NumbersStrip t={t} />
      <CTASection t={t} />
    </>
  )
}
