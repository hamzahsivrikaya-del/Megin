'use client'

import { useState, useEffect } from 'react'
import { subscribeToPush } from './ServiceWorkerRegistration'

export default function PushPermissionBanner() {
  const [show, setShow] = useState(false)

  useEffect(() => {
    if (!('Notification' in window) || !('serviceWorker' in navigator) || !('PushManager' in window)) return

    if (Notification.permission === 'denied') return

    // İzin verilmişse ama subscription DB'de olmayabilir — sessizce tekrar dene
    if (Notification.permission === 'granted') {
      try {
        if (sessionStorage.getItem('push-subscribed')) return
      } catch { /* private browsing */ }
      navigator.serviceWorker.ready
        .then((reg) => subscribeToPush(reg))
        .then(() => { try { sessionStorage.setItem('push-subscribed', '1') } catch {} })
        .catch(() => {})
      return
    }

    // default — henüz sorulmamış
    setShow(true)
  }, [])

  if (!show) return null

  async function handleEnable() {
    try {
      const permission = await Notification.requestPermission()
      if (permission === 'granted') {
        const registration = await navigator.serviceWorker.ready
        await subscribeToPush(registration)
      }
      setShow(false)
    } catch {
      setShow(false)
    }
  }

  return (
    <div className="bg-primary/10 border border-primary/20 rounded-xl p-4 mb-4 flex items-center justify-between gap-3">
      <div className="flex items-center gap-3 min-w-0">
        <div className="w-9 h-9 rounded-full bg-primary/15 flex items-center justify-center shrink-0">
          <svg className="w-5 h-5 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
              d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
          </svg>
        </div>
        <p className="text-sm text-text-primary">Haftalık raporlar ve ders hatırlatmaları için bildirimleri aç</p>
      </div>
      <button
        onClick={handleEnable}
        className="shrink-0 px-4 py-2 bg-gradient-to-r from-[#DC2626] to-[#F97316] text-white text-sm font-medium rounded-lg shadow-sm hover:shadow-md transition-all cursor-pointer"
      >
        Aç
      </button>
    </div>
  )
}
