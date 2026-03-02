'use client'

import { useState, useRef, useMemo } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import Card from '@/components/ui/Card'
import Modal from '@/components/ui/Modal'
import type { MealLog, MemberMeal } from '@/lib/types'

// ---------- helpers ----------

function toDateStr(d: Date): string {
  const y = d.getFullYear()
  const m = String(d.getMonth() + 1).padStart(2, '0')
  const dd = String(d.getDate()).padStart(2, '0')
  return `${y}-${m}-${dd}`
}

function prettyDate(dateStr: string, today: string): string {
  if (dateStr === today) return 'Bugün'
  const yesterday = new Date(today + 'T00:00:00')
  yesterday.setDate(yesterday.getDate() - 1)
  if (dateStr === toDateStr(yesterday)) return 'Dün'
  const d = new Date(dateStr + 'T00:00:00')
  return d.toLocaleDateString('tr-TR', { day: 'numeric', month: 'long', weekday: 'long' })
}

function shortDayName(dateStr: string): string {
  const d = new Date(dateStr + 'T00:00:00')
  return d.toLocaleDateString('tr-TR', { weekday: 'short' }).slice(0, 3)
}

// ---------- component ----------

interface Props {
  userId: string
  memberMeals: MemberMeal[]
  initialLogs: MealLog[]
  today: string
  nutritionNote: string | null
}

export default function BeslenmeClient({ userId, memberMeals, initialLogs, today, nutritionNote }: Props) {
  const [logs, setLogs] = useState<MealLog[]>(initialLogs)
  const [selectedDate, setSelectedDate] = useState(today)
  const [saving, setSaving] = useState<string | null>(null)
  const [uploading, setUploading] = useState<string | null>(null)
  const [expandedMeal, setExpandedMeal] = useState<string | null>(null)
  const [notes, setNotes] = useState<Record<string, string>>({})
  const [successMsg, setSuccessMsg] = useState<string | null>(null)
  const [showExtraForm, setShowExtraForm] = useState(false)
  const [extraForm, setExtraForm] = useState({ name: '', note: '' })
  const [detailDay, setDetailDay] = useState<string | null>(null)
  const fileRefs = useRef<Record<string, HTMLInputElement | null>>({})

  const mealCount = memberMeals.length

  // --- computed ---
  const dayLogs = useMemo(() => logs.filter(l => l.date === selectedDate), [logs, selectedDate])
  const normalLogs = useMemo(() => dayLogs.filter(l => !l.is_extra), [dayLogs])
  const extraLogs = useMemo(() => dayLogs.filter(l => l.is_extra), [dayLogs])
  const compliantCount = normalLogs.filter(l => l.status === 'compliant').length
  const totalMeals = mealCount
  const completionRatio = totalMeals > 0 ? compliantCount / totalMeals : 0

  // Son 14 gün
  const past14Days = useMemo(() => {
    const days: { date: string; compliant: number; total: number; hasExtra: boolean }[] = []
    for (let i = 13; i >= 0; i--) {
      const d = new Date(today + 'T00:00:00')
      d.setDate(d.getDate() - i)
      const ds = toDateStr(d)
      const dayNormal = logs.filter(l => l.date === ds && !l.is_extra)
      const dayCompliant = dayNormal.filter(l => l.status === 'compliant')
      const dayExtra = logs.filter(l => l.date === ds && l.is_extra)
      days.push({ date: ds, compliant: dayCompliant.length, total: mealCount, hasExtra: dayExtra.length > 0 })
    }
    return days
  }, [logs, today, mealCount])

  // --- tarih navigasyonu ---
  function changeDate(offset: number) {
    const d = new Date(selectedDate + 'T00:00:00')
    d.setDate(d.getDate() + offset)
    const newDate = toDateStr(d)
    if (newDate > today) return
    setSelectedDate(newDate)
    setExpandedMeal(null)
    setShowExtraForm(false)
  }

  // --- öğün durum değiştirme (uydum / uymadım) ---
  async function handleMealStatus(meal: MemberMeal, status: 'compliant' | 'non_compliant') {
    const existingLog = normalLogs.find(l => l.meal_id === meal.id)
    setSaving(meal.id)
    const supabase = createClient()

    if (existingLog && existingLog.status === status) {
      // Aynı duruma tekrar tıklanırsa geri al (sil)
      const { error } = await supabase.from('meal_logs').delete().eq('id', existingLog.id)
      if (!error) setLogs(prev => prev.filter(l => l.id !== existingLog.id))
    } else if (existingLog) {
      // Farklı duruma geçiş (compliant -> non_compliant veya tersi)
      const { data, error } = await supabase
        .from('meal_logs')
        .update({ status })
        .eq('id', existingLog.id)
        .select()
        .single()
      if (!error && data) {
        setLogs(prev => prev.map(l => l.id === existingLog.id ? data as MealLog : l))
        setSuccessMsg(status === 'compliant' ? 'Uydum' : 'Uymadim')
        setTimeout(() => setSuccessMsg(null), 2000)
      }
    } else {
      // Yeni log oluştur
      const { data, error } = await supabase
        .from('meal_logs')
        .upsert(
          {
            user_id: userId,
            date: selectedDate,
            meal_id: meal.id,
            status,
            is_extra: false,
          },
          { onConflict: 'user_id,date,meal_id' }
        )
        .select()
        .single()
      if (!error && data) {
        setLogs(prev => [...prev, data as MealLog])
        setSuccessMsg(status === 'compliant' ? 'Uydum' : 'Uymadim')
        setTimeout(() => setSuccessMsg(null), 2000)
      }
    }
    setSaving(null)
  }

  // --- not kaydetme ---
  async function handleNoteSave(logId: string, mealId: string) {
    const noteText = notes[mealId]
    if (noteText === undefined) return
    setSaving(mealId)
    const supabase = createClient()
    const { data, error } = await supabase
      .from('meal_logs')
      .update({ note: noteText || null })
      .eq('id', logId)
      .select()
      .single()
    if (!error && data) {
      setLogs(prev => prev.map(l => l.id === logId ? data as MealLog : l))
      setSuccessMsg('Not kaydedildi')
      setTimeout(() => setSuccessMsg(null), 2000)
    }
    setSaving(null)
  }

  // --- foto yükleme ---
  async function handlePhotoUpload(file: File, meal: MemberMeal) {
    if (file.size > 10 * 1024 * 1024) {
      alert('Dosya 10MB\'dan küçük olmalı')
      return
    }
    setUploading(meal.id)
    const supabase = createClient()
    const ext = file.name.split('.').pop()
    const path = `${userId}/${selectedDate}_${meal.id}.${ext}`

    const { error: uploadError } = await supabase.storage
      .from('meal_photos')
      .upload(path, file, { upsert: true })

    if (uploadError) {
      setUploading(null)
      return
    }

    const { data: { publicUrl } } = supabase.storage
      .from('meal_photos')
      .getPublicUrl(path)

    const existingLog = normalLogs.find(l => l.meal_id === meal.id)

    if (existingLog) {
      // mevcut log'u güncelle
      const { data, error } = await supabase
        .from('meal_logs')
        .update({ photo_url: publicUrl })
        .eq('id', existingLog.id)
        .select()
        .single()
      if (!error && data) {
        setLogs(prev => prev.map(l => l.id === existingLog.id ? data as MealLog : l))
        setSuccessMsg('Fotoğraf yüklendi')
        setTimeout(() => setSuccessMsg(null), 2000)
      }
    } else {
      // log yoksa oluştur
      const { data, error } = await supabase
        .from('meal_logs')
        .upsert(
          {
            user_id: userId,
            date: selectedDate,
            meal_id: meal.id,
            status: 'compliant' as const,
            photo_url: publicUrl,
            is_extra: false,
          },
          { onConflict: 'user_id,date,meal_id' }
        )
        .select()
        .single()
      if (!error && data) {
        setLogs(prev => [...prev, data as MealLog])
        setSuccessMsg('Fotoğraf yüklendi')
        setTimeout(() => setSuccessMsg(null), 2000)
      }
    }
    setUploading(null)
  }

  // --- extra öğün kaydetme ---
  async function handleExtraSave() {
    const name = extraForm.name.trim()
    if (!name) return
    setSaving('extra')
    const supabase = createClient()

    const { data, error } = await supabase
      .from('meal_logs')
      .insert({
        user_id: userId,
        date: selectedDate,
        meal_id: null,
        status: 'compliant' as const,
        is_extra: true,
        extra_name: name,
        note: extraForm.note || null,
      })
      .select()
      .single()

    if (!error && data) {
      setLogs(prev => [data as MealLog, ...prev])
      setExtraForm({ name: '', note: '' })
      setShowExtraForm(false)
      setSuccessMsg('Ekstra öğün eklendi')
      setTimeout(() => setSuccessMsg(null), 2000)
    }
    setSaving(null)
  }

  // --- extra öğün silme ---
  async function handleExtraDelete(logId: string) {
    setSaving(logId)
    const supabase = createClient()
    const { error } = await supabase.from('meal_logs').delete().eq('id', logId)
    if (!error) setLogs(prev => prev.filter(l => l.id !== logId))
    setSaving(null)
  }

  // --- detay modal verileri ---
  const detailDayData = useMemo(() => {
    if (!detailDay) return null
    const dayAll = logs.filter(l => l.date === detailDay)
    const normal = dayAll.filter(l => !l.is_extra)
    const extra = dayAll.filter(l => l.is_extra)
    const compliant = normal.filter(l => l.status === 'compliant').length
    return { normal, extra, compliant, total: mealCount }
  }, [detailDay, logs, mealCount])

  // --- progress bar renk ---
  function getProgressColor(ratio: number): string {
    if (ratio >= 1) return 'var(--color-success)'
    if (ratio >= 0.5) return 'var(--color-warning)'
    return 'var(--color-danger)'
  }

  // --- grid renk class ---
  function getGridColor(completed: number, total: number): string {
    if (total === 0) return 'bg-border text-text-secondary'
    const ratio = completed / total
    if (ratio >= 1) return 'bg-success/20 text-success ring-1 ring-success/30'
    if (ratio >= 0.5) return 'bg-amber-100 text-amber-700 ring-1 ring-amber-300/50'
    if (completed > 0) return 'bg-red-100 text-red-600 ring-1 ring-red-300/50'
    return 'bg-border text-text-secondary'
  }

  // --- spinner ---
  const Spinner = () => (
    <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
    </svg>
  )

  // ---- öğün atanmamış durumu ----
  if (mealCount === 0) {
    return (
      <div className="space-y-6 pb-8">
        <div className="flex items-center gap-3 animate-fade-up">
          <Link href="/dashboard" className="p-2 -ml-2 text-text-secondary hover:text-text-primary transition-colors">
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </Link>
          <h1 className="text-2xl font-bold">Beslenme Takibi</h1>
        </div>
        <Card className="animate-fade-up delay-100">
          <div className="flex flex-col items-center justify-center py-8 text-center space-y-3">
            <div className="w-14 h-14 rounded-full bg-surface-hover flex items-center justify-center">
              <svg className="w-7 h-7 text-text-secondary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
              </svg>
            </div>
            <div>
              <p className="text-sm font-medium text-text-primary">Henüz öğün planınız atanmadı</p>
              <p className="text-xs text-text-secondary mt-1">Antrenörünüzle iletişime geçin.</p>
            </div>
          </div>
        </Card>
      </div>
    )
  }

  return (
    <div className="space-y-6 pb-8">
      {/* Toast */}
      {successMsg && (
        <div className="fixed top-4 left-1/2 -translate-x-1/2 z-50 animate-fade-up">
          <div className={`flex items-center gap-2 text-white px-4 py-2.5 rounded-xl shadow-lg text-sm font-medium ${
            successMsg === 'Uymadim' ? 'bg-red-500' : 'bg-emerald-500'
          }`}>
            {successMsg === 'Uymadim' ? (
              <svg className="w-4 h-4 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12" />
              </svg>
            ) : (
              <svg className="w-4 h-4 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
              </svg>
            )}
            {successMsg}
          </div>
        </div>
      )}

      {/* Başlık */}
      <div className="flex items-center gap-3 animate-fade-up">
        <Link href="/dashboard" className="p-2 -ml-2 text-text-secondary hover:text-text-primary transition-colors">
          <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
        </Link>
        <h1 className="text-2xl font-bold">Beslenme Takibi</h1>
      </div>

      {/* Antrenörün beslenme notu */}
      {nutritionNote && (
        <div className="bg-primary/5 border border-primary/20 rounded-xl p-4 animate-fade-up delay-50">
          <div className="flex items-center gap-2 mb-2">
            <svg className="w-4 h-4 text-primary flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 8h10M7 12h4m1 8l-4-4H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-3l-4 4z" />
            </svg>
            <span className="text-xs font-semibold text-primary uppercase tracking-wide">Antrenörün Notu</span>
          </div>
          <p className="text-sm text-text-primary whitespace-pre-wrap">{nutritionNote}</p>
        </div>
      )}

      {/* Tarih seçici */}
      <div className="flex items-center justify-between bg-surface rounded-xl border border-border p-3 animate-fade-up delay-100">
        <button
          onClick={() => changeDate(-1)}
          className="p-2 rounded-lg hover:bg-surface-hover transition-colors cursor-pointer"
          aria-label="Önceki gün"
        >
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
        </button>
        <div className="text-center">
          <p className="font-semibold text-sm">{prettyDate(selectedDate, today)}</p>
          {selectedDate !== today && (
            <p className="text-xs text-text-secondary mt-0.5">
              {new Date(selectedDate + 'T00:00:00').toLocaleDateString('tr-TR', { day: 'numeric', month: 'short' })}
            </p>
          )}
        </div>
        <button
          onClick={() => changeDate(1)}
          disabled={selectedDate >= today}
          className="p-2 rounded-lg hover:bg-surface-hover transition-colors cursor-pointer disabled:opacity-30 disabled:cursor-not-allowed"
          aria-label="Sonraki gün"
        >
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
        </button>
      </div>

      {/* Progress bar */}
      <div className="animate-fade-up delay-150">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm font-semibold text-text-primary">
            {compliantCount}/{totalMeals} öğün uyumlu
          </span>
          <span className="text-xs font-medium" style={{ color: getProgressColor(completionRatio) }}>
            %{totalMeals > 0 ? Math.round(completionRatio * 100) : 0}
          </span>
        </div>
        <div className="h-2.5 bg-border rounded-full overflow-hidden">
          <div
            className="h-full rounded-full transition-all duration-500"
            style={{
              width: `${totalMeals > 0 ? completionRatio * 100 : 0}%`,
              backgroundColor: getProgressColor(completionRatio),
            }}
          />
        </div>
      </div>

      {/* Öğün checklist */}
      <div className="space-y-2">
        {memberMeals.map((meal) => {
          const log = normalLogs.find(l => l.meal_id === meal.id)
          const isCompliant = log?.status === 'compliant'
          const isNonCompliant = log?.status === 'non_compliant'
          const isExpanded = expandedMeal === meal.id
          const noteValue = notes[meal.id] ?? log?.note ?? ''

          return (
            <div
              key={meal.id}
              className={`rounded-xl border transition-all duration-200 animate-fade-up ${
                isCompliant
                  ? 'bg-success/5 border-success/30'
                  : isNonCompliant
                  ? 'bg-red-50 border-red-200'
                  : 'bg-surface border-border'
              }`}
            >
              {/* Ana satır */}
              <div className="flex items-center gap-3 p-3">
                {/* Tik butonu (uydum) */}
                <button
                  onClick={() => handleMealStatus(meal, 'compliant')}
                  disabled={saving !== null}
                  className={`flex-shrink-0 w-9 h-9 rounded-full flex items-center justify-center transition-all duration-200 cursor-pointer disabled:opacity-50 active:scale-90 ${
                    isCompliant
                      ? 'bg-emerald-500 text-white shadow-md shadow-emerald-500/30'
                      : 'border-2 border-gray-200 text-gray-300 hover:border-emerald-300 hover:text-emerald-400 hover:bg-emerald-50'
                  }`}
                  aria-label="Uydum"
                >
                  {saving === meal.id ? <Spinner /> : (
                    <svg className="w-[18px] h-[18px]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={isCompliant ? 3 : 2.5} d="M5 13l4 4L19 7" />
                    </svg>
                  )}
                </button>

                {/* Öğün adı */}
                <span className={`flex-1 text-sm font-medium ${
                  isCompliant ? 'text-emerald-600' : isNonCompliant ? 'text-red-500' : 'text-text-primary'
                }`}>
                  {meal.name}
                </span>

                {/* Çarpı butonu (uymadım) */}
                <button
                  onClick={() => handleMealStatus(meal, 'non_compliant')}
                  disabled={saving !== null}
                  className={`flex-shrink-0 w-9 h-9 rounded-full flex items-center justify-center transition-all duration-200 cursor-pointer disabled:opacity-50 active:scale-90 ${
                    isNonCompliant
                      ? 'bg-red-500 text-white shadow-md shadow-red-500/30'
                      : 'border-2 border-gray-200 text-gray-300 hover:border-red-300 hover:text-red-400 hover:bg-red-50'
                  }`}
                  aria-label="Uymadim"
                >
                  <svg className="w-[16px] h-[16px]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={isNonCompliant ? 3 : 2.5} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>

                {/* Aksiyon ikonları (log varsa aktif) */}
                {log && (
                  <div className="flex items-center gap-1">
                    {/* Foto */}
                    <input
                      ref={(el) => { fileRefs.current[meal.id] = el }}
                      type="file"
                      accept="image/*"
                      capture="environment"
                      className="hidden"
                      onChange={(e) => {
                        const file = e.target.files?.[0]
                        if (file) handlePhotoUpload(file, meal)
                        e.target.value = ''
                      }}
                    />
                    <button
                      onClick={() => fileRefs.current[meal.id]?.click()}
                      disabled={uploading !== null}
                      className={`p-2 rounded-lg transition-colors cursor-pointer disabled:opacity-50 ${
                        log?.photo_url ? 'text-primary bg-primary/10' : 'text-text-secondary hover:text-text-primary hover:bg-surface-hover'
                      }`}
                      aria-label="Fotoğraf ekle"
                    >
                      {uploading === meal.id ? (
                        <Spinner />
                      ) : (
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
                        </svg>
                      )}
                    </button>
                    {/* Not */}
                    <button
                      onClick={() => setExpandedMeal(isExpanded ? null : meal.id)}
                      className={`p-2 rounded-lg transition-colors cursor-pointer ${
                        log?.note ? 'text-primary bg-primary/10' : 'text-text-secondary hover:text-text-primary hover:bg-surface-hover'
                      }`}
                      aria-label="Not ekle"
                    >
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                      </svg>
                    </button>
                  </div>
                )}
              </div>

              {/* Expanded: foto + not */}
              {isExpanded && log && (
                <div className="px-3 pb-3 space-y-3 animate-fade-in">
                  {/* Foto thumbnail */}
                  {log.photo_url && (
                    <div className="relative w-full h-40 rounded-lg overflow-hidden border border-border">
                      <Image src={log.photo_url} alt={meal.name} fill className="object-cover" sizes="(max-width: 768px) 100vw, 400px" />
                    </div>
                  )}
                  {/* Not alanı */}
                  <div className="space-y-2">
                    <textarea
                      value={noteValue}
                      onChange={(e) => setNotes(prev => ({ ...prev, [meal.id]: e.target.value }))}
                      placeholder="Öğünle ilgili not ekle..."
                      rows={2}
                      className="w-full text-base bg-white border border-border rounded-lg px-3 py-2 resize-none focus:outline-none focus:border-primary placeholder:text-text-secondary/50"
                    />
                    {notes[meal.id] !== undefined && notes[meal.id] !== (log.note ?? '') && (
                      <button
                        onClick={() => handleNoteSave(log.id, meal.id)}
                        disabled={saving !== null}
                        className="w-full py-2 bg-primary text-white text-xs font-semibold rounded-lg hover:bg-primary/90 transition-colors cursor-pointer disabled:opacity-50"
                      >
                        Notu Kaydet
                      </button>
                    )}
                  </div>
                </div>
              )}

              {/* Collapsed not gösterimi */}
              {!isExpanded && log?.note && (
                <div className="px-3 pb-3 pl-12">
                  <p className="text-xs text-text-secondary italic line-clamp-1">{log.note}</p>
                </div>
              )}
            </div>
          )
        })}
      </div>

      {/* Ekstra Öğünler */}
      <div className="space-y-3 animate-fade-up">
        <p className="text-[10px] text-text-secondary uppercase tracking-[0.2em] font-medium">Ekstra Öğünler</p>

        {/* Mevcut extra'lar */}
        {extraLogs.map((log) => (
          <div key={log.id} className="flex items-start gap-3 p-3 rounded-xl border-2 border-dashed border-border bg-surface">
            <span className="text-lg flex-shrink-0">🍕</span>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-text-primary">{log.extra_name}</p>
              {log.note && <p className="text-xs text-text-secondary mt-0.5">{log.note}</p>}
            </div>
            <button
              onClick={() => handleExtraDelete(log.id)}
              disabled={saving === log.id}
              className="p-1.5 text-text-secondary hover:text-danger transition-colors cursor-pointer flex-shrink-0 disabled:opacity-50"
              aria-label="Sil"
            >
              {saving === log.id ? <Spinner /> : (
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              )}
            </button>
          </div>
        ))}

        {/* Extra form */}
        {showExtraForm ? (
          <div className="p-4 rounded-xl border-2 border-dashed border-primary/30 bg-primary/5 space-y-3 animate-fade-in">
            <input
              type="text"
              value={extraForm.name}
              onChange={(e) => setExtraForm(prev => ({ ...prev, name: e.target.value }))}
              placeholder="Öğün başlığı..."
              className="w-full text-base bg-white border border-border rounded-lg px-3 py-2 focus:outline-none focus:border-primary placeholder:text-text-secondary/50"
              maxLength={100}
            />
            <textarea
              value={extraForm.note}
              onChange={(e) => setExtraForm(prev => ({ ...prev, note: e.target.value }))}
              placeholder="Not (opsiyonel)..."
              rows={2}
              className="w-full text-base bg-white border border-border rounded-lg px-3 py-2 resize-none focus:outline-none focus:border-primary placeholder:text-text-secondary/50"
            />
            <div className="flex gap-2">
              <button
                onClick={handleExtraSave}
                disabled={!extraForm.name.trim() || saving === 'extra'}
                className="flex-1 py-2.5 bg-primary text-white text-sm font-semibold rounded-lg hover:bg-primary/90 transition-colors cursor-pointer disabled:opacity-50"
              >
                {saving === 'extra' ? <Spinner /> : 'Kaydet'}
              </button>
              <button
                onClick={() => { setShowExtraForm(false); setExtraForm({ name: '', note: '' }) }}
                className="px-4 py-2.5 bg-surface border border-border text-sm font-medium rounded-lg hover:bg-surface-hover transition-colors cursor-pointer"
              >
                İptal
              </button>
            </div>
          </div>
        ) : (
          <button
            onClick={() => setShowExtraForm(true)}
            className="w-full p-3 rounded-xl border-2 border-dashed border-border text-sm font-medium text-text-secondary hover:border-primary/30 hover:text-primary transition-colors cursor-pointer flex items-center justify-center gap-2"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
            </svg>
            Öğün Ekle
          </button>
        )}
      </div>

      {/* Son 14 gün grid */}
      <Card className="animate-fade-up">
        <h3 className="font-semibold text-sm text-text-primary mb-3">Son 14 Gün</h3>
        <div className="grid grid-cols-7 gap-1.5">
          {past14Days.map(({ date, compliant, total, hasExtra }) => {
            const isSelected = date === selectedDate
            const dayNum = new Date(date + 'T00:00:00').getDate()

            return (
              <button
                key={date}
                onClick={() => { setSelectedDate(date); setExpandedMeal(null); setShowExtraForm(false) }}
                onDoubleClick={() => setDetailDay(date)}
                className={`relative flex flex-col items-center gap-0.5 py-1.5 rounded-lg text-xs transition-all cursor-pointer ${
                  isSelected ? 'ring-2 ring-primary ring-offset-1' : ''
                }`}
              >
                <span className="text-[10px] text-text-secondary">{shortDayName(date)}</span>
                <span className={`w-7 h-7 flex items-center justify-center rounded-full text-xs font-semibold ${getGridColor(compliant, total)}`}>
                  {dayNum}
                </span>
                {hasExtra && (
                  <span className="absolute -top-0.5 -right-0.5 w-2 h-2 rounded-full bg-amber-400 border border-white" />
                )}
              </button>
            )
          })}
        </div>
        <p className="text-[10px] text-text-secondary mt-3">
          Güne tıklayarak git, çift tıklayarak detay gör
        </p>
      </Card>

      {/* Geçmiş gün detay modalı */}
      <Modal open={detailDay !== null} onClose={() => setDetailDay(null)} title={detailDay ? prettyDate(detailDay, today) : ''}>
        {detailDayData && (
          <div className="space-y-4">
            {/* Özet */}
            <div className="flex items-center gap-2">
              <span className="text-sm font-semibold">
                {detailDayData.compliant}/{detailDayData.total} öğün uyumlu
              </span>
              <span className="text-xs font-medium px-2 py-0.5 rounded-full" style={{
                backgroundColor: detailDayData.total > 0 && detailDayData.compliant / detailDayData.total >= 1
                  ? 'rgb(34 197 94 / 0.15)' : detailDayData.compliant / detailDayData.total >= 0.5
                  ? 'rgb(245 158 11 / 0.15)' : 'rgb(239 68 68 / 0.15)',
                color: detailDayData.total > 0 && detailDayData.compliant / detailDayData.total >= 1
                  ? 'rgb(22 163 74)' : detailDayData.compliant / detailDayData.total >= 0.5
                  ? 'rgb(217 119 6)' : 'rgb(220 38 38)',
              }}>
                %{detailDayData.total > 0 ? Math.round((detailDayData.compliant / detailDayData.total) * 100) : 0}
              </span>
            </div>

            {/* Normal öğünler */}
            <div className="space-y-2">
              {memberMeals.map((meal) => {
                const log = detailDayData.normal.find(l => l.meal_id === meal.id)
                const logCompliant = log?.status === 'compliant'
                const logNonCompliant = log?.status === 'non_compliant'
                return (
                  <div key={meal.id} className={`flex items-start gap-3 p-3 rounded-lg border ${
                    logCompliant ? 'bg-success/5 border-success/30'
                      : logNonCompliant ? 'bg-red-50 border-red-200'
                      : 'bg-surface border-border'
                  }`}>
                    {logCompliant ? (
                      <svg className="w-5 h-5 text-success flex-shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                      </svg>
                    ) : logNonCompliant ? (
                      <svg className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    ) : (
                      <div className="w-5 h-5 rounded-full border-2 border-border flex-shrink-0 mt-0.5" />
                    )}
                    <div className="flex-1 min-w-0">
                      <p className={`text-sm font-medium ${
                        logCompliant ? 'text-text-primary'
                          : logNonCompliant ? 'text-red-500'
                          : 'text-text-secondary'
                      }`}>{meal.name}</p>
                      {log?.note && <p className="text-xs text-text-secondary mt-0.5">{log.note}</p>}
                      {log?.photo_url && (
                        <a href={log.photo_url} target="_blank" rel="noopener noreferrer" className="block mt-2">
                          <div className="relative w-full h-32 rounded-lg overflow-hidden border border-border">
                            <Image src={log.photo_url} alt={meal.name} fill className="object-cover" sizes="400px" />
                          </div>
                        </a>
                      )}
                    </div>
                  </div>
                )
              })}
            </div>

            {/* Extra öğünler */}
            {detailDayData.extra.length > 0 && (
              <div className="space-y-2">
                <p className="text-[10px] text-text-secondary uppercase tracking-[0.2em] font-medium">Ekstra Öğünler</p>
                {detailDayData.extra.map((log) => (
                  <div key={log.id} className="flex items-start gap-3 p-3 rounded-lg border-2 border-dashed border-border">
                    <span className="text-lg flex-shrink-0">🍕</span>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-text-primary">{log.extra_name}</p>
                      {log.note && <p className="text-xs text-text-secondary mt-0.5">{log.note}</p>}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </Modal>
    </div>
  )
}
