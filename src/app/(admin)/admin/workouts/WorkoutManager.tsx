'use client'

import { useState, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import Card from '@/components/ui/Card'
import Button from '@/components/ui/Button'
import Input from '@/components/ui/Input'
import Textarea from '@/components/ui/Textarea'
import Modal from '@/components/ui/Modal'
import Select from '@/components/ui/Select'
import ExerciseAutocomplete from '@/components/ui/ExerciseAutocomplete'
import { getDayName, formatWeekRange, getAdjacentWeek, getMonday, getTodayDayIndex } from '@/lib/utils'
import type { Workout, WorkoutExercise, WorkoutSection, User } from '@/lib/types'
import { WORKOUT_SECTIONS } from '@/lib/types'

interface ExerciseForm {
  name: string
  sets: string
  reps: string
  weight: string
  rest: string
  notes: string
  superset_group: string
  section: WorkoutSection
}

const emptyExercise = (section: WorkoutSection = 'strength'): ExerciseForm => ({
  name: '', sets: '', reps: '', weight: '', rest: '', notes: '', superset_group: '', section,
})

interface Props {
  initialWorkouts: Workout[]
  members: User[]
  initialWeek: string
}

export default function WorkoutManager({ initialWorkouts, members, initialWeek }: Props) {
  const router = useRouter()
  const supabase = createClient()

  const [tab, setTab] = useState<'public' | 'member'>('public')
  const [weekStart, setWeekStart] = useState(initialWeek)
  const [workouts, setWorkouts] = useState<Workout[]>(initialWorkouts)
  const [loading, setLoading] = useState(false)

  // Üye programları
  const [selectedMemberId, setSelectedMemberId] = useState('')
  const [memberWorkouts, setMemberWorkouts] = useState<Workout[]>([])

  // Modal
  const [modalOpen, setModalOpen] = useState(false)
  const [editingDay, setEditingDay] = useState<number>(0)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  // Form
  const [title, setTitle] = useState('')
  const [content, setContent] = useState('')
  const [warmupText, setWarmupText] = useState('')
  const [cardioText, setCardioText] = useState('')
  const [exercises, setExercises] = useState<ExerciseForm[]>([emptyExercise()])
  const [editingWorkoutId, setEditingWorkoutId] = useState<string | null>(null)
  const [openSections, setOpenSections] = useState<Set<string>>(new Set(['strength']))

  const currentMonday = getMonday()
  const isCurrentWeek = weekStart === currentMonday
  const todayIndex = getTodayDayIndex()

  // Hafta değiştir
  const changeWeek = useCallback(async (newWeek: string) => {
    setWeekStart(newWeek)
    setLoading(true)
    const type = tab === 'public' ? 'public' : 'member'
    let query = supabase
      .from('workouts')
      .select('*, exercises:workout_exercises(*)')
      .eq('type', type)
      .eq('week_start', newWeek)
      .order('day_index')

    if (type === 'member' && selectedMemberId) {
      query = query.eq('user_id', selectedMemberId)
    }

    const { data } = await query
    if (tab === 'public') {
      setWorkouts(data || [])
    } else {
      setMemberWorkouts(data || [])
    }
    setLoading(false)
  }, [tab, selectedMemberId, supabase])

  // Üye seç
  async function handleMemberSelect(memberId: string) {
    setSelectedMemberId(memberId)
    if (!memberId) { setMemberWorkouts([]); return }
    setLoading(true)
    const { data } = await supabase
      .from('workouts')
      .select('*, exercises:workout_exercises(*)')
      .eq('type', 'member')
      .eq('user_id', memberId)
      .eq('week_start', weekStart)
      .order('day_index')
    setMemberWorkouts(data || [])
    setLoading(false)
  }

  // Tab değiştir
  async function handleTabChange(newTab: 'public' | 'member') {
    setTab(newTab)
    if (newTab === 'public') {
      setLoading(true)
      const { data } = await supabase
        .from('workouts')
        .select('*, exercises:workout_exercises(*)')
        .eq('type', 'public')
        .eq('week_start', weekStart)
        .order('day_index')
      setWorkouts(data || [])
      setLoading(false)
    } else {
      if (selectedMemberId) {
        handleMemberSelect(selectedMemberId)
      }
    }
  }

  // Kart tıklama → modal aç
  function openWorkoutModal(dayIndex: number) {
    const list = tab === 'public' ? workouts : memberWorkouts
    const existing = list.find(w => w.day_index === dayIndex)

    setEditingDay(dayIndex)
    setError('')

    if (existing) {
      setEditingWorkoutId(existing.id)
      setTitle(existing.title)
      setContent(existing.content || '')
      setWarmupText(existing.warmup_text || '')
      setCardioText(existing.cardio_text || '')
      const mapped = existing.exercises && existing.exercises.length > 0
        ? existing.exercises
            .sort((a, b) => a.order_num - b.order_num)
            .map(e => ({
              name: e.name,
              sets: e.sets?.toString() || '',
              reps: e.reps || '',
              weight: e.weight || '',
              rest: e.rest || '',
              notes: e.notes || '',
              superset_group: e.superset_group?.toString() || '',
              section: (e.section || 'strength') as WorkoutSection,
            }))
        : [emptyExercise()]
      setExercises(mapped)
      // Egzersiz olan bölümleri aç + içeriği dolu olan serbest metin bölümleri
      const usedSections = new Set(mapped.filter(e => e.name.trim()).map(e => e.section))
      if (existing.warmup_text) usedSections.add('warmup')
      if (existing.cardio_text) usedSections.add('cardio')
      if (usedSections.size === 0) usedSections.add('strength')
      setOpenSections(usedSections)
    } else {
      setEditingWorkoutId(null)
      setTitle('')
      setContent('')
      setWarmupText('')
      setCardioText('')
      setExercises([emptyExercise()])
      setOpenSections(new Set(['strength']))
    }
    setModalOpen(true)
  }

  // Egzersiz satırı işlemleri
  function updateExercise(idx: number, field: keyof ExerciseForm, value: string) {
    setExercises(prev => prev.map((e, i) => i === idx ? { ...e, [field]: value } : e))
  }
  function addExercise(section: WorkoutSection = 'strength') {
    setExercises(prev => [...prev, emptyExercise(section)])
  }
  function removeExercise(idx: number) {
    setExercises(prev => {
      if (prev.length <= 1) return prev
      const removing = prev[idx]
      // Süper set egzersizini siliyorsak, grubun diğer üyelerini de kontrol et
      if (removing.superset_group) {
        const remaining = prev.filter((_, i) => i !== idx)
        const sameGroup = remaining.filter(e => e.superset_group === removing.superset_group)
        // Grupta tek eleman kaldıysa grup numarasını kaldır
        if (sameGroup.length === 1) {
          return remaining.map(e => e.superset_group === removing.superset_group ? { ...e, superset_group: '' } : e)
        }
        return remaining
      }
      return prev.filter((_, i) => i !== idx)
    })
  }
  function addSuperset(idx: number) {
    setExercises(prev => {
      const current = prev[idx]
      const groups = prev.map(e => e.superset_group ? parseInt(e.superset_group) : 0)
      const groupNum = current.superset_group || (Math.max(...groups, 0) + 1).toString()
      const updated = prev.map((e, i) => i === idx ? { ...e, superset_group: groupNum } : e)
      // Yeni egzersizi hemen arkasına ekle
      const newExercise = { ...emptyExercise(current.section), superset_group: groupNum }
      updated.splice(idx + 1, 0, newExercise)
      return updated
    })
  }

  // Kaydet
  async function handleSave() {
    if (!title.trim()) { setError('Başlık gerekli'); return }
    setSaving(true)
    setError('')

    const workoutData = {
      type: tab,
      user_id: tab === 'member' ? selectedMemberId : null,
      week_start: weekStart,
      day_index: editingDay,
      title: title.trim(),
      content: content.trim() || null,
      warmup_text: warmupText.trim() || null,
      cardio_text: cardioText.trim() || null,
    }

    let workoutId = editingWorkoutId

    if (workoutId) {
      // Güncelle
      const { error: updateErr } = await supabase
        .from('workouts')
        .update(workoutData)
        .eq('id', workoutId)
      if (updateErr) { setError(updateErr.message); setSaving(false); return }

      // Mevcut egzersizleri sil
      await supabase.from('workout_exercises').delete().eq('workout_id', workoutId)
    } else {
      // Yeni oluştur
      const { data: newWorkout, error: insertErr } = await supabase
        .from('workouts')
        .insert(workoutData)
        .select('id')
        .single()
      if (insertErr || !newWorkout) { setError(insertErr?.message || 'Hata oluştu'); setSaving(false); return }
      workoutId = newWorkout.id
    }

    // Egzersizleri ekle
    const validExercises = exercises.filter(e => e.name.trim())
    if (validExercises.length > 0) {
      const { error: exErr } = await supabase.from('workout_exercises').insert(
        validExercises.map((e, i) => ({
          workout_id: workoutId,
          order_num: i,
          name: e.name.trim(),
          sets: e.sets ? parseInt(e.sets) : null,
          reps: e.reps.trim() || null,
          weight: e.weight.trim() || null,
          rest: e.rest.trim() || null,
          notes: e.notes.trim() || null,
          superset_group: e.superset_group ? parseInt(e.superset_group) : null,
          section: e.section,
        }))
      )
      if (exErr) { setError(exErr.message); setSaving(false); return }
    }

    setSaving(false)
    setModalOpen(false)

    // Listeyi yenile
    const type = tab
    let query = supabase
      .from('workouts')
      .select('*, exercises:workout_exercises(*)')
      .eq('type', type)
      .eq('week_start', weekStart)
      .order('day_index')
    if (type === 'member' && selectedMemberId) {
      query = query.eq('user_id', selectedMemberId)
    }
    const { data } = await query
    if (type === 'public') setWorkouts(data || [])
    else setMemberWorkouts(data || [])
  }

  // Sil
  async function handleDelete() {
    if (!editingWorkoutId) return
    setSaving(true)
    await supabase.from('workouts').delete().eq('id', editingWorkoutId)
    setSaving(false)
    setModalOpen(false)

    // Listeyi yenile
    if (tab === 'public') {
      setWorkouts(prev => prev.filter(w => w.id !== editingWorkoutId))
    } else {
      setMemberWorkouts(prev => prev.filter(w => w.id !== editingWorkoutId))
    }
  }

  // Bildirim gönder
  async function sendProgramNotification() {
    if (!selectedMemberId) return
    const member = members.find(m => m.id === selectedMemberId)
    if (!member) return

    await supabase.from('notifications').insert({
      user_id: selectedMemberId,
      type: 'manual',
      title: 'Programın Hazır!',
      message: `Bu haftanın antrenman programın hazırlandı. Dashboard'dan kontrol edebilirsin.`,
    })

    // Push notification
    const { sendManualPush } = await import('../notifications/actions')
    await sendManualPush([selectedMemberId], 'Programın Hazır!', 'Bu haftanın antrenman programın hazırlandı.')

    alert('Bildirim gönderildi!')
  }

  // Haftayı kopyala
  async function copyWeekToNext() {
    const sourceWorkouts = tab === 'public' ? workouts : memberWorkouts
    if (sourceWorkouts.length === 0) return

    const nextWeek = getAdjacentWeek(weekStart, 1)
    setSaving(true)

    for (const w of sourceWorkouts) {
      const { data: newWorkout } = await supabase
        .from('workouts')
        .upsert({
          type: w.type,
          user_id: w.user_id,
          week_start: nextWeek,
          day_index: w.day_index,
          title: w.title,
          content: w.content,
          warmup_text: w.warmup_text,
          cardio_text: w.cardio_text,
        }, { onConflict: 'week_start,day_index', ignoreDuplicates: false })
        .select('id')
        .single()

      if (newWorkout && w.exercises && w.exercises.length > 0) {
        await supabase.from('workout_exercises').delete().eq('workout_id', newWorkout.id)
        await supabase.from('workout_exercises').insert(
          w.exercises.map((e, i) => ({
            workout_id: newWorkout.id,
            order_num: i,
            name: e.name,
            sets: e.sets,
            reps: e.reps,
            weight: e.weight,
            rest: e.rest,
            notes: e.notes,
            superset_group: e.superset_group,
            section: e.section,
          }))
        )
      }
    }

    setSaving(false)
    alert(`Program sonraki haftaya (${formatWeekRange(nextWeek)}) kopyalandı!`)
  }

  const activeWorkouts = tab === 'public' ? workouts : memberWorkouts

  return (
    <div className="space-y-6">
      {/* Başlık */}
      <div className="flex items-center justify-between">
        <h1 className="text-2xl heading-display">Antrenmanlar</h1>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 bg-background rounded-lg p-1">
        <button
          onClick={() => handleTabChange('public')}
          className={`flex-1 py-2.5 px-4 rounded-md text-sm font-medium transition-colors cursor-pointer ${
            tab === 'public' ? 'bg-primary text-white' : 'text-text-secondary hover:text-text-primary'
          }`}
        >
          Haftalık Program
        </button>
        <button
          onClick={() => handleTabChange('member')}
          className={`flex-1 py-2.5 px-4 rounded-md text-sm font-medium transition-colors cursor-pointer ${
            tab === 'member' ? 'bg-primary text-white' : 'text-text-secondary hover:text-text-primary'
          }`}
        >
          Üye Programları
        </button>
      </div>

      {/* Üye seçici (member tab) */}
      {tab === 'member' && (
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="flex-1">
            <Select
              value={selectedMemberId}
              onChange={(e) => handleMemberSelect(e.target.value)}
              options={[
                { value: '', label: 'Üye seçin...' },
                ...members.map(m => ({ value: m.id, label: m.full_name })),
              ]}
            />
          </div>
          {selectedMemberId && memberWorkouts.length > 0 && (
            <Button onClick={sendProgramNotification} variant="secondary">
              Bildirim Gönder
            </Button>
          )}
        </div>
      )}

      {/* Hafta gezinme */}
      <div className="flex items-center justify-between">
        <button
          onClick={() => changeWeek(getAdjacentWeek(weekStart, -1))}
          className="p-3 rounded-lg hover:bg-surface-hover transition-colors cursor-pointer text-text-secondary hover:text-text-primary"
        >
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
        </button>
        <div className="text-center">
          <div className="text-lg font-semibold">{formatWeekRange(weekStart)}</div>
          {isCurrentWeek && <div className="text-xs text-primary font-medium">Bu Hafta</div>}
        </div>
        <button
          onClick={() => changeWeek(getAdjacentWeek(weekStart, 1))}
          className="p-3 rounded-lg hover:bg-surface-hover transition-colors cursor-pointer text-text-secondary hover:text-text-primary"
        >
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
        </button>
      </div>

      {/* 7 gün grid */}
      {loading ? (
        <div className="text-center py-12 text-text-secondary">Yükleniyor...</div>
      ) : (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3">
            {Array.from({ length: 7 }, (_, i) => {
              const workout = activeWorkouts.find(w => w.day_index === i)
              const isToday = isCurrentWeek && i === todayIndex
              const isSunday = i === 6

              return (
                <button
                  key={i}
                  onClick={() => {
                    if (tab === 'member' && !selectedMemberId) return
                    openWorkoutModal(i)
                  }}
                  disabled={tab === 'member' && !selectedMemberId}
                  className={`text-left p-4 rounded-xl border transition-all cursor-pointer min-h-[120px] flex flex-col disabled:opacity-40 disabled:cursor-not-allowed ${
                    isToday
                      ? 'border-primary/50 bg-primary/5 hover:bg-primary/10'
                      : workout
                        ? 'border-border bg-surface hover:bg-surface-hover'
                        : 'border-border/50 bg-surface/50 hover:bg-surface hover:border-border'
                  }`}
                >
                  <div className="flex items-center justify-between mb-2">
                    <span className={`text-xs font-semibold uppercase tracking-wider ${
                      isToday ? 'text-primary' : 'text-text-secondary'
                    }`}>
                      {getDayName(i)}
                    </span>
                    {isToday && (
                      <span className="text-[10px] bg-primary/20 text-primary px-1.5 py-0.5 rounded font-medium">
                        BUGÜN
                      </span>
                    )}
                  </div>

                  {workout ? (
                    <>
                      <h3 className="font-semibold text-sm text-text-primary mb-1">{workout.title}</h3>
                      {workout.exercises && workout.exercises.length > 0 && (
                        <p className="text-xs text-text-secondary">
                          {workout.exercises.length} egzersiz
                        </p>
                      )}
                      {workout.content && !workout.exercises?.length && (
                        <p className="text-xs text-text-secondary line-clamp-2">{workout.content}</p>
                      )}
                    </>
                  ) : (
                    <div className="flex-1 flex items-center justify-center">
                      <svg className="w-8 h-8 text-border" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 6v12m6-6H6" />
                      </svg>
                    </div>
                  )}
                </button>
              )
            })}
          </div>

          {/* Haftayı kopyala */}
          {activeWorkouts.length > 0 && (
            <div className="flex justify-end">
              <Button variant="secondary" onClick={copyWeekToNext} disabled={saving}>
                {saving ? 'Kopyalanıyor...' : 'Sonraki Haftaya Kopyala'}
              </Button>
            </div>
          )}
        </>
      )}

      {/* Antrenman Düzenleme Modal */}
      <Modal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        title={`${getDayName(editingDay)} — Antrenman`}
        size="lg"
      >
        <div className="space-y-5">
          {error && (
            <div className="text-sm text-red-400 bg-red-500/10 border border-red-500/20 rounded-lg p-3">
              {error}
            </div>
          )}

          {/* Başlık */}
          <Input
            label="Başlık"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Örn: Upper Body, Bacak Günü, AMRAP 20"
          />

          {/* Gün Notu */}
          <Textarea
            label="Gün Notu"
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="Örn: Bugün yoğunluk düşük, teknik odaklı çalış"
            rows={2}
          />

          {/* Bölümler */}
          <div className="space-y-3">
            {WORKOUT_SECTIONS.map(sec => {
              const isOpen = openSections.has(sec.key)
              const isFreetext = sec.type === 'freetext'

              // Egzersiz bazlı bölümler için
              const sectionExercises = !isFreetext
                ? exercises.map((ex, idx) => ({ ex, idx })).filter(({ ex }) => ex.section === sec.key)
                : []
              const exerciseCount = sectionExercises.filter(({ ex }) => ex.name.trim()).length

              // Serbest metin bölümler için doluluk
              const freetextValue = sec.key === 'warmup' ? warmupText : cardioText
              const hasContent = isFreetext ? freetextValue.trim().length > 0 : exerciseCount > 0

              return (
                <div key={sec.key} className={`rounded-lg border overflow-hidden ${isOpen ? 'border-border' : 'border-border/50'}`}>
                  {/* Section header */}
                  <button
                    type="button"
                    onClick={() => setOpenSections(prev => {
                      const next = new Set(prev)
                      if (next.has(sec.key)) next.delete(sec.key)
                      else next.add(sec.key)
                      return next
                    })}
                    className="w-full flex items-center justify-between px-4 py-3 transition-colors cursor-pointer bg-background hover:bg-surface-hover"
                  >
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-semibold text-text-primary">{sec.label}</span>
                      {hasContent && (
                        <span className="text-xs text-text-secondary bg-surface px-1.5 py-0.5 rounded">
                          {isFreetext ? '...' : exerciseCount}
                        </span>
                      )}
                    </div>
                    <svg
                      className={`w-4 h-4 text-text-secondary transition-transform ${isOpen ? 'rotate-180' : ''}`}
                      fill="none" viewBox="0 0 24 24" stroke="currentColor"
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </button>

                  {/* Section content */}
                  {isOpen && (
                    <div className="px-4 pb-4 pt-3 bg-surface/30">
                      {isFreetext ? (
                        /* Serbest metin bölüm (Isınma / Kardiyo-Metcon) */
                        <textarea
                          value={sec.key === 'warmup' ? warmupText : cardioText}
                          onChange={(e) => sec.key === 'warmup' ? setWarmupText(e.target.value) : setCardioText(e.target.value)}
                          placeholder={sec.key === 'warmup'
                            ? 'Örn: 5 dk koşu bandı, dinamik esneme, omuz mobilite...'
                            : 'Örn: 5 Rounds For Time: 10 Push-ups, 15 Air Squats, 200m Run'
                          }
                          rows={3}
                          className="w-full bg-background border border-border rounded-lg px-3 py-2 text-sm text-text-primary placeholder:text-text-secondary/50 focus:border-primary/50 focus:outline-none resize-y"
                        />
                      ) : (
                        /* Egzersiz bazlı bölüm (Güç-Kuvvet / Aksesuar) */
                        <div className="space-y-3">
                          {sectionExercises.length === 0 ? (
                            <p className="text-xs text-text-secondary text-center py-2">Bu bölümde egzersiz yok</p>
                          ) : (
                            sectionExercises.map(({ ex, idx }) => {
                              const hasSuperset = ex.superset_group !== ''
                              const sectionIdx = sectionExercises.findIndex(s => s.idx === idx)
                              const prevInSection = sectionIdx > 0 ? sectionExercises[sectionIdx - 1] : null
                              const nextInSection = sectionIdx < sectionExercises.length - 1 ? sectionExercises[sectionIdx + 1] : null
                              const prevSameGroup = hasSuperset && prevInSection?.ex.superset_group === ex.superset_group
                              const isFirstInGroup = hasSuperset && !prevSameGroup
                              const nextSameGroup = hasSuperset && nextInSection?.ex.superset_group === ex.superset_group
                              const isLastInGroup = hasSuperset && !nextSameGroup

                              return (
                                <div key={idx}>
                                  {isFirstInGroup && (
                                    <div className="text-[10px] font-semibold text-primary uppercase tracking-wider mb-1 flex items-center gap-1.5">
                                      <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M13 10V3L4 14h7v7l9-11h-7z" />
                                      </svg>
                                      Süper Set
                                    </div>
                                  )}
                                  <div className={`bg-background rounded-lg p-3 space-y-2 ${
                                    hasSuperset ? 'border-l-2 border-l-primary ml-1' : ''
                                  } ${prevSameGroup ? 'rounded-t-none -mt-1 border-t border-t-primary/10' : ''}`}>
                                    <div className="flex items-center gap-2">
                                      <ExerciseAutocomplete
                                        value={ex.name}
                                        onChange={(val) => updateExercise(idx, 'name', val)}
                                        placeholder={hasSuperset && prevSameGroup ? 'Süper set hareketi' : 'Egzersiz adı'}
                                        className="flex-1 bg-surface border border-border rounded-lg px-3 py-2 text-sm text-text-primary placeholder:text-text-secondary/50 focus:border-primary/50 focus:outline-none"
                                      />
                                      <button
                                        type="button"
                                        onClick={() => removeExercise(idx)}
                                        className="p-2.5 text-text-secondary hover:text-red-400 transition-colors cursor-pointer"
                                      >
                                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                        </svg>
                                      </button>
                                    </div>
                                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                                      <input
                                        value={ex.sets}
                                        onChange={(e) => updateExercise(idx, 'sets', e.target.value)}
                                        placeholder="Set"
                                        className="bg-surface border border-border rounded-lg px-3 py-2.5 sm:py-1.5 text-xs text-text-primary placeholder:text-text-secondary/50 focus:border-primary/50 focus:outline-none"
                                      />
                                      <input
                                        value={ex.reps}
                                        onChange={(e) => updateExercise(idx, 'reps', e.target.value)}
                                        placeholder="Tekrar"
                                        className="bg-surface border border-border rounded-lg px-3 py-2.5 sm:py-1.5 text-xs text-text-primary placeholder:text-text-secondary/50 focus:border-primary/50 focus:outline-none"
                                      />
                                      <input
                                        value={ex.weight}
                                        onChange={(e) => updateExercise(idx, 'weight', e.target.value)}
                                        placeholder="Ağırlık"
                                        className="bg-surface border border-border rounded-lg px-3 py-2.5 sm:py-1.5 text-xs text-text-primary placeholder:text-text-secondary/50 focus:border-primary/50 focus:outline-none"
                                      />
                                      <input
                                        value={ex.rest}
                                        onChange={(e) => updateExercise(idx, 'rest', e.target.value)}
                                        placeholder="Dinlenme"
                                        className="bg-surface border border-border rounded-lg px-3 py-2.5 sm:py-1.5 text-xs text-text-primary placeholder:text-text-secondary/50 focus:border-primary/50 focus:outline-none"
                                      />
                                    </div>
                                    <input
                                      value={ex.notes}
                                      onChange={(e) => updateExercise(idx, 'notes', e.target.value)}
                                      placeholder="Not (opsiyonel)"
                                      className="w-full bg-surface border border-border rounded-lg px-3 py-1.5 text-xs text-text-primary placeholder:text-text-secondary/50 focus:border-primary/50 focus:outline-none"
                                    />
                                    {(!hasSuperset || isLastInGroup) && (
                                      <button
                                        type="button"
                                        onClick={() => addSuperset(idx)}
                                        className="flex items-center gap-1 text-xs text-primary/70 hover:text-primary transition-colors cursor-pointer py-2"
                                      >
                                        <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                                        </svg>
                                        Süper Set Ekle
                                      </button>
                                    )}
                                  </div>
                                </div>
                              )
                            })
                          )}
                          <button
                            type="button"
                            onClick={() => addExercise(sec.key as WorkoutSection)}
                            className="flex items-center gap-1 text-xs text-primary/70 hover:text-primary transition-colors cursor-pointer"
                          >
                            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v12m6-6H6" />
                            </svg>
                            Egzersiz Ekle
                          </button>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              )
            })}
          </div>

          {/* Butonlar */}
          <div className="flex flex-col-reverse sm:flex-row items-stretch sm:items-center justify-between gap-2 pt-2">
            <div>
              {editingWorkoutId && (
                <Button variant="secondary" onClick={handleDelete} disabled={saving}>
                  Sil
                </Button>
              )}
            </div>
            <div className="flex gap-2">
              <Button variant="secondary" onClick={() => setModalOpen(false)}>
                İptal
              </Button>
              <Button onClick={handleSave} disabled={saving}>
                {saving ? 'Kaydediliyor...' : editingWorkoutId ? 'Güncelle' : 'Kaydet'}
              </Button>
            </div>
          </div>
        </div>
      </Modal>
    </div>
  )
}
