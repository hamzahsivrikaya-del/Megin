import type { Metadata } from 'next'
import { tr } from '@/lib/i18n/tr'
import FeaturesPageContent from '@/components/marketing/FeaturesPageContent'

export const metadata: Metadata = {
  title: 'Özellikler | Megin',
  description:
    'Müşterilerinizi yönetmek, program sunmak ve antrenörlük işinizi büyütmek için ihtiyacınız olan her şey.',
  alternates: {
    languages: {
      en: '/features',
      tr: '/tr/features',
    },
  },
}

export default function TurkishFeaturesPage() {
  return <FeaturesPageContent t={tr} locale="tr" />
}
