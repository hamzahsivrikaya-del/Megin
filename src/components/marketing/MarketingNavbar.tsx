'use client'

import { useState } from 'react'
import Link from 'next/link'
import { getTranslations, localePath } from '@/lib/i18n'
import type { Locale } from '@/lib/i18n/types'

interface MarketingNavbarProps {
  locale: Locale
}

export default function MarketingNavbar({ locale }: MarketingNavbarProps) {
  const [open, setOpen] = useState(false)
  const t = getTranslations(locale)

  const navLinks = [
    { href: localePath('/features', locale), label: t.nav.features },
    { href: localePath('/pricing', locale), label: t.nav.pricing },
    { href: localePath('/use-cases', locale), label: t.nav.useCases },
    { href: localePath('/blog', locale), label: t.nav.blog },
    { href: localePath('/tools', locale), label: t.nav.tools },
  ]

  return (
    <nav className="fixed top-0 w-full z-50 bg-white/90 backdrop-blur-md border-b border-gray-200/80">
      <div className="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between">
        <Link
          href={localePath('/', locale)}
          className="font-display text-lg tracking-[0.15em] text-[#0A0A0A]"
        >
          MEGIN<span className="text-[#FF2D2D]">.</span>
        </Link>

        <div className="flex items-center gap-4 sm:gap-6">
          {/* Desktop nav links */}
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="text-sm text-[#0A0A0A] hover:text-[#FF2D2D] transition-colors font-semibold hidden md:block"
            >
              {link.label}
            </Link>
          ))}

          {/* Language switcher */}
          <div className="hidden md:flex items-center gap-1 text-xs font-semibold">
            <Link
              href="/"
              className={locale === 'en' ? 'text-[#FF2D2D]' : 'text-[#0A0A0A] hover:text-[#FF2D2D] transition-colors'}
              aria-label="Switch to English"
            >
              EN
            </Link>
            <span className="text-gray-300">|</span>
            <Link
              href="/tr"
              className={locale === 'tr' ? 'text-[#FF2D2D]' : 'text-[#0A0A0A] hover:text-[#FF2D2D] transition-colors'}
              aria-label="Turkce'ye gec"
            >
              TR
            </Link>
          </div>

          {/* Login link */}
          <Link
            href="/login"
            className="text-sm font-semibold text-[#0A0A0A] hover:text-[#FF2D2D] transition-colors hidden md:block"
          >
            {t.nav.login}
          </Link>

          {/* Get Started button */}
          <Link href="/signup" className="mkt-cta-primary text-xs py-2.5 px-5">
            {t.nav.getStarted}
          </Link>

          {/* Mobile hamburger */}
          <button
            onClick={() => setOpen(!open)}
            className="md:hidden p-2.5 -mr-2 text-[#57534E] hover:text-[#0A0A0A] transition-colors cursor-pointer"
            aria-label="Menu"
            aria-expanded={open}
          >
            {open ? (
              <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            ) : (
              <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            )}
          </button>
        </div>
      </div>

      {/* Mobile dropdown */}
      {open && (
        <div className="md:hidden border-t border-gray-200 bg-white/95 backdrop-blur-md">
          <div className="px-4 py-3 flex flex-col gap-1">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setOpen(false)}
                className="px-4 py-3.5 text-sm text-[#57534E] hover:text-[#0A0A0A] hover:bg-gray-100 transition-colors active:bg-gray-200 font-medium"
              >
                {link.label}
              </Link>
            ))}
            <Link
              href="/login"
              onClick={() => setOpen(false)}
              className="px-4 py-3.5 text-sm text-[#57534E] hover:text-[#0A0A0A] hover:bg-gray-100 transition-colors active:bg-gray-200 font-medium"
            >
              {t.nav.login}
            </Link>
            {/* Mobile language switcher */}
            <div className="px-4 py-3 flex items-center gap-2 text-xs font-semibold border-t border-gray-100 mt-1">
              <Link
                href="/"
                onClick={() => setOpen(false)}
                className={locale === 'en' ? 'text-[#FF2D2D]' : 'text-[#57534E] hover:text-[#0A0A0A] transition-colors'}
              >
                EN
              </Link>
              <span className="text-gray-300">|</span>
              <Link
                href="/tr"
                onClick={() => setOpen(false)}
                className={locale === 'tr' ? 'text-[#FF2D2D]' : 'text-[#57534E] hover:text-[#0A0A0A] transition-colors'}
              >
                TR
              </Link>
            </div>
          </div>
        </div>
      )}
    </nav>
  )
}
