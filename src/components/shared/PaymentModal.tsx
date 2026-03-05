'use client'

import { useState, useEffect } from 'react'
import { SubscriptionPlan } from '@/lib/types'
import Modal from '@/components/ui/Modal'
import { PLAN_CONFIGS } from '@/lib/plans'

interface Props {
  plan: SubscriptionPlan
  onClose: () => void
}

export default function PaymentModal({ plan, onClose }: Props) {
  const [iframeToken, setIframeToken] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const planName = PLAN_CONFIGS[plan].name

  useEffect(() => {
    let cancelled = false

    async function getToken() {
      try {
        const res = await fetch('/api/paytr/token', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ plan }),
        })
        const data = await res.json()

        if (cancelled) return

        if (!res.ok) {
          setError(data.error || 'Ödeme başlatılamadı')
          return
        }

        setIframeToken(data.token)
      } catch {
        if (!cancelled) setError('Bağlantı hatası')
      } finally {
        if (!cancelled) setLoading(false)
      }
    }

    getToken()
    return () => { cancelled = true }
  }, [plan])

  return (
    <Modal open={true} onClose={onClose} title={`${planName} Plan - Ödeme`} size="lg">
      {loading && (
        <div className="flex flex-col items-center justify-center py-16 gap-3">
          <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
          <p className="text-sm text-text-secondary">Ödeme formu hazırlanıyor...</p>
        </div>
      )}

      {error && (
        <div className="flex flex-col items-center justify-center py-12 gap-4">
          <div className="w-12 h-12 rounded-full bg-danger/10 flex items-center justify-center">
            <svg className="w-6 h-6 text-danger" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </div>
          <p className="text-sm text-danger">{error}</p>
          <button
            onClick={onClose}
            className="text-sm text-primary font-medium cursor-pointer hover:underline"
          >
            Kapat
          </button>
        </div>
      )}

      {iframeToken && (
        <iframe
          src={`https://www.paytr.com/odeme/guvenli/${iframeToken}`}
          className="w-full border-0 rounded-lg"
          style={{ height: '460px' }}
        />
      )}
    </Modal>
  )
}
