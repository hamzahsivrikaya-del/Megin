'use client'

import { useState, useEffect, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import type { GoalMetricType } from '@/lib/types'

const STEPS = [
  { id: 'welcome', title: 'Hoşgeldin' },
  { id: 'goals', title: 'Hedefler' },
  { id: 'notifications', title: 'Bildirimler' },
  { id: 'done', title: 'Hazır' },
]

const GOAL_METRICS: { key: GoalMetricType; label: string; unit: string; placeholder: string; color: string }[] = [
  { key: 'weight', label: 'Kilo', unit: 'kg', placeholder: '75', color: '#DC2626' },
  { key: 'body_fat_pct', label: 'Vücut Yağı', unit: '%', placeholder: '15', color: '#DC2626' },
  { key: 'chest', label: 'Göğüs', unit: 'cm', placeholder: '100', color: '#DC2626' },
  { key: 'waist', label: 'Bel', unit: 'cm', placeholder: '80', color: '#DC2626' },
  { key: 'arm', label: 'Kol', unit: 'cm', placeholder: '35', color: '#DC2626' },
  { key: 'leg', label: 'Bacak', unit: 'cm', placeholder: '55', color: '#DC2626' },
]

function Confetti() {
  const [particles, setParticles] = useState<{ id: number; x: number; y: number; color: string; delay: number; size: number }[]>([])

  useEffect(() => {
    const colors = ['#DC2626', '#F59E0B', '#22C55E', '#3B82F6', '#8B5CF6', '#F97316']
    const p = Array.from({ length: 50 }, (_, i) => ({
      id: i,
      x: Math.random() * 100,
      y: Math.random() * -50 - 10,
      color: colors[Math.floor(Math.random() * colors.length)],
      delay: Math.random() * 1.5,
      size: Math.random() * 8 + 4,
    }))
    setParticles(p)
  }, [])

  return (
    <div className="fixed inset-0 pointer-events-none z-50 overflow-hidden">
      {particles.map((p) => (
        <div
          key={p.id}
          className="absolute rounded-sm"
          style={{
            left: `${p.x}%`,
            top: `${p.y}%`,
            width: p.size,
            height: p.size,
            backgroundColor: p.color,
            animation: `confetti-fall 3s ease-in ${p.delay}s forwards`,
            transform: `rotate(${Math.random() * 360}deg)`,
          }}
        />
      ))}
    </div>
  )
}

export default function OnboardingPage() {
  const router = useRouter()
  const [step, setStep] = useState(0)
  const [userName, setUserName] = useState('')
  const [goals, setGoals] = useState<Record<GoalMetricType, string>>({
    weight: '', body_fat_pct: '', chest: '', waist: '', arm: '', leg: '',
  })
  const [saving, setSaving] = useState(false)
  const [pushGranted, setPushGranted] = useState(false)
  const [showConfetti, setShowConfetti] = useState(false)

  useEffect(() => {
    async function load() {
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return
      const { data } = await supabase.from('users').select('full_name, onboarding_completed').eq('id', user.id).single()
      if (data?.onboarding_completed) {
        router.replace('/dashboard')
        return
      }
      setUserName(data?.full_name?.split(' ')[0] || '')
    }
    load()
  }, [router])

  const saveGoals = useCallback(async () => {
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return

    const entries = Object.entries(goals).filter(([, v]) => v && Number(v) > 0)
    for (const [key, value] of entries) {
      await fetch('/api/goals', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ metric_type: key, target_value: Number(value) }),
      })
    }
  }, [goals])

  const requestPushAndContinue = async () => {
    try {
      const permission = await Notification.requestPermission()
      setPushGranted(permission === 'granted')

      if (permission === 'granted' && 'serviceWorker' in navigator) {
        const registration = await navigator.serviceWorker.ready
        const subscription = await registration.pushManager.subscribe({
          userVisibleOnly: true,
          applicationServerKey: process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY,
        })

        await fetch('/api/push/subscribe', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(subscription),
        })
      }
    } catch {
      // Izin reddedildi veya hata
    }
    // Her durumda son adima gec
    setStep(step + 1)
    await completeOnboarding()
  }

  const completeOnboarding = async () => {
    setSaving(true)
    setShowConfetti(true)
    try {
      await fetch('/api/onboarding/complete', { method: 'POST' })
      await fetch('/api/badges')
    } catch {
      // Hata olsa bile devam et
    }
    setTimeout(() => {
      router.replace('/dashboard')
    }, 3000)
  }

  const nextStep = async () => {
    if (step === 1) {
      setSaving(true)
      await saveGoals()
      setSaving(false)
    }
    if (step === STEPS.length - 2) {
      setStep(step + 1)
      await completeOnboarding()
      return
    }
    setStep(step + 1)
  }

  return (
    <div className="fixed inset-0 z-50 bg-[#FAFAFA] flex flex-col">
      {showConfetti && <Confetti />}

      {/* Progress bar */}
      <div className="h-1 bg-border">
        <div
          className="h-full bg-primary transition-all duration-500 ease-out"
          style={{ width: `${((step + 1) / STEPS.length) * 100}%` }}
        />
      </div>

      {/* Step indicators */}
      <div className="flex justify-center gap-2 pt-6 pb-2">
        {STEPS.map((s, i) => (
          <div
            key={s.id}
            className={`w-2 h-2 rounded-full transition-all duration-300 ${
              i <= step ? 'bg-primary scale-110' : 'bg-border'
            }`}
          />
        ))}
      </div>

      {/* Content */}
      <div className="flex-1 flex items-center justify-center px-6">
        <div className="w-full max-w-md">

          {/* Step 0: Hosgeldin */}
          {step === 0 && (
            <div className="text-center space-y-8 animate-fade-up">
              {/* Decorative accent */}
              <div className="flex justify-center">
                <div className="w-12 h-1 rounded-full bg-primary/60" />
              </div>

              <div>
                <h1 className="text-[2.75rem] font-extrabold text-text-primary leading-[1.1] tracking-tight">
                  Hoşgeldin{userName ? ',' : '!'}
                  {userName && (
                    <>
                      <br />
                      <span className="text-primary">{userName}!</span>
                    </>
                  )}
                </h1>
                <p className="text-text-secondary mt-5 text-[1.0625rem] leading-relaxed max-w-[280px] mx-auto">
                  Harika bir adım attın. Birkaç adımda her şeyi hazırlayalım.
                </p>
              </div>

              <div className="grid grid-cols-3 gap-3 pt-2">
                {['Hedef Koy', 'Takip Et', 'Başar'].map((label, i) => (
                  <div
                    key={label}
                    className="relative bg-white rounded-2xl px-3 py-5 text-center animate-fade-up overflow-hidden"
                    style={{
                      animationDelay: `${(i + 1) * 200}ms`,
                      boxShadow: '0 1px 4px rgba(0,0,0,0.03), 0 4px 16px rgba(0,0,0,0.05)',
                    }}
                  >
                    <div className="flex justify-center gap-[3px] mb-3">
                      {[0, 1, 2].map((j) => (
                        <div
                          key={j}
                          className={`w-1.5 h-1.5 rounded-full ${
                            j <= i ? 'bg-primary' : 'bg-primary/15'
                          }`}
                        />
                      ))}
                    </div>
                    <span className="text-[13px] font-bold text-text-primary tracking-wide">{label}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Step 1: Hedef Belirleme */}
          {step === 1 && (
            <div className="space-y-5 animate-fade-up">
              <div className="text-center mb-6">
                <h2 className="text-2xl font-bold text-text-primary">Hedeflerini Belirle</h2>
                <p className="text-text-secondary mt-2 text-sm">
                  Ulaşmak istediğin değerleri gir. İstediğini boş bırakabilirsin.
                </p>
              </div>

              <div className="grid grid-cols-2 gap-3">
                {GOAL_METRICS.map((metric) => (
                  <div
                    key={metric.key}
                    className="bg-surface rounded-xl p-3.5 border border-border transition-all focus-within:border-primary/40 focus-within:shadow-sm"
                  >
                    <label className="text-xs font-medium text-text-secondary block mb-2">
                      {metric.label}
                    </label>
                    <div className="flex items-baseline gap-1.5">
                      <input
                        type="number"
                        inputMode="decimal"
                        placeholder={metric.placeholder}
                        value={goals[metric.key]}
                        onChange={(e) => setGoals(prev => ({ ...prev, [metric.key]: e.target.value }))}
                        className="w-full bg-transparent text-xl font-bold text-text-primary outline-none placeholder:text-border [appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none"
                      />
                      <span className="text-xs text-text-secondary flex-shrink-0">{metric.unit}</span>
                    </div>
                    <div className="h-0.5 rounded-full mt-2" style={{ backgroundColor: `${metric.color}30` }}>
                      <div
                        className="h-full rounded-full transition-all"
                        style={{
                          backgroundColor: metric.color,
                          width: goals[metric.key] ? '100%' : '0%',
                        }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Step 2: Bildirim Izni */}
          {step === 2 && (
            <div className="text-center space-y-6 animate-fade-up">
              <div className="relative mx-auto w-24 h-24">
                <div className={`absolute inset-0 rounded-full ${pushGranted ? 'bg-success/10' : 'bg-primary/10'} transition-colors`} />
                <div className="absolute inset-0 flex items-center justify-center">
                  {pushGranted ? (
                    <svg className="w-12 h-12 text-success" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                  ) : (
                    <svg className="w-12 h-12 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
                        d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                    </svg>
                  )}
                </div>
              </div>

              <div>
                <h2 className="text-2xl font-bold text-text-primary">Bildirimler</h2>
                <p className="text-text-secondary mt-2 text-sm leading-relaxed">
                  Her sabah sana özel motivasyon mesajı gönderelim. Haftalık ilerleme raporlarını kaçırma.
                </p>
              </div>

              <button
                onClick={requestPushAndContinue}
                className="w-full py-3.5 rounded-xl bg-primary text-white font-semibold text-sm hover:bg-primary-hover transition-colors cursor-pointer active:scale-[0.98]"
              >
                Bildirimleri Aç
              </button>

              <button
                onClick={nextStep}
                className="w-full mt-3 text-sm text-text-secondary hover:text-text-primary transition-colors cursor-pointer"
              >
                Şimdilik geç
              </button>
            </div>
          )}

          {/* Step 3: Tamamlandi */}
          {step === 3 && (
            <div className="text-center space-y-6 animate-fade-up">
              <div className="relative mx-auto w-28 h-28">
                <div className="absolute inset-0 rounded-full bg-success/10 animate-pulse" />
                <div className="absolute inset-0 flex items-center justify-center">
                  <svg className="w-16 h-16 text-success" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
              </div>

              <div>
                <h2 className="text-3xl font-bold text-text-primary">Hazırsın!</h2>
                <p className="text-text-secondary mt-3 text-lg">
                  Her şey tamam. Hadi başlayalım!
                </p>
              </div>

              <div className="flex gap-2 justify-center pt-2">
                <div className="w-1.5 h-1.5 rounded-full bg-primary animate-bounce" style={{ animationDelay: '0ms' }} />
                <div className="w-1.5 h-1.5 rounded-full bg-primary animate-bounce" style={{ animationDelay: '150ms' }} />
                <div className="w-1.5 h-1.5 rounded-full bg-primary animate-bounce" style={{ animationDelay: '300ms' }} />
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Bottom action */}
      {step < 3 && (
        <div className="p-6 pb-8">
          {step !== 2 && (
            <button
              onClick={nextStep}
              disabled={saving}
              className="w-full py-3.5 rounded-xl bg-primary text-white font-semibold text-sm hover:bg-primary-hover transition-all cursor-pointer active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {saving ? (
                <span className="flex items-center justify-center gap-2">
                  <svg className="w-4 h-4 animate-spin" viewBox="0 0 24 24" fill="none">
                    <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" className="opacity-25" />
                    <path d="M4 12a8 8 0 018-8" stroke="currentColor" strokeWidth="3" strokeLinecap="round" />
                  </svg>
                  Kaydediliyor...
                </span>
              ) : step === 0 ? 'Başlayalım' : 'Devam Et'}
            </button>
          )}

          {step === 1 && (
            <button
              onClick={() => setStep(step + 1)}
              className="w-full mt-3 text-sm text-text-secondary hover:text-text-primary transition-colors cursor-pointer"
            >
              Şimdilik geç
            </button>
          )}
        </div>
      )}
    </div>
  )
}
