'use client'

import { useState, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import Button from '@/components/ui/Button'

const FITNESS_GOALS = [
  { key: 'weight_loss', label: 'Kilo Vermek', icon: '🔥', desc: 'Yağ yakımı ve zayıflama' },
  { key: 'muscle_gain', label: 'Kas Yapmak', icon: '💪', desc: 'Kas kütlesi artışı' },
  { key: 'general_health', label: 'Genel Sağlık', icon: '❤️', desc: 'Sağlıklı yaşam ve form' },
  { key: 'flexibility', label: 'Esneklik', icon: '🧘', desc: 'Mobilite ve esneklik' },
]

function ConfettiEffect() {
  const colors = ['#DC2626', '#F59E0B', '#16A34A', '#2563EB', '#DC2626', '#F59E0B']
  return (
    <>
      {Array.from({ length: 30 }).map((_, i) => (
        <div
          key={i}
          className="confetti"
          style={{
            left: `${Math.random() * 100}%`,
            backgroundColor: colors[i % colors.length],
            animationDelay: `${Math.random() * 2}s`,
            animationDuration: `${2 + Math.random() * 2}s`,
            width: `${6 + Math.random() * 8}px`,
            height: `${6 + Math.random() * 8}px`,
            borderRadius: Math.random() > 0.5 ? '50%' : '2px',
          }}
        />
      ))}
    </>
  )
}

export default function OnboardingPage() {
  const router = useRouter()
  const [step, setStep] = useState(0)
  const [fullName, setFullName] = useState('')
  const [avatarFile, setAvatarFile] = useState<File | null>(null)
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null)
  const [selectedGoal, setSelectedGoal] = useState('')
  const [saving, setSaving] = useState(false)
  const [showConfetti, setShowConfetti] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const steps = [
    { title: 'Hoş Geldin', subtitle: 'Seni tanıyalım' },
    { title: 'Hedefin', subtitle: 'Ne için çalışıyorsun?' },
    { title: 'Bildirimler', subtitle: 'Güncel kal' },
    { title: 'Hazırsın!', subtitle: 'Hadi başlayalım' },
  ]

  function handleAvatarChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    if (file.size > 15 * 1024 * 1024) {
      alert('Dosya boyutu 15MB\'den küçük olmalıdır')
      return
    }
    setAvatarFile(file)
    const reader = new FileReader()
    reader.onloadend = () => setAvatarPreview(reader.result as string)
    reader.readAsDataURL(file)
  }

  async function uploadAvatar(userId: string) {
    if (!avatarFile) return null
    const supabase = createClient()
    const ext = avatarFile.name.split('.').pop()
    const path = `${userId}/avatar.${ext}`
    const { error } = await supabase.storage
      .from('avatars')
      .upload(path, avatarFile, { upsert: true })
    if (error) return null
    const { data: urlData } = supabase.storage.from('avatars').getPublicUrl(path)
    return urlData.publicUrl
  }

  async function completeOnboarding() {
    setSaving(true)
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return

    let avatarUrl: string | null = null
    if (avatarFile) {
      avatarUrl = await uploadAvatar(user.id)
    }

    const updateData: Record<string, unknown> = {
      onboarding_completed: true,
    }
    if (fullName.trim()) updateData.full_name = fullName.trim()
    if (avatarUrl) updateData.avatar_url = avatarUrl
    if (selectedGoal) updateData.fitness_goal = selectedGoal

    await supabase
      .from('clients')
      .update(updateData)
      .eq('user_id', user.id)

    setShowConfetti(true)
    setTimeout(() => {
      router.push('/app')
      router.refresh()
    }, 2500)
  }

  function canProceed() {
    if (step === 0) return fullName.trim().length >= 2
    if (step === 1) return !!selectedGoal
    return true
  }

  function nextStep() {
    if (step < 3) setStep(step + 1)
    else completeOnboarding()
  }

  async function requestNotification() {
    if ('Notification' in window && Notification.permission === 'default') {
      await Notification.requestPermission()
    }
    nextStep()
  }

  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center p-4 relative overflow-hidden">
      {showConfetti && <ConfettiEffect />}

      {/* Progress bar */}
      <div className="w-full max-w-md mb-8">
        <div className="flex items-center gap-1">
          {steps.map((_, i) => (
            <div
              key={i}
              className="h-1.5 flex-1 rounded-full transition-all duration-500"
              style={{
                backgroundColor: i <= step ? '#DC2626' : '#E5E5E5',
                transform: i <= step ? 'scaleY(1)' : 'scaleY(0.7)',
              }}
            />
          ))}
        </div>
        <p className="text-xs text-text-tertiary mt-2 text-center">
          {step + 1} / {steps.length}
        </p>
      </div>

      {/* Card */}
      <div className="w-full max-w-md bg-surface rounded-2xl border border-border p-6 md:p-8 shadow-sm">
        {/* Header */}
        {step < steps.length && (
          <div className="text-center mb-6">
            <h1 className="font-display text-3xl font-bold text-text-primary tracking-wide uppercase">
              {steps[step].title}
            </h1>
            <p className="text-sm text-text-secondary mt-1">{steps[step].subtitle}</p>
          </div>
        )}

        {/* Step 0: Hoş Geldin */}
        {step === 0 && (
          <div className="space-y-6 animate-[fadeIn_0.3s_ease-out]">
            {/* Avatar */}
            <div className="flex flex-col items-center gap-3">
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="w-24 h-24 rounded-full bg-primary-50 border-2 border-dashed border-primary/30 flex items-center justify-center overflow-hidden cursor-pointer hover:border-primary transition-colors"
              >
                {avatarPreview ? (
                  <img src={avatarPreview} alt="Avatar" className="w-full h-full object-cover" />
                ) : (
                  <svg className="w-8 h-8 text-primary/40" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                  </svg>
                )}
              </button>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleAvatarChange}
                className="hidden"
              />
              <p className="text-xs text-text-tertiary">Profil fotoğrafı (opsiyonel)</p>
            </div>

            {/* İsim */}
            <div className="space-y-1.5">
              <label className="block text-sm font-medium text-text-primary">Adın Soyadın</label>
              <input
                type="text"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                placeholder="Adını gir"
                className="w-full rounded-xl border border-border bg-surface px-4 py-3 text-sm text-text-primary placeholder:text-text-tertiary focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-colors"
                autoFocus
              />
            </div>
          </div>
        )}

        {/* Step 1: Hedefler */}
        {step === 1 && (
          <div className="space-y-3 animate-[fadeIn_0.3s_ease-out]">
            {FITNESS_GOALS.map((goal) => (
              <button
                key={goal.key}
                type="button"
                onClick={() => setSelectedGoal(goal.key)}
                className={`w-full flex items-center gap-4 p-4 rounded-xl border-2 transition-all cursor-pointer ${
                  selectedGoal === goal.key
                    ? 'border-primary bg-primary/5 shadow-sm'
                    : 'border-border hover:border-primary/30 hover:bg-primary/[0.02]'
                }`}
              >
                <span className="text-2xl">{goal.icon}</span>
                <div className="text-left">
                  <p className={`text-sm font-bold ${selectedGoal === goal.key ? 'text-primary' : 'text-text-primary'}`}>
                    {goal.label}
                  </p>
                  <p className="text-xs text-text-tertiary">{goal.desc}</p>
                </div>
                {selectedGoal === goal.key && (
                  <svg className="w-5 h-5 text-primary ml-auto" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                )}
              </button>
            ))}
          </div>
        )}

        {/* Step 2: Bildirimler */}
        {step === 2 && (
          <div className="text-center space-y-6 animate-[fadeIn_0.3s_ease-out]">
            <div className="w-20 h-20 rounded-full bg-primary-50 flex items-center justify-center mx-auto">
              <svg className="w-10 h-10 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
              </svg>
            </div>
            <div>
              <p className="text-sm text-text-secondary leading-relaxed">
                Antrenmanlarını kaçırma! Bildirimlerle güncel kal.
              </p>
            </div>
            <div className="flex flex-col gap-3">
              <Button onClick={requestNotification}>
                Bildirimleri Aç
              </Button>
              <button
                type="button"
                onClick={nextStep}
                className="text-sm text-text-tertiary hover:text-text-secondary transition-colors cursor-pointer"
              >
                Şimdilik geç
              </button>
            </div>
          </div>
        )}

        {/* Step 3: Tamamlandı */}
        {step === 3 && (
          <div className="text-center space-y-6 animate-[fadeIn_0.3s_ease-out]">
            <div className="w-20 h-20 rounded-full bg-success/10 flex items-center justify-center mx-auto">
              <svg className="w-10 h-10 text-success" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <div>
              <p className="text-sm text-text-secondary leading-relaxed">
                Profilin hazır! Antrenöründen gelecek programları takip etmeye başlayabilirsin.
              </p>
            </div>
          </div>
        )}

        {/* Navigation buttons */}
        {step !== 2 && (
          <div className="flex gap-3 mt-8">
            {step > 0 && step !== 3 && (
              <Button variant="secondary" onClick={() => setStep(step - 1)}>
                Geri
              </Button>
            )}
            <Button
              onClick={step === 3 ? completeOnboarding : nextStep}
              disabled={!canProceed()}
              loading={saving}
              className="flex-1"
            >
              {step === 3 ? 'Başlayalım!' : 'Devam'}
            </Button>
          </div>
        )}
      </div>

      {/* fadeIn keyframe */}
      <style jsx>{`
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(8px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </div>
  )
}
