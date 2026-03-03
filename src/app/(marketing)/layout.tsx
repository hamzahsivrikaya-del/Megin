import MarketingNavbar from '@/components/marketing/MarketingNavbar'
import MarketingFooter from '@/components/marketing/MarketingFooter'

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
