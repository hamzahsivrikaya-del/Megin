import type { Metadata } from 'next'
import PricingCards from '@/components/marketing/PricingCards'
import FAQAccordion from '@/components/marketing/FAQAccordion'

export const metadata: Metadata = {
  title: 'Fiyatlandırma | Megin',
  description:
    'Kişisel antrenörler için sade ve dürüst fiyatlandırma. 5 üyeye kadar ücretsiz. Gizli ücret yok, sözleşme yok, istediğinizde iptal edin.',
  alternates: {
    languages: {
      en: '/pricing',
      tr: '/tr/pricing',
    },
  },
}

const faqItems = [
  {
    question: 'Üye limitine ulaştığımda ne olur?',
    answer:
      'Bir sonraki plana geçmeniz için bildirim alırsınız. Mevcut üyeleriniz ve verileriniz hiçbir zaman etkilenmez — yükseltme yapana veya mevcut bir üyeyi kaldırana kadar yeni üye ekleyemezsiniz.',
  },
  {
    question: 'Planımı istediğim zaman değiştirebilir miyim?',
    answer:
      'Evet, istediğiniz zaman yükseltme veya düşürme yapabilirsiniz. Yükseltme yaptığınızda yeni özelliklere anında erişirsiniz. Düşürme yaptığınızda, değişiklik mevcut fatura döneminin sonunda geçerli olur.',
  },
  {
    question: 'Sözleşme var mı?',
    answer:
      'Sözleşme yok. Soru sorulmadan istediğiniz zaman iptal edin. Ürünümüz iyiyse kalmanızı sağlamalı — kilitli kalmanızı değil.',
  },
  {
    question: 'Hangi ödeme yöntemlerini kabul ediyorsunuz?',
    answer:
      'Stripe aracılığıyla kredi kartları — Visa, Mastercard ve American Express. Tüm ödemeler güvenli bir şekilde işlenir ve kart bilgileriniz sunucularımızda hiçbir zaman saklanmaz.',
  },
  {
    question: 'İstediğim zaman iptal edebilir miyim?',
    answer:
      'Evet, hesap ayarlarınızdan tek tıkla iptal edin. İptal ücreti yok, sizi tutmaya çalışan akışlar yok. Verileriniz iptal sonrası 30 gün boyunca erişilebilir kalır.',
  },
  {
    question: 'Verilerim güvende mi?',
    answer:
      'Satır Düzeyi Güvenlik ile Supabase kullanıyoruz — verileriniz izole edilmiş ve antrenörler arasında asla paylaşılmaz. Tüm veriler durumda ve aktarım sırasında şifrelenir.',
  },
]

export default function TurkishPricingPage() {
  return (
    <>
      <section className="mkt-section pt-32 pb-16 text-center bg-white">
        <div className="mkt-container">
          <h1 className="mkt-heading-xl text-4xl sm:text-5xl md:text-6xl text-[#0A0A0A]">
            SADELİK VE DÜRÜSTLÜK
          </h1>
          <p className="text-[#6B7280] mt-4 max-w-2xl mx-auto leading-relaxed">
            Gizli ücret yok. Sürpriz yok. İstediğiniz zaman iptal edin.
          </p>
        </div>
      </section>

      <section className="mkt-section pb-20 bg-white">
        <div className="mkt-container">
          <PricingCards />
        </div>
      </section>

      <section className="mkt-section py-20 bg-[#F5F5F5]">
        <div className="mkt-container max-w-3xl mx-auto">
          <h2 className="mkt-heading-lg text-2xl sm:text-3xl text-[#0A0A0A] text-center mb-12">
            Sık Sorulan Sorular
          </h2>
          <FAQAccordion items={faqItems} />
        </div>
      </section>
    </>
  )
}
