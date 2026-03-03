import type { Metadata } from 'next'
import UseCaseSection from '@/components/marketing/UseCaseSection'

export const metadata: Metadata = {
  title: 'Kullanım Senaryoları | Megin',
  description:
    '10 üye de antrenman ettirseniz 100 de, Megin çalışma şeklinize uyum sağlar. Bağımsız antrenörler, spor salonları ve online koçlar için geliştirildi.',
  alternates: {
    languages: {
      en: '/use-cases',
      tr: '/tr/use-cases',
    },
  },
}

export default function TurkishUseCasesPage() {
  return (
    <>
      <section className="mkt-section pt-32 pb-16 text-center bg-white">
        <div className="mkt-container">
          <h1 className="mkt-heading-xl text-4xl sm:text-5xl md:text-6xl text-[#0A0A0A]">
            ÇALIŞMA ŞEKLİNİZE GÖRE
          </h1>
          <p className="text-[#6B7280] mt-4 max-w-2xl mx-auto leading-relaxed">
            10 üye de antrenman ettirseniz 100 de, Megin iş akışınıza uyum sağlar.
          </p>
        </div>
      </section>

      <UseCaseSection
        label="Bağımsız Antrenör"
        title="10-30 ÜYE ANTRENMAN ETTİRİYORSUNUZ"
        description="Elektronik tablolarla uğraşmayı bırakın. İşinizi büyütmeye başlayın."
        features={[
          'Üye paketleri',
          'Antrenman programlama',
          'İlerleme takibi',
          'Otomatik hatırlatıcılar',
        ]}
        dark={false}
        ctaVariant="primary"
      />

      <UseCaseSection
        label="Spor Salonu / Stüdyo"
        title="ÇOKLU ANTRENÖR YÖNETİYORSUNUZ"
        description="Ekibinize araçları verin. Genel bakışı koruyun."
        features={[
          'Çoklu antrenör yönetimi',
          'Üye devri',
          'Gelir takibi',
          'Merkezi veri',
        ]}
        dark={true}
        ctaVariant="primary"
      />

      <UseCaseSection
        label="Online Koç"
        title="ÜYELERİNİZ UZAKTAN ÇALIŞIYOR"
        description="Onları her yerden hesap verebilir tutun."
        features={[
          'Fotoğraflı beslenme takibi',
          'Haftalık raporlar',
          'Rozet motivasyonu',
          'PWA mobil uygulama',
        ]}
        dark={false}
        ctaVariant="ghost"
      />
    </>
  )
}
