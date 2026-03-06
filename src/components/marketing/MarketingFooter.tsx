import Link from 'next/link'
import { getTranslations, localePath } from '@/lib/i18n'
import type { Locale } from '@/lib/i18n/types'

interface MarketingFooterProps {
  locale: Locale
}

export default function MarketingFooter({ locale }: MarketingFooterProps) {
  const t = getTranslations(locale)

  const productLinks = [
    { href: localePath('/features', locale), label: t.nav.features },
    { href: localePath('/pricing', locale), label: t.nav.pricing },
    { href: localePath('/use-cases', locale), label: t.nav.useCases },
  ]

  const resourceLinks = [
    { href: localePath('/blog', locale), label: t.nav.blog },
    { href: localePath('/tools', locale), label: t.nav.tools },
    { href: localePath('/contact', locale), label: locale === 'tr' ? 'İletişim' : 'Contact' },
  ]

  const legalLinks = [
    { href: localePath('/legal/privacy', locale), label: t.footer.privacy },
    { href: localePath('/legal/terms', locale), label: t.footer.terms },
    { href: localePath('/legal/refund', locale), label: t.footer.refund },
  ]

  return (
    <footer className="bg-[#FAFAFA] border-t border-[#E5E7EB]">
      <div className="max-w-6xl mx-auto px-4 py-16">
        {/* Top section */}
        <div className="flex flex-col md:flex-row gap-12 md:gap-16">
          {/* Logo + tagline */}
          <div className="md:w-48 shrink-0">
            <Link
              href={localePath('/', locale)}
              className="font-display text-xl tracking-[0.15em] text-[#0A0A0A]"
            >
              MEGIN<span className="text-[#DC2626]">.</span>
            </Link>
            <p className="mt-3 text-sm text-[#57534E] leading-relaxed">
              {locale === 'tr'
                ? 'Antrenörler için geliştirilmiş üye yönetim platformu.'
                : 'Client management platform built for personal trainers.'}
            </p>
            {/* Warm accent line */}
            <div className="w-12 h-1 rounded-full bg-gradient-to-r from-[#DC2626] to-[#F97316] mt-4" />
          </div>

          {/* 4-column link grid */}
          <div className="flex-1 grid grid-cols-2 sm:grid-cols-4 gap-8">
            {/* Product */}
            <div>
              <h3 className="text-xs font-bold uppercase tracking-wider text-[#0A0A0A] mb-4">
                {t.footer.product}
              </h3>
              <ul className="flex flex-col gap-2.5">
                {productLinks.map((link) => (
                  <li key={link.href}>
                    <Link
                      href={link.href}
                      className="text-sm text-[#57534E] hover:text-[#DC2626] transition-colors"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            {/* Resources */}
            <div>
              <h3 className="text-xs font-bold uppercase tracking-wider text-[#0A0A0A] mb-4">
                {t.footer.resources}
              </h3>
              <ul className="flex flex-col gap-2.5">
                {resourceLinks.map((link) => (
                  <li key={link.href}>
                    <Link
                      href={link.href}
                      className="text-sm text-[#57534E] hover:text-[#DC2626] transition-colors"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            {/* Legal */}
            <div>
              <h3 className="text-xs font-bold uppercase tracking-wider text-[#0A0A0A] mb-4">
                {t.footer.legal}
              </h3>
              <ul className="flex flex-col gap-2.5">
                {legalLinks.map((link) => (
                  <li key={link.href}>
                    <Link
                      href={link.href}
                      className="text-sm text-[#57534E] hover:text-[#DC2626] transition-colors"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            {/* Connect */}
            <div>
              <h3 className="text-xs font-bold uppercase tracking-wider text-[#0A0A0A] mb-4">
                {t.footer.connect}
              </h3>
              <ul className="flex flex-col gap-2.5">
                <li>
                  <Link
                    href="/contact"
                    className="text-sm text-[#57534E] hover:text-[#DC2626] transition-colors"
                  >
                    {locale === 'tr' ? 'İletişim' : 'Contact'}
                  </Link>
                </li>
              </ul>
            </div>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="border-t border-[#E5E7EB] mt-10 pt-6 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-xs text-[#57534E]">{t.footer.copyright}</p>

          {/* Language switcher */}
          <div className="flex items-center gap-1.5 text-xs font-semibold">
            <Link
              href="/"
              className={locale === 'en' ? 'text-[#DC2626]' : 'text-[#57534E] hover:text-[#DC2626] transition-colors'}
              aria-label="Switch to English"
            >
              EN
            </Link>
            <span className="text-gray-300">|</span>
            <Link
              href="/tr"
              className={locale === 'tr' ? 'text-[#DC2626]' : 'text-[#57534E] hover:text-[#DC2626] transition-colors'}
              aria-label="Turkce'ye gec"
            >
              TR
            </Link>
          </div>
        </div>
      </div>
    </footer>
  )
}
