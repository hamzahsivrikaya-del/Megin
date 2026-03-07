'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import Card from '@/components/ui/Card'
import Badge from '@/components/ui/Badge'

interface Attendee {
  packageId: string
  clientId: string
  clientName: string
  totalLessons: number
  usedLessons: number
  doneToday: boolean
  lessonId: string | null
}

interface TodayAttendanceProps {
  attendees: Attendee[]
  today: string
  trainerId: string
}

export default function TodayAttendance({ attendees: initial, today, trainerId }: TodayAttendanceProps) {
  const router = useRouter()
  const [attendees, setAttendees] = useState(initial)
  const [loading, setLoading] = useState<string | null>(null)

  const doneCount = attendees.filter((a) => a.doneToday).length

  async function markDone(att: Attendee) {
    setLoading(att.packageId)
    const supabase = createClient()

    const { data, error } = await supabase
      .from('lessons')
      .insert({
        package_id: att.packageId,
        client_id: att.clientId,
        trainer_id: trainerId,
        date: today,
        attended: true,
      })
      .select('id')
      .single()

    if (!error && data) {
      // Paket ders sayısını güncelle
      await supabase
        .from('packages')
        .update({ used_lessons: att.usedLessons + 1 })
        .eq('id', att.packageId)

      setAttendees((prev) =>
        prev.map((a) =>
          a.packageId === att.packageId
            ? { ...a, doneToday: true, lessonId: data.id, usedLessons: a.usedLessons + 1 }
            : a
        ).sort((a, b) => {
          if (a.doneToday !== b.doneToday) return a.doneToday ? 1 : -1
          return a.clientName.localeCompare(b.clientName, 'tr')
        })
      )
    }

    setLoading(null)
  }

  async function undoLesson(att: Attendee) {
    if (!att.lessonId) return
    setLoading(att.packageId)
    const supabase = createClient()

    await supabase.from('lessons').delete().eq('id', att.lessonId)
    await supabase
      .from('packages')
      .update({ used_lessons: att.usedLessons - 1 })
      .eq('id', att.packageId)

    setAttendees((prev) =>
      prev.map((a) =>
        a.packageId === att.packageId
          ? { ...a, doneToday: false, lessonId: null, usedLessons: a.usedLessons - 1 }
          : a
      ).sort((a, b) => {
        if (a.doneToday !== b.doneToday) return a.doneToday ? 1 : -1
        return a.clientName.localeCompare(b.clientName, 'tr')
      })
    )
    setLoading(null)
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Bugünkü Dersler</h1>
        <Badge variant={doneCount === attendees.length && attendees.length > 0 ? 'success' : 'default'}>
          {doneCount}/{attendees.length}
        </Badge>
      </div>

      {attendees.length === 0 ? (
        <Card>
          <p className="text-sm text-text-secondary text-center py-8">
            Bugün aktif paketi olan danışan bulunmuyor.
          </p>
        </Card>
      ) : (
        <div className="space-y-2">
          {attendees.map((att) => {
            const remaining = att.totalLessons - att.usedLessons
            const isLoading = loading === att.packageId

            return (
              <Card key={att.packageId} className={att.doneToday ? 'opacity-60' : ''}>
                <div className="flex items-center justify-between">
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-text-primary truncate">{att.clientName}</p>
                    <p className="text-xs text-text-secondary mt-0.5">
                      {att.usedLessons}/{att.totalLessons} ders · Kalan: {remaining}
                    </p>
                  </div>

                  <div className="flex items-center gap-2 ml-3">
                    {remaining <= 2 && remaining > 0 && !att.doneToday && (
                      <Badge variant="danger">Son {remaining}</Badge>
                    )}
                    {att.doneToday ? (
                      <button
                        onClick={() => undoLesson(att)}
                        disabled={isLoading}
                        className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium text-success bg-success/10 hover:bg-success/20 transition-colors cursor-pointer disabled:opacity-50"
                      >
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                        Yapıldı
                      </button>
                    ) : (
                      <button
                        onClick={() => markDone(att)}
                        disabled={isLoading}
                        className="px-3 py-1.5 rounded-lg text-xs font-medium text-white bg-gradient-to-r from-[#DC2626] to-[#F97316] shadow-sm hover:shadow-lg hover:shadow-red-500/20 transition-colors cursor-pointer disabled:opacity-50"
                      >
                        {isLoading ? 'Kaydediliyor...' : 'Ders Yap'}
                      </button>
                    )}
                  </div>
                </div>
              </Card>
            )
          })}
        </div>
      )}

      {/* Progress bar */}
      {attendees.length > 0 && (
        <div className="h-2 bg-border rounded-full overflow-hidden">
          <div
            className="h-full bg-primary rounded-full transition-all duration-500"
            style={{ width: `${(doneCount / attendees.length) * 100}%` }}
          />
        </div>
      )}
    </div>
  )
}
