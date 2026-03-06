'use client'

import { Check, X } from 'lucide-react'
import { useScrollReveal } from '@/lib/hooks/useScrollReveal'
import type { MarketingTranslations } from '@/lib/i18n/types'

interface ComparisonTableProps {
  t: MarketingTranslations
}

function isNoneValue(val: string): boolean {
  const lower = val.toLowerCase()
  return lower === 'none' || lower === 'yok' || lower === "doesn't exist" || lower === 'mümkün değil'
}

export default function ComparisonTable({ t }: ComparisonTableProps) {
  const revealRef = useScrollReveal()

  return (
    <section className="mkt-section py-20 sm:py-28 bg-[#FAFAFA]">
      <div className="mkt-container">
        {/* Heading */}
        <div className="text-center mb-14 sm:mb-16">
          <h2 className="mkt-heading-lg text-3xl sm:text-4xl md:text-5xl text-[#0A0A0A]">
            {t.comparison.title}
          </h2>
          <p className="text-[#6B7280] mt-4 max-w-2xl mx-auto leading-relaxed">
            {t.comparison.subtitle}
          </p>
          <div className="w-16 h-1 rounded-full bg-gradient-to-r from-[#DC2626] to-[#F97316] mx-auto mt-6" />
        </div>

        {/* Table */}
        <div ref={revealRef} className="max-w-3xl mx-auto overflow-x-auto -mx-4 px-4 sm:mx-0 sm:px-0">
          <div className="rounded-2xl border border-[#E5E7EB] overflow-hidden bg-white shadow-lg shadow-black/[0.03]">
            <table className="w-full border-collapse min-w-[500px]">
              <thead>
                <tr className="bg-[#FAFAFA]">
                  <th className="text-left text-xs font-semibold text-[#9CA3AF] uppercase tracking-wider py-5 px-5 sm:px-6 w-[30%]">
                    Feature
                  </th>
                  <th className="text-center py-5 px-3 w-[28%]">
                    <span className="inline-flex items-center gap-1.5 text-sm font-bold text-white bg-[#0A0A0A] rounded-full px-5 py-2 shadow-md">
                      <Check className="w-4 h-4" />
                      {t.comparison.megin}
                    </span>
                  </th>
                  <th className="text-center text-xs font-semibold text-[#D1D5DB] uppercase tracking-wider py-5 px-3 w-[21%]">
                    {t.comparison.excel}
                  </th>
                  <th className="text-center text-xs font-semibold text-[#D1D5DB] uppercase tracking-wider py-5 px-3 w-[21%]">
                    {t.comparison.whatsapp}
                  </th>
                </tr>
              </thead>
              <tbody>
                {t.comparison.rows.map((row, i) => (
                  <tr
                    key={row.feature}
                    className={`mkt-reveal border-t border-[#F3F4F6] transition-colors hover:bg-gray-50/80 ${i % 2 === 0 ? 'bg-white' : 'bg-[#FAFAFA]/30'}`}
                  >
                    <td className="text-sm font-medium text-[#0A0A0A] py-4 px-5 sm:px-6">
                      {row.feature}
                    </td>
                    <td className="text-center py-4 px-3 bg-green-50/30">
                      <span className="inline-block text-xs font-semibold text-[#059669] bg-[#059669]/[0.08] rounded-full px-3.5 py-1.5">
                        {row.megin}
                      </span>
                    </td>
                    <td className="text-center py-4 px-3">
                      {isNoneValue(row.excel) ? (
                        <span className="inline-flex items-center justify-center w-7 h-7 rounded-full bg-red-50">
                          <X className="w-3.5 h-3.5 text-red-300" />
                        </span>
                      ) : (
                        <span className="text-xs text-[#9CA3AF]">{row.excel}</span>
                      )}
                    </td>
                    <td className="text-center py-4 px-3">
                      {isNoneValue(row.whatsapp) ? (
                        <span className="inline-flex items-center justify-center w-7 h-7 rounded-full bg-red-50">
                          <X className="w-3.5 h-3.5 text-red-300" />
                        </span>
                      ) : (
                        <span className="text-xs text-[#9CA3AF]">{row.whatsapp}</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </section>
  )
}
