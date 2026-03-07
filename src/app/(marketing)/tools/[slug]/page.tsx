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
    title: 'Calorie & Macro Calculator',
    description: 'Calculate your daily calorie and macro needs.',
  },
  'one-rep-max': {
    title: '1RM Calculator',
    description: 'Estimate your one-rep max.',
  },
  'bmi-calculator': {
    title: 'BMI Calculator',
    description: 'Calculate your Body Mass Index.',
  },
  'water-intake': {
    title: 'Water Intake Calculator',
    description: 'Find your daily water needs.',
  },
  'ideal-weight': {
    title: 'Ideal Weight Calculator',
    description: 'Find your ideal weight range.',
  },
  'body-fat-skinfold': {
    title: 'Body Fat Calculator (Skinfold)',
    description: 'Estimate body fat percentage.',
  },
  'body-fat-navy': {
    title: 'Body Fat Calculator (Navy)',
    description: 'Calculate body fat using circumference measurements.',
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
    return { title: 'Tool Not Found | Megin' }
  }

  return {
    title: `${meta.title} | Free Tool | Megin`,
    description: `${meta.description} Free fitness calculator from Megin.`,
  }
}

export function generateStaticParams() {
  return validSlugs.map((slug) => ({ slug }))
}

export default async function ToolPage({ params }: ToolPageProps) {
  const { slug } = await params

  if (!validSlugs.includes(slug as ToolSlug)) {
    notFound()
  }

  const meta = calculatorMeta[slug as ToolSlug]

  return (
    <>
      {/* Back link + header */}
      <section className="mkt-section pt-28 pb-10 bg-white border-b border-[#E5E7EB]">
        <div className="mkt-container">
          <Link
            href="/tools"
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
            All Free Tools
          </Link>

          <h1 className="heading-display-xl text-3xl sm:text-4xl md:text-5xl text-[#0A0A0A]">
            {meta.title.toUpperCase()}
          </h1>
          <p className="text-[#6B7280] mt-3 text-base leading-relaxed max-w-xl">
            {meta.description}
          </p>
        </div>
      </section>

      {/* Calculator */}
      <section className="mkt-section py-12 bg-[#F5F5F5]">
        <div className="mkt-container max-w-2xl mx-auto">
          <ToolCalculatorWrapper slug={slug as ToolSlug} />
        </div>
      </section>

      {/* CTA banner */}
      <section className="mkt-section py-20 bg-white">
        <div className="mkt-container">
          <div className="rounded-2xl bg-[#0A0A0A] px-8 py-12 sm:px-12 sm:py-16 text-center">
            <h2 className="heading-display text-2xl sm:text-3xl text-white">
              Track your clients&apos; metrics automatically with Megin
            </h2>
            <p className="text-white/60 mt-3 text-sm sm:text-base max-w-lg mx-auto">
              Stop calculating manually. Megin tracks body measurements, progress,
              and nutrition for all your clients — in one place.
            </p>
            <div className="mt-8">
              <Link href="/signup" className="cta-primary">
                Try Megin Free
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
