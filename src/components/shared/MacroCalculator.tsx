'use client'

import { useState } from 'react'

type Gender = 'erkek' | 'kadin'
type Goal = 'yakim' | 'koruma' | 'hacim'
type ActivityLevel = 'hareketsiz' | 'hafif' | 'orta' | 'aktif' | 'cok_aktif'

const activityMultipliers: Record<ActivityLevel, number> = {
  hareketsiz: 1.2,
  hafif: 1.375,
  orta: 1.55,
  aktif: 1.725,
  cok_aktif: 1.9,
}

const activityLabels: Record<ActivityLevel, string> = {
  hareketsiz: 'Hareketsiz',
  hafif: 'Hafif Aktif',
  orta: 'Orta Aktif',
  aktif: 'Aktif',
  cok_aktif: 'Çok Aktif',
}

const activityDescriptions: Record<ActivityLevel, string> = {
  hareketsiz: 'Masa başı iş, egzersiz yok',
  hafif: 'Haftada 1-3 gün hafif egzersiz',
  orta: 'Haftada 3-5 gün orta yoğunlukta',
  aktif: 'Haftada 6-7 gün yoğun egzersiz',
  cok_aktif: 'Günde 2 antrenman veya fiziksel iş',
}

const goalLabels: Record<Goal, string> = {
  yakim: 'Yağ Yakımı',
  koruma: 'Kilo Koruma',
  hacim: 'Kas Yapımı',
}

export default function MacroCalculator() {
  const [gender, setGender] = useState<Gender>('erkek')
  const [age, setAge] = useState('')
  const [weight, setWeight] = useState('')
  const [height, setHeight] = useState('')
  const [bodyFat, setBodyFat] = useState('')
  const [activity, setActivity] = useState<ActivityLevel>('orta')
  const [goal, setGoal] = useState<Goal>('koruma')
  const [result, setResult] = useState<{
    bmr: number
    tdee: number
    calories: number
    protein: number
    fat: number
    carbs: number
    formula: string
  } | null>(null)
  const [error, setError] = useState('')

  function calculate() {
    setError('')

    const a = parseInt(age)
    const w = parseFloat(weight)
    const h = parseFloat(height)
    const bf = bodyFat ? parseFloat(bodyFat) : null

    if (!a || !w || !h || a <= 0 || w <= 0 || h <= 0) {
      setError('Lütfen tüm alanları doğru şekilde doldurun')
      return
    }

    if (bf !== null && (bf <= 0 || bf >= 70)) {
      setError('Yağ oranı %1-%70 arasında olmalı')
      return
    }

    let bmr: number
    let formula: string

    if (bf !== null) {
      // Katch-McArdle formülü (yağ oranı biliniyorsa — daha doğru)
      const lbm = w * (1 - bf / 100)
      bmr = 370 + 21.6 * lbm
      formula = 'Katch-McArdle'
    } else {
      // Mifflin-St Jeor formülü (genel)
      if (gender === 'erkek') {
        bmr = 10 * w + 6.25 * h - 5 * a + 5
      } else {
        bmr = 10 * w + 6.25 * h - 5 * a - 161
      }
      formula = 'Mifflin-St Jeor'
    }

    const tdee = bmr * activityMultipliers[activity]

    // Hedefe göre kalori ayarla
    let calories: number
    if (goal === 'yakim') {
      calories = tdee * 0.80 // %20 açık
    } else if (goal === 'hacim') {
      calories = tdee * 1.15 // %15 fazla
    } else {
      calories = tdee
    }

    // Makro dağılımı
    let proteinPerKg: number
    let fatRatio: number

    if (goal === 'yakim') {
      proteinPerKg = 2.2
      fatRatio = 0.25
    } else if (goal === 'hacim') {
      proteinPerKg = 1.8
      fatRatio = 0.25
    } else {
      proteinPerKg = 2.0
      fatRatio = 0.28
    }

    const protein = Math.round(w * proteinPerKg)
    const fat = Math.round((calories * fatRatio) / 9)
    const carbs = Math.max(0, Math.round((calories - protein * 4 - fat * 9) / 4))

    setResult({
      bmr: Math.round(bmr),
      tdee: Math.round(tdee),
      calories: Math.round(calories),
      protein,
      fat,
      carbs,
      formula,
    })
  }

  const proteinPct = result ? Math.round((result.protein * 4 / result.calories) * 100) : 0
  const fatPct = result ? Math.round((result.fat * 9 / result.calories) * 100) : 0
  const carbsPct = result ? 100 - proteinPct - fatPct : 0

  return (
    <div className="w-full">
      <div className="grid lg:grid-cols-2 gap-6">
        {/* Sol: Form */}
        <div className="bg-white rounded-2xl border border-[#E5E7EB] p-6 sm:p-8 space-y-5">
          {/* Cinsiyet */}
          <div>
            <label className="block text-sm font-medium text-[#6B7280] mb-2">Cinsiyet</label>
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => setGender('erkek')}
                className={`py-3 rounded-xl text-sm font-medium transition-all ${
                  gender === 'erkek'
                    ? 'bg-[#0A0A0A] text-white shadow-lg shadow-black/20'
                    : 'bg-[#FAFAFA] border border-[#E5E7EB] text-[#6B7280] hover:bg-gray-100'
                }`}
              >
                Erkek
              </button>
              <button
                type="button"
                onClick={() => setGender('kadin')}
                className={`py-3 rounded-xl text-sm font-medium transition-all ${
                  gender === 'kadin'
                    ? 'bg-[#0A0A0A] text-white shadow-lg shadow-black/20'
                    : 'bg-[#FAFAFA] border border-[#E5E7EB] text-[#6B7280] hover:bg-gray-100'
                }`}
              >
                Kadın
              </button>
            </div>
          </div>

          {/* Yaş, Kilo, Boy */}
          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className="block text-sm font-medium text-[#6B7280] mb-2">Yaş</label>
              <input
                type="number"
                value={age}
                onChange={(e) => setAge(e.target.value)}
                placeholder="25"
                className="w-full bg-[#FAFAFA] border border-[#E5E7EB] rounded-xl px-4 py-3 text-[#0A0A0A] text-center text-lg focus:outline-none focus:border-[#DC2626]/50 focus:ring-1 focus:ring-[#DC2626]/25 transition-colors placeholder:text-[#6B7280]/30"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-[#6B7280] mb-2">Kilo (kg)</label>
              <input
                type="number"
                value={weight}
                onChange={(e) => setWeight(e.target.value)}
                placeholder="75"
                className="w-full bg-[#FAFAFA] border border-[#E5E7EB] rounded-xl px-4 py-3 text-[#0A0A0A] text-center text-lg focus:outline-none focus:border-[#DC2626]/50 focus:ring-1 focus:ring-[#DC2626]/25 transition-colors placeholder:text-[#6B7280]/30"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-[#6B7280] mb-2">Boy (cm)</label>
              <input
                type="number"
                value={height}
                onChange={(e) => setHeight(e.target.value)}
                placeholder="178"
                className="w-full bg-[#FAFAFA] border border-[#E5E7EB] rounded-xl px-4 py-3 text-[#0A0A0A] text-center text-lg focus:outline-none focus:border-[#DC2626]/50 focus:ring-1 focus:ring-[#DC2626]/25 transition-colors placeholder:text-[#6B7280]/30"
              />
            </div>
          </div>

          {/* Yağ Oranı (Opsiyonel) */}
          <div>
            <label className="block text-sm font-medium text-[#6B7280] mb-2">
              Vücut Yağ Oranı (%)
              <span className="text-xs text-[#6B7280]/50 ml-2">— opsiyonel, daha doğru sonuç için</span>
            </label>
            <input
              type="number"
              value={bodyFat}
              onChange={(e) => setBodyFat(e.target.value)}
              placeholder="Biliyorsanız girin"
              className="w-full bg-[#FAFAFA] border border-[#E5E7EB] rounded-xl px-4 py-3 text-[#0A0A0A] text-center text-lg focus:outline-none focus:border-[#DC2626]/50 focus:ring-1 focus:ring-[#DC2626]/25 transition-colors placeholder:text-[#6B7280]/30 placeholder:text-sm"
            />
            <p className="text-xs text-[#6B7280]/40 mt-1.5 text-center">
              Girilirse Katch-McArdle, girilmezse Mifflin-St Jeor formülü kullanılır
            </p>
          </div>

          {/* Aktivite Seviyesi */}
          <div>
            <label className="block text-sm font-medium text-[#6B7280] mb-2">Aktivite Seviyesi</label>
            <div className="space-y-2">
              {(Object.keys(activityMultipliers) as ActivityLevel[]).map((level) => (
                <button
                  key={level}
                  type="button"
                  onClick={() => setActivity(level)}
                  className={`w-full flex items-center justify-between px-4 py-3 rounded-xl text-left transition-all ${
                    activity === level
                      ? 'bg-[#DC2626]/10 border border-[#DC2626]/30 text-[#0A0A0A]'
                      : 'bg-[#FAFAFA] border border-[#E5E7EB] text-[#6B7280] hover:bg-gray-50'
                  }`}
                >
                  <div>
                    <span className="text-sm font-medium">{activityLabels[level]}</span>
                    <span className="text-xs text-[#6B7280] ml-2 hidden sm:inline">— {activityDescriptions[level]}</span>
                  </div>
                  {activity === level && (
                    <div className="w-2 h-2 bg-[#DC2626] rounded-full" />
                  )}
                </button>
              ))}
            </div>
          </div>

          {/* Hedef */}
          <div>
            <label className="block text-sm font-medium text-[#6B7280] mb-2">Hedefiniz</label>
            <div className="grid grid-cols-3 gap-3">
              {(Object.keys(goalLabels) as Goal[]).map((g) => (
                <button
                  key={g}
                  type="button"
                  onClick={() => setGoal(g)}
                  className={`py-3 rounded-xl text-sm font-medium transition-all ${
                    goal === g
                      ? 'bg-[#0A0A0A] text-white shadow-lg shadow-black/20'
                      : 'bg-[#FAFAFA] border border-[#E5E7EB] text-[#6B7280] hover:bg-gray-100'
                  }`}
                >
                  {goalLabels[g]}
                </button>
              ))}
            </div>
          </div>

          {error && (
            <p className="text-sm text-[#DC2626] text-center animate-fade-in">{error}</p>
          )}

          <button
            onClick={calculate}
            className="w-full py-4 bg-gradient-to-r from-[#DC2626] to-[#F97316] text-white rounded-xl text-lg font-semibold hover:from-[#B91C1C] hover:to-[#EA580C] transition-all hover:shadow-lg hover:shadow-[#DC2626]/25 active:scale-[0.98]"
          >
            Hesapla
          </button>
        </div>

        {/* Sağ: Sonuçlar */}
        <div className={`bg-white rounded-2xl border border-[#E5E7EB] p-6 sm:p-8 flex flex-col justify-center ${!result ? 'items-center' : ''}`}>
          {!result ? (
            <div className="text-center py-8">
              <div className="w-20 h-20 bg-[#DC2626]/10 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-10 h-10 text-[#DC2626]/60" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                </svg>
              </div>
              <p className="text-[#6B7280] text-sm">Bilgileri girin ve hesapla butonuna tıklayın</p>
              <p className="text-[#6B7280]/50 text-xs mt-2">Yağ oranı girilirse Katch-McArdle, girilmezse Mifflin-St Jeor formülü kullanılır</p>
            </div>
          ) : (
            <div className="space-y-6 animate-fade-in">
              {/* Günlük Kalori */}
              <div className="text-center">
                <p className="text-sm text-[#6B7280] mb-1">Günlük Kalori İhtiyacınız</p>
                <div className="font-display text-6xl sm:text-7xl text-[#DC2626]">{result.calories}</div>
                <p className="text-sm text-[#6B7280] mt-1">kcal / gün</p>
              </div>

              {/* BMR & TDEE */}
              <div className="grid grid-cols-2 gap-3">
                <div className="bg-[#FAFAFA] rounded-xl p-4 text-center">
                  <p className="text-xs text-[#6B7280] mb-1">Bazal Metabolizma</p>
                  <p className="text-xl font-bold text-[#0A0A0A]">{result.bmr}</p>
                  <p className="text-xs text-[#6B7280]">kcal</p>
                </div>
                <div className="bg-[#FAFAFA] rounded-xl p-4 text-center">
                  <p className="text-xs text-[#6B7280] mb-1">Toplam Harcama</p>
                  <p className="text-xl font-bold text-[#0A0A0A]">{result.tdee}</p>
                  <p className="text-xs text-[#6B7280]">kcal</p>
                </div>
              </div>

              {/* Formül bilgisi */}
              <div className="text-center">
                <span className="text-xs text-[#6B7280]/50 bg-[#FAFAFA] px-3 py-1 rounded-full">
                  {result.formula} formülü ile hesaplandı
                </span>
              </div>

              {/* Makro Bar */}
              <div>
                <p className="text-sm text-[#6B7280] mb-3 text-center">Makro Dağılımı</p>
                <div className="flex rounded-full overflow-hidden h-4 mb-4">
                  <div className="bg-blue-500 transition-all" style={{ width: `${proteinPct}%` }} />
                  <div className="bg-amber-500 transition-all" style={{ width: `${fatPct}%` }} />
                  <div className="bg-green-500 transition-all" style={{ width: `${carbsPct}%` }} />
                </div>
              </div>

              {/* Makro Kartları */}
              <div className="grid grid-cols-3 gap-3">
                <div className="bg-blue-500/10 border border-blue-500/20 rounded-xl p-4 text-center">
                  <div className="w-3 h-3 bg-blue-500 rounded-full mx-auto mb-2" />
                  <p className="text-xs text-[#6B7280] mb-1">Protein</p>
                  <p className="text-2xl font-bold text-[#0A0A0A]">{result.protein}g</p>
                  <p className="text-xs text-[#6B7280] mt-1">%{proteinPct}</p>
                </div>
                <div className="bg-amber-500/10 border border-amber-500/20 rounded-xl p-4 text-center">
                  <div className="w-3 h-3 bg-amber-500 rounded-full mx-auto mb-2" />
                  <p className="text-xs text-[#6B7280] mb-1">Yağ</p>
                  <p className="text-2xl font-bold text-[#0A0A0A]">{result.fat}g</p>
                  <p className="text-xs text-[#6B7280] mt-1">%{fatPct}</p>
                </div>
                <div className="bg-green-500/10 border border-green-500/20 rounded-xl p-4 text-center">
                  <div className="w-3 h-3 bg-green-500 rounded-full mx-auto mb-2" />
                  <p className="text-xs text-[#6B7280] mb-1">Karbonhidrat</p>
                  <p className="text-2xl font-bold text-[#0A0A0A]">{result.carbs}g</p>
                  <p className="text-xs text-[#6B7280] mt-1">%{carbsPct}</p>
                </div>
              </div>

              {/* Hedef Notu */}
              <div className="bg-[#DC2626]/5 border border-[#DC2626]/15 rounded-xl p-4">
                <p className="text-sm text-[#6B7280] text-center">
                  {goal === 'yakim' && '🔥 Yağ yakımı için günlük harcamanızdan %20 düşük kalori önerildi.'}
                  {goal === 'koruma' && '⚖️ Mevcut kilonuzu korumak için bakım kalorileriniz hesaplandı.'}
                  {goal === 'hacim' && '💪 Kas yapımı için günlük harcamanıza %15 eklendi.'}
                </p>
              </div>

            </div>
          )}
        </div>
      </div>
    </div>
  )
}
