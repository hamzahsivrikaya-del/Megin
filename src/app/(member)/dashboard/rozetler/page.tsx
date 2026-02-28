'use client'

import { useState, useEffect, useRef } from 'react'
import { BADGE_DEFINITIONS, BADGE_VISUALS } from '@/lib/badges'
import type { BadgeDefinition } from '@/lib/badges'

const CATEGORY_LABELS: Record<string, string> = {
  lesson: 'Ders',
  streak: 'Seri',
  goal: 'Hedef',
  nutrition: 'Beslenme',
  special: 'Özel',
}

const CATEGORY_ORDER = ['lesson', 'streak', 'goal', 'nutrition', 'special']

type BadgeWithStatus = BadgeDefinition & { earned: boolean; earnedAt: string | null }

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
    // Cache'den gelen blob varsa direkt kullan
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
        {/* Görsel */}
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

        {/* Butonlar */}
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

        {/* Kapat */}
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

/* --- Badge Card ----------------------------------- */
function BadgeCard({ badge, onShare }: {
  badge: BadgeWithStatus
  onShare: (badge: BadgeWithStatus) => void
}) {
  const visual = BADGE_VISUALS[badge.id]
  const [hovered, setHovered] = useState(false)

  if (!visual) return null

  const shadowBase = `0 6px 20px ${visual.shadow},0.3)`
  const shadowHover = `0 12px 30px ${visual.shadow},0.4)`

  return (
    <div
      className={`badge${badge.earned ? '' : ' locked'}`}
      style={{
        background: visual.gradient,
        boxShadow: badge.earned ? (hovered ? shadowHover : shadowBase) : 'none',
        cursor: badge.earned ? 'pointer' : 'default',
      }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      <div className="badge-icon">{visual.emoji}</div>
      <div className="badge-name">{badge.name}</div>
      <div className="badge-desc">{badge.description}</div>
      {badge.earned && badge.earnedAt && (
        <div className="badge-date">
          {new Date(badge.earnedAt).toLocaleDateString('tr-TR', { day: 'numeric', month: 'short', year: 'numeric' })}
        </div>
      )}
      {badge.earned && (
        <button
          type="button"
          onClick={() => onShare(badge)}
          className="badge-share-btn"
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
            <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z"/>
          </svg>
          Paylaş
        </button>
      )}
    </div>
  )
}

/* --- Ana Sayfa ------------------------------------ */
export default function RozetlerPage() {
  const [badges, setBadges] = useState<BadgeWithStatus[]>([])
  const [userId, setUserId] = useState<string>('')
  const [loading, setLoading] = useState(true)
  const [shareBadge, setShareBadge] = useState<BadgeWithStatus | null>(null)
  const imageCache = useRef<Map<string, Blob>>(new Map())

  useEffect(() => {
    async function load() {
      const res = await fetch('/api/badges')
      if (res.ok) {
        const data = await res.json()
        setBadges(data.badges)
        setUserId(data.userId)

        // Kazanılan rozetlerin görsellerini arka planda preload et ve cache'le
        const earned = (data.badges as BadgeWithStatus[]).filter((b: BadgeWithStatus) => b.earned)
        earned.forEach(async (b) => {
          try {
            const r = await fetch(`/api/share/badge/${b.id}?u=${data.userId}`)
            if (r.ok) {
              const blob = await r.blob()
              imageCache.current.set(b.id, blob)
            }
          } catch {}
        })
      }
      setLoading(false)
    }
    load()
  }, [])

  const earnedCount = badges.filter(b => b.earned).length
  const totalCount = badges.length

  if (loading) {
    return (
      <div className="space-y-6 animate-pulse">
        <div className="h-8 bg-border rounded w-32" />
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3.5">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="h-48 bg-border rounded-2xl" />
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6 pb-8" style={{ fontFamily: 'var(--font-nunito), sans-serif' }}>
      {/* Share Overlay */}
      {shareBadge && (
        <ShareOverlay
          badge={shareBadge}
          userId={userId}
          cachedBlob={imageCache.current.get(shareBadge.id)}
          onClose={() => setShareBadge(null)}
        />
      )}

      {/* Baslik */}
      <div className="flex items-center gap-3 animate-fade-up">
        <a
          href="/dashboard"
          className="p-2 -ml-2 text-text-secondary hover:text-text-primary transition-colors"
        >
          <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
        </a>
        <h1 className="text-2xl font-bold text-text-primary">Rozetlerim</h1>
      </div>

      <div className="animate-fade-up">
        <p className="text-sm text-text-secondary mt-1">
          {earnedCount}/{totalCount} rozet kazanıldı
        </p>

        <div className="mt-3 h-2 bg-border rounded-full overflow-hidden">
          <div
            className="h-full bg-primary rounded-full transition-all duration-700"
            style={{ width: totalCount > 0 ? `${(earnedCount / totalCount) * 100}%` : '0%' }}
          />
        </div>
      </div>

      {/* Kategorilere gore rozetler */}
      {CATEGORY_ORDER.map((category) => {
        const categoryBadges = badges.filter(b => b.category === category)
        if (categoryBadges.length === 0) return null

        return (
          <div key={category} className="animate-fade-up">
            <h2 className="text-xs font-semibold text-text-secondary uppercase tracking-widest mb-3">
              {CATEGORY_LABELS[category]}
            </h2>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3.5">
              {categoryBadges.map((badge) => (
                <BadgeCard
                  key={badge.id}
                  badge={badge}
                  onShare={setShareBadge}
                />
              ))}
            </div>
          </div>
        )
      })}
    </div>
  )
}
