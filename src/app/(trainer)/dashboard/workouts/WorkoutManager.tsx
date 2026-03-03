'use client'

import { useState, useCallback } from 'react'
import { createClient } from '@/lib/supabase/client'
import Card, { CardHeader, CardTitle } from '@/components/ui/Card'
import Button from '@/components/ui/Button'
import Input from '@/components/ui/Input'
import Textarea from '@/components/ui/Textarea'
import Modal from '@/components/ui/Modal'
import Badge from '@/components/ui/Badge'

const DAY_NAMES = ['Pazartesi', 'Salı', 'Çarşamba', 'Perşembe', 'Cuma', 'Cumartesi', 'Pazar']

const SECTIONS = [
  { key: 'warmup', label: 'Isınma', type: 'freetext' },
  { key: 'strength', label: 'Güç-Kuvvet', type: 'exercises' },
  { key: 'accessory', label: 'Aksesuar', type: 'exercises' },
  { key: 'cardio', label: 'Kardiyo-Metcon', type: 'freetext' },
]

interface Exercise {
  id?: string
  workout_id?: string
  order_num: number
  name: string
  sets: number | null
  reps: string | null
  weight: string | null
  rest: string | null
  notes: string | null
  superset_group: number | null
  section: string
}

interface Workout {
  id: string
  trainer_id: string
  type: string
  client_id: string | null
  week_start: string
  day_index: number
  title: string | null
  warmup_text: string | null
  cardio_text: string | null
  exercises: Exercise[]
}

interface ClientInfo {
  id: string
  full_name: string
}

interface WorkoutManagerProps {
  initialWorkouts: Workout[]
  clients: ClientInfo[]
  initialWeek: string
  trainerId: string
}

export default function WorkoutManager({ initialWorkouts, clients, initialWeek, trainerId }: WorkoutManagerProps) {
  const [workouts, setWorkouts] = useState<Workout[]>(initialWorkouts)
  const [weekStart, setWeekStart] = useState(initialWeek)
  const [selectedClient, setSelectedClient] = useState<string>('')
  const [editingDay, setEditingDay] = useState<number | null>(null)
  const [editTitle, setEditTitle] = useState('')
  const [editWarmup, setEditWarmup] = useState('')
  const [editCardio, setEditCardio] = useState('')
  const [editExercises, setEditExercises] = useState<Exercise[]>([])
  const [saving, setSaving] = useState(false)
  const [loading, setLoading] = useState(false)

  const workoutType = selectedClient ? 'client' : 'public'

  const todayIndex = (() => {
    const d = new Date().getDay()
    return d === 0 ? 6 : d - 1
  })()

  function getWeekRange() {
    const start = new Date(weekStart)
    const end = new Date(start)
    end.setDate(end.getDate() + 6)
    const format = (d: Date) => `${d.getDate()} ${['Oca','Şub','Mar','Nis','May','Haz','Tem','Ağu','Eyl','Eki','Kas','Ara'][d.getMonth()]}`
    return `${format(start)} - ${format(end)} ${end.getFullYear()}`
  }

  const fetchWorkouts = useCallback(async (week: string, clientId: string) => {
    const supabase = createClient()
    let query = supabase
      .from('workouts')
      .select('*, exercises:workout_exercises(*)')
      .eq('trainer_id', trainerId)
      .eq('week_start', week)
      .order('day_index')

    if (clientId) {
      query = query.eq('type', 'client').eq('client_id', clientId)
    } else {
      query = query.eq('type', 'public')
    }

    const { data } = await query
    return data || []
  }, [trainerId])

  async function changeWeek(direction: number) {
    setLoading(true)
    const d = new Date(weekStart)
    d.setDate(d.getDate() + direction * 7)
    const newWeek = d.toISOString().split('T')[0]
    setWeekStart(newWeek)
    const data = await fetchWorkouts(newWeek, selectedClient)
    setWorkouts(data)
    setLoading(false)
  }

  async function handleClientChange(clientId: string) {
    setSelectedClient(clientId)
    setLoading(true)
    const data = await fetchWorkouts(weekStart, clientId)
    setWorkouts(data)
    setLoading(false)
  }

  function openEditor(dayIndex: number) {
    const existing = workouts.find((w) => w.day_index === dayIndex)
    setEditingDay(dayIndex)
    setEditTitle(existing?.title || '')
    setEditWarmup(existing?.warmup_text || '')
    setEditCardio(existing?.cardio_text || '')
    setEditExercises(
      existing?.exercises
        ?.filter((e) => e.section === 'strength' || e.section === 'accessory')
        .sort((a, b) => a.order_num - b.order_num) || []
    )
  }

  function addExercise(section: string) {
    setEditExercises((prev) => [
      ...prev,
      {
        order_num: prev.length + 1,
        name: '',
        sets: 3,
        reps: '10',
        weight: null,
        rest: '60s',
        notes: null,
        superset_group: null,
        section,
      },
    ])
  }

  function updateExercise(index: number, field: string, value: unknown) {
    setEditExercises((prev) =>
      prev.map((ex, i) => (i === index ? { ...ex, [field]: value } : ex))
    )
  }

  function removeExercise(index: number) {
    setEditExercises((prev) => prev.filter((_, i) => i !== index))
  }

  async function saveDay() {
    if (editingDay === null) return
    setSaving(true)

    const supabase = createClient()
    const existing = workouts.find((w) => w.day_index === editingDay)

    if (existing) {
      // Güncelle
      await supabase
        .from('workouts')
        .update({
          title: editTitle.trim() || null,
          warmup_text: editWarmup.trim() || null,
          cardio_text: editCardio.trim() || null,
        })
        .eq('id', existing.id)

      // Eski egzersizleri sil
      await supabase.from('workout_exercises').delete().eq('workout_id', existing.id)

      // Yeni egzersizleri ekle
      if (editExercises.length > 0) {
        await supabase.from('workout_exercises').insert(
          editExercises.map((ex, i) => ({
            workout_id: existing.id,
            order_num: i + 1,
            name: ex.name,
            sets: ex.sets,
            reps: ex.reps,
            weight: ex.weight,
            rest: ex.rest,
            notes: ex.notes,
            superset_group: ex.superset_group,
            section: ex.section,
          }))
        )
      }
    } else {
      // Yeni oluştur
      const { data: newWorkout } = await supabase
        .from('workouts')
        .insert({
          trainer_id: trainerId,
          type: workoutType,
          client_id: selectedClient || null,
          week_start: weekStart,
          day_index: editingDay,
          title: editTitle.trim() || null,
          warmup_text: editWarmup.trim() || null,
          cardio_text: editCardio.trim() || null,
        })
        .select()
        .single()

      if (newWorkout && editExercises.length > 0) {
        await supabase.from('workout_exercises').insert(
          editExercises.map((ex, i) => ({
            workout_id: newWorkout.id,
            order_num: i + 1,
            name: ex.name,
            sets: ex.sets,
            reps: ex.reps,
            weight: ex.weight,
            rest: ex.rest,
            notes: ex.notes,
            superset_group: ex.superset_group,
            section: ex.section,
          }))
        )
      }
    }

    // Reload
    const reloaded = await fetchWorkouts(weekStart, selectedClient)
    setWorkouts(reloaded)
    setEditingDay(null)
    setSaving(false)
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Antrenmanlar</h1>
      </div>

      {/* Danışan seçimi */}
      <select
        value={selectedClient}
        onChange={(e) => handleClientChange(e.target.value)}
        className="w-full sm:w-64 px-3 py-2.5 rounded-xl bg-surface border border-border text-sm text-text-primary focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-colors"
      >
        <option value="">Genel Program (Tüm Danışanlar)</option>
        {clients.map((c) => (
          <option key={c.id} value={c.id}>{c.full_name}</option>
        ))}
      </select>

      {/* Hafta navigasyonu */}
      <div className="flex items-center justify-between">
        <button
          onClick={() => changeWeek(-1)}
          disabled={loading}
          className="p-2 rounded-lg hover:bg-surface-hover transition-colors cursor-pointer"
        >
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
        </button>
        <span className="text-sm font-medium text-text-primary">{getWeekRange()}</span>
        <button
          onClick={() => changeWeek(1)}
          disabled={loading}
          className="p-2 rounded-lg hover:bg-surface-hover transition-colors cursor-pointer"
        >
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
        </button>
      </div>

      {/* 7 günlük grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3">
        {DAY_NAMES.map((dayName, index) => {
          const workout = workouts.find((w) => w.day_index === index)
          const isToday = index === todayIndex && weekStart === initialWeek
          const exerciseCount = workout?.exercises?.length || 0
          const strengthCount = workout?.exercises?.filter(e => e.section === 'strength').length || 0
          const accessoryCount = workout?.exercises?.filter(e => e.section === 'accessory').length || 0
          const hasContent = !!workout

          return (
            <div
              key={index}
              onClick={() => openEditor(index)}
              className={`relative rounded-xl border p-4 cursor-pointer transition-all hover:-translate-y-0.5 hover:shadow-md ${
                isToday
                  ? 'border-primary/40 bg-primary/5 shadow-sm shadow-primary/10'
                  : hasContent
                    ? 'border-border bg-surface hover:border-primary/20'
                    : 'border-dashed border-border/70 bg-surface/50 hover:border-border hover:bg-surface'
              }`}
            >
              <div className="flex items-center justify-between mb-2">
                <span className={`text-sm font-semibold ${isToday ? 'text-primary' : 'text-text-primary'}`}>
                  {dayName}
                </span>
                {isToday && <Badge variant="primary">Bugün</Badge>}
              </div>
              {hasContent ? (
                <>
                  {workout.title && (
                    <p className="text-sm font-bold text-text-primary mb-2">{workout.title}</p>
                  )}
                  <div className="flex flex-wrap gap-1.5">
                    {workout.warmup_text && (
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-primary-50 text-primary/70 text-[10px] font-semibold uppercase tracking-wide border border-primary/10">
                        Isınma
                      </span>
                    )}
                    {strengthCount > 0 && (
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-primary/10 text-primary text-[10px] font-semibold uppercase tracking-wide border border-primary/15">
                        Güç {strengthCount}
                      </span>
                    )}
                    {accessoryCount > 0 && (
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-surface-hover text-text-secondary text-[10px] font-semibold uppercase tracking-wide border border-border">
                        Aksesuar {accessoryCount}
                      </span>
                    )}
                    {workout.cardio_text && (
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-primary-50 text-primary/70 text-[10px] font-semibold uppercase tracking-wide border border-primary/10">
                        Kardiyo
                      </span>
                    )}
                  </div>
                  <p className="text-[11px] text-text-tertiary mt-2">{exerciseCount} egzersiz</p>
                </>
              ) : (
                <div className="flex items-center gap-2 py-2">
                  <svg className="w-4 h-4 text-text-tertiary/50" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                  </svg>
                  <p className="text-xs text-text-tertiary">Tıklayarak ekle</p>
                </div>
              )}
            </div>
          )
        })}
      </div>

      {/* Düzenleme modalı */}
      <Modal
        open={editingDay !== null}
        onClose={() => setEditingDay(null)}
        title={editingDay !== null ? `${DAY_NAMES[editingDay]} Antrenmanı` : ''}
        size="lg"
      >
        <div className="space-y-4">
          <Input
            label="Antrenman Başlığı"
            value={editTitle}
            onChange={(e) => setEditTitle(e.target.value)}
            placeholder="örn. Göğüs & Triceps"
          />

          {/* Isınma */}
          <div className="rounded-lg bg-primary-50 border border-primary/10 p-3">
            <label className="text-sm font-bold text-primary/70 mb-2 block">Isınma</label>
            <Textarea
              value={editWarmup}
              onChange={(e) => setEditWarmup(e.target.value)}
              placeholder="Isınma hareketlerini yazın..."
              className="min-h-[60px]"
            />
          </div>

          {/* Güç egzersizleri */}
          <div className="rounded-lg bg-primary/5 border border-primary/15 p-3">
            <div className="flex items-center justify-between mb-2">
              <label className="text-sm font-bold text-primary">Güç-Kuvvet</label>
              <button
                type="button"
                onClick={() => addExercise('strength')}
                className="text-xs text-primary font-semibold cursor-pointer hover:underline"
              >
                + Ekle
              </button>
            </div>
            {editExercises
              .map((ex, originalIndex) => ({ ex, originalIndex }))
              .filter(({ ex }) => ex.section === 'strength')
              .map(({ ex, originalIndex }) => (
                <div key={originalIndex} className="flex gap-2 mb-2 items-end">
                  <Input
                    placeholder="Egzersiz adı"
                    value={ex.name}
                    onChange={(e) => updateExercise(originalIndex, 'name', e.target.value)}
                    className="flex-1"
                  />
                  <Input
                    placeholder="Set"
                    type="number"
                    value={ex.sets?.toString() || ''}
                    onChange={(e) => updateExercise(originalIndex, 'sets', Number(e.target.value) || null)}
                    className="w-16"
                  />
                  <Input
                    placeholder="Tekrar"
                    value={ex.reps || ''}
                    onChange={(e) => updateExercise(originalIndex, 'reps', e.target.value)}
                    className="w-20"
                  />
                  <button
                    type="button"
                    onClick={() => removeExercise(originalIndex)}
                    className="p-2 text-text-tertiary hover:text-danger cursor-pointer"
                  >
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
              ))}
          </div>

          {/* Aksesuar egzersizleri */}
          <div className="rounded-lg bg-surface-hover border border-border p-3">
            <div className="flex items-center justify-between mb-2">
              <label className="text-sm font-bold text-text-primary">Aksesuar</label>
              <button
                type="button"
                onClick={() => addExercise('accessory')}
                className="text-xs text-primary font-semibold cursor-pointer hover:underline"
              >
                + Ekle
              </button>
            </div>
            {editExercises
              .map((ex, originalIndex) => ({ ex, originalIndex }))
              .filter(({ ex }) => ex.section === 'accessory')
              .map(({ ex, originalIndex }) => (
                <div key={originalIndex} className="flex gap-2 mb-2 items-end">
                  <Input
                    placeholder="Egzersiz adı"
                    value={ex.name}
                    onChange={(e) => updateExercise(originalIndex, 'name', e.target.value)}
                    className="flex-1"
                  />
                  <Input
                    placeholder="Set"
                    type="number"
                    value={ex.sets?.toString() || ''}
                    onChange={(e) => updateExercise(originalIndex, 'sets', Number(e.target.value) || null)}
                    className="w-16"
                  />
                  <Input
                    placeholder="Tekrar"
                    value={ex.reps || ''}
                    onChange={(e) => updateExercise(originalIndex, 'reps', e.target.value)}
                    className="w-20"
                  />
                  <button
                    type="button"
                    onClick={() => removeExercise(originalIndex)}
                    className="p-2 text-text-tertiary hover:text-danger cursor-pointer"
                  >
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
              ))}
          </div>

          {/* Kardiyo */}
          <div className="rounded-lg bg-primary-50 border border-primary/10 p-3">
            <label className="text-sm font-bold text-primary/70 mb-2 block">Kardiyo / Metcon</label>
            <Textarea
              value={editCardio}
              onChange={(e) => setEditCardio(e.target.value)}
              placeholder="Kardiyo programını yazın..."
              className="min-h-[60px]"
            />
          </div>

          <div className="flex gap-3 pt-2">
            <Button variant="secondary" onClick={() => setEditingDay(null)}>
              İptal
            </Button>
            <Button onClick={saveDay} loading={saving}>
              Kaydet
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  )
}
