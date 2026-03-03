import Link from 'next/link'
import type { Metadata } from 'next'
import FeatureShowcase from '@/components/marketing/FeatureShowcase'

export const metadata: Metadata = {
  title: 'Özellikler | Megin',
  description:
    'Müşterilerinizi yönetmek, program sunmak ve antrenörlük işinizi büyütmek için ihtiyacınız olan her şey.',
  alternates: {
    languages: {
      en: '/features',
      tr: '/tr/features',
    },
  },
}

const features = [
  {
    title: 'Üye Yönetimi',
    description: 'Hiçbir üyeyi kaybetme',
    bullets: [
      'Paket takibi',
      'Seans geçmişi',
      'Vücut ölçümleri',
      'Ödeme durumu',
    ],
  },
  {
    title: 'Antrenman Programları',
    description: 'Kendiliğinden oluşan programlar',
    bullets: [
      'Haftalık oluşturucu',
      'Superserie desteği',
      'Isınma ve kardiyo bölümleri',
      'Gün bazlı planlama',
    ],
  },
  {
    title: 'Beslenme Takibi',
    description: 'Üyelerinizin ne yediğini bilin',
    bullets: [
      'Günlük öğün kaydı',
      'Fotoğraflı kanıt',
      'Uyum yüzdeleri',
      'Özel beslenme planları',
    ],
  },
  {
    title: 'İlerleme Raporları',
    description: 'Üyelerinize dönüşümlerini gösterin',
    bullets: [
      'Vücut ölçüm grafikleri',
      'Öncesi/sonrası fotoğraflar',
      'PDF dışa aktarma',
      'Hedef takibi',
    ],
  },
  {
    title: 'Rozet Sistemi',
    description: 'Süreci oyunlaştırın',
    bullets: [
      '27 başarı rozeti',
      'Aşama bazlı ilerleme',
      'Paylaşım kartları',
      'Kutlama bildirimleri',
    ],
  },
  {
    title: 'Anlık Bildirimler',
    description: 'Orada olmadan var olun',
    bullets: [
      'Yenileme hatırlatıcıları',
      'Öğün kaydı uyarıları',
      'Haftalık motivasyon',
      'Rozet bildirimleri',
    ],
  },
  {
    title: 'Ebeveyn-Çocuk Hesapları',
    description: 'Aileleri birlikte antrenman ettirin',
    bullets: [
      'Aile üyelerini bağlama',
      'Paylaşımlı görünürlük',
      'Bireysel takip',
      'Ebeveyn bildirimleri',
    ],
  },
  {
    title: 'Üye Onboarding',
    description: 'Akılda kalan ilk izlenimler',
    bullets: [
      '4 adımlı yönlendirmeli akış',
      'Hedef belirleme',
      'Bildirim kurulumu',
      'Hoşgeldin deneyimi',
    ],
  },
  {
    title: 'Fitness Araçları',
    description: 'Ücretsiz araçlarla müşteri çekin',
    bullets: [
      '7 hesaplayıcı',
      'SEO trafik mıknatısı',
      'BMI/kalori/1RM ve daha fazlası',
      'Marka bilinirliği',
    ],
  },
]

export default function TurkishFeaturesPage() {
  return (
    <>
      <section className="mkt-section pt-32 pb-16 text-center bg-white">
        <div className="mkt-container">
          <h1 className="mkt-heading-xl text-4xl sm:text-5xl md:text-6xl text-[#0A0A0A]">
            İHTİYACINIZ OLAN HER ŞEY
          </h1>
          <p className="text-[#6B7280] mt-4 max-w-2xl mx-auto leading-relaxed">
            Müşterilerinizi yönetmek, program sunmak ve antrenörlük işinizi büyütmek için ihtiyacınız olan her şey.
          </p>
        </div>
      </section>

      {features.map((feature, index) => (
        <section
          key={feature.title}
          className={`mkt-section py-16 sm:py-20 ${
            index % 2 === 0 ? 'bg-white' : 'bg-[#F5F5F5]'
          }`}
        >
          <div className="mkt-container">
            <FeatureShowcase
              title={feature.title}
              description={feature.description}
              bullets={feature.bullets}
              reversed={index % 2 !== 0}
            />
          </div>
        </section>
      ))}

      <section className="mkt-section py-20 text-center bg-white">
        <div className="mkt-container">
          <h2 className="mkt-heading-lg text-3xl sm:text-4xl md:text-5xl text-[#0A0A0A]">
            İş akışınızı basitleştirmeye hazır mısınız?
          </h2>
          <div className="mt-8">
            <Link href="/signup" className="mkt-cta-primary">
              Ücretsiz Başla
              <svg
                width="16"
                height="16"
                viewBox="0 0 16 16"
                fill="none"
                aria-hidden="true"
              >
                <path
                  d="M3 8h10M9 4l4 4-4 4"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </Link>
          </div>
        </div>
      </section>
    </>
  )
}
