'use client'

import AnimatedCounter from '@/components/shared/AnimatedCounter'
import type { MarketingTranslations } from '@/lib/i18n/types'

interface NumbersStripProps {
  t: MarketingTranslations
}

function parseStatValue(value: string): { num: number; suffix: string } {
  // Remove commas from numbers like "10,000+"
  const cleaned = value.replace(/,/g, '')
  const suffix = cleaned.replace(/[0-9]/g, '')
  const num = parseInt(cleaned.replace(/[^0-9]/g, ''), 10)
  return { num: isNaN(num) ? 0 : num, suffix }
}

export default function NumbersStrip({ t }: NumbersStripProps) {
  return (
    <section className="mkt-section-dark py-16 sm:py-24">
      <div className="mkt-section">
        <div className="mkt-container">
          <div className="grid grid-cols-3 gap-4 sm:gap-8 text-center">
            {t.numbers.items.map((item) => {
              const { num, suffix } = parseStatValue(item.value)
              return (
                <div key={item.label}>
                  <div className="text-4xl sm:text-5xl md:text-6xl font-bold text-white">
                    <AnimatedCounter end={num} suffix={suffix} />
                  </div>
                  <p className="text-sm sm:text-base text-white/80 font-semibold mt-2">
                    {item.label}
                  </p>
                  <p className="text-xs sm:text-sm text-white/50 mt-1">{item.sublabel}</p>
                </div>
              )
            })}
          </div>
        </div>
      </div>
    </section>
  )
}
