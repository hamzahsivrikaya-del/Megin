'use client'

import { useState } from 'react'

type Gender = 'erkek' | 'kadin'

export default function IdealWeightCalculator() {
  const [gender, setGender] = useState<Gender>('erkek')
  const [height, setHeight] = useState('')
  const [weight, setWeight] = useState('')
  const [result, setResult] = useState<{
    devine: number
    robinson: number
    miller: number
    hamwi: number
    average: number
    range: { min: number; max: number }
    currentDiff: number | null
  } | null>(null)
  const [error, setError] = useState('')

  function calculate() {
    setError('')

    const h = parseFloat(height)
    const w = weight ? parseFloat(weight) : null

    if (!h || h <= 0) {
      setError('Lütfen boyunuzu girin')
      return
    }

    if (h < 140 || h > 250) {
      setError('Boy 140-250 cm arasında olmalı')
      return
    }

    const inchesOver5ft = (h - 152.4) / 2.54

    let devine: number, robinson: number, miller: number, hamwi: number

    if (gender === 'erkek') {
      devine = 50 + 2.3 * inchesOver5ft
      robinson = 52 + 1.9 * inchesOver5ft
      miller = 56.2 + 1.41 * inchesOver5ft
      hamwi = 48 + 2.7 * inchesOver5ft
    } else {
      devine = 45.5 + 2.3 * inchesOver5ft
      robinson = 49 + 1.7 * inchesOver5ft
      miller = 53.1 + 1.36 * inchesOver5ft
      hamwi = 45.5 + 2.2 * inchesOver5ft
    }

    const all = [devine, robinson, miller, hamwi]
    const average = Math.round(all.reduce((a, b) => a + b, 0) / all.length * 10) / 10

    const hMeters = h / 100
    const rangeMin = Math.round(18.5 * hMeters * hMeters * 10) / 10
    const rangeMax = Math.round(25 * hMeters * hMeters * 10) / 10

    const currentDiff = w ? Math.round((w - average) * 10) / 10 : null

    setResult({
      devine: Math.round(devine * 10) / 10,
      robinson: Math.round(robinson * 10) / 10,
      miller: Math.round(miller * 10) / 10,
      hamwi: Math.round(hamwi * 10) / 10,
      average,
      range: { min: rangeMin, max: rangeMax },
      currentDiff,
    })
  }

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

          {/* Boy ve Kilo */}
          <div className="grid grid-cols-2 gap-4">
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
              <label className="block text-sm font-medium text-[#6B7280] mb-2">
                Mevcut Kilo
                <span className="text-xs text-[#6B7280]/50 ml-1">(opsiyonel)</span>
              </label>
              <input
                type="number"
                value={weight}
                onChange={(e) => setWeight(e.target.value)}
                placeholder="75"
                className="w-full bg-[#FAFAFA] border border-[#E5E7EB] rounded-xl px-4 py-3 text-[#0A0A0A] text-center text-lg focus:outline-none focus:border-[#DC2626]/50 focus:ring-1 focus:ring-[#DC2626]/25 transition-colors placeholder:text-[#6B7280]/30"
              />
            </div>
          </div>

          <p className="text-xs text-[#6B7280]/40 text-center">
            4 farklı bilimsel formülün ortalaması ile hesaplanır
          </p>

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
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
              </div>
              <p className="text-[#6B7280] text-sm">Boy ve cinsiyetinizi girin</p>
              <p className="text-[#6B7280]/50 text-xs mt-2">Devine, Robinson, Miller ve Hamwi formülleri</p>
            </div>
          ) : (
            <div className="space-y-6 animate-fade-in">
              {/* İdeal Kilo */}
              <div className="text-center">
                <p className="text-sm text-[#6B7280] mb-1">İdeal Kilonuz</p>
                <div className="font-display text-6xl sm:text-7xl text-[#DC2626]">{result.average}</div>
                <p className="text-sm text-[#6B7280] mt-1">kg (4 formül ortalaması)</p>
              </div>

              {/* Mevcut kilo farkı */}
              {result.currentDiff !== null && (
                <div className={`rounded-xl p-4 text-center ${
                  Math.abs(result.currentDiff) <= 3
                    ? 'bg-green-500/10 border border-green-500/20'
                    : result.currentDiff > 0
                    ? 'bg-orange-500/10 border border-orange-500/20'
                    : 'bg-blue-500/10 border border-blue-500/20'
                }`}>
                  <p className="text-sm text-[#6B7280]">
                    {Math.abs(result.currentDiff) <= 3
                      ? 'Mevcut kilonuz ideal aralıkta!'
                      : result.currentDiff > 0
                      ? `İdeal kilonuzdan ${result.currentDiff} kg fazlasınız`
                      : `İdeal kilonuzdan ${Math.abs(result.currentDiff)} kg eksiksiniz`
                    }
                  </p>
                </div>
              )}

              {/* Sağlıklı Aralık */}
              <div className="bg-[#FAFAFA] rounded-xl p-4 text-center">
                <p className="text-xs text-[#6B7280] mb-1">Sağlıklı Kilo Aralığı (BKİ 18.5–25)</p>
                <p className="text-xl font-bold text-[#0A0A0A]">
                  {result.range.min} — {result.range.max} kg
                </p>
              </div>

              {/* Formül Detayları */}
              <div>
                <p className="text-sm text-[#6B7280] mb-3 text-center">Formül Karşılaştırması</p>
                <div className="space-y-1.5">
                  {[
                    { name: 'Devine', value: result.devine },
                    { name: 'Robinson', value: result.robinson },
                    { name: 'Miller', value: result.miller },
                    { name: 'Hamwi', value: result.hamwi },
                  ].map(({ name, value }) => {
                    const barWidth = Math.round((value / Math.max(result.devine, result.robinson, result.miller, result.hamwi)) * 100)
                    return (
                      <div key={name} className="flex items-center gap-3">
                        <span className="text-xs text-[#6B7280] w-16 text-right">{name}</span>
                        <div className="flex-1 h-7 bg-[#FAFAFA] rounded-lg overflow-hidden relative">
                          <div
                            className="h-full bg-gradient-to-r from-[#DC2626]/40 to-[#DC2626]/20 rounded-lg transition-all"
                            style={{ width: `${barWidth}%` }}
                          />
                          <div className="absolute inset-0 flex items-center px-3">
                            <span className="text-xs font-bold text-[#0A0A0A]">{value} kg</span>
                          </div>
                        </div>
                      </div>
                    )
                  })}
                </div>
              </div>

            </div>
          )}
        </div>
      </div>
    </div>
  )
}
