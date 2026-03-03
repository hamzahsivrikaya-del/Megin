import type { Metadata } from 'next'
import MarketingNavbar from '@/components/marketing/MarketingNavbar'
import MarketingFooter from '@/components/marketing/MarketingFooter'

export const metadata: Metadata = {
  metadataBase: new URL('https://megin.io'),
  title: {
    template: '%s — Megin',
    default: 'Megin — Kişisel Antrenörler İçin Platform',
  },
  description:
    'Üye takibi, antrenman programlama, beslenme yönetimi ve ilerleme raporları — bir antrenör tarafından, antrenörler için geliştirilmiş tek platformda.',
  openGraph: {
    type: 'website',
    siteName: 'Megin',
  },
}

export default function TurkishMarketingLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="min-h-screen bg-white text-[#0A0A0A]">
      <MarketingNavbar locale="tr" />
      <main>{children}</main>
      <MarketingFooter locale="tr" />
    </div>
  )
}
