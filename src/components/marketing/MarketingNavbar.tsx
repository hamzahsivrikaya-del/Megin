'use client'

import { useState, useEffect, useRef } from 'react'
import { usePathname } from 'next/navigation'
import Link from 'next/link'
import {
  UserCheck,
  Building2,
  Laptop,
} from 'lucide-react'
import { getTranslations, localePath } from '@/lib/i18n'
import type { Locale } from '@/lib/i18n/types'

interface MarketingNavbarProps {
  locale?: Locale
}

const BUSINESS_ICONS = [UserCheck, Building2, Laptop]

export default function MarketingNavbar({ locale = 'tr' }: MarketingNavbarProps) {
  const pathname = usePathname()
  const [open, setOpen] = useState(false)
  const [scrolled, setScrolled] = useState(false)
  const [darkHero, setDarkHero] = useState(false)
  const [useCasesOpen, setUseCasesOpen] = useState(false)
  const [mobileUseCasesOpen, setMobileUseCasesOpen] = useState(false)
  const t = getTranslations(locale)
  const megaMenuRef = useRef<HTMLDivElement>(null)
  const closeTimer = useRef<ReturnType<typeof setTimeout> | null>(null)

  // Re-detect dark hero on every route change
  useEffect(() => {
    // Small delay to let the new page render
    const timer = setTimeout(() => {
      const firstSection = document.querySelector('main > section:first-child, main > div > section:first-child')
      setDarkHero(!!firstSection?.classList.contains('mkt-section-dark-warm'))
    }, 50)
    return () => clearTimeout(timer)
  }, [pathname])

  // Whether nav text should be light (white)
  const lightNav = darkHero && !scrolled && !open

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20)
      setUseCasesOpen(false)
    }
    const handleResize = () => {
      if (window.innerWidth >= 768) setOpen(false)
      setUseCasesOpen(false)
    }
    window.addEventListener('scroll', handleScroll, { passive: true })
    window.addEventListener('resize', handleResize)
    return () => {
      window.removeEventListener('scroll', handleScroll)
      window.removeEventListener('resize', handleResize)
    }
  }, [])

  // Clean up timer on unmount
  useEffect(() => {
    return () => {
      if (closeTimer.current) clearTimeout(closeTimer.current)
    }
  }, [])

  function openMega() {
    if (closeTimer.current) clearTimeout(closeTimer.current)
    setUseCasesOpen(true)
  }

  function scheduleMegaClose() {
    closeTimer.current = setTimeout(() => setUseCasesOpen(false), 120)
  }

  const navLinks = [
    { href: localePath('/features', locale), label: t.nav.features, hasMega: false },
    { href: localePath('/pricing', locale), label: t.nav.pricing, hasMega: false },
    { href: localePath('/use-cases', locale), label: t.nav.useCases, hasMega: true },
    { href: localePath('/blog', locale), label: t.nav.blog, hasMega: false },
    { href: localePath('/tools', locale), label: t.nav.tools, hasMega: false },
  ]

  return (
    <nav
      className={`fixed top-0 w-full z-50 transition-all duration-500 ${
        scrolled
          ? 'bg-white/90 backdrop-blur-xl border-b border-gray-200/60 shadow-sm shadow-black/[0.03]'
          : 'bg-transparent border-b border-transparent'
      }`}
    >
      <div className="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between">
        <Link
          href={localePath('/', locale)}
          className={`font-display text-lg tracking-[0.15em] transition-colors duration-300 ${lightNav ? 'text-white' : 'text-[#0A0A0A]'}`}
        >
          MEGIN<span className="text-[#DC2626]">.</span>
        </Link>

        <div className="flex items-center gap-4 sm:gap-6">
          {/* Desktop nav links */}
          {navLinks.map((link) =>
            link.hasMega ? (
              /* Use Cases with mega menu */
              <div
                key={link.href}
                className="relative hidden md:block"
                onMouseEnter={openMega}
                onMouseLeave={scheduleMegaClose}
                ref={megaMenuRef}
              >
                <Link
                  href={link.href}
                  className={`text-sm hover:text-[#DC2626] transition-colors font-semibold relative after:absolute after:bottom-0 after:left-0 after:w-0 after:h-[2px] after:bg-gradient-to-r after:from-[#DC2626] after:to-[#F97316] after:transition-all after:duration-300 hover:after:w-full inline-flex items-center gap-1 ${lightNav ? 'text-white/90' : 'text-[#0A0A0A]'}`}
                  aria-expanded={useCasesOpen}
                  aria-haspopup="true"
                >
                  {link.label}
                  <svg
                    width="12"
                    height="12"
                    viewBox="0 0 12 12"
                    fill="none"
                    aria-hidden="true"
                    className={`transition-transform duration-200 ${useCasesOpen ? 'rotate-180' : ''}`}
                  >
                    <path
                      d="M2 4L6 8L10 4"
                      stroke="currentColor"
                      strokeWidth="1.5"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                </Link>

                {/* Mega menu — single column, business items only */}
                {useCasesOpen && (
                  <div
                    className="absolute top-full left-1/2 -translate-x-1/2 w-[320px] z-[100] pt-3"
                    onMouseEnter={openMega}
                    onMouseLeave={scheduleMegaClose}
                    role="menu"
                    aria-label={link.label}
                  >
                    <div className="bg-white rounded-2xl shadow-2xl border border-gray-100 overflow-hidden">
                      {/* Top accent bar */}
                      <div className="h-0.5 bg-gradient-to-r from-[#DC2626] to-[#F97316]" />

                      <div className="p-4">
                        <ul className="space-y-1" role="none">
                          {t.megaMenu.businesses.map((item, i) => {
                            const Icon = BUSINESS_ICONS[i] ?? UserCheck
                            const slugs = ['personal-trainers', 'gym-studios', 'online-coaches']
                            return (
                              <li key={item.title} role="none">
                                <Link
                                  href={localePath(`/use-cases/${slugs[i]}`, locale)}
                                  role="menuitem"
                                  className="flex items-start gap-2.5 p-2.5 rounded-xl hover:bg-gray-50 transition-colors group"
                                >
                                  <span className="mt-0.5 flex-shrink-0 w-7 h-7 rounded-lg bg-red-50 flex items-center justify-center group-hover:bg-red-100 transition-colors">
                                    <Icon size={14} className="text-[#DC2626]" />
                                  </span>
                                  <span>
                                    <span className="block text-sm font-semibold text-[#0A0A0A] leading-tight">
                                      {item.title}
                                    </span>
                                    <span className="block text-xs text-[#6B7280] leading-tight mt-0.5">
                                      {item.description}
                                    </span>
                                  </span>
                                </Link>
                              </li>
                            )
                          })}
                        </ul>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <Link
                key={link.href}
                href={link.href}
                className={`text-sm hover:text-[#DC2626] transition-colors font-semibold hidden md:block relative after:absolute after:bottom-0 after:left-0 after:w-0 after:h-[2px] after:bg-gradient-to-r after:from-[#DC2626] after:to-[#F97316] after:transition-all after:duration-300 hover:after:w-full ${lightNav ? 'text-white/90' : 'text-[#0A0A0A]'}`}
              >
                {link.label}
              </Link>
            )
          )}

          {/* Language switcher */}
          <div className="hidden md:flex items-center gap-1 text-xs font-semibold">
            <Link
              href="/"
              className={locale === 'en' ? 'text-[#DC2626]' : `${lightNav ? 'text-white/70' : 'text-[#0A0A0A]'} hover:text-[#DC2626] transition-colors`}
              aria-label="Switch to English"
            >
              EN
            </Link>
            <span className={lightNav ? 'text-white/30' : 'text-gray-300'}>|</span>
            <Link
              href="/tr"
              className={locale === 'tr' ? 'text-[#DC2626]' : `${lightNav ? 'text-white/70' : 'text-[#0A0A0A]'} hover:text-[#DC2626] transition-colors`}
              aria-label="Turkce'ye gec"
            >
              TR
            </Link>
          </div>

          {/* Login link */}
          <Link
            href="/login"
            className={`text-sm font-semibold hover:text-[#DC2626] transition-colors hidden md:block ${lightNav ? 'text-white/90' : 'text-[#0A0A0A]'}`}
          >
            {t.nav.login}
          </Link>

          {/* Get Started button */}
          <Link href="/signup" className="mkt-cta-gradient text-xs py-2.5 px-5 rounded-full">
            {t.nav.getStarted}
          </Link>

          {/* Mobile hamburger */}
          <button
            onClick={() => setOpen(!open)}
            className={`md:hidden p-2.5 -mr-2 transition-colors cursor-pointer ${lightNav ? 'text-white/80 hover:text-white' : 'text-[#57534E] hover:text-[#0A0A0A]'}`}
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
        <div className="md:hidden border-t border-gray-200 bg-white/95 backdrop-blur-xl">
          <div className="px-4 py-3 flex flex-col gap-1">
            {navLinks.map((link) =>
              link.hasMega ? (
                <div key={link.href}>
                  <button
                    type="button"
                    onClick={() => setMobileUseCasesOpen(!mobileUseCasesOpen)}
                    className="w-full px-4 py-3.5 text-sm text-[#57534E] hover:text-[#0A0A0A] hover:bg-gray-100 transition-colors active:bg-gray-200 font-medium rounded-lg flex items-center justify-between cursor-pointer"
                  >
                    {link.label}
                    <svg
                      width="12"
                      height="12"
                      viewBox="0 0 12 12"
                      fill="none"
                      aria-hidden="true"
                      className={`transition-transform duration-200 ${mobileUseCasesOpen ? 'rotate-180' : ''}`}
                    >
                      <path d="M2 4L6 8L10 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  </button>
                  {mobileUseCasesOpen && (
                    <div className="ml-4 mt-1 space-y-0.5">
                      {t.megaMenu.businesses.map((item, i) => {
                        const slugs = ['personal-trainers', 'gym-studios', 'online-coaches']
                        const Icon = BUSINESS_ICONS[i] ?? UserCheck
                        return (
                          <Link
                            key={item.title}
                            href={localePath(`/use-cases/${slugs[i]}`, locale)}
                            onClick={() => { setOpen(false); setMobileUseCasesOpen(false) }}
                            className="flex items-center gap-2.5 px-4 py-2.5 text-sm text-[#57534E] hover:text-[#0A0A0A] hover:bg-gray-100 transition-colors rounded-lg"
                          >
                            <Icon size={14} className="text-[#DC2626] flex-shrink-0" />
                            <span>{item.title}</span>
                          </Link>
                        )
                      })}
                    </div>
                  )}
                </div>
              ) : (
                <Link
                  key={link.href}
                  href={link.href}
                  onClick={() => setOpen(false)}
                  className="px-4 py-3.5 text-sm text-[#57534E] hover:text-[#0A0A0A] hover:bg-gray-100 transition-colors active:bg-gray-200 font-medium rounded-lg"
                >
                  {link.label}
                </Link>
              )
            )}
            <Link
              href="/login"
              onClick={() => setOpen(false)}
              className="px-4 py-3.5 text-sm text-[#57534E] hover:text-[#0A0A0A] hover:bg-gray-100 transition-colors active:bg-gray-200 font-medium rounded-lg"
            >
              {t.nav.login}
            </Link>
            {/* Mobile language switcher */}
            <div className="px-4 py-3 flex items-center gap-2 text-xs font-semibold border-t border-gray-100 mt-1">
              <Link
                href="/"
                onClick={() => setOpen(false)}
                className={locale === 'en' ? 'text-[#DC2626]' : 'text-[#57534E] hover:text-[#0A0A0A] transition-colors'}
              >
                EN
              </Link>
              <span className="text-gray-300">|</span>
              <Link
                href="/tr"
                onClick={() => setOpen(false)}
                className={locale === 'tr' ? 'text-[#DC2626]' : 'text-[#57534E] hover:text-[#0A0A0A] transition-colors'}
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
