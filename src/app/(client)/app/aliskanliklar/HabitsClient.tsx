'use client'

import { useState, useEffect, useCallback } from 'react'
import Link from 'next/link'
import { toDateStr } from '@/lib/utils'

interface HabitDef {
  name: string
  category: string
  icon: string
  is_avoidance: boolean
  order_num: number
}

interface UserHabit {
  id: string
  habit_id: string
  custom_name: string | null
  assigned_by: string | null
  habit_definitions: HabitDef
}

interface HabitLog {
  id: string
  client_habit_id: string
  completed: boolean
}

interface RecentLog {
  client_habit_id: string
  date: string
  completed: boolean
}

const CATEGORY_LABELS: Record<string, string> = {
  beslenme: 'Beslenme',
  icecek: 'İçecek',
  egzersiz: 'Egzersiz',
  uyku: 'Uyku',
  oz_bakim: 'Öz Bakım',
}

const CATEGORY_ORDER = ['beslenme', 'icecek', 'egzersiz', 'uyku', 'oz_bakim']

function getStreakDays(habitId: string, recentLogs: RecentLog[]): number {
  const logs = recentLogs
    .filter(l => l.client_habit_id === habitId && l.completed)
    .map(l => l.date)
    .sort((a, b) => b.localeCompare(a))

  if (logs.length === 0) return 0

  const today = toDateStr(new Date())
  const yesterday = toDateStr(new Date(Date.now() - 86400000))

  if (logs[0] !== today && logs[0] !== yesterday) return 0

  let streak = 1
  for (let i = 1; i < logs.length; i++) {
    const prev = new Date(logs[i - 1] + 'T00:00:00')
    const curr = new Date(logs[i] + 'T00:00:00')
    const diff = (prev.getTime() - curr.getTime()) / 86400000
    if (diff === 1) streak++
    else break
  }
  return streak
}

function getGeneralStreak(habits: UserHabit[], recentLogs: RecentLog[]): number {
  if (habits.length === 0) return 0

  const today = toDateStr(new Date())
  const dates = new Set(recentLogs.map(l => l.date))
  const sortedDates = Array.from(dates).sort((a, b) => b.localeCompare(a))

  let streak = 0
  for (const date of sortedDates) {
    if (date > today) continue

    const dayLogs = recentLogs.filter(l => l.date === date)
    const completedCount = dayLogs.filter(l => l.completed).length
    const ratio = completedCount / habits.length

    if (ratio >= 1) streak++
    else if (date === today) continue
    else break
  }
  return streak
}

function getWeekData(habits: UserHabit[], recentLogs: RecentLog[]): { date: string; ratio: number }[] {
  const today = new Date()
  const dayOfWeek = today.getDay() === 0 ? 6 : today.getDay() - 1
  const monday = new Date(today)
  monday.setDate(today.getDate() - dayOfWeek)

  return Array.from({ length: 7 }, (_, i) => {
    const d = new Date(monday)
    d.setDate(monday.getDate() + i)
    const dateStr = toDateStr(d)
    const dayLogs = recentLogs.filter(l => l.date === dateStr)
    const completed = dayLogs.filter(l => l.completed).length
    const ratio = habits.length > 0 ? completed / habits.length : 0
    return { date: dateStr, ratio }
  })
}

const DAYS_SHORT = ['P', 'S', 'C', 'P', 'C', 'C', 'P']

export default function HabitsClient() {
  const [habits, setHabits] = useState<UserHabit[]>([])
  const [logs, setLogs] = useState<HabitLog[]>([])
  const [recentLogs, setRecentLogs] = useState<RecentLog[]>([])
  const [loading, setLoading] = useState(true)
  const [togglingId, setTogglingId] = useState<string | null>(null)

  const today = toDateStr(new Date())

  const fetchData = useCallback(async () => {
    const res = await fetch(`/api/habits?date=${today}`)
    if (!res.ok) return
    const data = await res.json()
    setHabits(data.habits)
    setLogs(data.logs)
    setRecentLogs(data.recentLogs)
    setLoading(false)
  }, [today])

  useEffect(() => { fetchData() }, [fetchData])

  async function toggleHabit(clientHabitId: string, completed: boolean) {
    setTogglingId(clientHabitId)

    // Optimistik guncelleme
    setLogs(prev => {
      const existing = prev.find(l => l.client_habit_id === clientHabitId)
      if (existing) {
        return prev.map(l => l.client_habit_id === clientHabitId ? { ...l, completed } : l)
      }
      return [...prev, { id: 'temp', client_habit_id: clientHabitId, completed }]
    })

    setRecentLogs(prev => {
      const filtered = prev.filter(l => !(l.client_habit_id === clientHabitId && l.date === today))
      return [...filtered, { client_habit_id: clientHabitId, date: today, completed }]
    })

    const res = await fetch('/api/habits', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'log', clientHabitId, date: today, completed }),
    })

    if (!res.ok) {
      fetchData()
    }

    setTogglingId(null)
  }

  if (loading) {
    return (
      <div className="space-y-4 animate-pulse">
        <div className="h-32 bg-surface rounded-3xl border border-border" />
        <div className="h-12 bg-surface rounded-2xl border border-border" />
        <div className="space-y-2">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="h-16 bg-surface rounded-2xl border border-border" />
          ))}
        </div>
      </div>
    )
  }

  const completedToday = logs.filter(l => l.completed).length
  const totalHabits = habits.length
  const todayRatio = totalHabits > 0 ? completedToday / totalHabits : 0
  const generalStreak = getGeneralStreak(habits, recentLogs)
  const weekData = getWeekData(habits, recentLogs)

  const grouped = CATEGORY_ORDER
    .map(cat => ({
      category: cat,
      label: CATEGORY_LABELS[cat],
      items: habits.filter(h => h.habit_definitions.category === cat)
        .sort((a, b) => a.habit_definitions.order_num - b.habit_definitions.order_num),
    }))
    .filter(g => g.items.length > 0)

  const fireSize = generalStreak >= 30 ? 'text-5xl' : generalStreak >= 14 ? 'text-4xl' : generalStreak >= 7 ? 'text-3xl' : 'text-2xl'
  const fireGlow = generalStreak >= 7 ? 'drop-shadow-[0_0_12px_rgba(251,146,60,0.5)]' : ''

  return (
    <div className="space-y-5 pb-6 panel-section-enter">
      {/* Streak hero */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-amber-50 via-orange-50 to-red-50 border border-amber-200/60 p-5">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className={`${fireSize} ${fireGlow} transition-all`}>
              {"🔥"}
            </div>
            <div>
              <div className="flex items-baseline gap-1.5">
                <span className="text-3xl font-black text-text-primary">{generalStreak}</span>
                <span className="text-sm font-semibold text-text-secondary">gün</span>
              </div>
              <p className="text-xs text-text-secondary mt-0.5">
                {generalStreak === 0
                  ? 'Seriyi başlat! Hepsini tamamla'
                  : generalStreak >= 30
                    ? 'Efsanevi seri!'
                    : generalStreak >= 14
                      ? 'Muhteşem gidiyorsun!'
                      : generalStreak >= 7
                        ? 'Harika! Devam et!'
                        : 'Güzel başlangıç!'}
              </p>
            </div>
          </div>

          {/* Progress ring */}
          <div className="relative w-16 h-16">
            <svg className="w-16 h-16 -rotate-90" viewBox="0 0 64 64">
              <circle cx="32" cy="32" r="28" fill="none" stroke="#FED7AA" strokeWidth="5" />
              <circle
                cx="32" cy="32" r="28" fill="none"
                stroke={todayRatio >= 0.8 ? '#16A34A' : todayRatio >= 0.5 ? '#F59E0B' : '#EF4444'}
                strokeWidth="5"
                strokeLinecap="round"
                strokeDasharray={`${todayRatio * 175.9} 175.9`}
                className="transition-all duration-700"
              />
            </svg>
            <div className="absolute inset-0 flex items-center justify-center">
              <span className="text-sm font-black text-text-primary">{completedToday}/{totalHabits}</span>
            </div>
          </div>
        </div>

        {/* Haftalik grid */}
        <div className="flex justify-between mt-4 gap-1">
          {weekData.map((day, i) => {
            const isToday = day.date === today
            const isFuture = day.date > today

            return (
              <div key={day.date} className="flex-1 text-center">
                <div className="text-[10px] font-bold text-text-secondary/70 mb-1">{DAYS_SHORT[i]}</div>
                <div
                  className={`h-8 rounded-lg transition-all ${
                    isToday ? 'ring-2 ring-amber-400 ring-offset-1' : ''
                  }`}
                  style={{
                    backgroundColor: isFuture
                      ? '#F5F5F5'
                      : day.ratio >= 1
                        ? '#16A34A'
                        : day.ratio >= 0.5
                          ? '#F59E0B'
                          : day.ratio > 0
                            ? '#FBBF24'
                            : '#E5E7EB',
                    opacity: isFuture ? 0.5 : 1,
                  }}
                />
              </div>
            )
          })}
        </div>

        {/* Ayarlar linki */}
        <Link
          href="/app/aliskanliklar/setup"
          className="absolute top-4 right-4 w-8 h-8 rounded-full bg-white/60 backdrop-blur flex items-center justify-center text-text-secondary hover:bg-white/80 transition-all"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.066 2.573c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.573 1.066c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.066-2.573c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
            <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
          </svg>
        </Link>
      </div>

      {/* Alışkanlık listesi */}
      {grouped.map(group => (
        <div key={group.category}>
          <h3 className="text-xs font-bold uppercase tracking-[0.15em] text-text-secondary/60 mb-2 px-1">
            {group.label}
          </h3>
          <div className="space-y-1.5">
            {group.items.map(habit => {
              const def = habit.habit_definitions
              const log = logs.find(l => l.client_habit_id === habit.id)
              const isCompleted = log?.completed === true
              const streak = getStreakDays(habit.id, recentLogs)
              const isToggling = togglingId === habit.id

              return (
                <div
                  key={habit.id}
                  className={`flex items-center gap-3 px-4 py-3 rounded-2xl border transition-all ${
                    isCompleted
                      ? 'bg-emerald-50/80 border-emerald-200/60'
                      : 'bg-surface border-border hover:border-border/80'
                  }`}
                >
                  <span className="text-xl flex-shrink-0">{def.icon}</span>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className={`text-sm font-semibold truncate ${
                        isCompleted ? 'text-emerald-700' : 'text-text-primary'
                      }`}>
                        {habit.custom_name || def.name}
                      </span>
                      {def.is_avoidance && (
                        <span className="text-[9px] font-bold uppercase tracking-wider px-1 py-0.5 rounded bg-red-100 text-red-500 flex-shrink-0">
                          kaçın
                        </span>
                      )}
                    </div>
                    {streak > 0 && (
                      <div className="flex items-center gap-1 mt-0.5">
                        <span className={`text-xs ${streak >= 7 ? 'drop-shadow-[0_0_4px_rgba(251,146,60,0.4)]' : ''}`}>
                          {"🔥"}
                        </span>
                        <span className="text-[11px] font-bold text-amber-600">{streak} gün seri</span>
                      </div>
                    )}
                  </div>

                  <button
                    onClick={() => toggleHabit(habit.id, !isCompleted)}
                    disabled={isToggling}
                    className={`w-9 h-9 rounded-full flex items-center justify-center transition-all cursor-pointer active:scale-90 flex-shrink-0 ${
                      isCompleted
                        ? 'bg-emerald-500 text-white shadow-md shadow-emerald-200'
                        : 'border-2 border-gray-300 text-gray-300 hover:border-emerald-300 hover:text-emerald-400'
                    }`}
                  >
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                    </svg>
                  </button>
                </div>
              )
            })}
          </div>
        </div>
      ))}
    </div>
  )
}
