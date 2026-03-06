import Link from 'next/link'
import MarketingNavbar from '@/components/marketing/MarketingNavbar'
import NavyBodyFatCalculator from '@/components/shared/NavyBodyFatCalculator'

export const metadata = {
  title: 'Vücut Yağ Oranı Hesaplayıcı — U.S. Navy Metodu | Megin',
  description: 'Ücretsiz vücut yağ oranı hesaplayıcı. Kaliper gerektirmez — sadece mezura ile boyun, bel ve kalça ölçümlerinizi girerek yağ yüzdenizi hesaplayın.',
}

export default function VucutYagPage() {
  return (
    <div className="min-h-screen relative bg-[#FAFAFA]">
      <MarketingNavbar />

      <div className="relative max-w-6xl mx-auto px-4 pt-20 pb-12">
        <div className="flex items-center gap-2 text-sm text-[#6B7280] mb-8 animate-fade-up">
          <Link href="/" className="hover:text-[#DC2626] transition-colors">Ana Sayfa</Link>
          <span>/</span>
          <Link href="/araclar" className="hover:text-[#DC2626] transition-colors">Hesaplayıcılar</Link>
          <span>/</span>
          <span className="text-[#0A0A0A]">Vücut Yağ Hesaplayıcı</span>
        </div>

        <div className="text-center mb-12 animate-fade-up">
          <h1 className="font-display text-4xl sm:text-5xl md:text-6xl tracking-wider">
            <span className="text-[#DC2626]">VÜCUT</span> YAĞ ORANI
          </h1>
          <p className="text-[#6B7280] mt-4 max-w-2xl mx-auto leading-relaxed">
            Kaliper cihazı gerektirmeyen U.S. Navy yöntemiyle vücut yağ yüzdenizi hesaplayın. Tek ihtiyacınız bir mezura.
          </p>
        </div>

        <div className="animate-fade-up delay-200">
          <NavyBodyFatCalculator />
        </div>

        <div className="grid sm:grid-cols-2 gap-6 mt-16 animate-fade-up delay-400">
          <div className="bg-white rounded-xl border border-[#E5E7EB] p-6">
            <h3 className="font-semibold mb-2">U.S. Navy Metodu Nedir?</h3>
            <p className="text-sm text-[#6B7280] leading-relaxed">
              ABD Donanması tarafından geliştirilen bu yöntem, boyun, bel ve kalça çevre ölçümlerini kullanarak vücut yağ oranını tahmin eder. Kaliper veya özel cihaz gerektirmez — sadece bir mezura yeterlidir. Erkeklerde boyun ve bel, kadınlarda boyun, bel ve kalça ölçümleri kullanılır.
            </p>
          </div>
          <div className="bg-white rounded-xl border border-[#E5E7EB] p-6">
            <h3 className="font-semibold mb-2">Doğru Ölçüm İçin</h3>
            <p className="text-sm text-[#6B7280] leading-relaxed">
              <strong>Boyun:</strong> Adem elmasının hemen altından yatay ölçün. <strong>Bel:</strong> Göbek hizasından, nefes verirken ölçün. <strong>Kalça:</strong> En geniş noktadan yatay ölçün. Mezurayı sıkmadan, ciltte düz tutarak ölçüm yapın.
            </p>
          </div>
        </div>

        {/* Skinfold vs Navy karşılaştırma */}
        <div className="mt-8 bg-white rounded-xl border border-[#E5E7EB] p-6 animate-fade-up delay-500">
          <h3 className="font-semibold mb-3">Skinfold Kaliper vs U.S. Navy — Hangisini Kullanmalıyım?</h3>
          <div className="grid sm:grid-cols-2 gap-4">
            <div className="bg-[#FAFAFA] rounded-lg p-4">
              <p className="text-sm font-medium text-[#0A0A0A] mb-1">Skinfold Kaliper</p>
              <ul className="text-sm text-[#6B7280] space-y-1">
                <li>+ Daha hassas sonuç</li>
                <li>+ Bölgesel yağ dağılımı bilgisi</li>
                <li>- Kaliper cihazı gerektirir</li>
                <li>- Doğru ölçüm deneyim ister</li>
              </ul>
            </div>
            <div className="bg-[#FAFAFA] rounded-lg p-4">
              <p className="text-sm font-medium text-[#0A0A0A] mb-1">U.S. Navy Metodu</p>
              <ul className="text-sm text-[#6B7280] space-y-1">
                <li>+ Sadece mezura yeterli</li>
                <li>+ Herkes kolayca yapabilir</li>
                <li>+ İlerleme takibi için ideal</li>
                <li>- Kalipere göre daha az hassas</li>
              </ul>
            </div>
          </div>
          <p className="text-xs text-[#6B7280] mt-3">
            Kaliper cihazınız varsa <Link href="/araclar/deri-kaliper-hesaplayici" className="text-[#DC2626] hover:underline">Skinfold Hesaplayıcı</Link>'yı kullanabilirsiniz.
          </p>
        </div>
      </div>

      <footer className="relative py-8 px-4 border-t border-[#E5E7EB] mt-12">
        <div className="max-w-6xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="text-sm text-[#6B7280]">&copy; 2026 Megin. Tüm hakları saklıdır.</div>
          <div className="flex items-center gap-6">
            <Link href="/" className="text-sm text-[#6B7280] hover:text-[#0A0A0A] transition-colors">Ana Sayfa</Link>
            <Link href="/blog" className="text-sm text-[#6B7280] hover:text-[#0A0A0A] transition-colors">Blog</Link>
          </div>
        </div>
      </footer>
    </div>
  )
}
