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
  clientId: string
  clientName: string
  date: string
  startTime: string
  oldDate?: string
  oldStartTime?: string
  duration: number
}

function notifyLessonChange(changes: LessonChange[]) {
  fetch('/api/calendar-notify', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ changes }),
  }).catch(() => {})
}

interface Client {
  packageId: string
  clientId: string
  fullName: string
  totalLessons: number
  usedLessons: number
}

interface LessonModalProps {
  open: boolean
  mode: 'create' | 'edit'
  clients: Client[]
  trainerId: string
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
  clients,
  trainerId,
  event,
  defaultDate,
  defaultTime,
  onClose,
  onSave,
}: LessonModalProps) {
  const [clientId, setClientId] = useState('')
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
      setClientId(event.extendedProps.clientId)
      setDate(event.extendedProps.date)
      setTime(event.extendedProps.startTime || '10:00')
      setDuration(String(event.extendedProps.duration))
      setNotes(event.extendedProps.notes || '')
    } else {
      setClientId('')
      setDate(defaultDate || new Date().toISOString().split('T')[0])
      setTime(defaultTime || '10:00')
      setDuration('60')
      setNotes('')
    }
  }, [open, mode, event, defaultDate, defaultTime])

  const selectedClient = clients.find((c) => c.clientId === clientId)

  async function handleSave() {
    setSaving(true)
    setError('')

    const supabase = createClient()

    if (mode === 'create') {
      if (!clientId) {
        setError('Lütfen bir danışan seçin')
        setSaving(false)
        return
      }

      const client = clients.find((c) => c.clientId === clientId)
      if (!client) {
        setError('Danışan bulunamadı')
        setSaving(false)
        return
      }

      // Duplicate kontrol
      const { count } = await supabase
        .from('lessons')
        .select('*', { count: 'exact', head: true })
        .eq('client_id', clientId)
        .eq('date', date)

      if (count && count > 0) {
        setError('Bu danışana bu tarihte zaten ders eklenmiş')
        setSaving(false)
        return
      }

      const { error: insertError } = await supabase.from('lessons').insert({
        trainer_id: trainerId,
        package_id: client.packageId,
        client_id: clientId,
        date,
        start_time: time,
        duration: Number(duration),
        notes: notes || null,
      })

      if (insertError) {
        if (insertError.code === '23505') {
          setError('Bu danışana bu tarihte zaten ders eklenmiş')
        } else {
          setError(insertError.message)
        }
        setSaving(false)
        return
      }

      setSaving(false)
      const change: LessonChange = {
        type: 'create',
        clientId,
        clientName: client.fullName,
        date,
        startTime: time,
        duration: Number(duration),
      }
      notifyLessonChange([change])
      onSave(change)
    } else {
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
      const change: LessonChange = {
        type: 'update',
        clientId: event.extendedProps.clientId,
        clientName: event.extendedProps.clientName,
        date,
        startTime: time,
        oldDate: event.extendedProps.date,
        oldStartTime: event.extendedProps.startTime ?? undefined,
        duration: Number(duration),
      }
      notifyLessonChange([change])
      onSave(change)
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
    const change: LessonChange = {
      type: 'delete',
      clientId: event.extendedProps.clientId,
      clientName: event.extendedProps.clientName,
      date: event.extendedProps.date,
      startTime: event.extendedProps.startTime || '10:00',
      duration: event.extendedProps.duration || 60,
    }
    notifyLessonChange([change])
    onSave(change)
  }

  const clientOptions = [
    { value: '', label: 'Danışan seçin...' },
    ...clients.map((c) => ({
      value: c.clientId,
      label: `${c.fullName} (${c.usedLessons}/${c.totalLessons})`,
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
            label="Danışan"
            options={clientOptions}
            value={clientId}
            onChange={(e) => setClientId(e.target.value)}
          />
        ) : (
          <div className="text-sm">
            <span className="text-text-secondary">Danışan: </span>
            <span className="font-medium text-text-primary">
              {event?.extendedProps.clientName}
            </span>
          </div>
        )}

        {selectedClient && mode === 'create' && (
          <div className="text-sm text-text-secondary bg-surface-hover rounded-lg p-3">
            Kalan ders: <span className="text-text-primary font-medium">
              {selectedClient.totalLessons - selectedClient.usedLessons}
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
