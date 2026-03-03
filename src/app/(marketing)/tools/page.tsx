import Link from 'next/link'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Free Fitness Tools | Megin',
  description:
    '7 free fitness calculators for personal trainers and their clients. BMI, calories, 1RM, water intake, ideal weight, and body fat calculators.',
}

const tools = [
  {
    slug: 'calorie-calculator',
    title: 'Calorie & Macro Calculator',
    description: 'Calculate daily calories, protein, fat, and carbs based on your goals.',
    icon: '🔥',
  },
  {
    slug: 'one-rep-max',
    title: '1RM Calculator',
    description: 'Estimate your one-rep max from submaximal lifts.',
    icon: '🏋️',
  },
  {
    slug: 'bmi-calculator',
    title: 'BMI Calculator',
    description: 'Calculate Body Mass Index and see where you stand.',
    icon: '⚖️',
  },
  {
    slug: 'water-intake',
    title: 'Water Intake Calculator',
    description: 'Find your optimal daily water intake.',
    icon: '💧',
  },
  {
    slug: 'ideal-weight',
    title: 'Ideal Weight Calculator',
    description: 'Calculate your ideal weight using 4 scientific formulas.',
    icon: '🎯',
  },
  {
    slug: 'body-fat-skinfold',
    title: 'Body Fat (Skinfold)',
    description: 'Estimate body fat with the Jackson-Pollock 3-point method.',
    icon: '📏',
  },
  {
    slug: 'body-fat-navy',
    title: 'Body Fat (Navy)',
    description: 'Calculate body fat using the U.S. Navy circumference method.',
    icon: '🔢',
  },
]

export default function ToolsPage() {
  return (
    <>
      {/* Page header */}
      <section className="mkt-section pt-32 pb-16 text-center bg-white">
        <div className="mkt-container">
          <h1 className="mkt-heading-xl text-4xl sm:text-5xl md:text-6xl text-[#0A0A0A]">
            FREE FITNESS TOOLS
          </h1>
          <p className="text-[#6B7280] mt-4 max-w-2xl mx-auto leading-relaxed">
            7 free calculators to help you and your clients make data-driven decisions.
            No sign-up required.
          </p>
        </div>
      </section>

      {/* Tools grid */}
      <section className="mkt-section py-16 bg-[#F5F5F5]">
        <div className="mkt-container">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {tools.map((tool) => (
              <Link
                key={tool.slug}
                href={`/tools/${tool.slug}`}
                className="rounded-2xl bg-white border border-[#E5E7EB] p-8 hover-lift card-glow flex flex-col group"
              >
                {/* Icon */}
                <div
                  className="w-14 h-14 rounded-full bg-[#FF2D2D]/8 border border-[#E5E7EB] flex items-center justify-center text-2xl"
                  aria-hidden="true"
                >
                  {tool.icon}
                </div>

                {/* Title */}
                <h2 className="text-lg font-bold text-[#0A0A0A] mt-4">{tool.title}</h2>

                {/* Description */}
                <p className="text-sm text-[#6B7280] mt-2 leading-relaxed flex-1">
                  {tool.description}
                </p>

                {/* CTA */}
                <p className="text-[#FF2D2D] text-sm font-semibold mt-4 flex items-center gap-1 group-hover:gap-2 transition-all">
                  Calculate
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

      {/* CTA banner */}
      <section className="mkt-section py-20 bg-white">
        <div className="mkt-container">
          <div className="rounded-2xl bg-[#0A0A0A] px-8 py-12 sm:px-12 sm:py-16 text-center">
            <h2 className="mkt-heading-lg text-2xl sm:text-3xl text-white">
              Track all these metrics for your clients automatically
            </h2>
            <p className="text-white/60 mt-3 text-sm sm:text-base max-w-lg mx-auto">
              Stop doing manual calculations. Megin tracks body measurements, calories,
              and progress automatically — so you can focus on coaching.
            </p>
            <div className="mt-8">
              <Link href="/signup" className="mkt-cta-primary">
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
