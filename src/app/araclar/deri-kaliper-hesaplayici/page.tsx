import Link from 'next/link'
import MarketingNavbar from '@/components/marketing/MarketingNavbar'
import SkinfoldCalculator from '@/components/shared/SkinfoldCalculator'

export const metadata = {
  title: 'Derialtı Yağ Hesaplayıcı — Vücut Yağ Oranı | Megin',
  description: 'Ücretsiz derialtı yağ hesaplayıcı. Jackson & Pollock 3 nokta yöntemiyle vücut yağ yüzdenizi ve yağsız vücut kütlenizi hesaplayın.',
}

export default function DeriKaliperPage() {
  return (
    <div className="min-h-screen relative bg-[#FAFAFA]">
      <MarketingNavbar />

      <div className="relative max-w-6xl mx-auto px-4 pt-20 pb-12">
        <div className="flex items-center gap-2 text-sm text-[#6B7280] mb-8 animate-fade-up">
          <Link href="/" className="hover:text-[#DC2626] transition-colors">Ana Sayfa</Link>
          <span>/</span>
          <Link href="/araclar" className="hover:text-[#DC2626] transition-colors">Hesaplayıcılar</Link>
          <span>/</span>
          <span className="text-[#0A0A0A]">Derialtı Yağ Hesaplayıcı</span>
        </div>

        <div className="text-center mb-12 animate-fade-up">
          <h1 className="font-display text-4xl sm:text-5xl md:text-6xl tracking-wider">
            <span className="text-[#DC2626]">DERİALTI</span> YAĞ
          </h1>
          <p className="text-[#6B7280] mt-4 max-w-2xl mx-auto leading-relaxed">
            Jackson & Pollock 3 nokta kaliper yöntemiyle vücut yağ yüzdenizi, yağ kitlenizi ve yağsız vücut ağırlığınızı hesaplayın.
          </p>
        </div>

        <div className="animate-fade-up delay-200">
          <SkinfoldCalculator />
        </div>

        <div className="grid sm:grid-cols-2 gap-6 mt-16 animate-fade-up delay-400">
          <div className="bg-white rounded-xl border border-[#E5E7EB] p-6">
            <h3 className="font-semibold mb-2">Jackson & Pollock Yöntemi Nedir?</h3>
            <p className="text-sm text-[#6B7280] leading-relaxed">
              1978 yılında geliştirilen bu yöntem, belirli bölgelerdeki deri kıvrımı kalınlığını ölçerek vücut yoğunluğunu tahmin eder. Erkekler için göğüs, karın ve uyluk; kadınlar için triseps, suprailiak ve uyluk bölgeleri kullanılır.
            </p>
          </div>
          <div className="bg-white rounded-xl border border-[#E5E7EB] p-6">
            <h3 className="font-semibold mb-2">Doğru Ölçüm İçin</h3>
            <p className="text-sm text-[#6B7280] leading-relaxed">
              Kaliper ölçümlerinin doğru yapılması sonucun güvenilirliğini doğrudan etkiler. Her bölgeyi 2-3 kez ölçüp ortalamasını alın. Ölçümleri sabah, egzersiz öncesinde ve tok karnına yapmayın.
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
