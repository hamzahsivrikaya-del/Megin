'use client'

import { useState, useEffect, useCallback } from 'react'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'

interface NotificationBellProps {
  notificationsHref?: string
}

export default function NotificationBell({ notificationsHref = '/app/notifications' }: NotificationBellProps) {
  const [count, setCount] = useState(0)

  const fetchCount = useCallback(async () => {
    const supabase = createClient()
    const { count: unread } = await supabase
      .from('notifications')
      .select('*', { count: 'exact', head: true })
      .eq('is_read', false)

    setCount(unread || 0)
  }, [])

  useEffect(() => {
    fetchCount()

    // Her 60 saniyede bir kontrol et
    const interval = setInterval(fetchCount, 60000)

    // Tab görünür olduğunda kontrol et
    function handleVisibility() {
      if (document.visibilityState === 'visible') fetchCount()
    }
    document.addEventListener('visibilitychange', handleVisibility)

    return () => {
      clearInterval(interval)
      document.removeEventListener('visibilitychange', handleVisibility)
    }
  }, [fetchCount])

  return (
    <Link
      href={notificationsHref}
      className="relative p-2 text-text-secondary hover:text-text-primary transition-colors"
      title="Bildirimler"
    >
      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
          d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
      </svg>
      {count > 0 && (
        <span className="absolute -top-0.5 -right-0.5 flex h-4 w-4 items-center justify-center rounded-full bg-primary text-[10px] font-bold text-white">
          {count > 9 ? '9+' : count}
        </span>
      )}
    </Link>
  )
}
