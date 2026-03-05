'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import NotificationBell from './NotificationBell'
import { hasFeatureAccess } from '@/lib/plans'
import type { SubscriptionPlan } from '@/lib/types'

interface NavItem {
  href: string
  label: string
  feature?: string
  icon: React.ReactNode
}

interface ClientNavbarProps {
  userName?: string
  plan?: SubscriptionPlan
}

export default function ClientNavbar({ userName: initialName, plan = 'free' }: ClientNavbarProps) {
  const router = useRouter()
  const [userName, setUserName] = useState(initialName || '')

  useEffect(() => {
    async function fetchName() {
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return
      const { data } = await supabase
        .from('clients')
        .select('full_name')
        .eq('user_id', user.id)
        .maybeSingle()
      if (data) setUserName(data.full_name)
    }

    if (!initialName) fetchName()

    window.addEventListener('profile-updated', fetchName)
    return () => window.removeEventListener('profile-updated', fetchName)
  }, [initialName])

  async function handleLogout() {
    const supabase = createClient()
    await supabase.auth.signOut()
    router.push('/login')
  }

  const navItems: NavItem[] = [
    {
      href: '/app/program',
      label: 'Programım',
      icon: (
        <svg className="w-5 h-5 sm:hidden" fill="currentColor" viewBox="0 0 24 24">
          <path d="M20.57 14.86L22 13.43 20.57 12 17 15.57 8.43 7 12 3.43 10.57 2 9.14 3.43 7.71 2 5.57 4.14 4.14 2.71 2.71 4.14l1.43 1.43L2 7.71l1.43 1.43L2 10.57 3.43 12 7 8.43 15.57 17 12 20.57 13.43 22l1.43-1.43L16.29 22l2.14-2.14 1.43 1.43 1.43-1.43-1.43-1.43L22 16.29z" />
        </svg>
      ),
    },
    {
      href: '/app/haftalik-ozet',
      label: 'Haftalık Özet',
      feature: 'weekly_reports',
      icon: (
        <svg className="w-5 h-5 sm:hidden" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
        </svg>
      ),
    },
    {
      href: '/app/beslenme',
      label: 'Beslenme',
      feature: 'nutrition',
      icon: (
        <svg className="w-5 h-5 sm:hidden" viewBox="0 0 24 24" fill="currentColor">
          <path d="M7 2v9a3 3 0 003 3v7a1 1 0 002 0v-7a3 3 0 003-3V2h-2v9a1 1 0 01-1 1h-2a1 1 0 01-1-1V2H7zM17 2v20a1 1 0 002 0v-8h1a2 2 0 002-2V5a3 3 0 00-3-3h-2z" />
        </svg>
      ),
    },
    {
      href: '/app/rozetler',
      label: 'Rozetler',
      feature: 'badges',
      icon: (
        <svg className="w-5 h-5 sm:hidden" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
        </svg>
      ),
    },
    {
      href: '/app/blog',
      label: 'Blog',
      feature: 'blog',
      icon: (
        <svg className="w-5 h-5 sm:hidden" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9a2 2 0 00-2-2h-2m-4-3H9M7 16h6M7 8h6v4H7V8z" />
        </svg>
      ),
    },
    {
      href: '/app/settings',
      label: 'Profilim',
      icon: (
        <svg className="w-5 h-5 sm:hidden" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
        </svg>
      ),
    },
  ]

  const visibleItems = navItems.filter(
    (item) => !item.feature || hasFeatureAccess(plan, item.feature)
  )

  return (
    <header className="sticky top-0 z-40 bg-surface/80 backdrop-blur-sm border-b border-border">
      <div className="flex items-center justify-between h-14 px-4 md:px-6 max-w-5xl mx-auto">
        <Link href="/app" className="group flex items-center gap-2 px-2 py-1.5 -ml-2 rounded-lg hover:bg-surface-hover transition-colors" title="Ana Sayfa">
          <svg className="w-[18px] h-[18px] text-text-secondary group-hover:text-primary transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
          </svg>
          <span className="text-sm font-semibold text-text-secondary group-hover:text-primary transition-colors hidden sm:block">
            Ana Sayfa
          </span>
        </Link>

        <div className="flex items-center gap-1 sm:gap-4">
          <NotificationBell notificationsHref="/app/notifications" />
          <span className="text-sm font-bold text-text-primary uppercase hidden sm:block">{userName}</span>

          {visibleItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="p-2 sm:p-0 text-sm text-text-secondary hover:text-text-primary transition-colors"
              title={item.label}
            >
              {item.icon}
              <span className="hidden sm:inline">{item.label}</span>
            </Link>
          ))}

          <button
            onClick={handleLogout}
            className="p-2 sm:p-0 text-sm text-text-secondary hover:text-text-primary transition-colors cursor-pointer"
            title="Çıkış"
          >
            <svg className="w-5 h-5 sm:hidden" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
            </svg>
            <span className="hidden sm:inline">Çıkış</span>
          </button>
        </div>
      </div>
    </header>
  )
}
