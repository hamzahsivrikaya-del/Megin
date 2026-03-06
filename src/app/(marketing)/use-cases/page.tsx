import Link from 'next/link'
import type { Metadata } from 'next'
import { User, Building2, Globe, ArrowRight } from 'lucide-react'
import { en } from '@/lib/i18n/en'

export const metadata: Metadata = {
  title: 'Use Cases | Megin',
  description:
    'Whether you train 10 clients or 100, Megin adapts to how you work. Built for independent trainers, gyms, and online coaches.',
}

const icons = [User, Building2, Globe]

export default function UseCasesPage() {
  const segments = en.useCases.segments

  return (
    <>
      {/* Dark hero */}
      <section className="mkt-section-dark-warm pt-32 sm:pt-40 pb-16 sm:pb-20 text-center relative overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_60%_40%_at_50%_0%,rgba(220,38,38,0.08),transparent)] pointer-events-none" />
        <div className="mkt-container relative">
          <span className="inline-block text-xs font-bold uppercase tracking-[0.2em] text-[#DC2626] mb-4">Use Cases</span>
          <h1 className="mkt-heading-xl text-[clamp(2rem,6vw,4rem)] leading-[0.95] text-white">
            BUILT FOR HOW YOU TRAIN
          </h1>
          <p className="text-white/60 mt-4 max-w-2xl mx-auto leading-relaxed">
            Whether you train 10 clients or 100, Megin adapts to your workflow.
          </p>
          <div className="w-16 h-1 rounded-full bg-gradient-to-r from-[#DC2626] to-[#F97316] mx-auto mt-6" />
        </div>
      </section>

      {/* Segment cards */}
      <section className="mkt-section py-16 sm:py-24 bg-[#FAFAFA]">
        <div className="mkt-container">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5 sm:gap-6">
            {segments.map((segment, index) => {
              const Icon = icons[index]
              return (
                <Link
                  key={segment.slug}
                  href={`/use-cases/${segment.slug}`}
                  className="group rounded-2xl bg-white border border-[#E5E7EB] p-8 sm:p-10 transition-all duration-500 hover:-translate-y-2 hover:shadow-2xl hover:shadow-black/[0.06] hover:border-gray-200 flex flex-col"
                >
                  <div className="w-14 h-14 rounded-2xl bg-[#0A0A0A] flex items-center justify-center mb-6">
                    <Icon className="w-6 h-6 text-white" />
                  </div>
                  <h2 className="text-xl font-bold text-[#0A0A0A] mb-2">{segment.label}</h2>
                  <p className="text-[#6B7280] text-sm leading-relaxed mb-6 flex-1">{segment.description}</p>

                  {/* Feature pills */}
                  <div className="flex flex-wrap gap-2 mb-6">
                    {segment.features.slice(0, 3).map((f) => (
                      <span key={f} className="text-[10px] font-semibold uppercase tracking-wider text-[#6B7280] bg-[#F5F5F5] px-2.5 py-1 rounded-full">
                        {f.split(' ').slice(0, 3).join(' ')}
                      </span>
                    ))}
                  </div>

                  <span className="inline-flex items-center gap-1.5 text-xs font-bold tracking-wider uppercase text-[#DC2626] group-hover:gap-2.5 transition-all">
                    Learn More <ArrowRight className="w-3.5 h-3.5" />
                  </span>
                </Link>
              )
            })}
          </div>
        </div>
      </section>
    </>
  )
}
