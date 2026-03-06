import Link from 'next/link'
import MarketingNavbar from '@/components/marketing/MarketingNavbar'
import MacroCalculator from '@/components/shared/MacroCalculator'

export const metadata = {
  title: 'Kalori & Makro Hesaplayıcı | Megin',
  description: 'Ücretsiz kalori ve makro hesaplayıcı. Hedefinize göre günlük protein, yağ ve karbonhidrat ihtiyacınızı öğrenin.',
  openGraph: {
    title: 'Kalori & Makro Hesaplayıcı | Megin',
    description: 'Hedefinize göre günlük kalori, protein, yağ ve karbonhidrat ihtiyacınızı hesaplayın. Ücretsiz.',
    siteName: 'Megin',
    locale: 'tr_TR',
    type: 'website',
  },
  twitter: {
    card: 'summary',
    title: 'Kalori & Makro Hesaplayıcı',
    description: 'Hedefinize göre günlük kalori ve makro ihtiyacınızı hesaplayın.',
  },
}

export default function KaloriHesaplayiciPage() {
  return (
    <div className="min-h-screen relative bg-[#FAFAFA]">
      <MarketingNavbar />

      {/* İçerik */}
      <div className="relative max-w-6xl mx-auto px-4 pt-20 pb-12">
        {/* Breadcrumb */}
        <div className="flex items-center gap-2 text-sm text-[#6B7280] mb-8 animate-fade-up">
          <Link href="/" className="hover:text-[#DC2626] transition-colors">Ana Sayfa</Link>
          <span>/</span>
          <Link href="/araclar" className="hover:text-[#DC2626] transition-colors">Hesaplayıcılar</Link>
          <span>/</span>
          <span className="text-[#0A0A0A]">Kalori & Makro Hesaplayıcı</span>
        </div>

        {/* Başlık */}
        <div className="text-center mb-12 animate-fade-up">
          <h1 className="font-display text-4xl sm:text-5xl md:text-6xl tracking-wider">
            KALORİ & <span className="text-[#DC2626]">MAKRO</span> HESAPLAYICI
          </h1>
          <p className="text-[#6B7280] mt-4 max-w-2xl mx-auto leading-relaxed">
            Mifflin-St Jeor formülüyle günlük kalori ihtiyacınızı hesaplayın.
            Hedefinize göre protein, yağ ve karbonhidrat miktarlarınızı öğrenin.
          </p>
        </div>

        {/* Hesaplayıcı */}
        <div className="animate-fade-up delay-200">
          <MacroCalculator />
        </div>

        {/* Bilgi Kartları */}
        <div className="grid sm:grid-cols-3 gap-6 mt-16 animate-fade-up delay-400">
          <div className="bg-white rounded-xl border border-[#E5E7EB] p-6">
            <div className="w-10 h-10 bg-blue-500/10 rounded-lg flex items-center justify-center mb-3">
              <svg className="w-5 h-5 text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <h3 className="font-semibold mb-2">Mifflin-St Jeor Formülü</h3>
            <p className="text-sm text-[#6B7280] leading-relaxed">
              Bilimsel olarak en doğru kabul edilen BMR hesaplama yöntemi. Yaş, kilo, boy ve cinsiyete göre bazal metabolizma hızınızı hesaplar.
            </p>
          </div>
          <div className="bg-white rounded-xl border border-[#E5E7EB] p-6">
            <div className="w-10 h-10 bg-amber-500/10 rounded-lg flex items-center justify-center mb-3">
              <svg className="w-5 h-5 text-amber-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707" />
              </svg>
            </div>
            <h3 className="font-semibold mb-2">Aktivite Çarpanı (TDEE)</h3>
            <p className="text-sm text-[#6B7280] leading-relaxed">
              BMR değeriniz günlük aktivite seviyenizle çarpılarak toplam enerji harcamanız (TDEE) bulunur. Doğru seviye seçimi çok önemlidir.
            </p>
          </div>
          <div className="bg-white rounded-xl border border-[#E5E7EB] p-6">
            <div className="w-10 h-10 bg-green-500/10 rounded-lg flex items-center justify-center mb-3">
              <svg className="w-5 h-5 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
              </svg>
            </div>
            <h3 className="font-semibold mb-2">Makro Dağılımı</h3>
            <p className="text-sm text-[#6B7280] leading-relaxed">
              Hedefinize göre protein, yağ ve karbonhidrat oranları otomatik ayarlanır. Yağ yakımında yüksek protein, kas yapımında dengeli dağılım.
            </p>
          </div>
        </div>

      </div>

      {/* Footer */}
      <footer className="relative py-8 px-4 border-t border-[#E5E7EB] mt-12">
        <div className="max-w-6xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="text-sm text-[#6B7280]">
            © 2026 Megin. Tüm hakları saklıdır.
          </div>
          <div className="flex items-center gap-6">
            <Link href="/" className="text-sm text-[#6B7280] hover:text-[#0A0A0A] transition-colors">Ana Sayfa</Link>
            <Link href="/blog" className="text-sm text-[#6B7280] hover:text-[#0A0A0A] transition-colors">Blog</Link>
          </div>
        </div>
      </footer>
    </div>
  )
}
