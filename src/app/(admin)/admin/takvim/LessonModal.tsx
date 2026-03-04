'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import Modal from '@/components/ui/Modal'
import Button from '@/components/ui/Button'
import Input from '@/components/ui/Input'
import Select from '@/components/ui/Select'
import type { CalendarEvent } from './CalendarClient'

export interface LessonChange {
  type: 'create' | 'update' | 'delete'
  userId: string
  memberName: string
  date: string
  startTime: string
  oldDate?: string
  oldStartTime?: string
  duration: number
}

interface Member {
  packageId: string
  userId: string
  fullName: string
  totalLessons: number
  usedLessons: number
}

interface LessonModalProps {
  open: boolean
  mode: 'create' | 'edit'
  members: Member[]
  event: CalendarEvent | null
  defaultDate: string
  defaultTime: string
  onClose: () => void
  onSave: (change: LessonChange) => void
}

const DURATION_OPTIONS = [
  { value: '30', label: '30 dakika' },
  { value: '45', label: '45 dakika' },
  { value: '60', label: '60 dakika' },
  { value: '90', label: '90 dakika' },
]

export default function LessonModal({
  open,
  mode,
  members,
  event,
  defaultDate,
  defaultTime,
  onClose,
  onSave,
}: LessonModalProps) {
  const [memberId, setMemberId] = useState('')
  const [date, setDate] = useState('')
  const [time, setTime] = useState('10:00')
  const [duration, setDuration] = useState('60')
  const [notes, setNotes] = useState('')
  const [saving, setSaving] = useState(false)
  const [deleting, setDeleting] = useState(false)
  const [error, setError] = useState('')
  const [confirmDelete, setConfirmDelete] = useState(false)

  useEffect(() => {
    if (!open) {
      setError('')
      setConfirmDelete(false)
      return
    }

    if (mode === 'edit' && event) {
      setMemberId(event.extendedProps.userId)
      setDate(event.extendedProps.date)
      setTime(event.extendedProps.startTime || '10:00')
      setDuration(String(event.extendedProps.duration))
      setNotes(event.extendedProps.notes || '')
    } else {
      setMemberId('')
      setDate(defaultDate || new Date().toISOString().split('T')[0])
      setTime(defaultTime || '10:00')
      setDuration('60')
      setNotes('')
    }
  }, [open, mode, event, defaultDate, defaultTime])

  const selectedMember = members.find((m) => m.userId === memberId)

  async function handleSave() {
    setSaving(true)
    setError('')

    const supabase = createClient()

    if (mode === 'create') {
      if (!memberId) {
        setError('Lütfen bir üye seçin')
        setSaving(false)
        return
      }

      const member = members.find((m) => m.userId === memberId)
      if (!member) {
        setError('Üye bulunamadı')
        setSaving(false)
        return
      }

      // Duplicate kontrol
      const { count } = await supabase
        .from('lessons')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', memberId)
        .eq('date', date)

      if (count && count > 0) {
        setError('Bu üyeye bu tarihte zaten ders eklenmiş')
        setSaving(false)
        return
      }

      const { error: insertError } = await supabase.from('lessons').insert({
        package_id: member.packageId,
        user_id: memberId,
        date,
        start_time: time,
        duration: Number(duration),
        notes: notes || null,
      })

      if (insertError) {
        if (insertError.code === '23505') {
          setError('Bu üyeye bu tarihte zaten ders eklenmiş')
        } else {
          setError(insertError.message)
        }
        setSaving(false)
        return
      }

      setSaving(false)
      onSave({
        type: 'create',
        userId: memberId,
        memberName: member.fullName,
        date,
        startTime: time,
        duration: Number(duration),
      })
    } else {
      // Edit mode
      if (!event) {
        setSaving(false)
        return
      }

      const { error: updateError } = await supabase
        .from('lessons')
        .update({
          date,
          start_time: time,
          duration: Number(duration),
          notes: notes || null,
        })
        .eq('id', event.extendedProps.lessonId)

      if (updateError) {
        setError(updateError.message)
        setSaving(false)
        return
      }

      setSaving(false)
      onSave({
        type: 'update',
        userId: event.extendedProps.userId,
        memberName: event.extendedProps.memberName,
        date,
        startTime: time,
        oldDate: event.extendedProps.date,
        oldStartTime: event.extendedProps.startTime || undefined,
        duration: Number(duration),
      })
    }
  }

  async function handleDelete() {
    if (!confirmDelete) {
      setConfirmDelete(true)
      return
    }

    if (!event) return
    setDeleting(true)
    setError('')

    const supabase = createClient()
    const { error: deleteError } = await supabase
      .from('lessons')
      .delete()
      .eq('id', event.extendedProps.lessonId)

    if (deleteError) {
      setError(deleteError.message)
      setDeleting(false)
      return
    }

    setDeleting(false)
    onSave({
      type: 'delete',
      userId: event.extendedProps.userId,
      memberName: event.extendedProps.memberName,
      date: event.extendedProps.date,
      startTime: event.extendedProps.startTime || '10:00',
      duration: event.extendedProps.duration || 60,
    })
  }

  const memberOptions = [
    { value: '', label: 'Üye seçin...' },
    ...members.map((m) => ({
      value: m.userId,
      label: `${m.fullName} (${m.usedLessons}/${m.totalLessons})`,
    })),
  ]

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={mode === 'create' ? 'Ders Ekle' : 'Ders Düzenle'}
      size="sm"
    >
      <div className="space-y-4">
        {mode === 'create' ? (
          <Select
            label="Üye"
            options={memberOptions}
            value={memberId}
            onChange={(e) => setMemberId(e.target.value)}
          />
        ) : (
          <div className="text-sm">
            <span className="text-text-secondary">Üye: </span>
            <span className="font-medium text-text-primary">
              {event?.extendedProps.memberName}
            </span>
          </div>
        )}

        {selectedMember && mode === 'create' && (
          <div className="text-sm text-text-secondary bg-surface-hover rounded-lg p-3">
            Kalan ders: <span className="text-text-primary font-medium">
              {selectedMember.totalLessons - selectedMember.usedLessons}
            </span>
          </div>
        )}

        <Input
          label="Tarih"
          type="date"
          value={date}
          onChange={(e) => setDate(e.target.value)}
        />

        <Input
          label="Saat"
          type="time"
          value={time}
          onChange={(e) => setTime(e.target.value)}
        />

        <Select
          label="Süre"
          options={DURATION_OPTIONS}
          value={duration}
          onChange={(e) => setDuration(e.target.value)}
        />

        <Input
          label="Not (opsiyonel)"
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          placeholder="Ders hakkında notlar..."
        />

        {error && <p className="text-sm text-danger">{error}</p>}

        <div className="flex gap-3">
          <Button
            onClick={handleSave}
            loading={saving}
            className="flex-1"
          >
            {mode === 'create' ? 'Ders Ekle' : 'Kaydet'}
          </Button>

          {mode === 'edit' && (
            <Button
              variant="danger"
              onClick={handleDelete}
              loading={deleting}
            >
              {confirmDelete ? 'Emin misin?' : 'Sil'}
            </Button>
          )}
        </div>
      </div>
    </Modal>
  )
}
