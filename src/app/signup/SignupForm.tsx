'use client'

import { useState } from 'react'
import Link from 'next/link'

interface SignupState {
  fullName: string
  email: string
  password: string
  gymName: string
}

const TRUST_SIGNALS = [
  {
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden="true">
        <path
          d="M12 2L4 6v6c0 5.5 3.6 10.7 8 12 4.4-1.3 8-6.5 8-12V6l-8-4z"
          stroke="#DC2626"
          strokeWidth="1.5"
          strokeLinejoin="round"
        />
        <path
          d="M9 12l2 2 4-4"
          stroke="#DC2626"
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    ),
    text: 'Free for up to 3 clients',
  },
  {
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden="true">
        <rect x="3" y="11" width="18" height="11" rx="1" stroke="#DC2626" strokeWidth="1.5" />
        <path
          d="M7 11V7a5 5 0 0 1 10 0v4"
          stroke="#DC2626"
          strokeWidth="1.5"
          strokeLinecap="round"
        />
      </svg>
    ),
    text: 'No credit card required',
  },
  {
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden="true">
        <circle cx="12" cy="12" r="9" stroke="#DC2626" strokeWidth="1.5" />
        <path
          d="M9 12l2 2 4-4"
          stroke="#DC2626"
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    ),
    text: 'Cancel anytime',
  },
]

export default function SignupForm() {
  const [form, setForm] = useState<SignupState>({
    fullName: '',
    email: '',
    password: '',
    gymName: '',
  })
  const [submitted, setSubmitted] = useState(false)
  const [showPassword, setShowPassword] = useState(false)

  function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }))
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setSubmitted(true)
  }

  return (
    <div className="min-h-screen flex">
      {/* Left — Form */}
      <div className="w-full lg:w-1/2 flex flex-col bg-white px-6 py-10 sm:px-12 lg:px-16">
        {/* Logo */}
        <div className="mb-10">
          <Link
            href="/"
            className="font-display text-xl tracking-[0.15em] text-[#0A0A0A]"
            aria-label="Megin home"
          >
            MEGIN<span className="text-[#DC2626]">.</span>
          </Link>
        </div>

        <div className="flex-1 flex items-center">
          <div className="w-full max-w-md">
            {submitted ? (
              <div className="text-center space-y-5">
                <div className="w-14 h-14 rounded-full bg-[#DC2626]/10 flex items-center justify-center mx-auto">
                  <svg
                    width="26"
                    height="26"
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
                <h1 className="font-display text-2xl sm:text-3xl tracking-wide text-[#0A0A0A] uppercase">
                  You&apos;re on the list!
                </h1>
                <p className="text-[#6B7280] leading-relaxed text-sm">
                  We&apos;ll let you know when we launch! We&apos;ll send launch access to{' '}
                  <span className="font-semibold text-[#0A0A0A]">{form.email}</span>.
                </p>
                <p className="text-xs text-[#9CA3AF]">
                  In the meantime, check out our{' '}
                  <Link href="/blog" className="text-[#DC2626] hover:underline">
                    blog
                  </Link>{' '}
                  for training tips and guides.
                </p>
              </div>
            ) : (
              <>
                <div className="mb-8">
                  <h1 className="font-display text-3xl sm:text-4xl tracking-wide text-[#0A0A0A] uppercase leading-tight">
                    Create your account
                  </h1>
                  <p className="text-sm text-[#6B7280] mt-2">
                    Free forever for up to 3 clients.
                  </p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-4" noValidate>
                  {/* Full Name */}
                  <div>
                    <label
                      htmlFor="fullName"
                      className="block text-xs font-bold uppercase tracking-wider text-[#0A0A0A] mb-2"
                    >
                      Full Name{' '}
                      <span className="text-[#DC2626]" aria-hidden="true">
                        *
                      </span>
                    </label>
                    <input
                      id="fullName"
                      name="fullName"
                      type="text"
                      value={form.fullName}
                      onChange={handleChange}
                      placeholder="Alex Johnson"
                      required
                      autoComplete="name"
                      className="w-full border border-[#E5E7EB] bg-white rounded-xl px-4 py-3 text-sm text-[#0A0A0A] placeholder:text-[#9CA3AF] focus:outline-none focus:border-[#DC2626] transition-colors"
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
                      className="w-full border border-[#E5E7EB] bg-white rounded-xl px-4 py-3 text-sm text-[#0A0A0A] placeholder:text-[#9CA3AF] focus:outline-none focus:border-[#DC2626] transition-colors"
                    />
                  </div>

                  {/* Password */}
                  <div>
                    <label
                      htmlFor="password"
                      className="block text-xs font-bold uppercase tracking-wider text-[#0A0A0A] mb-2"
                    >
                      Password{' '}
                      <span className="text-[#DC2626]" aria-hidden="true">
                        *
                      </span>
                    </label>
                    <div className="relative">
                      <input
                        id="password"
                        name="password"
                        type={showPassword ? 'text' : 'password'}
                        value={form.password}
                        onChange={handleChange}
                        placeholder="Min. 8 characters"
                        required
                        minLength={8}
                        autoComplete="new-password"
                        className="w-full border border-[#E5E7EB] bg-white rounded-xl px-4 py-3 pr-12 text-sm text-[#0A0A0A] placeholder:text-[#9CA3AF] focus:outline-none focus:border-[#DC2626] transition-colors"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword((v) => !v)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-[#9CA3AF] hover:text-[#0A0A0A] transition-colors p-1"
                        aria-label={showPassword ? 'Hide password' : 'Show password'}
                      >
                        {showPassword ? (
                          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                            <path
                              d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24M1 1l22 22"
                              stroke="currentColor"
                              strokeWidth="2"
                              strokeLinecap="round"
                              strokeLinejoin="round"
                            />
                          </svg>
                        ) : (
                          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                            <path
                              d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"
                              stroke="currentColor"
                              strokeWidth="2"
                            />
                            <circle cx="12" cy="12" r="3" stroke="currentColor" strokeWidth="2" />
                          </svg>
                        )}
                      </button>
                    </div>
                  </div>

                  {/* Gym / Studio name (optional) */}
                  <div>
                    <label
                      htmlFor="gymName"
                      className="block text-xs font-bold uppercase tracking-wider text-[#0A0A0A] mb-2"
                    >
                      Gym / Studio Name{' '}
                      <span className="text-[#9CA3AF] font-normal normal-case tracking-normal">
                        (optional)
                      </span>
                    </label>
                    <input
                      id="gymName"
                      name="gymName"
                      type="text"
                      value={form.gymName}
                      onChange={handleChange}
                      placeholder="Peak Performance Gym"
                      autoComplete="organization"
                      className="w-full border border-[#E5E7EB] bg-white rounded-xl px-4 py-3 text-sm text-[#0A0A0A] placeholder:text-[#9CA3AF] focus:outline-none focus:border-[#DC2626] transition-colors"
                    />
                  </div>

                  <button
                    type="submit"
                    className="mkt-cta-gradient w-full mt-2 rounded-xl"
                  >
                    Create Free Account
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

                  <p className="text-xs text-[#9CA3AF] text-center leading-relaxed">
                    By signing up you agree to our{' '}
                    <Link href="/legal/terms" className="hover:text-[#DC2626] transition-colors underline">
                      Terms of Service
                    </Link>{' '}
                    and{' '}
                    <Link href="/legal/privacy" className="hover:text-[#DC2626] transition-colors underline">
                      Privacy Policy
                    </Link>
                    .
                  </p>
                </form>

                <p className="mt-6 text-sm text-center text-[#6B7280]">
                  Already have an account?{' '}
                  <Link
                    href="/login"
                    className="font-semibold text-[#0A0A0A] hover:text-[#DC2626] transition-colors"
                  >
                    Log in
                  </Link>
                </p>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Right — Branding / Trust */}
      <div
        className="hidden lg:flex lg:w-1/2 flex-col justify-between bg-[#0A0A0A] px-16 py-10 relative overflow-hidden"
        aria-hidden="true"
      >
        {/* Ambient glow */}
        <div className="absolute top-1/2 left-1/2 w-[500px] h-[500px] bg-[#DC2626]/[0.06] rounded-full blur-[150px] -translate-x-1/2 -translate-y-1/2 pointer-events-none" />

        {/* Dot pattern */}
        <div className="absolute inset-0 opacity-[0.015]" style={{ backgroundImage: 'radial-gradient(circle, rgba(255,255,255,0.8) 1px, transparent 1px)', backgroundSize: '32px 32px' }} />

        {/* Top area */}
        <div className="relative">
          <div className="inline-block border border-white/10 rounded-full px-4 py-1.5 text-xs font-bold uppercase tracking-widest text-[#DC2626]">
            Early Access
          </div>
        </div>

        {/* Center — headline */}
        <div className="space-y-6 relative">
          <h2 className="font-display text-5xl xl:text-6xl tracking-wide text-white uppercase leading-none">
            COACH SMARTER.<br />
            <span className="text-[#DC2626]">GROW FASTER.</span>
          </h2>
          <p className="text-white/50 text-base leading-relaxed max-w-sm">
            Join personal trainers who use Megin to manage clients, track progress, and spend less time on admin.
          </p>

          {/* Trust signals */}
          <ul className="space-y-4 mt-8">
            {TRUST_SIGNALS.map((signal) => (
              <li key={signal.text} className="flex items-center gap-3">
                <div className="shrink-0">{signal.icon}</div>
                <span className="text-sm font-semibold text-white">{signal.text}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* Bottom — decoration */}
        <div className="border-t border-white/10 pt-6 relative">
          <p className="text-xs text-white/20">
            megin.io — built for personal trainers
          </p>
        </div>
      </div>
    </div>
  )
}
