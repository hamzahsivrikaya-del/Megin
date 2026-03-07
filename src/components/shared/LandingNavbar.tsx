'use client'

import { useState } from 'react'
import Link from 'next/link'

const navLinks = [
  { href: '/#hakkimda', label: 'Hakkımda' },
  { href: '/#hizmetler', label: 'Hizmetler' },
  { href: '/antrenmanlar', label: 'Antrenmanlar' },
  { href: '/araclar', label: 'Hesaplayıcılar' },
  { href: '/blog', label: 'Blog' },
  { href: '/#iletisim', label: 'İletişim' },
]

export default function LandingNavbar() {
  const [open, setOpen] = useState(false)

  return (
    <nav className="fixed top-0 w-full z-50 bg-white/90 backdrop-blur-md border-b border-gray-200/80">
      <div className="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between">
        <Link href="/" className="font-display text-lg tracking-[0.15em] text-[#1A1A1A]">
          HAMZA<span className="text-primary">.</span>
        </Link>
        <div className="flex items-center gap-4 sm:gap-6">
          {/* Desktop links */}
          {navLinks.map((link) => (
            <a
              key={link.href}
              href={link.href}
              className="text-sm text-[#1A1A1A] hover:text-primary transition-colors hidden sm:block font-semibold"
            >
              {link.label}
            </a>
          ))}
          <Link
            href="/login"
            className="text-sm px-4 py-2 bg-gradient-to-r from-[#DC2626] to-[#F97316] text-white font-semibold shadow-sm hover:shadow-md transition-all press-effect rounded-lg"
          >
            Üye Girişi
          </Link>
          {/* Mobile hamburger */}
          <button
            onClick={() => setOpen(!open)}
            className="sm:hidden p-2.5 -mr-2 text-[#57534E] hover:text-[#1A1A1A] transition-colors cursor-pointer"
            aria-label="Menü"
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
        <div className="sm:hidden border-t border-gray-200 bg-white/95 backdrop-blur-md">
          <div className="px-4 py-3 flex flex-col gap-1">
            {navLinks.map((link) => (
              <a
                key={link.href}
                href={link.href}
                onClick={() => setOpen(false)}
                className="px-4 py-3.5 text-sm text-[#57534E] hover:text-[#1A1A1A] hover:bg-gray-100 transition-colors active:bg-gray-200 font-medium"
              >
                {link.label}
              </a>
            ))}
          </div>
        </div>
      )}
    </nav>
  )
}
