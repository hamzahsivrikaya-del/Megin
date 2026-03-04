import type { Metadata } from 'next'
import MarketingNavbar from '@/components/marketing/MarketingNavbar'
import MarketingFooter from '@/components/marketing/MarketingFooter'

export const metadata: Metadata = {
  metadataBase: new URL('https://megin.io'),
  title: {
    template: '%s — Megin',
    default: 'Megin — The Platform for Personal Trainers',
  },
  description:
    'Client tracking, workout programming, nutrition management, and progress reports, all in one platform built by a trainer, for trainers.',
  openGraph: {
    type: 'website',
    siteName: 'Megin',
  },
}

export default function MarketingLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="min-h-screen bg-white text-[#0A0A0A]">
      <MarketingNavbar locale="en" />
      <main>{children}</main>
      <MarketingFooter locale="en" />
    </div>
  )
}
