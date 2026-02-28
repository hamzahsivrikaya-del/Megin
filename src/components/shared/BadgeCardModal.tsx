'use client'

import { useEffect, useCallback } from 'react'
import type { BadgeDefinition } from '@/lib/badges'

interface BadgeCardModalProps {
  open: boolean
  onClose: () => void
  badge: BadgeDefinition
  userName: string
  earnedDate?: string // YYYY-MM-DD
}

function getFireTextSize(name: string): string {
  const len = name.length
  if (len <= 6) return 'bc-text-xl'
  if (len <= 9) return 'bc-text-lg'
  if (len <= 12) return 'bc-text-md'
  return 'bc-text-sm'
}

function formatDate(dateStr?: string): string {
  if (!dateStr) {
    const now = new Date()
    const d = String(now.getDate()).padStart(2, '0')
    const m = String(now.getMonth() + 1).padStart(2, '0')
    const y = now.getFullYear()
    return `${d} / ${m} / ${y}`
  }
  const [y, m, d] = dateStr.split('-')
  return `${d} / ${m} / ${y}`
}

function EquipmentLayer() {
  return (
    <div className="bc-equip-layer">
      {/* Dumbbell 1 */}
      <div className="bc-eq bc-eq-1">
        <svg width="74" height="74" viewBox="0 0 64 64" fill="none">
          <rect x="8" y="14" width="12" height="36" fill="rgba(232,67,10,0.5)"/>
          <rect x="44" y="14" width="12" height="36" fill="rgba(232,67,10,0.5)"/>
          <rect x="1" y="19" width="9" height="26" fill="rgba(232,67,10,0.35)"/>
          <rect x="54" y="19" width="9" height="26" fill="rgba(232,67,10,0.35)"/>
          <rect x="20" y="27" width="24" height="10" fill="rgba(232,67,10,0.4)"/>
        </svg>
      </div>

      {/* Kettlebell 1 */}
      <div className="bc-eq bc-eq-2">
        <svg width="58" height="74" viewBox="0 0 48 62" fill="none">
          <path d="M14 8 L14 2 L34 2 L34 8" stroke="rgba(200,155,60,0.7)" strokeWidth="4" fill="none" strokeLinejoin="miter"/>
          <rect x="11" y="8" width="26" height="8" fill="rgba(200,155,60,0.2)"/>
          <rect x="5" y="16" width="38" height="42" rx="2" fill="rgba(200,155,60,0.12)" stroke="rgba(200,155,60,0.55)" strokeWidth="2.5"/>
          <text x="24" y="43" textAnchor="middle" fontFamily="var(--font-display),sans-serif" fontSize="18" fontWeight="600" fill="rgba(200,155,60,0.6)">16</text>
        </svg>
      </div>

      {/* Barbell */}
      <div className="bc-eq bc-eq-3">
        <svg width="92" height="48" viewBox="0 0 88 40" fill="none">
          <rect x="0" y="2" width="18" height="36" fill="rgba(212,148,10,0.4)"/>
          <rect x="18" y="7" width="8" height="26" fill="rgba(212,148,10,0.25)"/>
          <rect x="26" y="15" width="36" height="10" fill="rgba(212,148,10,0.3)"/>
          <rect x="62" y="7" width="8" height="26" fill="rgba(212,148,10,0.25)"/>
          <rect x="70" y="2" width="18" height="36" fill="rgba(212,148,10,0.4)"/>
        </svg>
      </div>

      {/* Dumbbell 2 */}
      <div className="bc-eq bc-eq-4">
        <svg width="62" height="62" viewBox="0 0 64 64" fill="none">
          <rect x="8" y="14" width="12" height="36" fill="rgba(212,148,10,0.45)"/>
          <rect x="44" y="14" width="12" height="36" fill="rgba(212,148,10,0.45)"/>
          <rect x="1" y="19" width="9" height="26" fill="rgba(212,148,10,0.3)"/>
          <rect x="54" y="19" width="9" height="26" fill="rgba(212,148,10,0.3)"/>
          <rect x="20" y="27" width="24" height="10" fill="rgba(212,148,10,0.35)"/>
        </svg>
      </div>

      {/* Kettlebell 2 */}
      <div className="bc-eq bc-eq-5">
        <svg width="50" height="64" viewBox="0 0 48 62" fill="none">
          <path d="M14 8 L14 2 L34 2 L34 8" stroke="rgba(232,67,10,0.6)" strokeWidth="3.5" fill="none" strokeLinejoin="miter"/>
          <rect x="11" y="8" width="26" height="8" fill="rgba(232,67,10,0.15)"/>
          <rect x="5" y="16" width="38" height="42" rx="2" fill="rgba(232,67,10,0.1)" stroke="rgba(232,67,10,0.5)" strokeWidth="2.5"/>
          <text x="24" y="43" textAnchor="middle" fontFamily="var(--font-display),sans-serif" fontSize="16" fontWeight="600" fill="rgba(232,67,10,0.55)">24</text>
        </svg>
      </div>

      {/* Plaka */}
      <div className="bc-eq bc-eq-6">
        <svg width="60" height="60" viewBox="0 0 56 56" fill="none">
          <rect x="2" y="2" width="52" height="52" stroke="rgba(200,155,60,0.5)" strokeWidth="3" fill="rgba(200,155,60,0.04)"/>
          <rect x="12" y="12" width="32" height="32" stroke="rgba(200,155,60,0.25)" strokeWidth="1.5" fill="none"/>
          <circle cx="28" cy="28" r="5" fill="rgba(200,155,60,0.1)" stroke="rgba(200,155,60,0.4)" strokeWidth="2"/>
          <text x="28" y="10" textAnchor="middle" fontFamily="var(--font-display),sans-serif" fontSize="10" fontWeight="600" fill="rgba(200,155,60,0.5)">20KG</text>
        </svg>
      </div>

      {/* Dumbbell 3 */}
      <div className="bc-eq bc-eq-7">
        <svg width="70" height="70" viewBox="0 0 64 64" fill="none">
          <rect x="8" y="14" width="12" height="36" fill="rgba(180,80,10,0.4)"/>
          <rect x="44" y="14" width="12" height="36" fill="rgba(180,80,10,0.4)"/>
          <rect x="1" y="19" width="9" height="26" fill="rgba(180,80,10,0.28)"/>
          <rect x="54" y="19" width="9" height="26" fill="rgba(180,80,10,0.28)"/>
          <rect x="20" y="27" width="24" height="10" fill="rgba(180,80,10,0.32)"/>
        </svg>
      </div>
    </div>
  )
}

export default function BadgeCardModal({ open, onClose, badge, userName, earnedDate }: BadgeCardModalProps) {
  useEffect(() => {
    if (open) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = ''
    }
    return () => { document.body.style.overflow = '' }
  }, [open])

  const handleShare = useCallback(async () => {
    const shareUrl = `${window.location.origin}/api/share/badge/${badge.id}?u=${encodeURIComponent(userName)}`

    if (navigator.share) {
      try {
        await navigator.share({
          title: `${badge.name} Rozeti`,
          text: `${userName} "${badge.name}" rozetini kazandı!`,
          url: shareUrl,
        })
      } catch {
        // kullanici iptal etti
      }
    } else {
      await navigator.clipboard.writeText(shareUrl)
    }
  }, [badge, userName])

  if (!open) return null

  const firstName = userName.split(' ')[0].toUpperCase()
  const isSpecial = badge.trigger === 'admin'

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/80" onClick={onClose} />

      <div className="relative flex flex-col items-center gap-4 w-full max-w-[420px]">
        {/* Kapat butonu */}
        <button
          onClick={onClose}
          className="absolute -top-2 -right-2 z-20 w-10 h-10 flex items-center justify-center rounded-full bg-black/60 text-white/70 hover:text-white transition-colors cursor-pointer"
        >
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>

        {/* Badge Card */}
        <div className="badge-card">
          <div className="bc-bg-base" />
          <div className="bc-bg-light" />
          <div className="bc-bg-glow" />
          <div className="bc-bg-hatch" />
          <div className="bc-bg-grain" />
          <div className="bc-bg-vignette" />

          <div className="bc-edge-top" />
          <div className="bc-edge-right" />
          <div className="bc-edge-bottom" />

          <EquipmentLayer />

          <div className="bc-content">
            <div className="bc-top bc-reveal bc-d1">
              <span className="bc-top-date">{formatDate(earnedDate)}</span>
              <span className="bc-top-label">Yeni rozet</span>
            </div>

            <div className="bc-hero">
              <span className="bc-hero-pre bc-reveal bc-d2">&#x25CF; tebrikler</span>
              <div className="bc-hero-name bc-reveal bc-d3">{firstName},</div>
              <div className={`bc-hero-fire bc-reveal bc-d3 ${getFireTextSize(badge.name)}`}>
                {badge.name.toUpperCase()}
              </div>
              <div className="bc-hero-sub bc-reveal bc-d4">ROZETİ KAZANDIN!</div>

              <div className="bc-accent-slash bc-reveal bc-d5" />

              <p className="bc-quote bc-reveal bc-d5">
                &ldquo;{badge.quote}&rdquo;
              </p>

              {!isSpecial && (
                <div className="bc-stat-block bc-reveal bc-d6">
                  <div className="bc-stat-num">{badge.threshold}</div>
                  <div className="bc-stat-detail">
                    <span className="bc-stat-title">{badge.statLabel}</span>
                    <span className="bc-stat-sub">{badge.statSub}</span>
                  </div>
                </div>
              )}
            </div>

            <div className="bc-bottom bc-reveal bc-d7">
              <div className="bc-brand-col">
                <span className="bc-brand-name">@hamzasivrikayaa</span>
                <span className="bc-brand-sub">Kişisel Antrenör — Antalya</span>
              </div>
              <span className="bc-brand-url">hamzasivrikaya.com</span>
            </div>
          </div>
        </div>

        {/* Paylas butonu */}
        <button
          onClick={handleShare}
          className="w-full max-w-[420px] py-4 flex items-center justify-center gap-3 text-white font-semibold tracking-wider uppercase transition-all cursor-pointer"
          style={{
            background: 'linear-gradient(135deg, #E8430A 0%, #D4940A 100%)',
            fontFamily: 'var(--font-display), sans-serif',
            fontSize: '16px',
            letterSpacing: '3px',
          }}
        >
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
          </svg>
          Hikayende Paylaş
        </button>
      </div>
    </div>
  )
}
