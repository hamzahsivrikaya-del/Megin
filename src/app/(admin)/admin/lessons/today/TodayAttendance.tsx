'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { sendLowLessonPush, sendLessonCompletedPush } from '../new/actions'

interface Attendee {
  packageId: string
  userId: string
  userName: string
  totalLessons: number
  usedLessons: number
  doneToday: boolean
  lessonId: string | null
}

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString('tr-TR', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  })
}

function getInitials(name: string) {
  return name
    .split(' ')
    .map((n) => n[0])
    .join('')
    .slice(0, 2)
    .toUpperCase()
}

export default function TodayAttendance({
  attendees: initial,
  today,
}: {
  attendees: Attendee[]
  today: string
}) {
  const [attendees, setAttendees] = useState(initial)
  const [loading, setLoading] = useState<string | null>(null)

  const doneCount = attendees.filter((a) => a.doneToday).length
  const totalCount = attendees.length
  const progress = totalCount > 0 ? Math.round((doneCount / totalCount) * 100) : 0

  async function markDone(attendee: Attendee) {
    if (attendee.doneToday || loading) return
    setLoading(attendee.packageId)

    // Optimistik güncelleme
    setAttendees((prev) =>
      prev.map((a) =>
        a.packageId === attendee.packageId
          ? { ...a, doneToday: true, usedLessons: a.usedLessons + 1 }
          : a
      )
    )

    const supabase = createClient()
    const { data, error } = await supabase
      .from('lessons')
      .insert({ package_id: attendee.packageId, user_id: attendee.userId, date: today, notes: null })
      .select('id')
      .single()

    if (error) {
      // Geri al
      setAttendees((prev) =>
        prev.map((a) =>
          a.packageId === attendee.packageId
            ? { ...a, doneToday: false, usedLessons: a.usedLessons - 1 }
            : a
        )
      )
      alert('Hata: ' + error.message)
    } else {
      // Lesson ID'yi kaydet
      setAttendees((prev) =>
        prev.map((a) =>
          a.packageId === attendee.packageId ? { ...a, lessonId: data.id } : a
        )
      )

      // Ders tamamlandı bildirimi
      await sendLessonCompletedPush(attendee.userId)

      // Kalan ders uyarısı
      const remaining = attendee.totalLessons - attendee.usedLessons - 1
      if (remaining <= 2 && remaining >= 1) {
        await sendLowLessonPush(attendee.userId, remaining)
      }
    }

    setLoading(null)
  }

  async function undoLesson(attendee: Attendee) {
    if (!attendee.lessonId || loading) return
    setLoading(attendee.packageId)

    const supabase = createClient()
    const { error } = await supabase.from('lessons').delete().eq('id', attendee.lessonId)

    if (error) {
      alert('Geri alınamadı: ' + error.message)
    } else {
      setAttendees((prev) =>
        prev.map((a) =>
          a.packageId === attendee.packageId
            ? { ...a, doneToday: false, usedLessons: a.usedLessons - 1, lessonId: null }
            : a
        )
      )
    }

    setLoading(null)
  }

  return (
    <div className="space-y-5 max-w-2xl mx-auto">
      {/* Başlık */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl heading-display">Bugünkü Dersler</h1>
          <p className="text-sm text-text-secondary mt-0.5">{formatDate(today)}</p>
        </div>
        <div className="text-right">
          <span className="text-2xl font-bold text-primary">{doneCount}</span>
          <span className="text-2xl font-bold text-text-secondary">/{totalCount}</span>
          <p className="text-xs text-text-secondary">tamamlandı</p>
        </div>
      </div>

      {/* Progress bar */}
      {totalCount > 0 && (
        <div className="h-1.5 bg-surface-hover rounded-full overflow-hidden">
          <div
            className="h-full bg-primary rounded-full transition-all duration-500"
            style={{ width: `${progress}%` }}
          />
        </div>
      )}

      {/* Üye listesi */}
      {attendees.length === 0 ? (
        <div className="text-center py-16 text-text-secondary">
          <p className="text-4xl mb-3">📋</p>
          <p>Aktif paket bulunamadı</p>
        </div>
      ) : (
        <div className="space-y-2">
          {attendees.map((attendee) => {
            const remaining = attendee.totalLessons - attendee.usedLessons
            const isLow = remaining <= 3
            const isLoading = loading === attendee.packageId

            return (
              <div
                key={attendee.packageId}
                className={`flex items-center gap-3 px-4 py-3.5 rounded-xl border transition-all
                  ${attendee.doneToday
                    ? 'bg-success/5 border-success/20'
                    : 'bg-surface border-border'
                  }`}
              >
                {/* Avatar */}
                <div
                  className={`w-9 h-9 rounded-full flex items-center justify-center flex-shrink-0 text-xs font-bold
                    ${attendee.doneToday
                      ? 'bg-green-500/20 text-green-400'
                      : 'bg-primary/10 text-primary'
                    }`}
                >
                  {attendee.doneToday ? (
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                    </svg>
                  ) : (
                    getInitials(attendee.userName)
                  )}
                </div>

                {/* Bilgi */}
                <div className="flex-1 min-w-0">
                  <p
                    className={`font-medium text-sm truncate
                      ${attendee.doneToday ? 'text-green-400' : 'text-text-primary'}`}
                  >
                    {attendee.userName}
                  </p>
                  <p className="text-xs text-text-secondary mt-0.5">
                    {attendee.usedLessons}/{attendee.totalLessons} ders
                    {' · '}
                    <span className={isLow && !attendee.doneToday ? 'text-amber-400 font-medium' : ''}>
                      {remaining} kaldı
                      {isLow && !attendee.doneToday && ' ⚠'}
                    </span>
                  </p>
                </div>

                {/* Butonlar */}
                <div className="flex items-center gap-2 flex-shrink-0">
                  {attendee.doneToday ? (
                    <>
                      <span className="text-sm font-medium text-green-400">Yapıldı ✓</span>
                      <button
                        onClick={() => undoLesson(attendee)}
                        disabled={isLoading}
                        title="Geri Al"
                        className="p-1.5 rounded-lg text-text-secondary hover:text-danger hover:bg-danger/10 transition-all cursor-pointer disabled:opacity-40"
                      >
                        {isLoading ? (
                          <span className="text-xs">...</span>
                        ) : (
                          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                              d="M3 10h10a8 8 0 018 8v2M3 10l6 6m-6-6l6-6" />
                          </svg>
                        )}
                      </button>
                    </>
                  ) : (
                    <button
                      onClick={() => markDone(attendee)}
                      disabled={isLoading}
                      className={`px-4 py-2 rounded-lg text-sm font-medium transition-all active:scale-95 cursor-pointer
                        ${isLoading
                          ? 'bg-primary/30 text-primary/50 cursor-wait'
                          : 'bg-gradient-to-r from-[#DC2626] to-[#F97316] text-white shadow-sm hover:shadow-lg hover:shadow-red-500/20'
                        }`}
                    >
                      {isLoading ? '...' : 'Ders Ekle'}
                    </button>
                  )}
                </div>
              </div>
            )
          })}
        </div>
      )}

      {/* Hepsi bitti banner */}
      {totalCount > 0 && doneCount === totalCount && (
        <div className="text-center py-4 bg-green-500/5 border border-green-500/20 rounded-xl">
          <p className="text-green-400 font-medium">Tüm dersler tamamlandı! 🎉</p>
        </div>
      )}
    </div>
  )
}
