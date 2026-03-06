import Link from 'next/link'
import MarketingNavbar from '@/components/marketing/MarketingNavbar'
import OneRMCalculator from '@/components/shared/OneRMCalculator'

export const metadata = {
  title: '1RM Hesaplayıcı — Maksimum Kaldırma Ağırlığı | Megin',
  description: 'Ücretsiz 1RM hesaplayıcı. Kaldırdığınız ağırlık ve tekrar sayısından tahmini maksimum ağırlığınızı öğrenin. Epley ve Brzycki formülleri.',
  openGraph: {
    title: '1RM Hesaplayıcı | Megin',
    description: 'Tahmini maksimum kaldırma ağırlığınızı ve antrenman yüzdelik tablonuzu hesaplayın. Ücretsiz.',
    siteName: 'Megin',
    locale: 'tr_TR',
    type: 'website',
  },
  twitter: {
    card: 'summary',
    title: '1RM Hesaplayıcı',
    description: 'Tahmini maksimum kaldırma ağırlığınızı hesaplayın.',
  },
}

export default function OneRMPage() {
  return (
    <div className="min-h-screen relative bg-[#FAFAFA]">
      <MarketingNavbar />

      <div className="relative max-w-6xl mx-auto px-4 pt-20 pb-12">
        <div className="flex items-center gap-2 text-sm text-[#6B7280] mb-8 animate-fade-up">
          <Link href="/" className="hover:text-[#DC2626] transition-colors">Ana Sayfa</Link>
          <span>/</span>
          <Link href="/araclar" className="hover:text-[#DC2626] transition-colors">Hesaplayıcılar</Link>
          <span>/</span>
          <span className="text-[#0A0A0A]">1RM Hesaplayıcı</span>
        </div>

        <div className="text-center mb-12 animate-fade-up">
          <h1 className="font-display text-4xl sm:text-5xl md:text-6xl tracking-wider">
            <span className="text-[#DC2626]">1RM</span> HESAPLAYICI
          </h1>
          <p className="text-[#6B7280] mt-4 max-w-2xl mx-auto leading-relaxed">
            Bir harekette belirli ağırlıkla kaç tekrar yaptığınızı girin, tahmini maksimum kaldırma ağırlığınızı ve yüzdelik tablonuzu görün.
          </p>
        </div>

        <div className="animate-fade-up delay-200">
          <OneRMCalculator />
        </div>

        <div className="grid sm:grid-cols-3 gap-6 mt-16 animate-fade-up delay-400">
          <div className="bg-white rounded-xl border border-[#E5E7EB] p-6">
            <div className="w-10 h-10 bg-[#DC2626]/10 rounded-lg flex items-center justify-center mb-3">
              <svg className="w-5 h-5 text-[#DC2626]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <h3 className="font-semibold mb-2">Epley Formülü</h3>
            <p className="text-sm text-[#6B7280] leading-relaxed">
              1RM = Ağırlık × (1 + Tekrar / 30). Yüksek tekrar sayılarında daha doğru sonuç verir.
            </p>
          </div>
          <div className="bg-white rounded-xl border border-[#E5E7EB] p-6">
            <div className="w-10 h-10 bg-amber-500/10 rounded-lg flex items-center justify-center mb-3">
              <svg className="w-5 h-5 text-amber-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <h3 className="font-semibold mb-2">Brzycki Formülü</h3>
            <p className="text-sm text-[#6B7280] leading-relaxed">
              1RM = Ağırlık × 36 / (37 - Tekrar). Düşük tekrar sayılarında (1-10) daha güvenilir sonuçlar.
            </p>
          </div>
          <div className="bg-white rounded-xl border border-[#E5E7EB] p-6">
            <div className="w-10 h-10 bg-green-500/10 rounded-lg flex items-center justify-center mb-3">
              <svg className="w-5 h-5 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
              </svg>
            </div>
            <h3 className="font-semibold mb-2">Yüzdelik Tablo</h3>
            <p className="text-sm text-[#6B7280] leading-relaxed">
              1RM'nizin yüzdelerine göre antrenman ağırlıklarınızı planlayın. Güç, hipertrofi ve dayanıklılık bölgeleri.
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
