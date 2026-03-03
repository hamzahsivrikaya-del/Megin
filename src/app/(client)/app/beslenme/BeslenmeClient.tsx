'use client'

import { useState, useMemo } from 'react'
import { createClient } from '@/lib/supabase/client'
import Card, { CardHeader, CardTitle } from '@/components/ui/Card'
import Badge from '@/components/ui/Badge'
import Button from '@/components/ui/Button'
import Link from 'next/link'

interface Meal {
  id: string
  name: string
  order_num: number
}

interface MealLog {
  id: string
  client_id: string
  date: string
  meal_id: string | null
  status: string
  note: string | null
  is_extra: boolean
  extra_name: string | null
}

interface BeslenmeClientProps {
  clientId: string
  nutritionNote: string | null
  memberMeals: Meal[]
  initialLogs: MealLog[]
}

export default function BeslenmeClient({ clientId, nutritionNote, memberMeals, initialLogs }: BeslenmeClientProps) {
  const [logs, setLogs] = useState(initialLogs)
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0])
  const [saving, setSaving] = useState<string | null>(null)

  const todayLogs = useMemo(
    () => logs.filter((l) => l.date === selectedDate),
    [logs, selectedDate]
  )

  const compliantCount = todayLogs.filter((l) => l.status === 'compliant').length
  const total = memberMeals.length
  const ratio = total > 0 ? compliantCount / total : 0

  async function toggleMeal(mealId: string, currentStatus: string | null) {
    setSaving(mealId)
    const supabase = createClient()

    const existingLog = todayLogs.find((l) => l.meal_id === mealId)
    const newStatus = currentStatus === 'compliant' ? 'non_compliant' : 'compliant'

    if (existingLog) {
      await supabase
        .from('meal_logs')
        .update({ status: newStatus })
        .eq('id', existingLog.id)

      setLogs((prev) =>
        prev.map((l) => l.id === existingLog.id ? { ...l, status: newStatus } : l)
      )
    } else {
      const { data } = await supabase
        .from('meal_logs')
        .insert({
          client_id: clientId,
          date: selectedDate,
          meal_id: mealId,
          status: newStatus,
          is_extra: false,
        })
        .select()
        .single()

      if (data) {
        setLogs((prev) => [data, ...prev])
      }
    }

    setSaving(null)
  }

  // Son 14 gün
  const last14Days = useMemo(() => {
    const days = []
    for (let i = 0; i < 14; i++) {
      const d = new Date()
      d.setDate(d.getDate() - i)
      days.push(d.toISOString().split('T')[0])
    }
    return days
  }, [])

  return (
    <div className="space-y-6">
      <div>
        <Link href="/app" className="text-sm text-text-secondary hover:text-primary transition-colors">
          {'←'} Geri
        </Link>
        <h1 className="text-2xl font-bold mt-1">Beslenme</h1>
      </div>

      {nutritionNote && (
        <Card className="border-primary/20">
          <p className="text-sm text-text-secondary">{nutritionNote}</p>
        </Card>
      )}

      {memberMeals.length === 0 ? (
        <Card className="text-center py-8">
          <p className="text-text-secondary">{`Henüz öğün planı atanmadı.`}</p>
          <p className="text-sm text-text-tertiary mt-1">{`Antrenörün öğün planını oluşturduğunda burada görünecek.`}</p>
        </Card>
      ) : (
        <>
          {/* Tarih seçimi */}
          <div className="flex gap-2 overflow-x-auto pb-2">
            {last14Days.slice(0, 7).map((date) => {
              const d = new Date(date)
              const dayName = ['Paz', 'Pzt', 'Sal', 'Çar', 'Per', 'Cum', 'Cmt'][d.getDay()]
              const isSelected = date === selectedDate
              const dayLogs = logs.filter((l) => l.date === date)
              const dayCompliant = dayLogs.filter((l) => l.status === 'compliant').length
              const dayRatio = total > 0 ? dayCompliant / total : 0

              return (
                <button
                  key={date}
                  onClick={() => setSelectedDate(date)}
                  className={`flex-shrink-0 flex flex-col items-center gap-1 px-3 py-2 rounded-lg text-xs transition-colors cursor-pointer
                    ${isSelected ? 'bg-primary text-white' : 'bg-surface border border-border hover:bg-surface-hover'}`}
                >
                  <span className="font-medium">{dayName}</span>
                  <span>{d.getDate()}</span>
                  {dayLogs.length > 0 && (
                    <div className={`w-1.5 h-1.5 rounded-full ${
                      dayRatio >= 1 ? 'bg-success' : dayRatio >= 0.5 ? 'bg-warning' : 'bg-danger'
                    } ${isSelected ? 'opacity-80' : ''}`} />
                  )}
                </button>
              )
            })}
          </div>

          {/* Öğün listesi */}
          <Card>
            <div className="flex items-center justify-between mb-4">
              <CardTitle>{'Öğünler'}</CardTitle>
              <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${
                ratio >= 1 ? 'bg-emerald-100 text-emerald-700'
                  : ratio >= 0.5 ? 'bg-amber-100 text-amber-700'
                  : compliantCount > 0 ? 'bg-red-100 text-red-600'
                  : 'bg-gray-100 text-text-secondary'
              }`}>
                {compliantCount}/{total}
              </span>
            </div>

            <div className="space-y-2">
              {memberMeals.map((meal) => {
                const log = todayLogs.find((l) => l.meal_id === meal.id)
                const isCompliant = log?.status === 'compliant'
                const isNonCompliant = log?.status === 'non_compliant'
                const isLoading = saving === meal.id

                return (
                  <button
                    key={meal.id}
                    onClick={() => toggleMeal(meal.id, log?.status || null)}
                    disabled={isLoading}
                    className={`w-full flex items-center justify-between px-4 py-3 rounded-lg transition-colors cursor-pointer disabled:opacity-50
                      ${isCompliant ? 'bg-emerald-50 hover:bg-emerald-100'
                        : isNonCompliant ? 'bg-red-50 hover:bg-red-100'
                        : 'bg-background hover:bg-surface-hover'
                      }`}
                  >
                    <span className={`text-sm font-medium ${
                      isCompliant ? 'text-emerald-700'
                        : isNonCompliant ? 'text-red-600'
                        : 'text-text-primary'
                    }`}>
                      {meal.name}
                    </span>
                    {isCompliant && (
                      <svg className="w-5 h-5 text-emerald-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                      </svg>
                    )}
                    {isNonCompliant && (
                      <svg className="w-5 h-5 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    )}
                  </button>
                )
              })}
            </div>

            {/* Progress bar */}
            <div className="mt-4 h-1.5 bg-gray-100 rounded-full overflow-hidden">
              <div
                className="h-full rounded-full transition-all duration-500"
                style={{
                  width: `${ratio * 100}%`,
                  backgroundColor: ratio >= 1 ? '#10b981' : ratio >= 0.5 ? '#f59e0b' : '#ef4444',
                }}
              />
            </div>
          </Card>
        </>
      )}
    </div>
  )
}
