import { tr } from '@/lib/i18n/tr'
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
  title: 'Megin — Kişisel Antrenörler İçin Platform',
  description:
    'Üye takibi, antrenman programlama, beslenme yönetimi ve ilerleme raporları. Bir antrenör tarafından, antrenörler için geliştirildi. 5 üyeye kadar ücretsiz.',
  openGraph: {
    title: 'Megin — Kişisel Antrenörler İçin Platform',
    description:
      'Üye kaybını durdur. Büyümeye başla. Kişisel antrenörler için hepsi bir arada platform.',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Megin — Kişisel Antrenörler İçin Platform',
    description: 'Üye kaybını durdur. Büyümeye başla.',
  },
  alternates: {
    languages: {
      en: '/',
      tr: '/tr',
    },
  },
}

// Static schema data — no user input involved
const schemaData = {
  '@context': 'https://schema.org',
  '@type': 'SoftwareApplication',
  name: 'Megin',
  applicationCategory: 'BusinessApplication',
  operatingSystem: 'Web',
  description: 'Kişisel antrenörlerin üye takibi ve işlerini büyütmek için kullandığı platform.',
  offers: {
    '@type': 'Offer',
    price: '0',
    priceCurrency: 'TRY',
    description: '5 üyeye kadar ücretsiz',
  },
}

export default function TurkishHomePage() {
  const t = tr
  return (
    <>
      <script
        type="application/ld+json"
        // Static schema data only — safe for dangerouslySetInnerHTML
        dangerouslySetInnerHTML={{ __html: JSON.stringify(schemaData) }}
      />
      <HeroSection t={t} locale="tr" />
      <ProblemStrip t={t} />
      <FeaturesGrid t={t} />
      <TestimonialSection t={t} />
      <StorySection t={t} />
      <ComparisonTable t={t} />
      <BadgeShowcase t={t} locale="tr" />
      <NumbersStrip t={t} />
      <CTASection t={t} />
    </>
  )
}
