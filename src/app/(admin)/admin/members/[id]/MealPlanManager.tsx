'use client'

import { useState, useCallback } from 'react'
import { createClient } from '@/lib/supabase/client'
import type { MemberMeal } from '@/lib/types'

interface Props {
  userId: string
  initialMeals: MemberMeal[]
  initialNutritionNote?: string | null
}

export default function MealPlanManager({ userId, initialMeals, initialNutritionNote }: Props) {
  const [meals, setMeals] = useState<MemberMeal[]>(initialMeals)
  const [adding, setAdding] = useState(false)
  const [newName, setNewName] = useState('')
  const [saving, setSaving] = useState(false)
  const [movingId, setMovingId] = useState<string | null>(null)
  const [deletingId, setDeletingId] = useState<string | null>(null)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [editName, setEditName] = useState('')
  const [nutritionNote, setNutritionNote] = useState(initialNutritionNote || '')
  const [savingNote, setSavingNote] = useState(false)
  const [noteSaved, setNoteSaved] = useState(false)

  const supabase = createClient()

  async function handleNutritionNoteSave() {
    setSavingNote(true)
    await supabase.from('users').update({ nutrition_note: nutritionNote || null }).eq('id', userId)
    setSavingNote(false)
    setNoteSaved(true)
    setTimeout(() => setNoteSaved(false), 2000)
  }

  const handleAdd = useCallback(async () => {
    const name = newName.trim()
    if (!name) return

    setSaving(true)
    const nextOrder = meals.length > 0 ? Math.max(...meals.map((m) => m.order_num)) + 1 : 0

    const { data, error } = await supabase
      .from('member_meals')
      .insert({ user_id: userId, name, order_num: nextOrder })
      .select()
      .single()

    if (error) {
      alert('Eklenemedi: ' + error.message)
    } else if (data) {
      setMeals((prev) => [...prev, data as MemberMeal])
      setNewName('')
      setAdding(false)
    }
    setSaving(false)
  }, [newName, meals, userId, supabase])

  const handleDelete = useCallback(async (mealId: string, mealName: string) => {
    if (!confirm(`"${mealName}" öğününü silmek istediğinize emin misiniz? Bu öğüne ait kayıtlar etkilenebilir.`)) return

    setDeletingId(mealId)
    const { error } = await supabase.from('member_meals').delete().eq('id', mealId)

    if (error) {
      alert('Silinemedi: ' + error.message)
    } else {
      setMeals((prev) => prev.filter((m) => m.id !== mealId))
    }
    setDeletingId(null)
  }, [supabase])

  const handleEditSave = useCallback(async (mealId: string) => {
    const name = editName.trim()
    if (!name) return

    setSaving(true)
    const { error } = await supabase
      .from('member_meals')
      .update({ name })
      .eq('id', mealId)

    if (error) {
      alert('Güncellenemedi: ' + error.message)
    } else {
      setMeals((prev) => prev.map((m) => m.id === mealId ? { ...m, name } : m))
      setEditingId(null)
      setEditName('')
    }
    setSaving(false)
  }, [editName, supabase])

  const handleMove = useCallback(async (mealId: string, direction: 'up' | 'down') => {
    const idx = meals.findIndex((m) => m.id === mealId)
    if (idx === -1) return
    if (direction === 'up' && idx === 0) return
    if (direction === 'down' && idx === meals.length - 1) return

    const swapIdx = direction === 'up' ? idx - 1 : idx + 1
    const currentMeal = meals[idx]
    const swapMeal = meals[swapIdx]

    setMovingId(mealId)

    // Swap order_num values
    const [res1, res2] = await Promise.all([
      supabase.from('member_meals').update({ order_num: swapMeal.order_num }).eq('id', currentMeal.id),
      supabase.from('member_meals').update({ order_num: currentMeal.order_num }).eq('id', swapMeal.id),
    ])

    if (res1.error || res2.error) {
      alert('Sıralama güncellenemedi')
    } else {
      setMeals((prev) => {
        const updated = [...prev]
        const tempOrder = updated[idx].order_num
        updated[idx] = { ...updated[idx], order_num: updated[swapIdx].order_num }
        updated[swapIdx] = { ...updated[swapIdx], order_num: tempOrder }
        // Re-sort by order_num
        updated.sort((a, b) => a.order_num - b.order_num)
        return updated
      })
    }
    setMovingId(null)
  }, [meals, supabase])

  return (
    <div className="rounded-xl border border-border p-4 sm:p-5 bg-surface">
      <div className="flex items-center justify-between mb-4">
        <p className="text-[10px] text-text-secondary uppercase tracking-widest font-medium">
          Öğün Planı
        </p>
        {!adding && (
          <button
            onClick={() => setAdding(true)}
            className="text-xs font-medium text-primary hover:text-primary-hover transition-colors cursor-pointer flex items-center gap-1"
          >
            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            Öğün Ekle
          </button>
        )}
      </div>

      {/* Mevcut öğünler */}
      {meals.length > 0 ? (
        <div className="space-y-0">
          {meals.map((meal, i) => (
            <div
              key={meal.id}
              className={`flex items-center justify-between py-2.5 ${
                i < meals.length - 1 ? 'border-b border-border/50' : ''
              }`}
            >
              <div className="flex items-center gap-3 flex-1 min-w-0">
                <span className="w-5 h-5 rounded-md bg-surface-hover flex items-center justify-center text-[10px] font-semibold text-text-secondary flex-shrink-0">
                  {i + 1}
                </span>
                {editingId === meal.id ? (
                  <div className="flex items-center gap-2 flex-1 min-w-0">
                    <input
                      type="text"
                      value={editName}
                      onChange={(e) => setEditName(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') handleEditSave(meal.id)
                        if (e.key === 'Escape') { setEditingId(null); setEditName('') }
                      }}
                      autoFocus
                      className="flex-1 border border-border rounded-lg px-2 py-1 text-sm text-text-primary bg-background focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
                    />
                    <button
                      onClick={() => handleEditSave(meal.id)}
                      disabled={saving || !editName.trim()}
                      className="px-2 py-1 rounded-md bg-gradient-to-r from-[#DC2626] to-[#F97316] text-white text-xs font-medium shadow-sm hover:shadow-md transition-all cursor-pointer disabled:opacity-40"
                    >
                      Kaydet
                    </button>
                    <button
                      onClick={() => { setEditingId(null); setEditName('') }}
                      className="px-2 py-1 rounded-md text-xs text-text-secondary hover:text-text-primary hover:bg-surface-hover transition-all cursor-pointer"
                    >
                      İptal
                    </button>
                  </div>
                ) : (
                  <button
                    onClick={() => { setEditingId(meal.id); setEditName(meal.name) }}
                    className="text-sm font-medium text-text-primary text-left truncate hover:text-primary transition-colors cursor-pointer"
                    title="Düzenlemek için tıkla"
                  >
                    {meal.name}
                  </button>
                )}
              </div>

              <div className="flex items-center gap-0.5">
                {/* Yukarı */}
                <button
                  onClick={() => handleMove(meal.id, 'up')}
                  disabled={i === 0 || movingId === meal.id}
                  className="p-1.5 rounded-lg text-text-secondary hover:text-text-primary hover:bg-surface-hover transition-all cursor-pointer disabled:opacity-20 disabled:cursor-default"
                  title="Yukarı taşı"
                >
                  <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
                  </svg>
                </button>

                {/* Aşağı */}
                <button
                  onClick={() => handleMove(meal.id, 'down')}
                  disabled={i === meals.length - 1 || movingId === meal.id}
                  className="p-1.5 rounded-lg text-text-secondary hover:text-text-primary hover:bg-surface-hover transition-all cursor-pointer disabled:opacity-20 disabled:cursor-default"
                  title="Aşağı taşı"
                >
                  <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </button>

                {/* Sil */}
                <button
                  onClick={() => handleDelete(meal.id, meal.name)}
                  disabled={deletingId === meal.id}
                  className="p-1.5 rounded-lg text-text-secondary hover:text-danger hover:bg-danger/10 transition-all cursor-pointer disabled:opacity-40 ml-1"
                  title="Öğünü sil"
                >
                  {deletingId === meal.id ? (
                    <span className="text-xs w-3.5 h-3.5 flex items-center justify-center">...</span>
                  ) : (
                    <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  )}
                </button>
              </div>
            </div>
          ))}
        </div>
      ) : !adding ? (
        <p className="text-sm text-text-secondary py-2">
          Henüz öğün tanımlanmamış. Üyenin beslenme planını oluşturmak için öğün ekleyin.
        </p>
      ) : null}

      {/* Yeni öğün ekleme formu */}
      {adding && (
        <div className={`flex items-center gap-2 ${meals.length > 0 ? 'mt-3 pt-3 border-t border-border/50' : ''}`}>
          <input
            type="text"
            value={newName}
            onChange={(e) => setNewName(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') handleAdd()
              if (e.key === 'Escape') { setAdding(false); setNewName('') }
            }}
            placeholder="Öğün adı (ör. Kahvaltı)"
            autoFocus
            className="flex-1 border border-border rounded-lg px-3 py-2 text-sm text-text-primary placeholder:text-text-secondary/50 bg-background focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
          />
          <button
            onClick={handleAdd}
            disabled={saving || !newName.trim()}
            className="px-3 py-2 rounded-lg bg-gradient-to-r from-[#DC2626] to-[#F97316] text-white text-sm font-medium shadow-sm hover:shadow-md transition-all cursor-pointer disabled:opacity-40 disabled:cursor-default whitespace-nowrap"
          >
            {saving ? (
              <span className="flex items-center gap-1.5">
                <svg className="w-3.5 h-3.5 animate-spin" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                </svg>
                Kaydediliyor
              </span>
            ) : 'Kaydet'}
          </button>
          <button
            onClick={() => { setAdding(false); setNewName('') }}
            className="px-3 py-2 rounded-lg text-sm text-text-secondary hover:text-text-primary hover:bg-surface-hover transition-all cursor-pointer"
          >
            İptal
          </button>
        </div>
      )}

      {/* Üyeye genel beslenme notu */}
      <div className="mt-4 pt-4 border-t border-border/50">
        <div className="flex items-center justify-between mb-2">
          <p className="text-[10px] text-text-secondary uppercase tracking-widest font-medium">
            Üyeye Not
          </p>
          {noteSaved && (
            <span className="text-xs text-green-600 font-medium">Kaydedildi</span>
          )}
        </div>
        <textarea
          value={nutritionNote}
          onChange={(e) => setNutritionNote(e.target.value)}
          placeholder="Genel beslenme notu... (üye beslenme sayfasında görecek)"
          rows={2}
          className="w-full text-sm bg-background border border-border rounded-lg px-3 py-2 resize-none focus:outline-none focus:border-primary/50 placeholder:text-text-secondary/50"
        />
        {nutritionNote !== (initialNutritionNote || '') && (
          <div className="flex justify-end mt-2">
            <button
              onClick={handleNutritionNoteSave}
              disabled={savingNote}
              className="px-3 py-1.5 rounded-lg bg-gradient-to-r from-[#DC2626] to-[#F97316] text-white text-xs font-medium shadow-sm hover:shadow-md transition-all cursor-pointer disabled:opacity-40"
            >
              {savingNote ? 'Kaydediliyor...' : 'Notu Kaydet'}
            </button>
          </div>
        )}
      </div>
    </div>
  )
}
