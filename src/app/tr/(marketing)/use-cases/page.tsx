import Link from 'next/link'
import type { Metadata } from 'next'
import { User, Building2, Globe, ArrowRight } from 'lucide-react'
import { tr } from '@/lib/i18n/tr'

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

const icons = [User, Building2, Globe]

export default function TurkishUseCasesPage() {
  const segments = tr.useCases.segments

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

      <section className="mkt-section pb-24 bg-white">
        <div className="mkt-container">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {segments.map((segment, index) => {
              const Icon = icons[index]
              return (
                <Link
                  key={segment.slug}
                  href={`/tr/use-cases/${segment.slug}`}
                  className="group rounded-2xl bg-[#F5F5F5] border border-[#E5E7EB] p-8 hover-lift transition-all"
                >
                  <div className="w-12 h-12 rounded-full bg-gradient-to-br from-[#DC2626] to-[#F97316] flex items-center justify-center mb-6 shadow-lg shadow-red-500/10">
                    <Icon className="w-6 h-6 text-white" />
                  </div>
                  <h2 className="text-xl font-bold text-[#0A0A0A] mb-2">{segment.label}</h2>
                  <p className="text-[#6B7280] text-sm leading-relaxed mb-4">{segment.description}</p>
                  <span className="inline-flex items-center gap-1.5 text-xs font-bold tracking-wider uppercase text-[#DC2626] group-hover:gap-2.5 transition-all">
                    Detayları Gör <ArrowRight className="w-3.5 h-3.5" />
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
