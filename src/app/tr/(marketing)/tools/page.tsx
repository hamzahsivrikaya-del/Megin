import Link from 'next/link'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Ücretsiz Fitness Araçları | Megin',
  description:
    'Kişisel antrenörler ve müşterileri için 7 ücretsiz fitness hesaplayıcı. BMI, kalori, 1RM, su ihtiyacı, ideal kilo ve vücut yağı hesaplayıcıları.',
  alternates: {
    languages: {
      en: '/tools',
      tr: '/tr/tools',
    },
  },
}

const tools = [
  {
    slug: 'calorie-calculator',
    title: 'Kalori & Makro Hesaplayıcı',
    description: 'Hedeflerinize göre günlük kalori, protein, yağ ve karbonhidrat ihtiyacınızı hesaplayın.',
    icon: '🔥',
  },
  {
    slug: 'one-rep-max',
    title: '1RM Hesaplayıcı',
    description: 'Submaksimal kaldırışlardan tek tekrar maksimumunuzu tahmin edin.',
    icon: '🏋️',
  },
  {
    slug: 'bmi-calculator',
    title: 'BMI Hesaplayıcı',
    description: 'Vücut Kitle İndeksini hesaplayın ve nerede durduğunuzu görün.',
    icon: '⚖️',
  },
  {
    slug: 'water-intake',
    title: 'Su İhtiyacı Hesaplayıcı',
    description: 'Optimal günlük su ihtiyacınızı bulun.',
    icon: '💧',
  },
  {
    slug: 'ideal-weight',
    title: 'İdeal Kilo Hesaplayıcı',
    description: '4 bilimsel formülle ideal kilonuzu hesaplayın.',
    icon: '🎯',
  },
  {
    slug: 'body-fat-skinfold',
    title: 'Vücut Yağı (Kaliper)',
    description: 'Jackson-Pollock 3 nokta yöntemiyle vücut yağını tahmin edin.',
    icon: '📏',
  },
  {
    slug: 'body-fat-navy',
    title: 'Vücut Yağı (Donanma)',
    description: 'ABD Donanması çevre ölçümü yöntemiyle vücut yağını hesaplayın.',
    icon: '🔢',
  },
]

export default function TurkishToolsPage() {
  return (
    <>
      <section className="mkt-section pt-32 pb-16 text-center bg-white">
        <div className="mkt-container">
          <h1 className="mkt-heading-xl text-4xl sm:text-5xl md:text-6xl text-[#0A0A0A]">
            ÜCRETSİZ FİTNESS ARAÇLARI
          </h1>
          <p className="text-[#6B7280] mt-4 max-w-2xl mx-auto leading-relaxed">
            Siz ve müşterilerinizin veri odaklı kararlar almasına yardımcı olan 7 ücretsiz hesaplayıcı.
            Kayıt gerekmez.
          </p>
        </div>
      </section>

      <section className="mkt-section py-16 bg-[#F5F5F5]">
        <div className="mkt-container">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {tools.map((tool) => (
              <Link
                key={tool.slug}
                href={`/tr/tools/${tool.slug}`}
                className="rounded-2xl bg-white border border-[#E5E7EB] p-8 hover-lift card-glow flex flex-col group"
              >
                <div
                  className="w-14 h-14 rounded-full bg-[#FF2D2D]/8 border border-[#E5E7EB] flex items-center justify-center text-2xl"
                  aria-hidden="true"
                >
                  {tool.icon}
                </div>

                <h2 className="text-lg font-bold text-[#0A0A0A] mt-4">{tool.title}</h2>

                <p className="text-sm text-[#6B7280] mt-2 leading-relaxed flex-1">
                  {tool.description}
                </p>

                <p className="text-[#FF2D2D] text-sm font-semibold mt-4 flex items-center gap-1 group-hover:gap-2 transition-all">
                  Hesapla
                  <svg
                    width="14"
                    height="14"
                    viewBox="0 0 14 14"
                    fill="none"
                    aria-hidden="true"
                  >
                    <path
                      d="M2.5 7h9M8 3.5L11.5 7 8 10.5"
                      stroke="currentColor"
                      strokeWidth="1.8"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                </p>
              </Link>
            ))}
          </div>
        </div>
      </section>

      <section className="mkt-section py-20 bg-white">
        <div className="mkt-container">
          <div className="rounded-2xl bg-[#0A0A0A] px-8 py-12 sm:px-12 sm:py-16 text-center">
            <h2 className="mkt-heading-lg text-2xl sm:text-3xl text-white">
              Müşterilerinizin tüm bu metriklerini otomatik takip edin
            </h2>
            <p className="text-white/60 mt-3 text-sm sm:text-base max-w-lg mx-auto">
              Manuel hesaplamaları bırakın. Megin vücut ölçümlerini, kalorileri ve ilerlemeyi
              otomatik takip eder — siz koçluğa odaklanın.
            </p>
            <div className="mt-8">
              <Link href="/signup" className="mkt-cta-primary">
                Megin&apos;i Ücretsiz Dene
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
        </div>
      </section>
    </>
  )
}
