'use client'

import { useState } from 'react'

interface FAQItem {
  question: string
  answer: string
}

interface FAQAccordionProps {
  items: FAQItem[]
}

export default function FAQAccordion({ items }: FAQAccordionProps) {
  const [openIndex, setOpenIndex] = useState<number | null>(null)

  const toggle = (index: number) => {
    setOpenIndex(openIndex === index ? null : index)
  }

  return (
    <div role="list" aria-label="Frequently asked questions" className="space-y-1">
      {items.map((item, index) => {
        const isOpen = openIndex === index
        const answerId = `faq-answer-${index}`
        const buttonId = `faq-button-${index}`

        return (
          <div
            key={item.question}
            className={`rounded-xl border transition-all duration-300 ${
              isOpen
                ? 'border-[#DC2626]/20 bg-white shadow-md shadow-red-500/[0.03]'
                : 'border-[#E5E7EB] bg-white hover:border-gray-300'
            }`}
            role="listitem"
          >
            <button
              id={buttonId}
              aria-expanded={isOpen}
              aria-controls={answerId}
              onClick={() => toggle(index)}
              className="w-full flex justify-between items-center px-6 py-5 text-left cursor-pointer"
            >
              <span className={`text-base font-semibold pr-4 transition-colors duration-300 ${isOpen ? 'text-[#0A0A0A]' : 'text-[#374151]'}`}>
                {item.question}
              </span>
              <span
                className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center transition-all duration-300 ${
                  isOpen
                    ? 'bg-[#0A0A0A] text-white rotate-180'
                    : 'bg-[#F5F5F5] text-[#6B7280]'
                }`}
                aria-hidden="true"
              >
                <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                  <path d="M3.5 5.25L7 8.75L10.5 5.25" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </span>
            </button>

            <div
              id={answerId}
              role="region"
              aria-labelledby={buttonId}
              className="grid transition-all duration-300"
              style={{ gridTemplateRows: isOpen ? '1fr' : '0fr' }}
            >
              <div className="overflow-hidden">
                <div className="px-6 pb-5">
                  {/* Red accent line */}
                  <div className="w-8 h-0.5 bg-gradient-to-r from-[#DC2626] to-[#F97316] rounded-full mb-3" />
                  <p className="text-[#6B7280] leading-relaxed text-[15px]">{item.answer}</p>
                </div>
              </div>
            </div>
          </div>
        )
      })}
    </div>
  )
}
