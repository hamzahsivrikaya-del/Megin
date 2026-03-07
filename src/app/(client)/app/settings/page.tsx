'use client'

import { useState, useEffect, useRef } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import Card, { CardHeader, CardTitle } from '@/components/ui/Card'
import Input from '@/components/ui/Input'
import Button from '@/components/ui/Button'
import { BADGE_VISUALS } from '@/lib/badges'
import type { BadgeDefinition } from '@/lib/badges'
import { CLIENT_TOUR_STEPS, isTourStepLocked } from '@/lib/tour'
import type { TourProgress, SubscriptionPlan } from '@/lib/types'

type BadgeWithStatus = BadgeDefinition & {
  earned: boolean
  earnedAt: string | null
}

/* --- Share Overlay -------------------------------- */
function ShareOverlay({ badge, userId, cachedBlob, onClose }: {
  badge: BadgeWithStatus
  userId: string
  cachedBlob?: Blob | null
  onClose: () => void
}) {
  const [imageUrl, setImageUrl] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)
  const [blob, setBlob] = useState<Blob | null>(null)

  useEffect(() => {
    if (cachedBlob) {
      setBlob(cachedBlob)
      setImageUrl(URL.createObjectURL(cachedBlob))
      setLoading(false)
      return
    }

    let cancelled = false
    async function load() {
      try {
        const res = await fetch(`/api/share/badge/${badge.id}?u=${userId}`)
        if (!res.ok) throw new Error()
        const b = await res.blob()
        if (!cancelled) {
          setBlob(b)
          setImageUrl(URL.createObjectURL(b))
        }
      } catch {
        // hata
      } finally {
        if (!cancelled) setLoading(false)
      }
    }
    load()
    return () => { cancelled = true }
  }, [badge.id, userId, cachedBlob])

  useEffect(() => {
    document.body.style.overflow = 'hidden'
    return () => { document.body.style.overflow = '' }
  }, [])

  async function handleNativeShare() {
    if (!blob) return
    try {
      const file = new File([blob], `rozet-${badge.name}.png`, { type: 'image/png' })
      if (navigator.share && navigator.canShare?.({ files: [file] })) {
        await navigator.share({ files: [file] })
      }
    } catch {
      // iptal
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-black/90 p-6" onClick={onClose}>
      <div className="w-full max-w-xs flex flex-col items-center gap-5" onClick={(e) => e.stopPropagation()}>
        <div className="w-full rounded-2xl overflow-hidden bg-black/50">
          {loading ? (
            <div className="aspect-[9/16] flex items-center justify-center">
              <div className="w-8 h-8 border-2 border-white/40 border-t-white rounded-full animate-spin" />
            </div>
          ) : imageUrl ? (
            <img src={imageUrl} alt={badge.name} className="w-full" />
          ) : (
            <div className="aspect-[9/16] flex items-center justify-center text-white/50 text-sm">
              Yüklenemedi
            </div>
          )}
        </div>

        {!loading && imageUrl && (
          <>
            <button
              type="button"
              onClick={handleNativeShare}
              className="w-full py-3.5 rounded-xl bg-gradient-to-r from-[#833AB4] via-[#FD1D1D] to-[#F77737] text-white font-bold text-sm flex items-center justify-center gap-2 active:scale-[0.97] transition-transform"
            >
              <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z"/>
              </svg>
              Hikayende Paylaş
            </button>
            <p className="text-white/40 text-xs text-center">
              veya görsele basılı tutarak kaydet
            </p>
          </>
        )}

        <button
          type="button"
          onClick={onClose}
          className="text-white/50 text-sm font-medium"
        >
          Kapat
        </button>
      </div>
    </div>
  )
}

function formatStartDate(date: string): string {
  return new Date(date).toLocaleDateString('tr-TR', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  })
}

export default function ClientSettingsPage() {
  // Profile state
  const [fullName, setFullName] = useState('')
  const [phone, setPhone] = useState('')
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null)
  const [startDate, setStartDate] = useState<string | null>(null)
  const [profileLoading, setProfileLoading] = useState(true)

  // Avatar state
  const [avatarUploading, setAvatarUploading] = useState(false)
  const [avatarError, setAvatarError] = useState('')
  const fileInputRef = useRef<HTMLInputElement>(null)

  // Profile form state
  const [profilLoading, setProfilLoading] = useState(false)
  const [profilMessage, setProfilMessage] = useState('')
  const [profilError, setProfilError] = useState('')

  // Password state
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [sifreLoading, setSifreLoading] = useState(false)
  const [sifreMessage, setSifreMessage] = useState('')
  const [sifreError, setSifreError] = useState('')

  // Badges state
  const [badges, setBadges] = useState<BadgeWithStatus[]>([])
  const [badgesLoading, setBadgesLoading] = useState(true)
  const [shareBadge, setShareBadge] = useState<BadgeWithStatus | null>(null)
  const [badgeUserId, setBadgeUserId] = useState('')
  const imageCache = useRef<Map<string, Blob>>(new Map())

  // Tour state
  const [tourProgress, setTourProgress] = useState<TourProgress | null>(null)
  const [clientPlan, setClientPlan] = useState<SubscriptionPlan>('free')

  // Load profile
  useEffect(() => {
    async function loadProfile() {
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return

      const { data: client } = await supabase
        .from('clients')
        .select('id, full_name, phone, avatar_url, start_date')
        .eq('user_id', user.id)
        .maybeSingle()

      if (client) {
        const { data: firstLesson } = await supabase
          .from('lessons')
          .select('date')
          .eq('client_id', client.id)
          .order('date', { ascending: true })
          .limit(1)
          .maybeSingle()

        setFullName(client.full_name || '')
        setPhone(client.phone || '')
        setAvatarUrl(client.avatar_url || null)
        setStartDate(firstLesson?.date || client.start_date || null)

        // Tour progress
        const { data: fullClient } = await supabase
          .from('clients')
          .select('tour_progress, trainer_id')
          .eq('user_id', user.id)
          .maybeSingle()
        if (fullClient) {
          setTourProgress(fullClient.tour_progress as TourProgress | null)
          const { data: sub } = await supabase
            .from('subscriptions')
            .select('plan')
            .eq('trainer_id', fullClient.trainer_id)
            .eq('status', 'active')
            .maybeSingle()
          if (sub) setClientPlan(sub.plan as SubscriptionPlan)
        }
      }
      setProfileLoading(false)
    }
    loadProfile()
  }, [])

  // Load badges
  useEffect(() => {
    async function loadBadges() {
      try {
        const res = await fetch('/api/badges')
        if (res.ok) {
          const data = await res.json()
          setBadges(data.badges)
          setBadgeUserId(data.userId || '')

          const earned = (data.badges as BadgeWithStatus[]).filter((b: BadgeWithStatus) => b.earned)
          earned.forEach(async (b: BadgeWithStatus) => {
            try {
              const r = await fetch(`/api/share/badge/${b.id}?u=${data.userId}`)
              if (r.ok) {
                const blob = await r.blob()
                imageCache.current.set(b.id, blob)
              }
            } catch { /* skip */ }
          })
        }
      } catch {
        // sessiz hata
      }
      setBadgesLoading(false)
    }
    loadBadges()
  }, [])

  // Avatar upload
  async function handleAvatarChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    if (file.size > 15 * 1024 * 1024) {
      setAvatarError('Dosya 15MB\'dan küçük olmalı')
      return
    }
    setAvatarError('')
    setAvatarUploading(true)
    try {
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return

      const ext = file.name.split('.').pop()
      const path = `${user.id}/avatar.${ext}`
      const { error: uploadError } = await supabase.storage
        .from('avatars')
        .upload(path, file, { upsert: true })
      if (uploadError) {
        setAvatarError('Yükleme başarısız')
        setAvatarUploading(false)
        return
      }
      const { data: { publicUrl } } = supabase.storage
        .from('avatars')
        .getPublicUrl(path)
      const urlWithCacheBust = `${publicUrl}?t=${Date.now()}`
      const { error: updateError } = await supabase
        .from('clients')
        .update({ avatar_url: urlWithCacheBust })
        .eq('user_id', user.id)
      if (updateError) {
        setAvatarError('Kayıt başarısız')
        setAvatarUploading(false)
        return
      }
      setAvatarUrl(urlWithCacheBust)
      window.dispatchEvent(new Event('profile-updated'))
    } catch {
      setAvatarError('Bir hata oluştu')
    }
    setAvatarUploading(false)
  }

  // Profile submit
  async function handleProfilSubmit(e: React.FormEvent) {
    e.preventDefault()
    setProfilError('')
    setProfilMessage('')
    if (!fullName.trim()) {
      setProfilError('İsim boş olamaz')
      return
    }
    setProfilLoading(true)
    try {
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return

      const { error } = await supabase
        .from('clients')
        .update({
          full_name: fullName.trim(),
          phone: phone.trim() || null,
        })
        .eq('user_id', user.id)

      if (error) {
        setProfilError('Güncelleme başarısız')
      } else {
        setProfilMessage('Profil bilgileri güncellendi')
        window.dispatchEvent(new Event('profile-updated'))
      }
    } catch {
      setProfilError('Güncelleme başarısız')
    }
    setProfilLoading(false)
  }

  // Password submit
  async function handleSifreSubmit(e: React.FormEvent) {
    e.preventDefault()
    setSifreError('')
    setSifreMessage('')
    if (newPassword !== confirmPassword) {
      setSifreError('Şifreler eşleşmiyor')
      return
    }
    if (newPassword.length < 6) {
      setSifreError('Şifre en az 6 karakter olmalı')
      return
    }
    setSifreLoading(true)
    try {
      const supabase = createClient()
      const { error } = await supabase.auth.updateUser({ password: newPassword })
      if (error) setSifreError(error.message)
      else {
        setSifreMessage('Şifre başarıyla güncellendi')
        setNewPassword('')
        setConfirmPassword('')
      }
    } catch {
      setSifreError('Bir hata oluştu')
    }
    setSifreLoading(false)
  }

  const earnedCount = badges.filter(b => b.earned).length
  const totalCount = badges.length

  if (profileLoading) {
    return (
      <div className="space-y-6 animate-pulse">
        <div className="flex items-center gap-3">
          <div className="w-6 h-6 bg-border rounded" />
          <div className="h-7 bg-border rounded w-28" />
        </div>
        <div className="flex flex-col items-center gap-3">
          <div className="w-24 h-24 bg-border rounded-full" />
          <div className="h-5 bg-border rounded w-32" />
          <div className="h-4 bg-border rounded w-40" />
        </div>
        <div className="bg-surface rounded-2xl border border-border p-5 space-y-3">
          <div className="h-5 bg-border rounded w-36" />
          <div className="h-10 bg-border rounded" />
          <div className="h-10 bg-border rounded" />
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6 pb-8 panel-section-enter">
      {/* Baslik */}
      <div className="flex items-center gap-3">
        <Link
          href="/app"
          className="p-2 -ml-2 text-text-secondary hover:text-text-primary transition-colors"
        >
          <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
        </Link>
        <h1 className="text-2xl heading-gradient">Profilim</h1>
      </div>

      {/* Section 1: Profile Header */}
      <div className="flex flex-col items-center gap-2 pt-2">
        {/* Avatar */}
        <button
          type="button"
          onClick={() => fileInputRef.current?.click()}
          disabled={avatarUploading}
          className="relative w-24 h-24 rounded-full bg-surface-hover border-2 border-border overflow-hidden flex items-center justify-center group cursor-pointer"
        >
          {avatarUrl ? (
            <Image
              src={avatarUrl}
              alt="Profil"
              fill
              className="object-cover"
              sizes="96px"
            />
          ) : (
            <svg
              className="w-10 h-10 text-text-secondary"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1.5}
                d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
              />
            </svg>
          )}
          {/* Camera overlay */}
          <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 group-active:opacity-100 transition-opacity">
            <svg
              className="w-6 h-6 text-white"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={1.5}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M6.827 6.175A2.31 2.31 0 015.186 7.23c-.38.054-.757.112-1.134.175C2.999 7.58 2.25 8.507 2.25 9.574V18a2.25 2.25 0 002.25 2.25h15A2.25 2.25 0 0021.75 18V9.574c0-1.067-.75-1.994-1.802-2.169a47.865 47.865 0 00-1.134-.175 2.31 2.31 0 01-1.64-1.055l-.822-1.316a2.192 2.192 0 00-1.736-1.039 48.774 48.774 0 00-5.232 0 2.192 2.192 0 00-1.736 1.039l-.821 1.316z"
              />
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M16.5 12.75a4.5 4.5 0 11-9 0 4.5 4.5 0 019 0z"
              />
            </svg>
          </div>
          {avatarUploading && (
            <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
              <div className="w-6 h-6 border-2 border-white border-t-transparent rounded-full animate-spin" />
            </div>
          )}
        </button>
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={handleAvatarChange}
        />
        {avatarError && (
          <p className="text-xs text-danger">{avatarError}</p>
        )}

        {/* Name */}
        <h2 className="text-xl font-bold text-text-primary mt-1">
          {fullName || '-'}
        </h2>

        {/* Start date */}
        {startDate && (
          <p className="text-sm text-text-secondary">
            Üyelik: {formatStartDate(startDate)}
          </p>
        )}
      </div>

      {/* Section 2: Profil Bilgileri */}
      <Card glow className="rounded-2xl p-5">
        <CardHeader className="mb-0">
          <CardTitle>Profil Bilgileri</CardTitle>
        </CardHeader>
        <form onSubmit={handleProfilSubmit} className="space-y-4 mt-4">
          <Input
            label="Ad Soyad"
            type="text"
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
            required
          />
          <Input
            label="Telefon"
            type="tel"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            placeholder="05xx xxx xx xx"
          />
          {profilError && <p className="text-sm text-danger">{profilError}</p>}
          {profilMessage && <p className="text-sm text-green-500">{profilMessage}</p>}
          <Button type="submit" loading={profilLoading}>Kaydet</Button>
        </form>
      </Card>

      {/* Section 3: Sifre Degistir */}
      <Card glow className="rounded-2xl p-5">
        <CardHeader className="mb-0">
          <CardTitle>Şifre Değiştir</CardTitle>
        </CardHeader>
        <form onSubmit={handleSifreSubmit} className="space-y-4 mt-4">
          <Input
            label="Yeni Şifre"
            type="password"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            required
          />
          <Input
            label="Yeni Şifre (Tekrar)"
            type="password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            required
          />
          {sifreError && <p className="text-sm text-danger">{sifreError}</p>}
          {sifreMessage && <p className="text-sm text-green-500">{sifreMessage}</p>}
          <Button type="submit" loading={sifreLoading}>Şifreyi Güncelle</Button>
        </form>
      </Card>

      {/* Platform Rehberi */}
      {tourProgress && !tourProgress.dismissed && (
        <Card glow className="rounded-2xl p-5">
          <CardHeader className="mb-0">
            <CardTitle>Platform Rehberi</CardTitle>
          </CardHeader>
          <div className="mt-4 space-y-1">
            {(() => {
              const completedCount = CLIENT_TOUR_STEPS.filter(s =>
                tourProgress.completed?.includes(s.key) || isTourStepLocked(s, clientPlan)
              ).length
              const allDone = completedCount === CLIENT_TOUR_STEPS.length
              return (
                <>
                  <div className="mb-4">
                    <div className="flex justify-between text-sm text-text-secondary mb-2">
                      <span>İlerleme</span>
                      <span>{completedCount}/{CLIENT_TOUR_STEPS.length} tamamlandı</span>
                    </div>
                    <div className="h-2 bg-border rounded-full overflow-hidden">
                      <div
                        className="h-full bg-primary rounded-full transition-all duration-500"
                        style={{ width: `${(completedCount / CLIENT_TOUR_STEPS.length) * 100}%` }}
                      />
                    </div>
                  </div>
                  {allDone ? (
                    <div className="text-center py-4">
                      <p className="text-sm text-success font-medium">Tebrikler! Platformu keşfettin.</p>
                    </div>
                  ) : (
                    CLIENT_TOUR_STEPS.map(s => {
                      const locked = isTourStepLocked(s, clientPlan)
                      const completed = tourProgress.completed?.includes(s.key)
                      return (
                        <div key={s.key} className="flex items-center justify-between py-2.5 border-b border-border last:border-0">
                          <div className="flex items-center gap-3">
                            <span className="text-base">{locked ? '🔒' : completed ? '✅' : '◻️'}</span>
                            <span className={`text-sm ${completed ? 'text-text-tertiary line-through' : 'text-text-primary'}`}>
                              {s.title}
                            </span>
                          </div>
                          {!completed && (
                            <Link
                              href={locked ? '/app' : s.ctaPath}
                              onClick={async () => {
                                if (locked || completed) return
                                const updated = {
                                  ...tourProgress,
                                  completed: [...(tourProgress.completed || []), s.key],
                                }
                                setTourProgress(updated)
                                const supabase = createClient()
                                const { data: { user } } = await supabase.auth.getUser()
                                if (user) {
                                  await supabase.from('clients').update({ tour_progress: updated }).eq('user_id', user.id)
                                }
                              }}
                              className="text-xs text-primary hover:text-primary/80 font-medium"
                            >
                              {locked ? 'Pro ile Aç' : '→ Git'}
                            </Link>
                          )}
                        </div>
                      )
                    })
                  )}
                </>
              )
            })()}
          </div>
        </Card>
      )}

      {/* Section 4: Rozetlerim */}
      <Card glow className="rounded-2xl p-5">
        <CardHeader className="mb-0">
          <div className="flex items-center justify-between">
            <CardTitle>Rozetlerim</CardTitle>
            {!badgesLoading && (
              <span className="text-sm font-semibold text-text-secondary">
                {earnedCount}/{totalCount}
              </span>
            )}
          </div>
        </CardHeader>

        {badgesLoading ? (
          <div className="mt-4 grid grid-cols-3 sm:grid-cols-4 gap-3">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="h-20 bg-border rounded-xl animate-pulse" />
            ))}
          </div>
        ) : (
          <>
            <div className="mt-4 grid grid-cols-3 sm:grid-cols-4 gap-3">
              {badges.map((badge) => {
                const earned = badge.earned
                const visual = BADGE_VISUALS[badge.id]

                return (
                  <button
                    key={badge.id}
                    type="button"
                    disabled={!earned}
                    onClick={() => {
                      if (earned) setShareBadge(badge)
                    }}
                    className={`flex flex-col items-center gap-1.5 p-3 rounded-xl transition-all ${
                      earned
                        ? 'cursor-pointer active:scale-95'
                        : 'opacity-40 grayscale cursor-default'
                    }`}
                    style={earned && visual ? {
                      background: visual.gradient,
                      boxShadow: `0 4px 12px ${visual.shadow},0.3)`,
                    } : undefined}
                  >
                    <span className="text-2xl leading-none">
                      {visual?.emoji || ''}
                    </span>
                    <span
                      className={`text-[11px] font-medium leading-tight text-center ${
                        earned ? 'text-white' : 'text-text-secondary'
                      }`}
                    >
                      {badge.name}
                    </span>
                  </button>
                )
              })}
            </div>

            {/* Link to full badges page */}
            <Link
              href="/app/rozetler"
              className="mt-4 flex items-center justify-center gap-1.5 text-sm font-semibold text-primary hover:text-primary-hover transition-colors"
            >
              Tüm rozetleri gör
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
              </svg>
            </Link>
          </>
        )}
      </Card>

      {/* Share Overlay */}
      {shareBadge && (
        <ShareOverlay
          badge={shareBadge}
          userId={badgeUserId}
          cachedBlob={imageCache.current.get(shareBadge.id)}
          onClose={() => setShareBadge(null)}
        />
      )}
    </div>
  )
}
