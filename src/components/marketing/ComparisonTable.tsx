'use client'

import { Check, X } from 'lucide-react'
import { useScrollReveal } from '@/lib/hooks/useScrollReveal'
import type { MarketingTranslations } from '@/lib/i18n/types'

interface ComparisonTableProps {
  t: MarketingTranslations
}

export default function ComparisonTable({ t }: ComparisonTableProps) {
  const revealRef = useScrollReveal()

  return (
    <section className="mkt-section py-16 sm:py-20 bg-white">
      <div className="mkt-container">
        {/* Heading */}
        <div className="text-center mb-14">
          <h2 className="mkt-heading-lg text-3xl sm:text-4xl md:text-5xl text-[#0A0A0A]">
            {t.comparison.title}
          </h2>
          <p className="text-[#6B7280] mt-4 max-w-2xl mx-auto leading-relaxed">
            {t.comparison.subtitle}
          </p>
        </div>

        {/* Table */}
        <div ref={revealRef} className="max-w-3xl mx-auto overflow-x-auto">
          <div className="rounded-2xl border border-[#E5E7EB] overflow-hidden shadow-lg shadow-black/[0.03]">
            <table className="w-full border-collapse">
              {/* Header */}
              <thead>
                <tr className="bg-[#FAFAFA]">
                  <th className="text-left text-sm font-semibold text-[#6B7280] py-5 px-5 sm:px-6 w-[30%]" />
                  <th className="text-center py-5 px-3 w-[28%] bg-red-50/50">
                    <span className="inline-flex items-center gap-1.5 text-sm font-bold text-white bg-gradient-to-r from-[#DC2626] to-[#F97316] rounded-full px-5 py-2 shadow-md shadow-red-500/15">
                      <Check className="w-4 h-4" />
                      {t.comparison.megin}
                    </span>
                  </th>
                  <th className="text-center text-sm font-semibold text-[#9CA3AF] py-5 px-3 w-[21%]">
                    {t.comparison.excel}
                  </th>
                  <th className="text-center text-sm font-semibold text-[#9CA3AF] py-5 px-3 w-[21%]">
                    {t.comparison.whatsapp}
                  </th>
                </tr>
              </thead>
              {/* Rows */}
              <tbody>
                {t.comparison.rows.map((row, i) => {
                  const isNoneExcel = row.excel.toLowerCase() === 'none' || row.excel.toLowerCase() === 'yok' || row.excel.toLowerCase() === "doesn't exist" || row.excel.toLowerCase() === 'mümkün değil'
                  const isNoneWhatsapp = row.whatsapp.toLowerCase() === 'none' || row.whatsapp.toLowerCase() === 'yok' || row.whatsapp.toLowerCase() === "doesn't exist" || row.whatsapp.toLowerCase() === 'mümkün değil'

                  return (
                    <tr
                      key={row.feature}
                      className={`mkt-reveal border-t border-[#E5E7EB] transition-colors hover:bg-gray-50/50 ${
                        i % 2 === 0 ? 'bg-white' : 'bg-[#FAFAFA]/50'
                      }`}
                    >
                      <td className="text-sm font-medium text-[#0A0A0A] py-4.5 px-5 sm:px-6">
                        {row.feature}
                      </td>
                      <td className="text-center py-4.5 px-3 bg-red-50/30">
                        <span className="inline-block text-xs font-semibold text-[#DC2626] bg-[#DC2626]/[0.08] rounded-full px-3.5 py-1.5">
                          {row.megin}
                        </span>
                      </td>
                      <td className="text-center py-4.5 px-3">
                        {isNoneExcel ? (
                          <span className="inline-flex items-center justify-center w-7 h-7 rounded-full bg-red-50">
                            <X className="w-3.5 h-3.5 text-red-300" />
                          </span>
                        ) : (
                          <span className="text-xs text-[#9CA3AF]">{row.excel}</span>
                        )}
                      </td>
                      <td className="text-center py-4.5 px-3">
                        {isNoneWhatsapp ? (
                          <span className="inline-flex items-center justify-center w-7 h-7 rounded-full bg-red-50">
                            <X className="w-3.5 h-3.5 text-red-300" />
                          </span>
                        ) : (
                          <span className="text-xs text-[#9CA3AF]">{row.whatsapp}</span>
                        )}
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </section>
  )
}
