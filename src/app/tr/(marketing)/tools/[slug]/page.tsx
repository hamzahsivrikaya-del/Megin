import Link from 'next/link'
import { notFound } from 'next/navigation'
import type { Metadata } from 'next'
import ToolCalculatorWrapper, { type ToolSlug } from '@/components/marketing/ToolCalculatorWrapper'

interface CalculatorMeta {
  title: string
  description: string
}

const calculatorMeta: Record<ToolSlug, CalculatorMeta> = {
  'calorie-calculator': {
    title: 'Kalori & Makro Hesaplayıcı',
    description: 'Günlük kalori ve makro ihtiyacınızı hesaplayın.',
  },
  'one-rep-max': {
    title: '1RM Hesaplayıcı',
    description: 'Tek tekrar maksimumunuzu tahmin edin.',
  },
  'bmi-calculator': {
    title: 'BMI Hesaplayıcı',
    description: 'Vücut Kitle İndeksinizi hesaplayın.',
  },
  'water-intake': {
    title: 'Su İhtiyacı Hesaplayıcı',
    description: 'Günlük su ihtiyacınızı bulun.',
  },
  'ideal-weight': {
    title: 'İdeal Kilo Hesaplayıcı',
    description: 'İdeal kilo aralığınızı bulun.',
  },
  'body-fat-skinfold': {
    title: 'Vücut Yağı Hesaplayıcı (Kaliper)',
    description: 'Vücut yağ yüzdenizi tahmin edin.',
  },
  'body-fat-navy': {
    title: 'Vücut Yağı Hesaplayıcı (Donanma)',
    description: 'Çevre ölçümleriyle vücut yağını hesaplayın.',
  },
}

const validSlugs = Object.keys(calculatorMeta) as ToolSlug[]

interface ToolPageProps {
  params: Promise<{ slug: string }>
}

export async function generateMetadata({ params }: ToolPageProps): Promise<Metadata> {
  const { slug } = await params
  const meta = calculatorMeta[slug as ToolSlug]

  if (!meta) {
    return { title: 'Araç Bulunamadı | Megin' }
  }

  return {
    title: `${meta.title} | Ücretsiz Araç | Megin`,
    description: `${meta.description} Megin'den ücretsiz fitness hesaplayıcı.`,
    alternates: {
      languages: {
        en: `/tools/${slug}`,
        tr: `/tr/tools/${slug}`,
      },
    },
  }
}

export function generateStaticParams() {
  return validSlugs.map((slug) => ({ slug }))
}

export default async function TurkishToolPage({ params }: ToolPageProps) {
  const { slug } = await params

  if (!validSlugs.includes(slug as ToolSlug)) {
    notFound()
  }

  const meta = calculatorMeta[slug as ToolSlug]

  return (
    <>
      <section className="mkt-section pt-28 pb-10 bg-white border-b border-[#E5E7EB]">
        <div className="mkt-container">
          <Link
            href="/tr/tools"
            className="inline-flex items-center gap-2 text-sm text-[#6B7280] hover:text-[#0A0A0A] transition-colors font-medium mb-6"
          >
            <svg
              width="16"
              height="16"
              viewBox="0 0 16 16"
              fill="none"
              aria-hidden="true"
            >
              <path
                d="M10 3L5 8l5 5"
                stroke="currentColor"
                strokeWidth="1.8"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
            Tüm Ücretsiz Araçlar
          </Link>

          <h1 className="mkt-heading-xl text-3xl sm:text-4xl md:text-5xl text-[#0A0A0A]">
            {meta.title.toUpperCase()}
          </h1>
          <p className="text-[#6B7280] mt-3 text-base leading-relaxed max-w-xl">
            {meta.description}
          </p>
        </div>
      </section>

      <section className="mkt-section py-12 bg-[#F5F5F5]">
        <div className="mkt-container max-w-2xl mx-auto">
          <ToolCalculatorWrapper slug={slug as ToolSlug} />
        </div>
      </section>

      <section className="mkt-section py-20 bg-white">
        <div className="mkt-container">
          <div className="rounded-2xl bg-[#0A0A0A] px-8 py-12 sm:px-12 sm:py-16 text-center">
            <h2 className="mkt-heading-lg text-2xl sm:text-3xl text-white">
              Müşterilerinizin metriklerini Megin ile otomatik takip edin
            </h2>
            <p className="text-white/60 mt-3 text-sm sm:text-base max-w-lg mx-auto">
              Manuel hesaplamaları bırakın. Megin tüm müşterileriniz için vücut ölçümlerini, ilerlemeyi
              ve beslenmesini tek bir yerde takip eder.
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
