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
      bullets?: string[]
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
  badges: {
    title: string
    subtitle: string
  }
  useCases: {
    segments: Array<{
      slug: string
      label: string
      title: string
      description: string
      features: string[]
      heroDescription: string
      benefits: string[]
      problemStrip: string
      extendedFeatures: Array<{ title: string; description: string }>
      comparisonBefore: string[]
      comparisonAfter: string[]
      faqItems: Array<{ question: string; answer: string }>
      testimonialQuote: string
      testimonialName: string
      testimonialRole: string
    }>
  }
  comparison: {
    title: string
    subtitle: string
    megin: string
    excel: string
    whatsapp: string
    rows: Array<{
      feature: string
      megin: string
      excel: string
      whatsapp: string
    }>
  }
  testimonials: {
    title: string
    subtitle: string
    items: Array<{
      quote: string
      name: string
      role: string
      rating: number
    }>
  }
  pricing: {
    currencySymbol: string
    title: string
    subtitle: string
    monthly: string
    annual: string
    savePercent: string
    perMonth: string
    perYear: string
    mostPopular: string
    miniTestimonials: string[]
    startFree: string
    startTrial: string
    contactUs: string
    cancelAnytime: string
    trialNote: string
    tiers: Array<{
      badge: string
      monthlyPrice: number
      annualPrice: number
      limit: string
      features: string[]
    }>
    faq: {
      title: string
      items: Array<{
        question: string
        answer: string
      }>
    }
    lockedFeatures: string[][]
    comparisonTitle: string
    comparisonSubtitle: string
    featureLabel: string
    comparisonCategories: Array<{
      name: string
      features: Array<{
        name: string
        values: [boolean | string, boolean | string, boolean | string]
      }>
    }>
  }
  contact: {
    badge: string
    title: string
    subtitle: string
    nameLabel: string
    namePlaceholder: string
    emailLabel: string
    emailPlaceholder: string
    clientCountLabel: string
    clientCountOptional: string
    clientCountOptions: Array<{ value: string; label: string }>
    messageLabel: string
    messagePlaceholder: string
    sendButton: string
    successTitle: string
    successMessage: string
    sendAnother: string
    tryPlatform: string
    getStartedFree: string
    tryPlatformSuffix: string
    getInTouch: string
    responseTimeLabel: string
    responseTimeValue: string
    responseTimeNote: string
    faqNudgeTitle: string
    faqNudgeText: string
    faqNudgeLink: string
  }
  featuresPage: {
    title: string
    subtitle: string
    ctaTitle: string
    ctaButton: string
    items: Array<{
      title: string
      description: string
      bullets: string[]
    }>
  }
  megaMenu: {
    byUseCase: string
    byBusiness: string
    bySize: string
    useCases: Array<{ title: string; description: string }>
    businesses: Array<{ title: string; description: string }>
    sizes: Array<{ title: string; description: string }>
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
