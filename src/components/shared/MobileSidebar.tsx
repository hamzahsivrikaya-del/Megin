'use client'

import { useState, useEffect } from 'react'
import { usePathname } from 'next/navigation'
import Sidebar from './Sidebar'
import { SubscriptionPlan } from '@/lib/types'

interface MobileSidebarProps {
  trainerName?: string
  plan?: SubscriptionPlan
}

export default function MobileSidebar({ trainerName, plan }: MobileSidebarProps) {
  const [open, setOpen] = useState(false)
  const pathname = usePathname()

  // Route değişiminde sidebar'ı kapat
  useEffect(() => {
    setOpen(false)
  }, [pathname])

  return (
    <>
      {/* Hamburger butonu - sadece mobilde, panel kapalıyken görünür */}
      {!open && (
        <button
          onClick={() => setOpen(true)}
          className="md:hidden fixed top-3 left-3 z-50 p-2.5 bg-surface rounded-lg border border-border cursor-pointer active:bg-surface-hover"
        >
          <svg className="w-5 h-5 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
          </svg>
        </button>
      )}

      {/* Overlay */}
      {open && (
        <div className="md:hidden fixed inset-0 z-40 bg-black/60" onClick={() => setOpen(false)}>
          <div onClick={(e) => e.stopPropagation()}>
            <Sidebar trainerName={trainerName} plan={plan} />
          </div>
        </div>
      )}
    </>
  )
}
