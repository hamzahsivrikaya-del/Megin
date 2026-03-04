'use client'

import { useState } from 'react'
import Link from 'next/link'

interface FormState {
  name: string
  email: string
  message: string
  clientCount: string
}

const CLIENT_COUNT_OPTIONS = [
  { value: '', label: 'Select an option' },
  { value: '1-5', label: '1 – 5 clients' },
  { value: '6-15', label: '6 – 15 clients' },
  { value: '16-30', label: '16 – 30 clients' },
  { value: '30+', label: '30+ clients' },
]

const INPUT_BASE =
  'w-full border border-[#E5E7EB] bg-white px-4 py-3 text-sm text-[#0A0A0A] placeholder:text-[#9CA3AF] focus:outline-none focus:border-[#DC2626] focus:ring-1 focus:ring-[#DC2626]/20 transition-colors'

export default function ContactForm() {
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
      <section className="mkt-section pt-32 pb-16 bg-white">
        <div className="mkt-container">
          <div className="max-w-2xl">
            <p className="text-xs font-bold tracking-widest uppercase text-[#DC2626] mb-3">
              Contact
            </p>
            <h1 className="mkt-heading-xl text-4xl sm:text-5xl text-[#0A0A0A]">
              LET&apos;S TALK
            </h1>
            <p className="text-[#6B7280] mt-4 text-lg leading-relaxed">
              Have a question, a partnership idea, or just want to say hi? We read every message.
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
                <div className="border border-[#E5E7EB] p-10 text-center space-y-4">
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
                  <h2 className="mkt-heading-lg text-xl text-[#0A0A0A]">
                    Message sent!
                  </h2>
                  <p className="text-[#6B7280] text-sm leading-relaxed">
                    Thanks for reaching out, {firstName}. We&apos;ll get back to you within 1–2 business days.
                  </p>
                  <button
                    onClick={() => {
                      setSubmitted(false)
                      setForm({ name: '', email: '', message: '', clientCount: '' })
                    }}
                    className="text-sm font-semibold text-[#DC2626] hover:underline mt-2 cursor-pointer"
                  >
                    Send another message
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
                      Full Name{' '}
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
                      placeholder="Alex Johnson"
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
                      Email Address{' '}
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
                      placeholder="alex@gymname.com"
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
                      How many clients do you have?{' '}
                      <span className="text-[#9CA3AF] font-normal normal-case tracking-normal">
                        (optional)
                      </span>
                    </label>
                    <select
                      id="clientCount"
                      name="clientCount"
                      value={form.clientCount}
                      onChange={handleChange}
                      className={INPUT_BASE + ' cursor-pointer'}
                    >
                      {CLIENT_COUNT_OPTIONS.map((opt) => (
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
                      Message{' '}
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
                      placeholder="Tell us what's on your mind..."
                      required
                      className={INPUT_BASE + ' resize-none'}
                    />
                  </div>

                  <button
                    type="submit"
                    className="mkt-cta-gradient w-full sm:w-auto"
                  >
                    Send Message
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
                  Just want to try the platform?{' '}
                  <Link
                    href="/signup"
                    className="font-semibold text-[#DC2626] hover:underline"
                  >
                    Get started free
                  </Link>{' '}
                  — no credit card needed.
                </p>
              )}
            </div>

            {/* Right — Contact info */}
            <div className="space-y-8 lg:pt-2">
              <div>
                <h2 className="mkt-heading-lg text-xl text-[#0A0A0A] mb-6">
                  Get in touch
                </h2>
                <div className="space-y-5">
                  {/* Email */}
                  <div className="flex items-start gap-4">
                    <div className="w-10 h-10 border border-[#E5E7EB] flex items-center justify-center shrink-0 mt-0.5">
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
                          stroke="#DC2626"
                          strokeWidth="1.5"
                        />
                        <path
                          d="M3 8l9 6 9-6"
                          stroke="#DC2626"
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
                    <div className="w-10 h-10 border border-[#E5E7EB] flex items-center justify-center shrink-0 mt-0.5">
                      <svg
                        width="18"
                        height="18"
                        viewBox="0 0 24 24"
                        fill="none"
                        aria-hidden="true"
                      >
                        <circle cx="12" cy="12" r="9" stroke="#DC2626" strokeWidth="1.5" />
                        <path
                          d="M12 7v5l3 3"
                          stroke="#DC2626"
                          strokeWidth="1.5"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        />
                      </svg>
                    </div>
                    <div>
                      <p className="text-xs font-bold uppercase tracking-wider text-[#9CA3AF] mb-1">
                        Response time
                      </p>
                      <p className="text-sm text-[#0A0A0A] font-semibold">
                        Within 1–2 business days
                      </p>
                      <p className="text-xs text-[#6B7280] mt-0.5">
                        Monday – Friday, 9am – 6pm GMT+3
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Divider */}
              <div className="border-t border-[#E5E7EB]" />

              {/* FAQ nudge */}
              <div className="bg-[#F5F5F5] p-6">
                <h3 className="text-sm font-bold text-[#0A0A0A] mb-2">
                  Looking for quick answers?
                </h3>
                <p className="text-sm text-[#6B7280] leading-relaxed mb-4">
                  Most common questions about pricing, plans, and features are covered in our FAQ.
                </p>
                <Link
                  href="/pricing#faq"
                  className="text-sm font-bold text-[#DC2626] flex items-center gap-1.5 hover:gap-2.5 transition-all"
                >
                  View FAQ
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
