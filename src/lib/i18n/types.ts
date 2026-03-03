export type Locale = 'en' | 'tr'

export interface MarketingTranslations {
  nav: {
    features: string
    pricing: string
    useCases: string
    blog: string
    tools: string
    login: string
    getStarted: string
  }
  hero: {
    title1: string
    title2: string
    subtitle: string
    cta: string
    trustNoCreditCard: string
    trustFreeClients: string
  }
  problem: {
    line1: string
    line2: string
    line3: string
  }
  features: {
    title1: string
    title2: string
    seeAll: string
    items: Array<{
      title: string
      description: string
    }>
  }
  story: {
    heading1: string
    heading2: string
    quote: string
    author: string
  }
  numbers: {
    items: Array<{
      value: string
      label: string
      sublabel: string
    }>
  }
  cta: {
    title1: string
    title2: string
    button: string
    subtext: string
  }
  footer: {
    product: string
    resources: string
    legal: string
    connect: string
    copyright: string
    privacy: string
    terms: string
    refund: string
  }
}
