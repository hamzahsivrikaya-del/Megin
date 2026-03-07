'use client'

import { useState } from 'react'
import Link from 'next/link'
import type { MarketingTranslations } from '@/lib/i18n/types'

interface ContactFormProps {
  t: MarketingTranslations
}

interface FormState {
  name: string
  email: string
  message: string
  clientCount: string
}

const INPUT_BASE =
  'w-full border border-[#E5E7EB] bg-white px-4 py-3 text-sm text-[#0A0A0A] placeholder:text-[#9CA3AF] focus:outline-none focus:border-[#DC2626] focus:ring-1 focus:ring-[#DC2626]/20 transition-colors rounded-xl'

export default function ContactForm({ t }: ContactFormProps) {
  const { contact } = t
  const [form, setForm] = useState<FormState>({
    name: '',
    email: '',
    message: '',
    clientCount: '',
  })
  const [submitted, setSubmitted] = useState(false)

  function handleChange(
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }))
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setSubmitted(true)
  }

  const firstName = form.name.split(' ')[0] || 'there'

  return (
    <>
      {/* Header */}
      <section className="mkt-section pt-32 pb-16 mkt-section-dark-warm mkt-grain relative overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_80%_50%_at_50%_-20%,rgba(220,38,38,0.15),transparent)] pointer-events-none" />
        <div className="mkt-container relative">
          <div className="max-w-2xl">
            <p className="text-xs font-bold tracking-widest uppercase text-[#DC2626] mb-3">
              {contact.badge}
            </p>
            <h1 className="heading-display-xl text-4xl sm:text-5xl text-white">
              {contact.title}
            </h1>
            <p className="text-white/60 mt-4 text-lg leading-relaxed">
              {contact.subtitle}
            </p>
          </div>
        </div>
      </section>

      {/* Form + Info */}
      <section className="mkt-section pb-24 bg-white">
        <div className="mkt-container">
          <div className="grid lg:grid-cols-2 gap-16 lg:gap-24">

            {/* Left — Form */}
            <div>
              {submitted ? (
                <div className="border border-[#E5E7EB] p-10 rounded-xl text-center space-y-4">
                  <div className="w-12 h-12 rounded-full bg-[#DC2626]/10 flex items-center justify-center mx-auto">
                    <svg
                      width="22"
                      height="22"
                      viewBox="0 0 24 24"
                      fill="none"
                      aria-hidden="true"
                    >
                      <path
                        d="M5 13l4 4L19 7"
                        stroke="#DC2626"
                        strokeWidth="2.5"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                  </div>
                  <h2 className="heading-display text-xl text-[#0A0A0A]">
                    {contact.successTitle}
                  </h2>
                  <p className="text-[#6B7280] text-sm leading-relaxed">
                    {contact.successMessage.replace('{name}', firstName)}
                  </p>
                  <button
                    onClick={() => {
                      setSubmitted(false)
                      setForm({ name: '', email: '', message: '', clientCount: '' })
                    }}
                    className="text-sm font-semibold text-[#DC2626] hover:underline mt-2 cursor-pointer"
                  >
                    {contact.sendAnother}
                  </button>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-5" noValidate>
                  {/* Name */}
                  <div>
                    <label
                      htmlFor="name"
                      className="block text-xs font-bold uppercase tracking-wider text-[#0A0A0A] mb-2"
                    >
                      {contact.nameLabel}{' '}
                      <span className="text-[#DC2626]" aria-hidden="true">
                        *
                      </span>
                    </label>
                    <input
                      id="name"
                      name="name"
                      type="text"
                      value={form.name}
                      onChange={handleChange}
                      placeholder={contact.namePlaceholder}
                      required
                      autoComplete="name"
                      className={INPUT_BASE}
                    />
                  </div>

                  {/* Email */}
                  <div>
                    <label
                      htmlFor="email"
                      className="block text-xs font-bold uppercase tracking-wider text-[#0A0A0A] mb-2"
                    >
                      {contact.emailLabel}{' '}
                      <span className="text-[#DC2626]" aria-hidden="true">
                        *
                      </span>
                    </label>
                    <input
                      id="email"
                      name="email"
                      type="email"
                      value={form.email}
                      onChange={handleChange}
                      placeholder={contact.emailPlaceholder}
                      required
                      autoComplete="email"
                      className={INPUT_BASE}
                    />
                  </div>

                  {/* Client count (optional) */}
                  <div>
                    <label
                      htmlFor="clientCount"
                      className="block text-xs font-bold uppercase tracking-wider text-[#0A0A0A] mb-2"
                    >
                      {contact.clientCountLabel}{' '}
                      <span className="text-[#9CA3AF] font-normal normal-case tracking-normal">
                        {contact.clientCountOptional}
                      </span>
                    </label>
                    <select
                      id="clientCount"
                      name="clientCount"
                      value={form.clientCount}
                      onChange={handleChange}
                      className={INPUT_BASE + ' cursor-pointer'}
                    >
                      {contact.clientCountOptions.map((opt) => (
                        <option key={opt.value} value={opt.value}>
                          {opt.label}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Message */}
                  <div>
                    <label
                      htmlFor="message"
                      className="block text-xs font-bold uppercase tracking-wider text-[#0A0A0A] mb-2"
                    >
                      {contact.messageLabel}{' '}
                      <span className="text-[#DC2626]" aria-hidden="true">
                        *
                      </span>
                    </label>
                    <textarea
                      id="message"
                      name="message"
                      rows={6}
                      value={form.message}
                      onChange={handleChange}
                      placeholder={contact.messagePlaceholder}
                      required
                      className={INPUT_BASE + ' resize-none'}
                    />
                  </div>

                  <button
                    type="submit"
                    className="cta-gradient w-full sm:w-auto"
                  >
                    {contact.sendButton}
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
                  </button>
                </form>
              )}

              {/* Or get started */}
              {!submitted && (
                <p className="mt-6 text-sm text-[#6B7280]">
                  {contact.tryPlatform}{' '}
                  <Link
                    href="/signup"
                    className="font-semibold text-[#DC2626] hover:underline"
                  >
                    {contact.getStartedFree}
                  </Link>{' '}
                  {contact.tryPlatformSuffix}
                </p>
              )}
            </div>

            {/* Right — Contact info */}
            <div className="space-y-8 lg:pt-2">
              <div>
                <h2 className="heading-display text-xl text-[#0A0A0A] mb-6">
                  {contact.getInTouch}
                </h2>
                <div className="space-y-5">
                  {/* Email */}
                  <div className="flex items-start gap-4">
                    <div className="w-10 h-10 bg-[#0A0A0A] border-0 rounded-xl flex items-center justify-center shrink-0 mt-0.5">
                      <svg
                        width="18"
                        height="18"
                        viewBox="0 0 24 24"
                        fill="none"
                        aria-hidden="true"
                      >
                        <rect
                          x="3"
                          y="5"
                          width="18"
                          height="14"
                          rx="1"
                          stroke="#FFFFFF"
                          strokeWidth="1.5"
                        />
                        <path
                          d="M3 8l9 6 9-6"
                          stroke="#FFFFFF"
                          strokeWidth="1.5"
                          strokeLinecap="round"
                        />
                      </svg>
                    </div>
                    <div>
                      <p className="text-xs font-bold uppercase tracking-wider text-[#9CA3AF] mb-1">
                        Email
                      </p>
                      <a
                        href="mailto:hello@megin.io"
                        className="text-sm text-[#0A0A0A] font-semibold hover:text-[#DC2626] transition-colors"
                      >
                        hello@megin.io
                      </a>
                    </div>
                  </div>

                  {/* Response time */}
                  <div className="flex items-start gap-4">
                    <div className="w-10 h-10 bg-[#0A0A0A] border-0 rounded-xl flex items-center justify-center shrink-0 mt-0.5">
                      <svg
                        width="18"
                        height="18"
                        viewBox="0 0 24 24"
                        fill="none"
                        aria-hidden="true"
                      >
                        <circle cx="12" cy="12" r="9" stroke="#FFFFFF" strokeWidth="1.5" />
                        <path
                          d="M12 7v5l3 3"
                          stroke="#FFFFFF"
                          strokeWidth="1.5"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        />
                      </svg>
                    </div>
                    <div>
                      <p className="text-xs font-bold uppercase tracking-wider text-[#9CA3AF] mb-1">
                        {contact.responseTimeLabel}
                      </p>
                      <p className="text-sm text-[#0A0A0A] font-semibold">
                        {contact.responseTimeValue}
                      </p>
                      <p className="text-xs text-[#6B7280] mt-0.5">
                        {contact.responseTimeNote}
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Divider */}
              <div className="border-t border-[#E5E7EB]" />

              {/* FAQ nudge */}
              <div className="bg-[#FAFAFA] p-6 rounded-xl border border-[#E5E7EB]">
                <h3 className="text-sm font-bold text-[#0A0A0A] mb-2">
                  {contact.faqNudgeTitle}
                </h3>
                <p className="text-sm text-[#6B7280] leading-relaxed mb-4">
                  {contact.faqNudgeText}
                </p>
                <Link
                  href="/pricing#faq"
                  className="text-sm font-bold text-[#DC2626] flex items-center gap-1.5 hover:gap-2.5 transition-all"
                >
                  {contact.faqNudgeLink}
                  <svg
                    width="14"
                    height="14"
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
        </div>
      </section>
    </>
  )
}
