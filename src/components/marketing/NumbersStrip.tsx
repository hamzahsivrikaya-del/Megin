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
    <section className="mkt-gradient-bg py-16 sm:py-20">
      <div className="mkt-section">
        <div className="mkt-container">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-6">
            {t.numbers.items.map((item, index) => {
              const { num, suffix } = parseStatValue(item.value)
              const Icon = statIcons[index]
              return (
                <div
                  key={item.label}
                  className="mkt-glass rounded-2xl p-5 sm:p-6 lg:p-8 text-center hover-lift mkt-glow-warm transition-all"
                >
                  <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-xl bg-gradient-to-br from-[#DC2626] to-[#F97316] flex items-center justify-center mx-auto mb-4 sm:mb-5 shadow-lg shadow-red-500/10">
                    <Icon className="w-6 h-6 sm:w-7 sm:h-7 text-white" />
                  </div>
                  <div className="text-3xl sm:text-4xl lg:text-5xl font-bold text-gradient">
                    <AnimatedCounter end={num} suffix={suffix} />
                  </div>
                  <p className="text-sm font-semibold text-[#0A0A0A] mt-3">
                    {item.label}
                  </p>
                  <p className="text-xs text-[#6B7280] mt-1">{item.sublabel}</p>
                </div>
              )
            })}
          </div>
        </div>
      </div>
    </section>
  )
}
