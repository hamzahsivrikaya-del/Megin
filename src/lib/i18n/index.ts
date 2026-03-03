import { en } from './en'
import { tr } from './tr'
import type { Locale, MarketingTranslations } from './types'

const translations: Record<Locale, MarketingTranslations> = { en, tr }

export function getTranslations(locale: Locale): MarketingTranslations {
  return translations[locale] ?? translations.en
}

export function getLocaleFromPath(pathname: string): Locale {
  if (pathname.startsWith('/tr')) return 'tr'
  return 'en'
}

export function localePath(path: string, locale: Locale): string {
  if (locale === 'en') return path
  return `/tr${path === '/' ? '' : path}`
}

export type { Locale, MarketingTranslations }
