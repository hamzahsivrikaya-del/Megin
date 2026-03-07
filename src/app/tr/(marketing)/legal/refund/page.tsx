import type { Metadata } from 'next'
import Link from 'next/link'

export const metadata: Metadata = {
  title: 'İade Politikası — Megin',
  description:
    'Megin iade politikası. Uygunluk kriterleri, iade süreci, zaman çizelgeleri ve istisnalar hakkında bilgi edinin.',
  alternates: {
    languages: {
      en: '/legal/refund',
      tr: '/tr/legal/refund',
    },
  },
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="space-y-4">
      <h2 className="heading-display text-lg sm:text-xl text-[#0A0A0A]">{title}</h2>
      <div className="space-y-3 text-[#374151] text-sm sm:text-base leading-relaxed">
        {children}
      </div>
    </section>
  )
}

export default function TurkishRefundPolicyPage() {
  return (
    <>
      <section className="mkt-section pt-32 pb-12 bg-white border-b border-[#E5E7EB]">
        <div className="mkt-container">
          <nav className="mb-6">
            <Link
              href="/tr"
              className="text-xs text-[#9CA3AF] hover:text-[#DC2626] transition-colors"
            >
              Ana Sayfa
            </Link>
            <span className="text-[#9CA3AF] mx-2">/</span>
            <span className="text-xs text-[#0A0A0A]">İade Politikası</span>
          </nav>
          <p className="text-xs font-bold tracking-widest uppercase text-[#DC2626] mb-3">
            Yasal
          </p>
          <h1 className="heading-display-xl text-3xl sm:text-4xl md:text-5xl text-[#0A0A0A]">
            İADE POLİTİKASI
          </h1>
          <p className="text-sm text-[#9CA3AF] mt-4">Son güncelleme: Mart 2026</p>
        </div>
      </section>

      <section className="mkt-section py-16 bg-white">
        <div className="max-w-3xl mx-auto space-y-12">

          <Section title="1. Uygunluk">
            <p>
              Megin ile memnun kalmanızı istiyoruz. İadeler aşağıdaki koşullar altında mevcuttur:
            </p>
            <ul className="list-disc pl-6 space-y-2">
              <li>
                <strong className="text-[#0A0A0A]">14 günlük para iade garantisi:</strong> Ücretli bir plandaysanız ve memnun kalmadıysanız, ilk abonelik ödemenizden itibaren 14 gün içinde tam iade talep edebilirsiniz.
              </li>
              <li>
                <strong className="text-[#0A0A0A]">Yıllık planlar:</strong> Yıllık bir plana abone oldunuzsa ve ödemenizden itibaren 30 gün içinde iade talep ederseniz tam iade almaya hakkınız vardır.
              </li>
              <li>
                <strong className="text-[#0A0A0A]">Fatura hataları:</strong> Yanlış ücretlendirildiyseniz (ör. aynı dönem için iki kez ücretlendirildiyseniz), hatalı ücret için istediğiniz zaman tam iade almaya hakkınız vardır.
              </li>
            </ul>
            <p>
              Ücretsiz plan kullanıcıları ödeme alınmadığı için iade hakkına sahip değildir.
            </p>
          </Section>

          <Section title="2. İade Nasıl Talep Edilir">
            <p>
              İade talebinde bulunmak için geçerlilik süresi içinde e-posta ile bize ulaşın:
            </p>
            <div className="bg-[#F5F5F5] p-5 space-y-2">
              <p>
                <strong className="text-[#0A0A0A]">E-posta:</strong>{' '}
                <a
                  href="mailto:hello@megin.io"
                  className="text-[#DC2626] underline hover:no-underline"
                >
                  hello@megin.io
                </a>
              </p>
              <p className="text-sm text-[#6B7280]">
                Konu satırı: &quot;İade Talebi — [hesap e-postanız]&quot;
              </p>
            </div>
            <p>
              Hesap e-posta adresinizi ve iade talebinizin nedenini belirtin. Deneyiminizi anlamak için birkaç takip sorusu sorabiliriz — geri bildiriminiz iyileştirmemize yardımcı olur.
            </p>
          </Section>

          <Section title="3. Zaman Çizelgesi">
            <p>
              İade talebiniz onaylandıktan sonra:
            </p>
            <ul className="list-disc pl-6 space-y-2">
              <li>Onaydan itibaren 3 iş günü içinde iadeyi işleyeceğiz.</li>
              <li>İadeler orijinal ödeme yöntemine yapılır.</li>
              <li>Bankanıza veya kart kuruluşunuza bağlı olarak fonların hesabınızda görünmesi 5-10 iş günü sürebilir.</li>
            </ul>
            <p>
              İade bizim tarafımızdan işlendiğinde size e-posta ile onay göndereceğiz.
            </p>
          </Section>

          <Section title="4. İstisnalar">
            <p>
              Aşağıdaki durumlarda iade yapılmaz:
            </p>
            <ul className="list-disc pl-6 space-y-2">
              <li>14 günlük pencere (aylık planlar) veya 30 günlük pencere (yıllık planlar) geçtikten sonra yapılan talepler.</li>
              <li>Kullanım Koşulları ihlalleri nedeniyle sonlandırılan hesaplar.</li>
              <li>Aylık abonelik döneminin kullanılmamış kısımları için kısmi iadeler.</li>
              <li>Abonelik yenilemeleri — yenileme tarihinden önce iptal etmekten siz sorumlusunuz. Her yıllık yenileme öncesinde 7 gün öncesinden hatırlatma e-postası göndereceğiz.</li>
            </ul>
            <p>
              Uç durumları durum bazında ele alıyoruz. Durumunuz yukarıda kapsanmıyorsa bize e-posta gönderin, adil bir çözüm bulmak için elimizden geleni yapacağız.
            </p>
          </Section>

          <Section title="5. İletişim">
            <p>
              Bu İade Politikası hakkında sorularınız veya iade talebiniz için:
            </p>
            <div className="bg-[#F5F5F5] p-5 space-y-1">
              <p>
                <strong className="text-[#0A0A0A]">E-posta:</strong>{' '}
                <a
                  href="mailto:hello@megin.io"
                  className="text-[#DC2626] underline hover:no-underline"
                >
                  hello@megin.io
                </a>
              </p>
              <p>
                <strong className="text-[#0A0A0A]">Yanıt süresi:</strong> 1-2 iş günü içinde
              </p>
            </div>
          </Section>

          <div className="border-t border-[#E5E7EB] pt-8 flex flex-col sm:flex-row gap-4">
            <Link
              href="/tr/legal/privacy"
              className="text-sm font-semibold text-[#57534E] hover:text-[#DC2626] transition-colors"
            >
              Gizlilik Politikası
            </Link>
            <Link
              href="/tr/legal/terms"
              className="text-sm font-semibold text-[#57534E] hover:text-[#DC2626] transition-colors"
            >
              Kullanım Koşulları
            </Link>
          </div>
        </div>
      </section>
    </>
  )
}
