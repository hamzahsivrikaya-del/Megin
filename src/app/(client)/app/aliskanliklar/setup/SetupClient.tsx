'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

interface HabitDefinition {
  id: string
  name: string
  category: string
  icon: string
  is_avoidance: boolean
  order_num: number
}

const CATEGORIES = [
  { key: 'beslenme', label: 'Beslenme' },
  { key: 'icecek', label: 'İçecek' },
  { key: 'egzersiz', label: 'Egzersiz' },
  { key: 'uyku', label: 'Uyku' },
  { key: 'oz_bakim', label: 'Öz Bakım' },
]

const CATEGORY_COLORS: Record<string, { bg: string; border: string; text: string }> = {
  beslenme: { bg: 'bg-emerald-50', border: 'border-emerald-200', text: 'text-emerald-700' },
  icecek: { bg: 'bg-blue-50', border: 'border-blue-200', text: 'text-blue-700' },
  egzersiz: { bg: 'bg-orange-50', border: 'border-orange-200', text: 'text-orange-700' },
  uyku: { bg: 'bg-indigo-50', border: 'border-indigo-200', text: 'text-indigo-700' },
  oz_bakim: { bg: 'bg-rose-50', border: 'border-rose-200', text: 'text-rose-700' },
}

export default function SetupClient({
  definitions,
  existingIds,
  hasExisting,
}: {
  definitions: HabitDefinition[]
  existingIds: string[]
  hasExisting: boolean
}) {
  const router = useRouter()
  const [selected, setSelected] = useState<Set<string>>(new Set(existingIds))
  const [activeTab, setActiveTab] = useState('beslenme')
  const [saving, setSaving] = useState(false)
  const [showIntro, setShowIntro] = useState(!hasExisting)

  const filtered = definitions.filter(d => d.category === activeTab)

  function toggle(id: string) {
    setSelected(prev => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  }

  async function handleSave() {
    if (selected.size === 0) return
    setSaving(true)

    const res = await fetch('/api/habits', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'setup', habitIds: Array.from(selected) }),
    })

    if (res.ok) {
      router.push('/app/aliskanliklar')
      router.refresh()
    } else {
      setSaving(false)
    }
  }

  if (showIntro) {
    return (
      <div className="min-h-[70vh] flex flex-col items-center justify-center px-2">
        <div className="w-full max-w-sm space-y-8">
          <div className="text-center">
            <div className="text-6xl mb-4">{"🔥"}</div>
            <h1 className="text-2xl font-extrabold text-text-primary">Alışkanlık Takibi</h1>
            <p className="text-text-secondary mt-2 text-sm leading-relaxed">
              Küçük adımlar, büyük değişimler. Her gün alışkanlıklarını tamamla ve serini koru.
            </p>
          </div>

          <div className="space-y-3">
            <div className="bg-white rounded-2xl p-4 border border-border">
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-xl bg-amber-100 flex items-center justify-center flex-shrink-0 mt-0.5">
                  <span className="text-sm">{"✅"}</span>
                </div>
                <div>
                  <h3 className="text-sm font-bold text-text-primary">Günlük Tamamla</h3>
                  <p className="text-xs text-text-secondary mt-0.5 leading-relaxed">
                    Seçtiğin alışkanlıkları her gün tek tıkla tamamla. Su içtiysen tik at, erken uyuduysan tik at.
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-2xl p-4 border border-border">
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-xl bg-orange-100 flex items-center justify-center flex-shrink-0 mt-0.5">
                  <span className="text-sm">{"🔥"}</span>
                </div>
                <div>
                  <h3 className="text-sm font-bold text-text-primary">Seri Nedir?</h3>
                  <p className="text-xs text-text-secondary mt-0.5 leading-relaxed">
                    Arka arkaya tüm alışkanlıklarını tamamladığın her gün serin 1 artar.
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-2xl p-4 border border-border">
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-xl bg-red-100 flex items-center justify-center flex-shrink-0 mt-0.5">
                  <span className="text-sm">{"💔"}</span>
                </div>
                <div>
                  <h3 className="text-sm font-bold text-text-primary">Seri Nasıl Bozulur?</h3>
                  <p className="text-xs text-text-secondary mt-0.5 leading-relaxed">
                    Bir gün bile tüm alışkanlıklarını tamamlamazsan serin sıfırlanır.
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-2xl p-4 border border-border">
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-xl bg-emerald-100 flex items-center justify-center flex-shrink-0 mt-0.5">
                  <span className="text-sm">{"💪"}</span>
                </div>
                <div>
                  <h3 className="text-sm font-bold text-text-primary">Her Alışkanlığın Kendi Serisi</h3>
                  <p className="text-xs text-text-secondary mt-0.5 leading-relaxed">
                    Her alışkanlık kendi serisini de tutar. Su içmeyi 10 gündür aksatmadıysan su serisi 10 gün görünür.
                  </p>
                </div>
              </div>
            </div>
          </div>

          <button
            onClick={() => setShowIntro(false)}
            className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-amber-500 to-orange-500 text-white font-bold text-sm shadow-lg shadow-orange-200 hover:shadow-xl hover:shadow-orange-300 transition-all cursor-pointer active:scale-[0.98]"
          >
            Anladım, Alışkanlıklarımı Seçeyim
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen pb-28">
      {/* Header */}
      <div className="mb-6">
        <div className="flex items-center gap-3 mb-2">
          {hasExisting ? (
            <Link
              href="/app/aliskanliklar"
              className="w-10 h-10 rounded-2xl bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center shadow-lg shadow-orange-200"
            >
              <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
              </svg>
            </Link>
          ) : (
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center shadow-lg shadow-orange-200">
              <span className="text-xl">{"🔥"}</span>
            </div>
          )}
          <div>
            <h1 className="text-xl font-bold text-text-primary">Alışkanlıklarını Seç</h1>
            <p className="text-sm text-text-secondary">Takip etmek istediğin alışkanlıklar</p>
          </div>
        </div>
      </div>

      {/* Category tabs */}
      <div className="flex gap-2 overflow-x-auto pb-3 mb-5 -mx-4 px-4 scrollbar-none">
        {CATEGORIES.map(cat => (
          <button
            key={cat.key}
            onClick={() => setActiveTab(cat.key)}
            className={`px-4 py-2 rounded-full text-sm font-semibold whitespace-nowrap transition-all cursor-pointer ${
              activeTab === cat.key
                ? 'bg-text-primary text-white shadow-md'
                : 'bg-surface border border-border text-text-secondary hover:border-text-secondary'
            }`}
          >
            {cat.label}
          </button>
        ))}
      </div>

      {/* Habit list */}
      <div className="space-y-2">
        {filtered.map(habit => {
          const isSelected = selected.has(habit.id)
          const colors = CATEGORY_COLORS[habit.category] || CATEGORY_COLORS.beslenme

          return (
            <button
              key={habit.id}
              onClick={() => toggle(habit.id)}
              className={`w-full flex items-center gap-3 px-4 py-3.5 rounded-2xl border-2 transition-all cursor-pointer active:scale-[0.98] ${
                isSelected
                  ? `${colors.bg} ${colors.border} shadow-sm`
                  : 'bg-surface border-transparent hover:border-border'
              }`}
            >
              <span className="text-2xl flex-shrink-0">{habit.icon}</span>

              <div className="flex-1 text-left min-w-0">
                <span className={`text-[15px] font-semibold ${isSelected ? colors.text : 'text-text-primary'}`}>
                  {habit.name}
                </span>
                {habit.is_avoidance && (
                  <span className="ml-2 text-[10px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded-md bg-red-100 text-red-600">
                    kaçın
                  </span>
                )}
              </div>

              <div className={`w-7 h-7 rounded-full flex items-center justify-center flex-shrink-0 transition-all ${
                isSelected
                  ? `${colors.bg} border-2 ${colors.border}`
                  : 'border-2 border-border'
              }`}>
                {isSelected && (
                  <svg className={`w-4 h-4 ${colors.text}`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                  </svg>
                )}
              </div>
            </button>
          )
        })}
      </div>

      {/* Sticky bottom bar */}
      <div className="fixed bottom-0 left-0 right-0 bg-white/90 backdrop-blur-xl border-t border-border px-4 py-4 z-50">
        <div className="max-w-lg mx-auto flex items-center justify-between gap-4">
          <div className="text-sm">
            <span className="font-bold text-text-primary text-lg">{selected.size}</span>
            <span className="text-text-secondary ml-1">seçildi</span>
          </div>
          <button
            onClick={handleSave}
            disabled={selected.size === 0 || saving}
            className={`px-8 py-3 rounded-2xl font-bold text-white transition-all cursor-pointer active:scale-95 ${
              selected.size > 0
                ? 'bg-gradient-to-r from-amber-500 to-orange-500 shadow-lg shadow-orange-200 hover:shadow-xl hover:shadow-orange-300'
                : 'bg-gray-200 text-gray-400 cursor-not-allowed'
            }`}
          >
            {saving ? (
              <span className="flex items-center gap-2">
                <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                Kaydediliyor
              </span>
            ) : (
              <>{"🔥"} Başla</>
            )}
          </button>
        </div>
      </div>
    </div>
  )
}
