'use client'

import Link from 'next/link'
import { SubscriptionPlan } from '@/lib/types'
import { hasFeatureAccess, getUpgradePlan, PLAN_CONFIGS } from '@/lib/plans'

interface FeatureGateProps {
  plan: SubscriptionPlan
  feature: string
  children: React.ReactNode
  role?: 'trainer' | 'client'
}

export default function FeatureGate({ plan, feature, children, role = 'trainer' }: FeatureGateProps) {
  if (hasFeatureAccess(plan, feature)) {
    return <>{children}</>
  }

  const upgradePlan = getUpgradePlan(plan)
  const upgradeName = upgradePlan ? PLAN_CONFIGS[upgradePlan].name : 'Elite'
  const upgradeLink = '/dashboard/upgrade'

  return (
    <div className="flex flex-col items-center justify-center min-h-[400px] p-8 text-center">
      <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mb-4">
        <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-primary">
          <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
          <path d="M7 11V7a5 5 0 0 1 10 0v4" />
        </svg>
      </div>
      <h2 className="text-xl font-bold text-text-primary mb-2">
        Bu özellik {upgradeName} paketinde
      </h2>
      <p className="text-text-secondary mb-6 max-w-md">
        Bu özelliğe erişmek için planını yükselt.
      </p>
      {role === 'trainer' && (
        <Link
          href={upgradeLink}
          className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-primary text-white font-semibold hover:bg-primary/90 transition-colors"
        >
          {upgradeName} Planına Geç
        </Link>
      )}
    </div>
  )
}
