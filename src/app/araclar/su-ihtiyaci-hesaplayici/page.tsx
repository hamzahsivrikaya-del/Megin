import Link from 'next/link'
import MarketingNavbar from '@/components/marketing/MarketingNavbar'
import WaterCalculator from '@/components/shared/WaterCalculator'

export const metadata = {
  title: 'Su İhtiyacı Hesaplayıcı — Günlük Su Miktarı | Megin',
  description: 'Ücretsiz su ihtiyacı hesaplayıcı. Kilonuz ve aktivite seviyenize göre günlük içmeniz gereken su miktarını öğrenin.',
  openGraph: {
    title: 'Su İhtiyacı Hesaplayıcı | Megin',
    description: 'Kilonuz ve aktivite seviyenize göre günlük su ihtiyacınızı ve içme programınızı hesaplayın. Ücretsiz.',
    siteName: 'Megin',
    locale: 'tr_TR',
    type: 'website',
  },
  twitter: {
    card: 'summary',
    title: 'Su İhtiyacı Hesaplayıcı',
    description: 'Günlük su ihtiyacınızı ve içme programınızı hesaplayın.',
  },
}

export default function WaterPage() {
  return (
    <div className="min-h-screen relative bg-[#FAFAFA]">
      <MarketingNavbar />

      <div className="relative max-w-6xl mx-auto px-4 pt-20 pb-12">
        <div className="flex items-center gap-2 text-sm text-[#6B7280] mb-8 animate-fade-up">
          <Link href="/" className="hover:text-[#DC2626] transition-colors">Ana Sayfa</Link>
          <span>/</span>
          <Link href="/araclar" className="hover:text-[#DC2626] transition-colors">Hesaplayıcılar</Link>
          <span>/</span>
          <span className="text-[#0A0A0A]">Su İhtiyacı Hesaplayıcı</span>
        </div>

        <div className="text-center mb-12 animate-fade-up">
          <h1 className="font-display text-4xl sm:text-5xl md:text-6xl tracking-wider">
            SU <span className="text-blue-400">İHTİYACI</span> HESAPLAYICI
          </h1>
          <p className="text-[#6B7280] mt-4 max-w-2xl mx-auto leading-relaxed">
            Kilonuz ve aktivite seviyenize göre günlük su ihtiyacınızı hesaplayın. Gün boyunca ne zaman, ne kadar su içmeniz gerektiğini öğrenin.
          </p>
        </div>

        <div className="animate-fade-up delay-200">
          <WaterCalculator />
        </div>

        <div className="grid sm:grid-cols-3 gap-6 mt-16 animate-fade-up delay-400">
          <div className="bg-white rounded-xl border border-[#E5E7EB] p-6">
            <h3 className="font-semibold mb-2">Neden Su Önemli?</h3>
            <p className="text-sm text-[#6B7280] leading-relaxed">
              Vücudumuzun %60-70'i sudan oluşur. Kas performansı, metabolizma, sindirim ve beyin fonksiyonları için yeterli su tüketimi kritiktir.
            </p>
          </div>
          <div className="bg-white rounded-xl border border-[#E5E7EB] p-6">
            <h3 className="font-semibold mb-2">Antrenman ve Su</h3>
            <p className="text-sm text-[#6B7280] leading-relaxed">
              Egzersiz sırasında vücut saatte 0.5-2 litre su kaybedebilir. %2 dehidrasyon bile performansı %10-20 düşürebilir.
            </p>
          </div>
          <div className="bg-white rounded-xl border border-[#E5E7EB] p-6">
            <h3 className="font-semibold mb-2">İpuçları</h3>
            <p className="text-sm text-[#6B7280] leading-relaxed">
              Sabah kalkar kalkmaz 1 bardak su için. Antrenman öncesi ve sonrası mutlaka su tüketin. İdrar renginiz açık sarı olmalı.
            </p>
          </div>
        </div>

      </div>

      <footer className="relative py-8 px-4 border-t border-[#E5E7EB] mt-12">
        <div className="max-w-6xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="text-sm text-[#6B7280]">© 2026 Megin. Tüm hakları saklıdır.</div>
          <div className="flex items-center gap-6">
            <Link href="/" className="text-sm text-[#6B7280] hover:text-[#0A0A0A] transition-colors">Ana Sayfa</Link>
            <Link href="/blog" className="text-sm text-[#6B7280] hover:text-[#0A0A0A] transition-colors">Blog</Link>
          </div>
        </div>
      </footer>
    </div>
  )
}
