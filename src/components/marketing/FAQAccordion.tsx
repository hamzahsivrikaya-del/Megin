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
    <div role="list" aria-label="Frequently asked questions">
      {items.map((item, index) => {
        const isOpen = openIndex === index
        const answerId = `faq-answer-${index}`
        const buttonId = `faq-button-${index}`

        return (
          <div
            key={item.question}
            className="border-b border-[#E5E7EB]"
            role="listitem"
          >
            <button
              id={buttonId}
              aria-expanded={isOpen}
              aria-controls={answerId}
              onClick={() => toggle(index)}
              className="w-full flex justify-between items-center py-5 text-left cursor-pointer"
            >
              <span className="text-base font-semibold text-[#0A0A0A] pr-4">
                {item.question}
              </span>
              <span
                className="flex-shrink-0 text-[#6B7280] transition-transform duration-300"
                style={{ transform: isOpen ? 'rotate(180deg)' : 'rotate(0deg)' }}
                aria-hidden="true"
              >
                <svg
                  width="20"
                  height="20"
                  viewBox="0 0 20 20"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    d="M5 7.5L10 12.5L15 7.5"
                    stroke="currentColor"
                    strokeWidth="1.8"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </span>
            </button>

            <div
              id={answerId}
              role="region"
              aria-labelledby={buttonId}
              className="overflow-hidden transition-[max-height] duration-300"
              style={{ maxHeight: isOpen ? '500px' : '0px' }}
            >
              <p className="pb-5 text-[#6B7280] leading-relaxed">{item.answer}</p>
            </div>
          </div>
        )
      })}
    </div>
  )
}
