'use client'

import { useState } from 'react'
import { toDateStr } from '@/lib/utils'
import type { CalendarEvent } from './CalendarClient'

const SHORT_DAYS = ['P', 'S', 'Ç', 'P', 'C', 'C', 'P']
const LONG_DAYS = ['Pazartesi', 'Salı', 'Çarşamba', 'Perşembe', 'Cuma', 'Cumartesi', 'Pazar']
const MONTHS = ['Oca', 'Şub', 'Mar', 'Nis', 'May', 'Haz', 'Tem', 'Ağu', 'Eyl', 'Eki', 'Kas', 'Ara']

interface MobileDayViewProps {
  events: CalendarEvent[]
  currentMonday: string
  selectedDay: string
  onSelectDay: (day: string) => void
  onEventClick: (event: CalendarEvent) => void
  onAddClick: (dateStr: string) => void
}

function calcEndTime(startTime: string, duration: number): string {
  const [h, m] = startTime.split(':').map(Number)
  const endMin = h * 60 + m + duration
  return `${String(Math.floor(endMin / 60)).padStart(2, '0')}:${String(endMin % 60).padStart(2, '0')}`
}

function EventRow({ event, onClick }: { event: CalendarEvent; onClick: () => void }) {
  const startTime = event.extendedProps.startTime || '—'
  const endTime = event.extendedProps.startTime
    ? calcEndTime(event.extendedProps.startTime, event.extendedProps.duration || 60)
    : ''

  return (
    <button
      onClick={onClick}
      className="w-full text-left px-4 py-3 flex items-start gap-3 active:bg-surface-hover transition-colors cursor-pointer"
    >
      <div className="w-14 flex-shrink-0 pt-0.5">
        <p className="text-sm font-medium text-text-secondary">{startTime}</p>
      </div>
      <div className="flex-1 rounded-lg px-3 py-2.5 border-l-3 border-sky-400 bg-sky-50">
        <p className="font-semibold text-text-primary text-[15px]">
          {event.extendedProps.memberName}
        </p>
        <p className="text-sm text-sky-600 mt-0.5">
          {startTime}{endTime ? ` – ${endTime}` : ''}
        </p>
        {event.extendedProps.notes && (
          <p className="text-xs text-text-secondary mt-1 opacity-70">
            {event.extendedProps.notes}
          </p>
        )}
      </div>
    </button>
  )
}

export default function MobileDayView({
  events,
  currentMonday,
  selectedDay,
  onSelectDay,
  onEventClick,
  onAddClick,
}: MobileDayViewProps) {
  const [viewMode, setViewMode] = useState<'day' | 'week'>('week')
  const today = toDateStr(new Date())

  // Haftanın 7 gününü oluştur
  const weekDays = Array.from({ length: 7 }, (_, i) => {
    const d = new Date(currentMonday + 'T00:00:00')
    d.setDate(d.getDate() + i)
    return toDateStr(d)
  })

  // Her gündeki event sayısı
  const eventCounts: Record<string, number> = {}
  for (const e of events) {
    const d = e.extendedProps.date
    eventCounts[d] = (eventCounts[d] || 0) + 1
  }

  // Günlere göre grupla ve sırala
  const eventsByDay: Record<string, CalendarEvent[]> = {}
  for (const dayStr of weekDays) {
    eventsByDay[dayStr] = events
      .filter((e) => e.extendedProps.date === dayStr)
      .sort((a, b) => (a.extendedProps.startTime || '').localeCompare(b.extendedProps.startTime || ''))
  }

  // Seçili günün event'leri
  const dayEvents = eventsByDay[selectedDay] || []

  // Seçili gün bilgisi
  const selDate = new Date(selectedDay + 'T00:00:00')
  const dayIdx = selDate.getDay() === 0 ? 6 : selDate.getDay() - 1
  const dayLabel = `${selDate.getDate()} ${MONTHS[selDate.getMonth()]} ${selDate.getFullYear()} – ${LONG_DAYS[dayIdx]}`

  return (
    <div className="space-y-0">
      {/* Üst bar: toggle */}
      <div className="bg-surface border border-border rounded-t-xl px-3 pt-3 pb-2">
        <div className="flex justify-center mb-3">
          <div className="inline-flex bg-surface-hover rounded-lg p-0.5">
            <button
              onClick={() => setViewMode('week')}
              className={`px-4 py-1.5 rounded-md text-xs font-semibold transition-colors cursor-pointer ${
                viewMode === 'week'
                  ? 'bg-surface text-primary shadow-sm'
                  : 'text-text-secondary'
              }`}
            >
              Haftalık
            </button>
            <button
              onClick={() => setViewMode('day')}
              className={`px-4 py-1.5 rounded-md text-xs font-semibold transition-colors cursor-pointer ${
                viewMode === 'day'
                  ? 'bg-surface text-primary shadow-sm'
                  : 'text-text-secondary'
              }`}
            >
              Günlük
            </button>
          </div>
        </div>

        {/* Hafta gün numaraları — Apple Calendar stili */}
        <div className="grid grid-cols-7">
          {weekDays.map((dayStr, i) => {
            const d = new Date(dayStr + 'T00:00:00')
            const dayNum = d.getDate()
            const isToday = dayStr === today
            const isSelected = dayStr === selectedDay && viewMode === 'day'

            return (
              <button
                key={dayStr}
                onClick={() => { onSelectDay(dayStr); setViewMode('day') }}
                className="flex flex-col items-center py-1 cursor-pointer"
              >
                <span className="text-[10px] font-medium text-text-secondary mb-0.5">
                  {SHORT_DAYS[i]}
                </span>
                <span className={`w-10 h-10 flex items-center justify-center rounded-full text-lg font-semibold transition-colors ${
                  isToday
                    ? 'bg-primary text-white'
                    : isSelected
                      ? 'bg-primary/10 text-primary'
                      : 'text-text-primary'
                }`}>
                  {dayNum}
                </span>
              </button>
            )
          })}
        </div>
      </div>

      {/* ===== HAFTALIK GRID — Apple Calendar stili ===== */}
      {viewMode === 'week' && (
        <div className="bg-surface border border-t-0 border-border rounded-b-xl overflow-hidden">
          <div className="grid grid-cols-7">
            {weekDays.map((dayStr) => {
              const dayEvts = eventsByDay[dayStr] || []

              return (
                <div key={dayStr} className="border-r border-border last:border-r-0 min-h-[80px]">
                  <div className="space-y-[3px] p-[2px]">
                    {dayEvts.map((event) => (
                      <button
                        key={event.id}
                        onClick={() => onEventClick(event)}
                        className="w-full text-left bg-sky-100 rounded-[3px] px-[5px] py-[3px] active:bg-sky-200 transition-colors cursor-pointer"
                      >
                        <p className="text-[12px] font-bold leading-[1.15] text-text-primary break-words">
                          {event.extendedProps.memberName}
                        </p>
                        {event.extendedProps.startTime && (
                          <p className="text-[11px] leading-[1.15] text-sky-600 font-medium">
                            {event.extendedProps.startTime}
                          </p>
                        )}
                      </button>
                    ))}
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      )}

      {/* ===== GÜNLÜK GÖRÜNÜM ===== */}
      {viewMode === 'day' && (
        <>
          <div className="bg-surface border-x border-border px-4 py-2.5 border-b">
            <p className="text-sm font-semibold text-text-primary text-center">{dayLabel}</p>
          </div>

          <div className="bg-surface border border-t-0 border-border rounded-b-xl">
            {dayEvents.length > 0 ? (
              <div className="divide-y divide-border">
                {dayEvents.map((event) => (
                  <EventRow key={event.id} event={event} onClick={() => onEventClick(event)} />
                ))}
              </div>
            ) : (
              <div className="px-4 py-12 text-center">
                <p className="text-sm text-text-secondary">Bu gün planlanmış ders yok</p>
              </div>
            )}

            <div className="px-4 py-3 border-t border-border">
              <button
                onClick={() => onAddClick(selectedDay)}
                className="w-full flex items-center justify-center gap-2 py-2.5 rounded-lg bg-primary/5 text-primary text-sm font-medium hover:bg-primary/10 active:bg-primary/15 transition-colors cursor-pointer"
              >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v12m6-6H6" />
                </svg>
                Ders Ekle
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  )
}
