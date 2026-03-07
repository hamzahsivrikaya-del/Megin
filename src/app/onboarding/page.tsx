'use client'

import { useState, useEffect, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import Button from '@/components/ui/Button'
import Input from '@/components/ui/Input'
import { cn, isValidUsername } from '@/lib/utils'
import type { ExpertiseArea, ReferralSource } from '@/lib/types'

const TOTAL_STEPS = 8

const CITIES = [
  'İstanbul', 'Ankara', 'İzmir', 'Bursa', 'Antalya',
  'Adana', 'Konya', 'Gaziantep', 'Mersin', 'Kayseri',
  'Eskişehir', 'Diyarbakır', 'Samsun', 'Denizli', 'Trabzon',
  'Sakarya', 'Muğla', 'Tekirdağ', 'Kocaeli', 'Manisa',
  'Aydın', 'Balıkesir', 'Malatya', 'Kahramanmaraş', 'Erzurum',
  'Van', 'Hatay', 'Mardin', 'Şanlıurfa', 'Elazığ',
  'Diğer',
]

const EXPERTISE_OPTIONS: { value: ExpertiseArea; label: string; icon: string }[] = [
  { value: 'pt', label: 'Personal Trainer', icon: '🏋️' },
  { value: 'pilates', label: 'Pilates', icon: '🧘' },
  { value: 'yoga', label: 'Yoga', icon: '🕉️' },
  { value: 'dietitian', label: 'Diyetisyen', icon: '🥗' },
  { value: 'other', label: 'Diğer', icon: '⚡' },
]

const CLIENT_RANGES = ['0-5', '5-15', '15-30', '30+']

const REFERRAL_OPTIONS: { value: ReferralSource; label: string; icon: string }[] = [
  { value: 'instagram', label: 'Instagram', icon: '📸' },
  { value: 'friend', label: 'Arkadaş Tavsiyesi', icon: '🤝' },
  { value: 'google', label: 'Google', icon: '🔍' },
  { value: 'other', label: 'Diğer', icon: '💬' },
]

export default function OnboardingPage() {
  const router = useRouter()
  const [step, setStep] = useState(1)
  const [loading, setLoading] = useState(false)
  const [showConfetti, setShowConfetti] = useState(false)

  // Form state
  const [fullName, setFullName] = useState('')
  const [avatarFile, setAvatarFile] = useState<File | null>(null)
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null)
  const [username, setUsername] = useState('')
  const [usernameError, setUsernameError] = useState('')
  const [usernameChecking, setUsernameChecking] = useState(false)
  const [expertise, setExpertise] = useState<ExpertiseArea | null>(null)
  const [experienceYears, setExperienceYears] = useState('')
  const [clientRange, setClientRange] = useState('')
  const [city, setCity] = useState('')
  const [referralSource, setReferralSource] = useState<ReferralSource | null>(null)

  // Username benzersizlik kontrolü
  const checkUsername = useCallback(async (value: string) => {
    if (!isValidUsername(value)) {
      setUsernameError('3-30 karakter, küçük harf, rakam, tire veya alt çizgi')
      return
    }
    setUsernameChecking(true)
    const supabase = createClient()
    const { data } = await supabase
      .from('trainers')
      .select('id')
      .eq('username', value)
      .maybeSingle()

    setUsernameChecking(false)
    if (data) {
      setUsernameError('Bu kullanıcı adı alınmış')
    } else {
      setUsernameError('')
    }
  }, [])

  useEffect(() => {
    if (username.length >= 3) {
      const timer = setTimeout(() => checkUsername(username), 500)
      return () => clearTimeout(timer)
    } else if (username.length > 0) {
      setUsernameError('En az 3 karakter')
    }
  }, [username, checkUsername])

  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      setAvatarFile(file)
      setAvatarPreview(URL.createObjectURL(file))
    }
  }

  const handleComplete = async () => {
    setLoading(true)
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      router.push('/login')
      return
    }

    // Avatar yükleme
    let avatarUrl = null
    if (avatarFile) {
      const ext = avatarFile.name.split('.').pop()
      const path = `${user.id}/avatar.${ext}`
      const { error: uploadError } = await supabase.storage
        .from('avatars')
        .upload(path, avatarFile, { upsert: true })

      if (!uploadError) {
        const { data: urlData } = supabase.storage.from('avatars').getPublicUrl(path)
        avatarUrl = urlData.publicUrl
      }
    }

    // Trainer profili oluştur
    const { error } = await supabase.from('trainers').insert({
      user_id: user.id,
      full_name: fullName,
      username,
      avatar_url: avatarUrl,
      expertise,
      experience_years: experienceYears ? parseInt(experienceYears) : null,
      client_count_range: clientRange || null,
      city: city || null,
      referral_source: referralSource,
      onboarding_completed: true,
    })

    if (error) {
      console.error('Onboarding error:', error)
      setLoading(false)
      return
    }

    setShowConfetti(true)
    setTimeout(() => {
      router.push('/dashboard')
    }, 2500)
  }

  const canProceed = () => {
    switch (step) {
      case 2: return fullName.trim().length >= 2
      case 3: return username.length >= 3 && !usernameError && !usernameChecking
      case 4: return expertise !== null
      case 5: return clientRange !== ''
      case 6: return city !== ''
      case 7: return referralSource !== null
      default: return true
    }
  }

  const nextStep = () => {
    if (step === TOTAL_STEPS) {
      handleComplete()
    } else {
      setStep(step + 1)
    }
  }

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Progress bar */}
      <div className="fixed top-0 left-0 right-0 z-50 h-1 bg-border-light">
        <div
          className="h-full bg-primary transition-all duration-500 ease-out"
          style={{ width: `${(step / TOTAL_STEPS) * 100}%` }}
        />
      </div>

      {/* Content */}
      <div className="flex-1 flex items-center justify-center p-6">
        <div className="w-full max-w-lg">

          {/* Step 1 — Hoş geldin */}
          {step === 1 && (
            <div className="text-center">
              <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-2xl bg-primary/10">
                <span className="text-4xl">💪</span>
              </div>
              <h1 className="font-display text-4xl font-bold text-text-primary tracking-tight">
                Megin&apos;e Hoş Geldin!
              </h1>
              <p className="mt-4 text-lg text-text-secondary max-w-sm mx-auto">
                Profilini kuralım ve danışanlarını yönetmeye başlayalım. Sadece 2 dakika.
              </p>
              <Button onClick={nextStep} size="lg" className="mt-8">
                Başlayalım
              </Button>
            </div>
          )}

          {/* Step 2 — Kişisel bilgiler */}
          {step === 2 && (
            <div>
              <StepHeader
                title="Kendini Tanıt"
                description="Danışanlarının seni göreceği isim ve fotoğraf."
              />
              <div className="mt-8 space-y-6">
                {/* Avatar */}
                <div className="flex justify-center">
                  <label className="cursor-pointer group">
                    <div className={cn(
                      'w-24 h-24 rounded-full border-2 border-dashed flex items-center justify-center overflow-hidden transition-colors',
                      avatarPreview ? 'border-primary' : 'border-border group-hover:border-primary'
                    )}>
                      {avatarPreview ? (
                        <img src={avatarPreview} alt="Avatar" className="w-full h-full object-cover" />
                      ) : (
                        <div className="text-center">
                          <svg className="mx-auto h-8 w-8 text-text-tertiary group-hover:text-primary transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 4.5v15m7.5-7.5h-15" />
                          </svg>
                          <span className="text-xs text-text-tertiary">Fotoğraf</span>
                        </div>
                      )}
                    </div>
                    <input type="file" accept="image/*" className="hidden" onChange={handleAvatarChange} />
                  </label>
                </div>
                <Input
                  label="Ad Soyad"
                  placeholder="Ad Soyad"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  autoFocus
                />
              </div>
            </div>
          )}

          {/* Step 3 — Username */}
          {step === 3 && (
            <div>
              <StepHeader
                title="Kullanıcı Adını Seç"
                description="Bu senin profil linkin olacak."
              />
              <div className="mt-8">
                <Input
                  label="Kullanıcı Adı"
                  placeholder="kullaniciadi"
                  value={username}
                  onChange={(e) => setUsername(e.target.value.toLowerCase().replace(/[^a-z0-9_-]/g, ''))}
                  error={usernameError}
                  autoFocus
                />
                {username && !usernameError && !usernameChecking && (
                  <div className="mt-3 flex items-center gap-2 text-sm text-success">
                    <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    megin.com/{username}
                  </div>
                )}
                {usernameChecking && (
                  <p className="mt-3 text-sm text-text-tertiary">Kontrol ediliyor...</p>
                )}
              </div>
            </div>
          )}

          {/* Step 4 — Uzmanlık */}
          {step === 4 && (
            <div>
              <StepHeader
                title="Uzmanlık Alanın"
                description="Ne tür antrenman/danışmanlık yapıyorsun?"
              />
              <div className="mt-8 grid grid-cols-1 gap-3">
                {EXPERTISE_OPTIONS.map((opt) => (
                  <button
                    key={opt.value}
                    onClick={() => setExpertise(opt.value)}
                    className={cn(
                      'flex items-center gap-4 rounded-xl border px-5 py-4 text-left transition-all',
                      expertise === opt.value
                        ? 'border-primary bg-primary-50 text-text-primary'
                        : 'border-border bg-surface text-text-secondary hover:border-text-tertiary'
                    )}
                  >
                    <span className="text-2xl">{opt.icon}</span>
                    <span className="font-medium">{opt.label}</span>
                  </button>
                ))}
              </div>
              {expertise && (
                <div className="mt-6">
                  <Input
                    label="Kaç yıldır yapıyorsun?"
                    type="number"
                    placeholder="3"
                    value={experienceYears}
                    onChange={(e) => setExperienceYears(e.target.value)}
                    hint="Opsiyonel"
                  />
                </div>
              )}
            </div>
          )}

          {/* Step 5 — Danışan sayısı */}
          {step === 5 && (
            <div>
              <StepHeader
                title="Danışan Durumun"
                description="Şu an kaç aktif danışanınla çalışıyorsun?"
              />
              <div className="mt-8 grid grid-cols-2 gap-3">
                {CLIENT_RANGES.map((range) => (
                  <button
                    key={range}
                    onClick={() => setClientRange(range)}
                    className={cn(
                      'rounded-xl border px-5 py-6 text-center transition-all',
                      clientRange === range
                        ? 'border-primary bg-primary-50'
                        : 'border-border bg-surface hover:border-text-tertiary'
                    )}
                  >
                    <div className="text-2xl font-display font-bold text-text-primary">{range}</div>
                    <div className="mt-1 text-sm text-text-secondary">danışan</div>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Step 6 — Şehir */}
          {step === 6 && (
            <div>
              <StepHeader
                title="Hangi İldesin?"
                description="Bulunduğun şehri seç."
              />
              <div className="mt-8 grid grid-cols-2 gap-2 max-h-80 overflow-y-auto">
                {CITIES.map((c) => (
                  <button
                    key={c}
                    onClick={() => setCity(c)}
                    className={cn(
                      'rounded-xl border px-4 py-3 text-sm font-medium text-left transition-all',
                      city === c
                        ? 'border-primary bg-primary-50 text-text-primary'
                        : 'border-border bg-surface text-text-secondary hover:border-text-tertiary'
                    )}
                  >
                    {c}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Step 7 — Referans */}
          {step === 7 && (
            <div>
              <StepHeader
                title="Bizi Nereden Buldun?"
                description="Bu bize çok yardımcı oluyor."
              />
              <div className="mt-8 grid grid-cols-1 gap-3">
                {REFERRAL_OPTIONS.map((opt) => (
                  <button
                    key={opt.value}
                    onClick={() => setReferralSource(opt.value)}
                    className={cn(
                      'flex items-center gap-4 rounded-xl border px-5 py-4 text-left transition-all',
                      referralSource === opt.value
                        ? 'border-primary bg-primary-50 text-text-primary'
                        : 'border-border bg-surface text-text-secondary hover:border-text-tertiary'
                    )}
                  >
                    <span className="text-2xl">{opt.icon}</span>
                    <span className="font-medium">{opt.label}</span>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Step 8 — Hazırsın */}
          {step === 8 && (
            <div className="text-center">
              <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-2xl bg-success/10">
                <span className="text-4xl">🎉</span>
              </div>
              <h1 className="font-display text-4xl font-bold text-text-primary tracking-tight">
                Hazırsın!
              </h1>
              <p className="mt-4 text-lg text-text-secondary max-w-sm mx-auto">
                Profilin kuruldu. Şimdi ilk danışanını ekle ve başla!
              </p>
            </div>
          )}

          {/* Navigation */}
          {step > 1 && (
            <div className="mt-8 flex items-center justify-between">
              <button
                onClick={() => setStep(step - 1)}
                className="text-sm text-text-secondary hover:text-text-primary transition-colors"
              >
                ← Geri
              </button>
              <div className="flex items-center gap-2">
                {Array.from({ length: TOTAL_STEPS }, (_, i) => (
                  <div
                    key={i}
                    className={cn(
                      'h-2 rounded-full transition-all duration-300',
                      i + 1 === step ? 'w-8 bg-primary' : i + 1 < step ? 'w-2 bg-primary/40' : 'w-2 bg-border'
                    )}
                  />
                ))}
              </div>
              <Button
                onClick={nextStep}
                disabled={!canProceed()}
                loading={loading}
                size="md"
              >
                {step === TOTAL_STEPS ? 'Tamamla' : 'Devam'}
              </Button>
            </div>
          )}
        </div>
      </div>

      {/* Confetti */}
      {showConfetti && (
        <>
          {Array.from({ length: 50 }, (_, i) => (
            <div
              key={i}
              className="confetti"
              style={{
                left: `${Math.random() * 100}%`,
                backgroundColor: ['#DC2626', '#F59E0B', '#16A34A', '#2563EB', '#8B5CF6'][
                  Math.floor(Math.random() * 5)
                ],
                animationDelay: `${Math.random() * 2}s`,
                animationDuration: `${2 + Math.random() * 2}s`,
                width: `${6 + Math.random() * 8}px`,
                height: `${6 + Math.random() * 8}px`,
              }}
            />
          ))}
        </>
      )}
    </div>
  )
}

function StepHeader({ title, description }: { title: string; description: string }) {
  return (
    <div>
      <h2 className="text-2xl font-bold text-text-primary">{title}</h2>
      <p className="mt-2 text-text-secondary">{description}</p>
    </div>
  )
}
