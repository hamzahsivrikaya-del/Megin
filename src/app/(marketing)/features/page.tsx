import type { Metadata } from 'next'
import { en } from '@/lib/i18n/en'
import FeaturesPageContent from '@/components/marketing/FeaturesPageContent'

export const metadata: Metadata = {
  title: 'Features | Megin',
  description:
    'Everything you need to manage clients, deliver programs, and grow your training business.',
}

export default function FeaturesPage() {
  return <FeaturesPageContent t={en} locale="en" />
}
