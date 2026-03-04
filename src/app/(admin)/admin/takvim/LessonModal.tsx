'use client'

import type { CalendarEvent } from './CalendarClient'

interface LessonModalProps {
  open: boolean
  mode: 'create' | 'edit'
  members: Array<{ packageId: string; userId: string; fullName: string; totalLessons: number; usedLessons: number }>
  event: CalendarEvent | null
  defaultDate: string
  defaultTime: string
  onClose: () => void
  onSave: () => void
}

export default function LessonModal({ open }: LessonModalProps) {
  if (!open) return null
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div className="bg-white rounded-xl p-6 max-w-md w-full mx-4">
        <p className="text-text-secondary text-center">Ders modal — yakında</p>
      </div>
    </div>
  )
}
