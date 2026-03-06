'use client'

import { useState } from 'react'

type ActivityLevel = 'hareketsiz' | 'hafif' | 'orta' | 'aktif' | 'cok_aktif'

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

const activityMultipliers: Record<ActivityLevel, number> = {
  hareketsiz: 30,
  hafif: 35,
  orta: 40,
  aktif: 45,
  cok_aktif: 50,
}

export default function WaterCalculator() {
  const [weight, setWeight] = useState('')
  const [activity, setActivity] = useState<ActivityLevel>('orta')
  const [hotWeather, setHotWeather] = useState(false)
  const [result, setResult] = useState<{
    liters: number
    glasses: number
    min: number
    max: number
    breakdown: { time: string; amount: string }[]
  } | null>(null)
  const [error, setError] = useState('')

  function calculate() {
    setError('')

    const w = parseFloat(weight)

    if (!w || w <= 0) {
      setError('Lütfen kilonuzu girin')
      return
    }

    let ml = w * activityMultipliers[activity]

    // Sıcak havada %15 daha fazla
    if (hotWeather) {
      ml *= 1.15
    }

    const liters = Math.round(ml / 100) / 10
    const glasses = Math.round(ml / 250)
    const min = Math.round((w * 30) / 100) / 10
    const max = Math.round((w * 50) / 100) / 10

    // Günlük içme planı (çarpanlar toplamı = 8.0)
    const perOccasion = Math.round(ml / 8)
    const breakdown = [
      { time: 'Sabah uyanınca', amount: `${Math.round(perOccasion * 1.2)} ml` },
      { time: 'Kahvaltı ile', amount: `${perOccasion} ml` },
      { time: 'Öğleden önce', amount: `${perOccasion} ml` },
      { time: 'Öğle yemeği ile', amount: `${perOccasion} ml` },
      { time: 'Öğleden sonra', amount: `${perOccasion} ml` },
      { time: 'Antrenman öncesi', amount: `${Math.round(perOccasion * 0.8)} ml` },
      { time: 'Antrenman sonrası', amount: `${Math.round(perOccasion * 1.5)} ml` },
      { time: 'Akşam yemeği ile', amount: `${Math.round(perOccasion * 0.5)} ml` },
    ]
    // Planı hedef toplamına normalize et
    const planTotal = breakdown.reduce((sum, b) => sum + parseInt(b.amount), 0)
    if (planTotal > 0) {
      const factor = ml / planTotal
      breakdown.forEach((b, i) => {
        breakdown[i] = { ...b, amount: `${Math.round(parseInt(b.amount) * factor)} ml` }
      })
    }

    setResult({ liters, glasses, min, max, breakdown })
  }

  return (
    <div className="w-full">
      <div className="grid lg:grid-cols-2 gap-6">
        {/* Sol: Form */}
        <div className="bg-white rounded-2xl border border-[#E5E7EB] p-6 sm:p-8 space-y-5">
          {/* Kilo */}
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

          {/* Sıcak Hava */}
          <button
            type="button"
            onClick={() => setHotWeather(!hotWeather)}
            className={`w-full flex items-center justify-between px-4 py-3 rounded-xl transition-all ${
              hotWeather
                ? 'bg-amber-500/15 border border-amber-500/40 text-[#0A0A0A]'
                : 'bg-[#FAFAFA] border border-[#E5E7EB] text-[#6B7280] hover:bg-gray-50'
            }`}
          >
            <span className="text-sm font-medium">Sıcak hava / yoğun terleme</span>
            <div className={`w-10 h-6 rounded-full relative transition-colors ${hotWeather ? 'bg-amber-500' : 'bg-gray-200'}`}>
              <div className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-all ${hotWeather ? 'left-5' : 'left-1'}`} />
            </div>
          </button>

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
                <svg className="w-10 h-10 text-blue-400/60" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 3v1m0 16v1m-6.364-2.636l.707-.707m10.314-10.314l.707-.707M3 12h1m16 0h1m-2.636 6.364l-.707-.707M6.343 6.343l-.707-.707" />
                </svg>
              </div>
              <p className="text-[#6B7280] text-sm">Kilonuzu ve aktivite seviyenizi girin</p>
              <p className="text-[#6B7280]/50 text-xs mt-2">Günlük su ihtiyacınızı öğrenin</p>
            </div>
          ) : (
            <div className="space-y-6 animate-fade-in">
              {/* Günlük Su */}
              <div className="text-center">
                <p className="text-sm text-[#6B7280] mb-1">Günlük Su İhtiyacınız</p>
                <div className="font-display text-6xl sm:text-7xl text-blue-400">{result.liters}</div>
                <p className="text-sm text-[#6B7280] mt-1">litre / gün</p>
              </div>

              {/* Bardak ve Aralık */}
              <div className="grid grid-cols-2 gap-3">
                <div className="bg-[#FAFAFA] rounded-xl p-4 text-center">
                  <p className="text-xs text-[#6B7280] mb-1">Bardak (250ml)</p>
                  <p className="text-xl font-bold text-[#0A0A0A]">{result.glasses}</p>
                  <p className="text-xs text-[#6B7280]">bardak</p>
                </div>
                <div className="bg-[#FAFAFA] rounded-xl p-4 text-center">
                  <p className="text-xs text-[#6B7280] mb-1">Genel Aralık</p>
                  <p className="text-xl font-bold text-[#0A0A0A]">{result.min}–{result.max}</p>
                  <p className="text-xs text-[#6B7280]">litre</p>
                </div>
              </div>

              {/* Günlük Plan */}
              <div>
                <p className="text-sm text-[#6B7280] mb-3 text-center">Önerilen İçme Planı</p>
                <div className="space-y-1.5">
                  {result.breakdown.map(({ time, amount }) => (
                    <div key={time} className="flex items-center justify-between px-4 py-2.5 bg-[#FAFAFA]/60 rounded-lg">
                      <span className="text-sm text-[#0A0A0A]">{time}</span>
                      <span className="text-sm font-semibold text-blue-400">{amount}</span>
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
