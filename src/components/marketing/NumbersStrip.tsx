'use client'

import { Dumbbell, Utensils, TrendingUp } from 'lucide-react'
import AnimatedCounter from '@/components/shared/AnimatedCounter'
import type { MarketingTranslations } from '@/lib/i18n/types'

interface NumbersStripProps {
  t: MarketingTranslations
}

const statIcons = [Dumbbell, Utensils, TrendingUp]

function parseStatValue(value: string): { num: number; suffix: string } {
  const cleaned = value.replace(/,/g, '')
  const suffix = cleaned.replace(/[0-9]/g, '')
  const num = parseInt(cleaned.replace(/[^0-9]/g, ''), 10)
  return { num: isNaN(num) ? 0 : num, suffix }
}

export default function NumbersStrip({ t }: NumbersStripProps) {
  return (
    <section className="py-20 sm:py-28 bg-white">
      <div className="mkt-section">
        <div className="mkt-container">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-8">
            {t.numbers.items.map((item, index) => {
              const { num, suffix } = parseStatValue(item.value)
              const Icon = statIcons[index]
              return (
                <div
                  key={item.label}
                  className="rounded-2xl border border-[#E5E7EB] bg-[#FAFAFA] p-6 sm:p-8 lg:p-10 text-center transition-all duration-500 hover:-translate-y-2 hover:shadow-xl hover:shadow-black/[0.04] hover:border-gray-200"
                >
                  <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-xl bg-[#0A0A0A] flex items-center justify-center mx-auto mb-5 sm:mb-6">
                    <Icon className="w-6 h-6 sm:w-7 sm:h-7 text-white" />
                  </div>
                  <div className="text-4xl sm:text-5xl lg:text-6xl font-bold text-[#0A0A0A] font-display tracking-tight">
                    <AnimatedCounter end={num} suffix={suffix} />
                  </div>
                  <p className="text-sm font-bold text-[#0A0A0A] mt-4 uppercase tracking-wider">
                    {item.label}
                  </p>
                  <p className="text-xs text-[#9CA3AF] mt-1">{item.sublabel}</p>
                </div>
              )
            })}
          </div>
        </div>
      </div>
    </section>
  )
}
