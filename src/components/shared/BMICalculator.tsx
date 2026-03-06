'use client'

import { useState } from 'react'

type Gender = 'erkek' | 'kadin'

const categories = [
  { min: 0, max: 16, label: 'Aşırı Zayıf', color: 'text-blue-400', bg: 'bg-blue-500' },
  { min: 16, max: 17, label: 'Zayıf', color: 'text-cyan-400', bg: 'bg-cyan-500' },
  { min: 17, max: 18.5, label: 'Hafif Zayıf', color: 'text-teal-400', bg: 'bg-teal-500' },
  { min: 18.5, max: 25, label: 'Normal', color: 'text-green-400', bg: 'bg-green-500' },
  { min: 25, max: 30, label: 'Fazla Kilolu', color: 'text-yellow-400', bg: 'bg-yellow-500' },
  { min: 30, max: 35, label: 'Obez (Sınıf 1)', color: 'text-orange-400', bg: 'bg-orange-500' },
  { min: 35, max: 40, label: 'Obez (Sınıf 2)', color: 'text-red-400', bg: 'bg-red-500' },
  { min: 40, max: 100, label: 'Aşırı Obez', color: 'text-red-600', bg: 'bg-red-600' },
]

export default function BMICalculator() {
  const [gender, setGender] = useState<Gender>('erkek')
  const [weight, setWeight] = useState('')
  const [height, setHeight] = useState('')
  const [age, setAge] = useState('')
  const [result, setResult] = useState<{
    bmi: number
    category: string
    color: string
    bg: string
    normalMin: number
    normalMax: number
    diff: number
  } | null>(null)
  const [error, setError] = useState('')

  function calculate() {
    setError('')

    const w = parseFloat(weight)
    const h = parseFloat(height)
    const a = parseInt(age)

    if (!w || !h || w <= 0 || h <= 0) {
      setError('Lütfen kilo ve boy bilgilerini girin')
      return
    }

    if (a && (a < 15 || a > 100)) {
      setError('Yaş 15-100 arasında olmalı')
      return
    }

    const hMeters = h / 100
    const bmi = w / (hMeters * hMeters)
    const rounded = Math.round(bmi * 10) / 10

    const cat = categories.find((c) => bmi >= c.min && bmi < c.max) || categories[categories.length - 1]

    const normalMin = Math.round(18.5 * hMeters * hMeters * 10) / 10
    const normalMax = Math.round(25 * hMeters * hMeters * 10) / 10

    let diff = 0
    if (bmi < 18.5) {
      diff = Math.round((normalMin - w) * 10) / 10
    } else if (bmi >= 25) {
      diff = Math.round((w - normalMax) * 10) / 10
    }

    setResult({
      bmi: rounded,
      category: cat.label,
      color: cat.color,
      bg: cat.bg,
      normalMin,
      normalMax,
      diff,
    })
  }

  // BMI gösterge pozisyonu (15-40 arası ölçek)
  const indicatorPos = result ? Math.min(Math.max(((result.bmi - 15) / 25) * 100, 0), 100) : 0

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

          {/* Kilo, Boy, Yaş */}
          <div className="grid grid-cols-3 gap-3">
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

          <p className="text-xs text-[#6B7280]/40 text-center">
            BMI kas kütlesini hesaba katmaz, sporcular için yanıltıcı olabilir
          </p>
        </div>

        {/* Sağ: Sonuçlar */}
        <div className={`bg-white rounded-2xl border border-[#E5E7EB] p-6 sm:p-8 flex flex-col justify-center ${!result ? 'items-center' : ''}`}>
          {!result ? (
            <div className="text-center py-8">
              <div className="w-20 h-20 bg-[#DC2626]/10 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-10 h-10 text-[#DC2626]/60" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 6l3 1m0 0l-3 9a5.002 5.002 0 006.001 0M6 7l3 9M6 7l6-2m6 2l3-1m-3 1l-3 9a5.002 5.002 0 006.001 0M18 7l3 9m-3-9l-6-2m0-2v2m0 16V5m0 16H9m3 0h3" />
                </svg>
              </div>
              <p className="text-[#6B7280] text-sm">Kilo ve boyunuzu girip hesaplayın</p>
              <p className="text-[#6B7280]/50 text-xs mt-2">Vücut Kitle İndeksi (BMI) formülü</p>
            </div>
          ) : (
            <div className="space-y-6 animate-fade-in">
              {/* BMI Değeri */}
              <div className="text-center">
                <p className="text-sm text-[#6B7280] mb-1">Vücut Kitle İndeksiniz</p>
                <div className={`font-display text-6xl sm:text-7xl ${result.color}`}>{result.bmi}</div>
                <p className={`text-lg font-semibold mt-2 ${result.color}`}>{result.category}</p>
              </div>

              {/* Görsel Gösterge */}
              <div>
                <div className="relative h-6 rounded-full overflow-hidden flex">
                  <div className="flex-1 bg-blue-500/40" />
                  <div className="flex-1 bg-cyan-500/40" />
                  <div className="flex-1 bg-teal-500/40" />
                  <div className="flex-[2] bg-green-500/40" />
                  <div className="flex-[2] bg-yellow-500/40" />
                  <div className="flex-[2] bg-orange-500/40" />
                  <div className="flex-1 bg-red-500/40" />
                  <div className="flex-1 bg-red-600/40" />
                  <div
                    className="absolute top-0 bottom-0 w-1 bg-white shadow-lg shadow-white/50 rounded-full transition-all"
                    style={{ left: `${indicatorPos}%` }}
                  />
                </div>
                <div className="flex justify-between mt-1">
                  <span className="text-xs text-[#6B7280]/40">15</span>
                  <span className="text-xs text-[#6B7280]/40">40</span>
                </div>
              </div>

              {/* Normal Aralık */}
              <div className="bg-[#FAFAFA] rounded-xl p-4 text-center">
                <p className="text-xs text-[#6B7280] mb-1">Normal BMI aralığı için ideal kilonuz</p>
                <p className="text-xl font-bold text-[#0A0A0A]">
                  {result.normalMin} — {result.normalMax} kg
                </p>
              </div>

              {/* Fark */}
              {result.diff > 0 && (
                <div className={`rounded-xl p-4 text-center ${result.bmi < 18.5 ? 'bg-blue-500/10 border border-blue-500/20' : 'bg-orange-500/10 border border-orange-500/20'}`}>
                  <p className="text-sm text-[#6B7280]">
                    {result.bmi < 18.5
                      ? `Normal aralığa ulaşmak için ${result.diff} kg almanız önerilir`
                      : `Normal aralığa ulaşmak için ${result.diff} kg vermeniz önerilir`
                    }
                  </p>
                </div>
              )}

              {/* BMI Tablosu */}
              <div>
                <p className="text-sm text-[#6B7280] mb-3 text-center">BMI Kategorileri</p>
                <div className="space-y-1.5">
                  {categories.filter((_, i) => i > 0 && i < 7).map((cat) => (
                    <div
                      key={cat.label}
                      className={`flex items-center justify-between px-4 py-2 rounded-lg transition-all ${
                        result.category === cat.label ? 'bg-[#DC2626]/5 border border-[#DC2626]/15' : 'bg-[#FAFAFA]/60'
                      }`}
                    >
                      <div className="flex items-center gap-2">
                        <div className={`w-2.5 h-2.5 rounded-full ${cat.bg}`} />
                        <span className="text-sm text-[#0A0A0A]">{cat.label}</span>
                      </div>
                      <span className="text-xs text-[#6B7280]">{cat.min} — {cat.max}</span>
                    </div>
                  ))}
                </div>
              </div>

            </div>
          )}
        </div>
      </div>
    </div>
  )
}
