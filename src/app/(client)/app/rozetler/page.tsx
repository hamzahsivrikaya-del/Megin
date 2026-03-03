'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import Card from '@/components/ui/Card'
import BadgeUI from '@/components/ui/Badge'
import { BADGE_CATEGORY_LABELS, BadgeDefinition } from '@/lib/badges'

interface BadgeWithStatus extends BadgeDefinition {
  earned: boolean
  earnedAt: string | null
  progress?: number
}

interface BadgeStats {
  totalLessons: number
  weeklyLessons: number
  maxStreak: number
  currentStreak: number
  goalsSet: number
  goalsAchieved: number
  nutritionEntries: number
  bestNutritionCompliance: number
}

interface ApiResponse {
  badges: BadgeWithStatus[]
  stats: BadgeStats
  newlyEarned: string[]
}

const CATEGORY_ORDER: BadgeDefinition['category'][] = [
  'lesson',
  'streak',
  'goal',
  'nutrition',
  'special',
]

const CATEGORY_COLORS: Record<BadgeDefinition['category'], string> = {
  lesson: 'from-blue-500/20 to-blue-600/10 border-blue-500/30',
  streak: 'from-orange-500/20 to-orange-600/10 border-orange-500/30',
  goal: 'from-green-500/20 to-green-600/10 border-green-500/30',
  nutrition: 'from-emerald-500/20 to-emerald-600/10 border-emerald-500/30',
  special: 'from-yellow-500/20 to-yellow-600/10 border-yellow-500/30',
}

function formatDate(dateStr: string) {
  const date = new Date(dateStr)
  const months = ['Oca', 'Şub', 'Mar', 'Nis', 'May', 'Haz', 'Tem', 'Ağu', 'Eyl', 'Eki', 'Kas', 'Ara']
  return `${date.getDate()} ${months[date.getMonth()]} ${date.getFullYear()}`
}

function getProgress(badge: BadgeWithStatus, stats: BadgeStats): number {
  if (badge.trigger === 'admin' || badge.threshold === 0) return 0
  const metricMap: Record<string, number> = {
    totalLessons: stats.totalLessons,
    weeklyLessons: stats.weeklyLessons,
    maxStreak: stats.maxStreak,
    currentStreak: stats.currentStreak,
    goalsSet: stats.goalsSet,
    goalsAchieved: stats.goalsAchieved,
    nutritionEntries: stats.nutritionEntries,
    bestNutritionCompliance: stats.bestNutritionCompliance,
  }
  const value = metricMap[badge.metric] ?? 0
  return Math.min(1, value / badge.threshold)
}

function SkeletonCard() {
  return (
    <div className="bg-surface rounded-xl border border-border p-4 animate-pulse">
      <div className="flex flex-col items-center gap-2">
        <div className="w-12 h-12 rounded-full bg-surface-hover" />
        <div className="h-3 w-20 bg-surface-hover rounded" />
        <div className="h-2 w-28 bg-surface-hover rounded" />
      </div>
    </div>
  )
}

export default function RozetlerPage() {
  const [data, setData] = useState<ApiResponse | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    async function fetchBadges() {
      try {
        const res = await fetch('/api/badges')
        if (!res.ok) {
          const json = await res.json()
          setError(json.error || 'Bir hata oluştu')
          return
        }
        const json = await res.json()
        setData(json)
      } catch {
        setError('Bağlantı hatası')
      } finally {
        setLoading(false)
      }
    }
    fetchBadges()
  }, [])

  const earnedCount = data?.badges.filter((b) => b.earned).length ?? 0
  const totalCount = data?.badges.length ?? 0

  const grouped = data
    ? CATEGORY_ORDER.reduce<Record<string, BadgeWithStatus[]>>((acc, cat) => {
        acc[cat] = data.badges.filter((b) => b.category === cat)
        return acc
      }, {} as Record<string, BadgeWithStatus[]>)
    : {}

  return (
    <div className="space-y-6">
      {/* Başlık */}
      <div>
        <Link href="/app" className="text-sm text-text-secondary hover:text-primary transition-colors">
          ← Geri
        </Link>
        <h1 className="text-2xl font-bold mt-1">Rozetlerim</h1>
        <p className="text-sm text-text-secondary mt-0.5">
          Antrenman yolculuğundaki başarılarını takip et
        </p>
      </div>

      {/* Özet */}
      {loading ? (
        <div className="bg-surface rounded-xl border border-border p-4 animate-pulse">
          <div className="h-8 w-24 bg-surface-hover rounded mx-auto" />
        </div>
      ) : error ? (
        <Card className="text-center py-6">
          <p className="text-danger text-sm">{error}</p>
        </Card>
      ) : data ? (
        <Card className="flex items-center justify-between">
          <div>
            <p className="text-sm text-text-secondary">Kazanılan Rozetler</p>
            <p className="text-3xl font-bold text-text-primary mt-0.5">
              {earnedCount}
              <span className="text-lg font-normal text-text-secondary">/{totalCount}</span>
            </p>
          </div>
          <div className="flex flex-col items-end gap-1">
            <BadgeUI variant={earnedCount === totalCount ? 'success' : earnedCount > 0 ? 'primary' : 'default'}>
              {earnedCount === totalCount
                ? 'Tamamlandı'
                : earnedCount === 0
                ? 'Henüz yok'
                : `%${Math.round((earnedCount / totalCount) * 100)} tamamlandı`}
            </BadgeUI>
            {/* Progress bar */}
            <div className="w-32 h-1.5 bg-surface-hover rounded-full overflow-hidden">
              <div
                className="h-full bg-primary rounded-full transition-all duration-500"
                style={{ width: `${(earnedCount / totalCount) * 100}%` }}
              />
            </div>
          </div>
        </Card>
      ) : null}

      {/* Rozet Grupları */}
      {loading ? (
        <div className="space-y-6">
          {CATEGORY_ORDER.map((cat) => (
            <div key={cat} className="space-y-3">
              <div className="h-5 w-24 bg-surface-hover rounded animate-pulse" />
              <div className="grid grid-cols-3 sm:grid-cols-4 gap-3">
                {[...Array(3)].map((_, i) => <SkeletonCard key={i} />)}
              </div>
            </div>
          ))}
        </div>
      ) : data ? (
        <div className="space-y-8">
          {CATEGORY_ORDER.map((cat) => {
            const badges = grouped[cat] ?? []
            if (badges.length === 0) return null
            const earnedInCat = badges.filter((b) => b.earned).length

            return (
              <div key={cat} className="space-y-3">
                {/* Kategori başlığı */}
                <div className="flex items-center gap-2">
                  <h2 className="text-sm font-semibold text-text-secondary uppercase tracking-wide">
                    {BADGE_CATEGORY_LABELS[cat]}
                  </h2>
                  <span className="text-xs text-text-tertiary">
                    {earnedInCat}/{badges.length}
                  </span>
                </div>

                {/* Badge grid */}
                <div className="grid grid-cols-3 sm:grid-cols-4 gap-3">
                  {badges.map((badge) => {
                    const progress = badge.earned ? 1 : (data ? getProgress(badge, data.stats) : 0)
                    const hasProgress = !badge.earned && progress > 0

                    return (
                      <div
                        key={badge.id}
                        className={`relative rounded-xl border p-3 flex flex-col items-center gap-1.5 transition-all ${
                          badge.earned
                            ? `bg-gradient-to-br ${CATEGORY_COLORS[badge.category]} shadow-sm`
                            : 'bg-surface border-border'
                        }`}
                      >
                        {/* Emoji */}
                        <span
                          className={`text-3xl leading-none select-none ${
                            badge.earned ? '' : 'grayscale opacity-40'
                          }`}
                        >
                          {badge.emoji}
                        </span>

                        {/* Kilit ikonu (kazanılmamışsa) */}
                        {!badge.earned && (
                          <div className="absolute top-2 right-2">
                            <svg
                              className="w-3 h-3 text-text-tertiary"
                              fill="none"
                              viewBox="0 0 24 24"
                              stroke="currentColor"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
                              />
                            </svg>
                          </div>
                        )}

                        {/* İsim */}
                        <p
                          className={`text-xs font-semibold text-center leading-tight ${
                            badge.earned ? 'text-text-primary' : 'text-text-tertiary'
                          }`}
                        >
                          {badge.name}
                        </p>

                        {/* Açıklama (tooltip benzeri, sadece küçük hint) */}
                        <p
                          className={`text-[10px] text-center leading-tight line-clamp-2 ${
                            badge.earned ? 'text-text-secondary' : 'text-text-tertiary opacity-70'
                          }`}
                        >
                          {badge.description}
                        </p>

                        {/* Kazanılan tarih */}
                        {badge.earned && badge.earnedAt && (
                          <span className="text-[10px] text-text-secondary mt-0.5">
                            {formatDate(badge.earnedAt)}
                          </span>
                        )}

                        {/* İlerleme çubuğu */}
                        {hasProgress && (
                          <div className="w-full mt-0.5">
                            <div className="w-full h-1 bg-surface-hover rounded-full overflow-hidden">
                              <div
                                className="h-full bg-primary/50 rounded-full transition-all duration-500"
                                style={{ width: `${progress * 100}%` }}
                              />
                            </div>
                            <p className="text-[9px] text-text-tertiary text-center mt-0.5">
                              %{Math.round(progress * 100)}
                            </p>
                          </div>
                        )}
                      </div>
                    )
                  })}
                </div>
              </div>
            )
          })}
        </div>
      ) : null}
    </div>
  )
}
