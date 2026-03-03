'use client'

import { useState, useEffect, useCallback, useRef } from 'react'
import { createClient } from '@/lib/supabase/client'
import { getMonday, getAdjacentWeek, toDateStr } from '@/lib/utils'
import LessonModal from './LessonModal'

interface Member {
  packageId: string
  userId: string
  fullName: string
  totalLessons: number
  usedLessons: number
}

export interface CalendarEvent {
  id: string
  title: string
  start: string
  end: string
  backgroundColor: string
  borderColor: string
  textColor?: string
  extendedProps: {
    lessonId: string
    userId: string
    packageId: string
    date: string
    startTime: string | null
    duration: number
    notes: string | null
    memberName: string
  }
}

const DAYS_SHORT = ['PZT', 'SAL', 'ÇAR', 'PER', 'CUM', 'CMT', 'PAZ']
const DAYS_TR = ['Pazartesi', 'Salı', 'Çarşamba', 'Perşembe', 'Cuma', 'Cumartesi', 'Pazar']
const MONTHS_TR = ['Ocak', 'Şubat', 'Mart', 'Nisan', 'Mayıs', 'Haziran', 'Temmuz', 'Ağustos', 'Eylül', 'Ekim', 'Kasım', 'Aralık']

const HOUR_HEIGHT = 72
const WEEK_HOUR_HEIGHT = 56
const DAY_START = 6
const DAY_END = 23

function fmt(h: number, m: number) {
  return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`
}

function shortName(name: string): string {
  const parts = name.trim().split(' ')
  return parts.length === 1 ? parts[0] : `${parts[0]} ${parts[parts.length - 1][0]}.`
}

export default function CalendarClient({ members }: { members: Member[] }) {
  const [currentMonday, setCurrentMonday] = useState(() => getMonday())
  const [events, setEvents] = useState<CalendarEvent[]>([])
  const [loading, setLoading] = useState(true)
  const [view, setView] = useState<'week' | 'day'>('week')
  const [selectedDayIdx, setSelectedDayIdx] = useState<number | null>(null)
  const [modalOpen, setModalOpen] = useState(false)
  const [modalMode, setModalMode] = useState<'create' | 'edit'>('create')
  const [selectedEvent, setSelectedEvent] = useState<CalendarEvent | null>(null)
  const [selectedDate, setSelectedDate] = useState('')
  const [selectedTime, setSelectedTime] = useState('')
  const [currentTime, setCurrentTime] = useState(new Date())
  const scrollRef = useRef<HTMLDivElement>(null)

  // Move mode (tap-to-move)
  const [movingEvent, setMovingEvent] = useState<CalendarEvent | null>(null)
  const longPressRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const touchStartPos = useRef<{ x: number; y: number } | null>(null)

  const today = toDateStr(new Date())

  const weekDays = Array.from({ length: 7 }, (_, i) => {
    const d = new Date(currentMonday + 'T00:00:00')
    d.setDate(d.getDate() + i)
    return toDateStr(d)
  })
  const todayIdx = weekDays.indexOf(today)

  const startD = new Date(weekDays[0] + 'T00:00:00')
  const endD = new Date(weekDays[6] + 'T00:00:00')
  const rangeText = startD.getMonth() === endD.getMonth()
    ? `${startD.getDate()}–${endD.getDate()} ${MONTHS_TR[startD.getMonth()]} ${startD.getFullYear()}`
    : `${startD.getDate()} ${MONTHS_TR[startD.getMonth()]} – ${endD.getDate()} ${MONTHS_TR[endD.getMonth()]} ${endD.getFullYear()}`

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 60000)
    return () => clearInterval(timer)
  }, [])

  useEffect(() => {
    if (view === 'day' && scrollRef.current) {
      scrollRef.current.scrollTop = (13 - DAY_START) * HOUR_HEIGHT
    }
  }, [view, selectedDayIdx])

  const fetchLessons = useCallback(async () => {
    setLoading(true)
    const supabase = createClient()
    const sundayDate = new Date(currentMonday + 'T00:00:00')
    sundayDate.setDate(sundayDate.getDate() + 6)
    const sunday = toDateStr(sundayDate)

    const { data: lessons } = await supabase
      .from('lessons')
      .select('id, package_id, user_id, date, start_time, duration, notes, users(full_name)')
      .gte('date', currentMonday)
      .lte('date', sunday)
      .order('date')
      .order('start_time')

    const mapped: CalendarEvent[] = (lessons || []).map((l) => {
      const userName = (l.users as unknown as { full_name: string })?.full_name || 'Bilinmeyen'
      const time = l.start_time || '10:00'
      const dur = l.duration || 60
      const startDt = `${l.date}T${time}`
      const endDate = new Date(startDt)
      endDate.setMinutes(endDate.getMinutes() + dur)
      const endH = String(endDate.getHours()).padStart(2, '0')
      const endM = String(endDate.getMinutes()).padStart(2, '0')

      return {
        id: l.id,
        title: userName,
        start: startDt,
        end: `${l.date}T${endH}:${endM}`,
        backgroundColor: '#FEF2F2',
        borderColor: '#F87171',
        extendedProps: {
          lessonId: l.id,
          userId: l.user_id,
          packageId: l.package_id,
          date: l.date,
          startTime: l.start_time || time,
          duration: dur,
          notes: l.notes,
          memberName: userName,
        },
      }
    })

    setEvents(mapped)
    setLoading(false)
  }, [currentMonday])

  useEffect(() => { fetchLessons() }, [fetchLessons])

  function eventsForDay(dayStr: string) {
    return events
      .filter((e) => e.extendedProps.date === dayStr)
      .sort((a, b) => (a.extendedProps.startTime || '').localeCompare(b.extendedProps.startTime || ''))
  }

  function goToWeek(direction: -1 | 1) {
    setCurrentMonday(getAdjacentWeek(currentMonday, direction))
    setView('week')
  }

  function handleDayClick(dayIdx: number) {
    setSelectedDayIdx(dayIdx)
    setView('day')
  }

  function handleEventClick(event: CalendarEvent) {
    setSelectedEvent(event)
    setModalMode('edit')
    setModalOpen(true)
  }

  function handleAddClick(dateStr: string, timeStr?: string) {
    // Move mode: taşınacak ders varsa saat dilimine taşı
    if (movingEvent) {
      const newTime = timeStr || '10:00'
      if (dateStr !== movingEvent.extendedProps.date || newTime !== movingEvent.extendedProps.startTime) {
        moveLesson(movingEvent.extendedProps.lessonId, dateStr, newTime)
      }
      setMovingEvent(null)
      return
    }

    setSelectedDate(dateStr)
    setSelectedTime(timeStr || '10:00')
    setSelectedEvent(null)
    setModalMode('create')
    setModalOpen(true)
  }

  async function moveLesson(lessonId: string, newDate: string, newTime: string) {
    const supabase = createClient()
    await supabase
      .from('lessons')
      .update({ date: newDate, start_time: newTime })
      .eq('id', lessonId)
    fetchLessons()
  }

  function handleModalClose() {
    setModalOpen(false)
    setSelectedEvent(null)
  }

  function handleModalSave() {
    setModalOpen(false)
    setSelectedEvent(null)
    fetchLessons()
  }

  const activeDayIdx = selectedDayIdx ?? (todayIdx >= 0 ? todayIdx : 0)
  const activeDayStr = weekDays[activeDayIdx]
  const activeDayDate = new Date(activeDayStr + 'T00:00:00')

  // ===== MOVE MODE (long press → tap to move) =====

  function onCardTouchStart(e: React.TouchEvent, event: CalendarEvent) {
    const touch = e.touches[0]
    touchStartPos.current = { x: touch.clientX, y: touch.clientY }

    longPressRef.current = setTimeout(() => {
      setMovingEvent(event)
      if (navigator.vibrate) navigator.vibrate(30)
      longPressRef.current = null
    }, 400)
  }

  function onCardTouchMove(e: React.TouchEvent) {
    if (!longPressRef.current || !touchStartPos.current) return
    const touch = e.touches[0]
    const dx = Math.abs(touch.clientX - touchStartPos.current.x)
    const dy = Math.abs(touch.clientY - touchStartPos.current.y)
    if (dx > 10 || dy > 10) {
      clearTimeout(longPressRef.current)
      longPressRef.current = null
    }
  }

  function onCardTouchEnd() {
    if (longPressRef.current) {
      clearTimeout(longPressRef.current)
      longPressRef.current = null
    }
  }

  return (
    <div className="min-h-[80vh]">
      {/* ===== HEADER ===== */}
      <div
        className="flex items-center justify-between px-3 py-2.5"
        style={{ background: '#fff', borderBottom: '1px solid #F3F4F6' }}
      >
        <div className="flex items-center gap-1.5">
          <button
            onClick={() => goToWeek(-1)}
            className="w-7 h-7 rounded-lg border border-[#F3F4F6] bg-white flex items-center justify-center text-[#9CA3AF] cursor-pointer hover:bg-[#F9FAFB] transition-colors flex-shrink-0"
          >
            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
            </svg>
          </button>
          <div className="text-center min-w-0">
            <p className="text-[13px] font-bold text-text-primary leading-tight">{rangeText}</p>
            {events.length > 0 && (
              <p className="text-[10px] text-[#9CA3AF]">{events.length} ders</p>
            )}
          </div>
          <button
            onClick={() => goToWeek(1)}
            className="w-7 h-7 rounded-lg border border-[#F3F4F6] bg-white flex items-center justify-center text-[#9CA3AF] cursor-pointer hover:bg-[#F9FAFB] transition-colors flex-shrink-0"
          >
            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
            </svg>
          </button>
        </div>

        <div className="flex bg-[#F3F4F6] rounded-lg p-0.5 flex-shrink-0">
          <button
            onClick={() => setView('week')}
            className="px-3 py-1.5 rounded-md text-[11px] font-semibold cursor-pointer transition-all"
            style={{
              background: view === 'week' ? '#fff' : 'transparent',
              color: view === 'week' ? '#DC2626' : '#6B7280',
              boxShadow: view === 'week' ? '0 1px 3px rgba(0,0,0,0.08)' : 'none',
            }}
          >
            Haftalık
          </button>
          <button
            onClick={() => {
              setView('day')
              if (selectedDayIdx === null) setSelectedDayIdx(todayIdx >= 0 ? todayIdx : 0)
            }}
            className="px-3 py-1.5 rounded-md text-[11px] font-semibold cursor-pointer transition-all"
            style={{
              background: view === 'day' ? '#fff' : 'transparent',
              color: view === 'day' ? '#DC2626' : '#6B7280',
              boxShadow: view === 'day' ? '0 1px 3px rgba(0,0,0,0.08)' : 'none',
            }}
          >
            Günlük
          </button>
        </div>
      </div>

      {/* ===== CONTENT ===== */}
      {loading ? (
        <div className="animate-pulse bg-white h-[400px]" />
      ) : view === 'week' ? (
        /* ===== HAFTALIK GÖRÜNÜM ===== */
        <div className="overflow-x-auto -mx-4 sm:mx-0">
          <div style={{ minWidth: 700, background: '#fff' }}>
            {/* Gün header satırı */}
            <div style={{ display: 'grid', gridTemplateColumns: '36px repeat(7, 1fr)', borderBottom: '1px solid #F3F4F6' }}>
              <div />
              {weekDays.map((dayStr, i) => {
                const isTodayCol = dayStr === today
                const d = new Date(dayStr + 'T00:00:00')
                return (
                  <div
                    key={dayStr}
                    onClick={() => handleDayClick(i)}
                    className="text-center cursor-pointer"
                    style={{
                      padding: '8px 0 6px',
                      borderLeft: '1px solid #F3F4F6',
                      background: isTodayCol ? '#FFFBFB' : '#fff',
                    }}
                  >
                    <div
                      className="text-[10px] font-bold tracking-wider mb-[2px]"
                      style={{ color: isTodayCol ? '#DC2626' : '#9CA3AF' }}
                    >
                      {DAYS_SHORT[i]}
                    </div>
                    <div
                      className="inline-flex items-center justify-center w-[28px] h-[28px] rounded-full text-[14px] font-bold"
                      style={{
                        background: isTodayCol ? '#DC2626' : 'transparent',
                        color: isTodayCol ? '#fff' : '#1a1a1a',
                      }}
                    >
                      {d.getDate()}
                    </div>
                  </div>
                )
              })}
            </div>

            {/* Zaman grid'i */}
            <div className="overflow-y-auto" style={{ height: 'calc(100vh - 180px)', minHeight: 400 }}>
              <div style={{ display: 'grid', gridTemplateColumns: '36px repeat(7, 1fr)', position: 'relative' }}>
                {/* Sol saat etiketleri */}
                <div style={{ position: 'relative', height: (DAY_END - DAY_START + 1) * WEEK_HOUR_HEIGHT }}>
                  {Array.from({ length: DAY_END - DAY_START + 1 }, (_, i) => DAY_START + i).map((h) => (
                    <span
                      key={h}
                      className="absolute text-[10px] font-medium text-right w-[30px]"
                      style={{ right: 3, top: (h - DAY_START) * WEEK_HOUR_HEIGHT - 6, color: '#9CA3AF' }}
                    >
                      {fmt(h, 0)}
                    </span>
                  ))}
                </div>

                {/* 7 gün sütunu */}
                {weekDays.map((dayStr, i) => {
                  const isTodayCol = dayStr === today
                  const dayEvts = eventsForDay(dayStr)
                  const totalH = (DAY_END - DAY_START + 1) * WEEK_HOUR_HEIGHT

                  return (
                    <div
                      key={dayStr}
                      style={{
                        position: 'relative',
                        height: totalH,
                        borderLeft: '1px solid #F3F4F6',
                        background: isTodayCol ? '#FFFBFB' : '#fff',
                      }}
                    >
                      {/* Tıklanabilir saat dilimleri */}
                      {Array.from({ length: DAY_END - DAY_START + 1 }, (_, j) => DAY_START + j).map((h) => (
                        <div
                          key={h}
                          onClick={() => handleAddClick(dayStr, fmt(h, 0))}
                          className="absolute left-0 right-0 cursor-pointer hover:bg-red-50/50 transition-colors"
                          style={{ top: (h - DAY_START) * WEEK_HOUR_HEIGHT, height: WEEK_HOUR_HEIGHT, borderTop: '1px solid #F3F4F6' }}
                        />
                      ))}

                      {/* Ders kartları */}
                      {dayEvts.map((event) => {
                        const timeStr = event.extendedProps.startTime || '10:00'
                        const [sh, sm] = timeStr.split(':').map(Number)
                        const dur = event.extendedProps.duration || 60
                        const top = (sh - DAY_START) * WEEK_HOUR_HEIGHT + (sm / 60) * WEEK_HOUR_HEIGHT
                        const height = Math.max((dur / 60) * WEEK_HOUR_HEIGHT - 2, 28)
                        const isMoving = movingEvent?.id === event.id

                        return (
                          <div
                            key={event.id}
                            onTouchStart={(e) => onCardTouchStart(e, event)}
                            onTouchMove={onCardTouchMove}
                            onTouchEnd={onCardTouchEnd}
                            onClick={(e) => { e.stopPropagation(); handleEventClick(event) }}
                            className="absolute cursor-pointer"
                            style={{
                              left: 2,
                              right: 2,
                              top: top + 1,
                              height,
                              background: isMoving ? '#FECACA' : '#FEF2F2',
                              borderRadius: 4,
                              borderLeft: `3px solid ${isMoving ? '#DC2626' : '#F87171'}`,
                              padding: '2px 3px',
                              overflow: 'hidden',
                              zIndex: isMoving ? 5 : 2,
                              boxShadow: isMoving ? '0 0 0 2px #DC2626, 0 4px 12px rgba(220,38,38,0.3)' : 'none',
                              animation: isMoving ? 'pulse 1.5s ease-in-out infinite' : 'none',
                            }}
                          >
                            <div
                              className="text-[10px] font-bold leading-tight text-text-primary"
                              style={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}
                            >
                              {shortName(event.extendedProps.memberName)}
                            </div>
                            <div className="text-[9px] font-semibold" style={{ color: '#DC2626' }}>
                              {timeStr}
                            </div>
                          </div>
                        )
                      })}

                      {/* Now indicator */}
                      {isTodayCol && (() => {
                        const nowH = currentTime.getHours()
                        const nowM = currentTime.getMinutes()
                        if (nowH < DAY_START || nowH > DAY_END) return null
                        const nowTop = (nowH - DAY_START) * WEEK_HOUR_HEIGHT + (nowM / 60) * WEEK_HOUR_HEIGHT
                        return (
                          <div
                            className="absolute left-0 right-0 z-10"
                            style={{ top: nowTop, height: 2, background: '#DC2626' }}
                          />
                        )
                      })()}
                    </div>
                  )
                })}
              </div>
            </div>
          </div>
        </div>
      ) : (
        /* ===== GÜNLÜK GÖRÜNÜM ===== */
        <div style={{ background: '#fff' }}>
          {/* Gün seçici strip */}
          <div
            className="flex justify-center gap-[3px] px-1 py-2"
            style={{ background: '#fff', borderBottom: '1px solid #F3F4F6' }}
          >
            {weekDays.map((dayStr, i) => {
              const active = i === activeDayIdx
              const isTodayBtn = dayStr === today
              const d = new Date(dayStr + 'T00:00:00')

              return (
                <button
                  key={dayStr}
                  onClick={() => setSelectedDayIdx(i)}
                  className="flex flex-col items-center rounded-[10px] border-none cursor-pointer transition-all"
                  style={{
                    padding: '5px 7px',
                    background: active ? '#DC2626' : 'transparent',
                    minWidth: 38,
                  }}
                >
                  <span
                    className="text-[9px] font-bold tracking-wider mb-0.5"
                    style={{ color: active ? 'rgba(255,255,255,0.8)' : '#9CA3AF' }}
                  >
                    {DAYS_SHORT[i]}
                  </span>
                  <span
                    className="w-[26px] h-[26px] flex items-center justify-center rounded-full text-xs font-bold"
                    style={{
                      background: isTodayBtn && !active ? '#DC2626' : 'transparent',
                      color: active || isTodayBtn ? '#fff' : '#1a1a1a',
                    }}
                  >
                    {d.getDate()}
                  </span>
                </button>
              )
            })}
          </div>

          {/* Tarih label */}
          <div
            className="text-center py-2 text-[13px] font-semibold"
            style={{ color: '#374151', background: '#fff', borderBottom: '1px solid #F3F4F6' }}
          >
            {activeDayDate.getDate()} {MONTHS_TR[activeDayDate.getMonth()]} {activeDayDate.getFullYear()} — {DAYS_TR[activeDayIdx]}
          </div>

          {/* Ders ekle butonu */}
          <div className="px-3 py-2 flex justify-end" style={{ borderBottom: '1px solid #F3F4F6' }}>
            <button
              onClick={() => handleAddClick(activeDayStr)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold cursor-pointer transition-colors"
              style={{ background: 'rgba(220,38,38,0.08)', color: '#DC2626' }}
            >
              <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v12m6-6H6" />
              </svg>
              Ders Ekle
            </button>
          </div>

          {/* Timeline */}
          <div
            ref={scrollRef}
            className="overflow-y-auto"
            style={{ height: 'calc(100vh - 240px)', background: '#fff' }}
          >
            <div
              className="relative"
              style={{ height: (DAY_END - DAY_START + 1) * HOUR_HEIGHT, marginLeft: 50, marginRight: 8 }}
            >
              {/* Tıklanabilir saat dilimleri */}
              {Array.from({ length: DAY_END - DAY_START + 1 }, (_, i) => DAY_START + i).map((h) => {
                const top = (h - DAY_START) * HOUR_HEIGHT
                return (
                  <div
                    key={h}
                    onClick={() => handleAddClick(activeDayStr, fmt(h, 0))}
                    className="absolute left-0 right-0 cursor-pointer hover:bg-red-50/50 transition-colors"
                    style={{ top, height: HOUR_HEIGHT, borderTop: '1px solid #F3F4F6' }}
                  >
                    <span
                      className="absolute text-[11px] font-medium text-right w-[38px]"
                      style={{ left: -46, top: -7, color: '#9CA3AF' }}
                    >
                      {fmt(h, 0)}
                    </span>
                  </div>
                )
              })}

              {/* Ders kartları */}
              {eventsForDay(activeDayStr).map((event) => {
                if (!event.extendedProps.startTime) return null
                const [sh, sm] = event.extendedProps.startTime.split(':').map(Number)
                const dur = event.extendedProps.duration || 60
                const top = (sh - DAY_START) * HOUR_HEIGHT + (sm / 60) * HOUR_HEIGHT
                const height = (dur / 60) * HOUR_HEIGHT
                const endMin = sh * 60 + sm + dur
                const eh = Math.floor(endMin / 60)
                const em = endMin % 60
                const isMoving = movingEvent?.id === event.id

                return (
                  <div
                    key={event.id}
                    onTouchStart={(e) => onCardTouchStart(e, event)}
                    onTouchMove={onCardTouchMove}
                    onTouchEnd={onCardTouchEnd}
                    onClick={(e) => { e.stopPropagation(); handleEventClick(event) }}
                    className="absolute cursor-pointer rounded-[10px]"
                    style={{
                      left: 2,
                      right: 8,
                      top: top + 1,
                      height: height - 3,
                      background: isMoving
                        ? 'linear-gradient(135deg, #FECACA 0%, #FCA5A5 100%)'
                        : 'linear-gradient(135deg, #FEF2F2 0%, #FECACA 100%)',
                      borderLeft: `4px solid ${isMoving ? '#DC2626' : '#F87171'}`,
                      padding: '10px 14px',
                      display: 'flex',
                      flexDirection: 'column',
                      justifyContent: 'center',
                      zIndex: isMoving ? 5 : 2,
                      boxShadow: isMoving
                        ? '0 0 0 2px #DC2626, 0 4px 12px rgba(220,38,38,0.3)'
                        : '0 1px 6px rgba(0,0,0,0.04)',
                      animation: isMoving ? 'pulse 1.5s ease-in-out infinite' : 'none',
                    }}
                  >
                    <p className="text-[15px] font-bold text-text-primary mb-0.5">
                      {event.extendedProps.memberName}
                    </p>
                    <div className="flex items-center gap-1 text-xs font-medium" style={{ color: '#DC2626' }}>
                      <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#DC2626" strokeWidth="2.2" strokeLinecap="round">
                        <circle cx="12" cy="12" r="10" />
                        <polyline points="12,6 12,12 16,14" />
                      </svg>
                      {fmt(sh, sm)} – {fmt(eh, em)}
                    </div>
                    {event.extendedProps.notes && (
                      <p className="text-xs text-text-secondary mt-1 opacity-70">
                        {event.extendedProps.notes}
                      </p>
                    )}
                  </div>
                )
              })}

              {/* Now indicator */}
              {activeDayStr === today && (() => {
                const nowH = currentTime.getHours()
                const nowM = currentTime.getMinutes()
                if (nowH < DAY_START || nowH > DAY_END) return null
                const nowTop = (nowH - DAY_START) * HOUR_HEIGHT + (nowM / 60) * HOUR_HEIGHT
                return (
                  <>
                    <span
                      className="absolute text-[10px] font-bold z-[11]"
                      style={{ left: -48, top: nowTop - 7, color: '#DC2626' }}
                    >
                      {fmt(nowH, nowM)}
                    </span>
                    <div
                      className="absolute rounded-full z-[11]"
                      style={{ left: -8, top: nowTop - 4, width: 9, height: 9, background: '#DC2626' }}
                    />
                    <div
                      className="absolute z-10"
                      style={{ left: -2, right: 0, top: nowTop, height: 2, background: '#DC2626' }}
                    />
                  </>
                )
              })()}
            </div>
          </div>
        </div>
      )}

      {/* Move mode banner */}
      {movingEvent && (
        <div
          className="fixed bottom-0 left-0 right-0 z-50 flex items-center justify-between px-4 py-3 safe-area-bottom"
          style={{
            background: 'linear-gradient(135deg, #DC2626 0%, #B91C1C 100%)',
            boxShadow: '0 -4px 20px rgba(0,0,0,0.15)',
          }}
        >
          <div className="flex items-center gap-2 text-white min-w-0">
            <svg className="w-5 h-5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M7 11l5-5m0 0l5 5m-5-5v12" />
            </svg>
            <div className="min-w-0">
              <p className="text-[13px] font-bold truncate">{shortName(movingEvent.extendedProps.memberName)}</p>
              <p className="text-[11px] opacity-80">Yeni saat dilimine dokun</p>
            </div>
          </div>
          <button
            onClick={() => setMovingEvent(null)}
            className="text-white/90 text-xs font-semibold px-3 py-1.5 rounded-lg cursor-pointer"
            style={{ background: 'rgba(255,255,255,0.2)' }}
          >
            İptal
          </button>
        </div>
      )}

      {/* Modal */}
      <LessonModal
        open={modalOpen}
        mode={modalMode}
        members={members}
        event={selectedEvent}
        defaultDate={selectedDate}
        defaultTime={selectedTime}
        onClose={handleModalClose}
        onSave={handleModalSave}
      />
    </div>
  )
}
