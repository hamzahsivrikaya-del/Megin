'use client'

import Sidebar from '@/components/shared/Sidebar'
import MobileSidebar from '@/components/shared/MobileSidebar'
import { SubscriptionPlan } from '@/lib/types'

interface TrainerLayoutClientProps {
  children: React.ReactNode
  trainerName: string
  plan?: SubscriptionPlan
}

export default function TrainerLayoutClient({ children, trainerName, plan = 'free' }: TrainerLayoutClientProps) {
  return (
    <div className="min-h-screen bg-background">
      {/* Desktop sidebar */}
      <div className="hidden md:block">
        <Sidebar trainerName={trainerName} plan={plan} />
      </div>

      {/* Mobile sidebar */}
      <MobileSidebar trainerName={trainerName} plan={plan} />

      {/* Ana içerik */}
      <main className="md:ml-64 min-h-screen">
        <div className="p-4 md:p-6 pt-16 md:pt-6">
          {children}
        </div>
      </main>
    </div>
  )
}
