'use client'

import Sidebar from '@/components/shared/Sidebar'
import MobileSidebar from '@/components/shared/MobileSidebar'

interface AdminLayoutClientProps {
  children: React.ReactNode
  userName: string
}

export default function AdminLayoutClient({ children, userName }: AdminLayoutClientProps) {
  return (
    <div className="min-h-screen bg-[#FAFAFA]">
      {/* Desktop sidebar */}
      <div className="hidden md:block">
        <Sidebar />
      </div>

      {/* Mobile sidebar */}
      <MobileSidebar />

      {/* Ana içerik */}
      <main className="md:ml-64 min-h-screen">
        <div className="p-4 md:p-6 pt-16 md:pt-6 pb-safe">
          {children}
        </div>
      </main>
    </div>
  )
}
