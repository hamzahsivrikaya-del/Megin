'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { BADGE_VISUALS } from '@/lib/badges'

const MAX_BADGES = 4

type BadgeItem = {
  id: string
  name: string
  category: string
  earned: boolean
  earnedAt: string | null
}

export default function BadgeStrip() {
  const [badges, setBadges] = useState<BadgeItem[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(false)

  useEffect(() => {
    let cancelled = false
    async function load() {
      try {
        const res = await fetch('/api/badges')
        if (!res.ok) throw new Error()
        const data = await res.json()
        if (!cancelled) {
          setBadges(data.badges || [])
        }
      } catch {
        if (!cancelled) setError(true)
      } finally {
        if (!cancelled) setLoading(false)
      }
    }
    load()
    return () => { cancelled = true }
  }, [])

  if (error) return null

  const earnedBadges = badges
    .filter(b => b.earned)
    .sort((a, b) => {
      if (!a.earnedAt && !b.earnedAt) return 0
      if (!a.earnedAt) return 1
      if (!b.earnedAt) return -1
      return new Date(b.earnedAt).getTime() - new Date(a.earnedAt).getTime()
    })
    .slice(0, MAX_BADGES)

  return (
    <div className="bg-surface rounded-2xl border border-border p-4 animate-fade-up delay-75">
      {/* Baslik satiri */}
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <h3 className="font-semibold text-text-primary text-sm">Rozetlerim</h3>
          {!loading && (
            <span className="text-sm text-text-secondary">
              {badges.filter(b => b.earned).length}/{badges.length}
            </span>
          )}
        </div>
        <Link
          href="/app/rozetler"
          className="text-sm text-primary hover:underline"
        >
          Tüm rozetleri gör &rarr;
        </Link>
      </div>

      {/* Badge kartlari */}
      <div className="flex gap-3 overflow-x-auto scrollbar-none pb-1">
        {loading ? (
          Array.from({ length: 4 }).map((_, i) => (
            <div
              key={i}
              className="shrink-0 rounded-2xl bg-border/50 animate-pulse"
              style={{ width: 104, height: 88 }}
            />
          ))
        ) : earnedBadges.length === 0 ? (
          <p className="text-sm text-text-secondary py-2">
            Henüz rozet kazanılmadı
          </p>
        ) : (
          earnedBadges.map((badge) => {
            const visual = BADGE_VISUALS[badge.id]
            if (!visual) return null

            return (
              <Link
                key={badge.id}
                href="/app/rozetler"
                className="shrink-0 flex flex-col items-center justify-center text-center no-underline"
                style={{
                  width: 104,
                  borderRadius: 16,
                  padding: '12px 8px',
                  background: visual.gradient,
                  boxShadow: `0 4px 12px ${visual.shadow},0.3)`,
                  color: '#fff',
                  textDecoration: 'none',
                }}
              >
                <span style={{ fontSize: 28, lineHeight: 1 }}>{visual.emoji}</span>
                <span
                  style={{
                    fontSize: 11,
                    fontWeight: 700,
                    marginTop: 6,
                    lineHeight: 1.2,
                    textShadow: '0 1px 2px rgba(0,0,0,0.2)',
                  }}
                >
                  {badge.name}
                </span>
              </Link>
            )
          })
        )}
      </div>
    </div>
  )
}
