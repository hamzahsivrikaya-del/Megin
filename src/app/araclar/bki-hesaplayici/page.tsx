import Link from 'next/link'
import MarketingNavbar from '@/components/marketing/MarketingNavbar'
import BMICalculator from '@/components/shared/BMICalculator'

export const metadata = {
  title: 'BMI Hesaplayıcı — Vücut Kitle İndeksi | Megin',
  description: 'Ücretsiz BMI hesaplayıcı. Boy ve kilonuza göre Vücut Kitle İndeksinizi hesaplayın, ideal kilo aralığınızı öğrenin.',
  openGraph: {
    title: 'BMI Hesaplayıcı | Megin',
    description: 'Boy ve kilonuza göre Vücut Kitle İndeksinizi hesaplayın. Sağlıklı kilo aralığınızı öğrenin. Ücretsiz.',
    siteName: 'Megin',
    locale: 'tr_TR',
    type: 'website',
  },
  twitter: {
    card: 'summary',
    title: 'BMI Hesaplayıcı',
    description: 'Vücut Kitle İndeksinizi hesaplayın, sağlıklı aralığı öğrenin.',
  },
}

export default function BKIPage() {
  return (
    <div className="min-h-screen relative bg-[#FAFAFA]">
      <MarketingNavbar />

      <div className="relative max-w-6xl mx-auto px-4 pt-20 pb-12">
        <div className="flex items-center gap-2 text-sm text-[#6B7280] mb-8 animate-fade-up">
          <Link href="/" className="hover:text-[#DC2626] transition-colors">Ana Sayfa</Link>
          <span>/</span>
          <Link href="/araclar" className="hover:text-[#DC2626] transition-colors">Hesaplayıcılar</Link>
          <span>/</span>
          <span className="text-[#0A0A0A]">BMI Hesaplayıcı</span>
        </div>

        <div className="text-center mb-12 animate-fade-up">
          <h1 className="font-display text-4xl sm:text-5xl md:text-6xl tracking-wider">
            <span className="text-[#DC2626]">BMI</span> HESAPLAYICI
          </h1>
          <p className="text-[#6B7280] mt-4 max-w-2xl mx-auto leading-relaxed">
            Vücut Kitle İndeksinizi hesaplayarak sağlıklı kilo aralığınızı öğrenin. BMI genel bir rehberdir, kas kütlesini hesaba katmaz.
          </p>
        </div>

        <div className="animate-fade-up delay-200">
          <BMICalculator />
        </div>

        <div className="grid sm:grid-cols-2 gap-6 mt-16 animate-fade-up delay-400">
          <div className="bg-white rounded-xl border border-[#E5E7EB] p-6">
            <h3 className="font-semibold mb-2">BMI Nedir?</h3>
            <p className="text-sm text-[#6B7280] leading-relaxed">
              Vücut Kitle İndeksi (BMI), kilonuzun boyunuzla orantılı olup olmadığını gösteren bir göstergedir. Formül: kilo (kg) / boy² (m²). Dünya Sağlık Örgütü tarafından kullanılan standart bir ölçüttür.
            </p>
          </div>
          <div className="bg-white rounded-xl border border-[#E5E7EB] p-6">
            <h3 className="font-semibold mb-2">Sınırlılıkları</h3>
            <p className="text-sm text-[#6B7280] leading-relaxed">
              BMI kas kütlesini, kemik yoğunluğunu ve vücut kompozisyonunu hesaba katmaz. Kas kütlesi yüksek sporcular normal kiloda olsalar bile yüksek BMI gösterebilir. Daha doğru sonuç için vücut yağ oranı ölçümü önerilir.
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
