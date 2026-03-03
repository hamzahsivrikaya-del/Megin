'use client'

import Sidebar from '@/components/shared/Sidebar'
import MobileSidebar from '@/components/shared/MobileSidebar'

interface TrainerLayoutClientProps {
  children: React.ReactNode
  trainerName: string
}

export default function TrainerLayoutClient({ children, trainerName }: TrainerLayoutClientProps) {
  return (
    <div className="min-h-screen bg-background">
      {/* Desktop sidebar */}
      <div className="hidden md:block">
        <Sidebar trainerName={trainerName} />
      </div>

      {/* Mobile sidebar */}
      <MobileSidebar trainerName={trainerName} />

      {/* Ana içerik */}
      <main className="md:ml-64 min-h-screen">
        <div className="p-4 md:p-6 pt-16 md:pt-6">
          {children}
        </div>
      </main>
    </div>
  )
}
