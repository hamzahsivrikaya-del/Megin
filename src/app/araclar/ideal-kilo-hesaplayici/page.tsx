import Link from 'next/link'
import MarketingNavbar from '@/components/marketing/MarketingNavbar'
import IdealWeightCalculator from '@/components/shared/IdealWeightCalculator'

export const metadata = {
  title: 'İdeal Kilo Hesaplayıcı | Megin',
  description: 'Ücretsiz ideal kilo hesaplayıcı. Boy ve cinsiyetinize göre 4 farklı bilimsel formülle ideal kilonuzu öğrenin.',
  openGraph: {
    title: 'İdeal Kilo Hesaplayıcı | Megin',
    description: 'Boy ve cinsiyetinize göre 4 bilimsel formülle (Hamwi, Devine, Robinson, Miller) ideal kilonuzu öğrenin. Ücretsiz.',
    siteName: 'Megin',
    locale: 'tr_TR',
    type: 'website',
  },
  twitter: {
    card: 'summary',
    title: 'İdeal Kilo Hesaplayıcı',
    description: '4 bilimsel formülle ideal kilonuzu hesaplayın.',
  },
}

export default function IdealWeightPage() {
  return (
    <div className="min-h-screen relative bg-[#FAFAFA]">
      <MarketingNavbar />

      <div className="relative max-w-6xl mx-auto px-4 pt-20 pb-12">
        <div className="flex items-center gap-2 text-sm text-[#6B7280] mb-8 animate-fade-up">
          <Link href="/" className="hover:text-[#DC2626] transition-colors">Ana Sayfa</Link>
          <span>/</span>
          <Link href="/araclar" className="hover:text-[#DC2626] transition-colors">Hesaplayıcılar</Link>
          <span>/</span>
          <span className="text-[#0A0A0A]">İdeal Kilo Hesaplayıcı</span>
        </div>

        <div className="text-center mb-12 animate-fade-up">
          <h1 className="font-display text-4xl sm:text-5xl md:text-6xl tracking-wider">
            İDEAL <span className="text-[#DC2626]">KİLO</span> HESAPLAYICI
          </h1>
          <p className="text-[#6B7280] mt-4 max-w-2xl mx-auto leading-relaxed">
            Boy ve cinsiyetinize göre 4 farklı bilimsel formülle ideal kilonuzu hesaplayın. Mevcut kilonuzla karşılaştırın.
          </p>
        </div>

        <div className="animate-fade-up delay-200">
          <IdealWeightCalculator />
        </div>

        <div className="grid sm:grid-cols-2 gap-6 mt-16 animate-fade-up delay-400">
          <div className="bg-white rounded-xl border border-[#E5E7EB] p-6">
            <h3 className="font-semibold mb-2">4 Formül Neden?</h3>
            <p className="text-sm text-[#6B7280] leading-relaxed">
              Tek bir &ldquo;ideal kilo&rdquo; formülü yoktur. Devine, Robinson, Miller ve Hamwi formülleri farklı yaklaşımlar sunar. Ortalamaları alarak daha güvenilir bir sonuç elde edilir.
            </p>
          </div>
          <div className="bg-white rounded-xl border border-[#E5E7EB] p-6">
            <h3 className="font-semibold mb-2">İdeal Kilo = Sağlıklı Kilo mu?</h3>
            <p className="text-sm text-[#6B7280] leading-relaxed">
              İdeal kilo formülleri genel bir rehberdir. Kas kütlesi, vücut yapısı ve yaşam tarzı gibi faktörler dikkate alınmalıdır. Profesyonel değerlendirme için bir antrenöre danışın.
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
