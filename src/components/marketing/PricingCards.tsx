import Link from 'next/link'

interface PricingTier {
  badge: string
  badgeStyle: 'gray' | 'white'
  price: string
  period: string
  limit: string
  features: string[]
  ctaLabel: string
  ctaHref: string
  ctaVariant: 'primary' | 'ghost'
  highlighted?: boolean
  dark?: boolean
}

const tiers: PricingTier[] = [
  {
    badge: 'Free',
    badgeStyle: 'gray',
    price: '$0',
    period: '/month',
    limit: 'Up to 5 clients',
    features: [
      'All core features',
      'Basic support',
      'Push notifications',
      'Badge system',
      'Progress reports',
    ],
    ctaLabel: 'Get Started Free',
    ctaHref: '/signup',
    ctaVariant: 'ghost',
  },
  {
    badge: 'Pro',
    badgeStyle: 'gray',
    price: '$29',
    period: '/month',
    limit: 'Up to 30 clients',
    features: [
      'Everything in Free',
      'Custom branding',
      'Advanced analytics',
      'Priority support',
      'Export data',
    ],
    ctaLabel: 'Start Pro Trial',
    ctaHref: '/signup',
    ctaVariant: 'primary',
    highlighted: true,
  },
  {
    badge: 'Enterprise',
    badgeStyle: 'white',
    price: '$79',
    period: '/month',
    limit: 'Unlimited clients',
    features: [
      'Everything in Pro',
      'Multi-trainer support',
      'API access',
      'Dedicated support',
      'Custom integrations',
    ],
    ctaLabel: 'Contact Us',
    ctaHref: '/contact',
    ctaVariant: 'primary',
    dark: true,
  },
]

function CheckIcon({ dark }: { dark?: boolean }) {
  return (
    <svg
      width="16"
      height="16"
      viewBox="0 0 16 16"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
      className="flex-shrink-0 mt-0.5"
    >
      <circle
        cx="8"
        cy="8"
        r="8"
        fill={dark ? 'rgba(255,255,255,0.12)' : 'rgba(34,197,94,0.12)'}
      />
      <path
        d="M4.5 8.5L6.5 10.5L11 5.5"
        stroke={dark ? '#FFFFFF' : '#22C55E'}
        strokeWidth="1.6"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  )
}

export default function PricingCards() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 sm:gap-8">
      {tiers.map((tier) => {
        const isHighlighted = tier.highlighted
        const isDark = tier.dark

        return (
          <div
            key={tier.badge}
            className={[
              'rounded-2xl border p-8 sm:p-10 relative',
              isHighlighted
                ? 'border-[#FF2D2D] bg-white gradient-border scale-[1.02]'
                : isDark
                  ? 'border-[#E5E7EB] bg-[#0A0A0A]'
                  : 'border-[#E5E7EB] bg-white',
            ].join(' ')}
          >
            {/* Most Popular badge */}
            {isHighlighted && (
              <span className="absolute -top-4 left-1/2 -translate-x-1/2 bg-[#FF2D2D] text-white text-xs font-bold px-4 py-1.5 rounded-full uppercase tracking-wider whitespace-nowrap">
                Most Popular
              </span>
            )}

            {/* Tier badge */}
            <span
              className={[
                'inline-block text-xs font-bold uppercase tracking-wider px-3 py-1 rounded-full',
                isDark
                  ? 'bg-white/10 text-white/70'
                  : 'bg-[#F5F5F5] text-[#6B7280]',
              ].join(' ')}
            >
              {tier.badge}
            </span>

            {/* Price */}
            <div className="mt-4 flex items-end gap-1">
              <span
                className={`font-display text-5xl font-bold leading-none ${
                  isDark ? 'text-white' : 'text-[#0A0A0A]'
                }`}
              >
                {tier.price}
              </span>
              <span
                className={`text-sm mb-1.5 ${
                  isDark ? 'text-white/50' : 'text-[#6B7280]'
                }`}
              >
                {tier.period}
              </span>
            </div>

            {/* Client limit */}
            <p
              className={`mt-2 text-sm font-medium ${
                isDark ? 'text-white/60' : 'text-[#6B7280]'
              }`}
            >
              {tier.limit}
            </p>

            {/* Divider */}
            <hr
              className={`my-6 ${
                isDark ? 'border-white/10' : 'border-[#E5E7EB]'
              }`}
            />

            {/* Features */}
            <ul className="space-y-3" aria-label={`${tier.badge} plan features`}>
              {tier.features.map((feature) => (
                <li key={feature} className="flex items-start gap-3">
                  <CheckIcon dark={isDark} />
                  <span
                    className={`text-sm ${
                      isDark ? 'text-white/80' : 'text-[#0A0A0A]'
                    }`}
                  >
                    {feature}
                  </span>
                </li>
              ))}
            </ul>

            {/* CTA */}
            <div className="mt-8">
              <Link
                href={tier.ctaHref}
                className={
                  tier.ctaVariant === 'primary'
                    ? 'mkt-cta-primary w-full justify-center'
                    : 'mkt-cta-ghost w-full justify-center'
                }
              >
                {tier.ctaLabel}
              </Link>
            </div>
          </div>
        )
      })}
    </div>
  )
}
