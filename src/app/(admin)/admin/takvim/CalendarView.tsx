'use client'

import { useRef, useEffect } from 'react'
import FullCalendar from '@fullcalendar/react'
import timeGridPlugin from '@fullcalendar/timegrid'
import interactionPlugin from '@fullcalendar/interaction'
import type { CalendarEvent } from './CalendarClient'

interface CalendarViewProps {
  events: CalendarEvent[]
  currentMonday: string
  onDateClick: (date: string, time: string) => void
  onEventClick: (event: CalendarEvent) => void
  onEventDrop: (eventId: string, newDate: string, newTime: string) => void
}

export default function CalendarView({
  events,
  currentMonday,
  onDateClick,
  onEventClick,
  onEventDrop,
}: CalendarViewProps) {
  const calendarRef = useRef<FullCalendar>(null)

  useEffect(() => {
    const api = calendarRef.current?.getApi()
    if (api) {
      api.gotoDate(currentMonday)
    }
  }, [currentMonday])

  return (
    <div className="fc-wrapper bg-surface border border-border rounded-xl overflow-x-auto -mx-4 sm:mx-0">
      <div style={{ minWidth: 750 }}>
        <FullCalendar
          ref={calendarRef}
          plugins={[timeGridPlugin, interactionPlugin]}
          initialView="timeGridWeek"
          initialDate={currentMonday}
          locale="tr"
          firstDay={1}
          headerToolbar={false}
          slotMinTime="07:00:00"
          slotMaxTime="22:00:00"
          allDaySlot={false}
          editable={true}
          selectable={true}
          selectMirror={true}
          nowIndicator={true}
          slotDuration="00:30:00"
          slotLabelInterval="01:00:00"
          slotLabelFormat={{ hour: '2-digit', minute: '2-digit', hour12: false }}
          eventTimeFormat={{ hour: '2-digit', minute: '2-digit', hour12: false }}
          dayHeaderFormat={{ weekday: 'short', day: 'numeric' }}
          height="auto"
          contentHeight={700}
          expandRows={true}
          events={events}
          eventContent={(arg) => {
            const time = arg.timeText
            const title = arg.event.title
            return (
              <div className="fc-event-inner">
                <div className="fc-event-name">{title}</div>
                <div className="fc-event-time">{time}</div>
              </div>
            )
          }}
          dateClick={(info) => {
            const dateStr = info.dateStr.split('T')[0]
            const timeStr = info.dateStr.includes('T')
              ? info.dateStr.split('T')[1].slice(0, 5)
              : '10:00'
            onDateClick(dateStr, timeStr)
          }}
          eventClick={(info) => {
            const event = events.find((e) => e.id === info.event.id)
            if (event) onEventClick(event)
          }}
          eventDrop={(info) => {
            const newStart = info.event.start
            if (!newStart) return
            const y = newStart.getFullYear()
            const m = String(newStart.getMonth() + 1).padStart(2, '0')
            const d = String(newStart.getDate()).padStart(2, '0')
            const h = String(newStart.getHours()).padStart(2, '0')
            const min = String(newStart.getMinutes()).padStart(2, '0')
            onEventDrop(info.event.id, `${y}-${m}-${d}`, `${h}:${min}`)
          }}
        />
      </div>
    </div>
  )
}
