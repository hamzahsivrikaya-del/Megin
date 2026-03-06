'use client'

import { useState } from 'react'
import Card, { CardHeader, CardTitle } from '@/components/ui/Card'

type Gender = 'erkek' | 'kadin'

const foldConfig = {
  erkek: [
    { id: 'gogus', label: 'Göğüs' },
    { id: 'karin', label: 'Karın' },
    { id: 'uyluk', label: 'Uyluk' },
  ],
  kadin: [
    { id: 'triceps', label: 'Triceps' },
    { id: 'suprailiac', label: 'Suprailiac' },
    { id: 'uyluk', label: 'Uyluk' },
  ],
}

function getCategory(fatPct: number, gender: Gender) {
  if (gender === 'erkek') {
    if (fatPct < 6) return { text: 'Elite Sporcu', cls: 'bg-green-500/15 text-green-600 border border-green-500/30' }
    if (fatPct < 14) return { text: 'Fit', cls: 'bg-blue-500/15 text-blue-600 border border-blue-500/30' }
    if (fatPct < 18) return { text: 'Ortalama', cls: 'bg-yellow-500/15 text-yellow-600 border border-yellow-500/30' }
    if (fatPct < 25) return { text: 'Fazla Yağlı', cls: 'bg-orange-500/15 text-orange-600 border border-orange-500/30' }
    return { text: 'Obez', cls: 'bg-red-500/15 text-red-600 border border-red-500/30' }
  } else {
    if (fatPct < 14) return { text: 'Elite Sporcu', cls: 'bg-green-500/15 text-green-600 border border-green-500/30' }
    if (fatPct < 21) return { text: 'Fit', cls: 'bg-blue-500/15 text-blue-600 border border-blue-500/30' }
    if (fatPct < 25) return { text: 'Ortalama', cls: 'bg-yellow-500/15 text-yellow-600 border border-yellow-500/30' }
    if (fatPct < 32) return { text: 'Fazla Yağlı', cls: 'bg-orange-500/15 text-orange-600 border border-orange-500/30' }
    return { text: 'Obez', cls: 'bg-red-500/15 text-red-600 border border-red-500/30' }
  }
}

export default function SkinfoldCalculator() {
  const [gender, setGender] = useState<Gender>('erkek')
  const [yas, setYas] = useState('')
  const [kilo, setKilo] = useState('')
  const [folds, setFolds] = useState<Record<string, string>>({})
  const [result, setResult] = useState<{
    fatPct: number
    fatKg: number
    leanKg: number
  } | null>(null)
  const [error, setError] = useState('')

  function handleGenderChange(g: Gender) {
    setGender(g)
    setFolds({})
    setResult(null)
    setError('')
  }

  function handleFoldChange(id: string, value: string) {
    setFolds((prev) => ({ ...prev, [id]: value }))
  }

  function hesapla() {
    const yasVal = parseFloat(yas)
    const kiloVal = parseFloat(kilo)
    const foldValues = foldConfig[gender].map((f) => parseFloat(folds[f.id] || ''))

    if ([yasVal, kiloVal, ...foldValues].some((v) => isNaN(v) || v <= 0)) {
      setError('Lütfen tüm alanları doldurun.')
      setResult(null)
      return
    }
    setError('')

    const sum = foldValues.reduce((a, b) => a + b, 0)
    const sum2 = sum * sum

    let density: number
    if (gender === 'erkek') {
      density = 1.10938 - 0.0008267 * sum + 0.0000016 * sum2 - 0.0002574 * yasVal
    } else {
      density = 1.0994921 - 0.0009929 * sum + 0.0000023 * sum2 - 0.0001392 * yasVal
    }

    const fatPct = Math.max(2, (4.95 / density - 4.5) * 100)
    const fatKg = (fatPct / 100) * kiloVal
    const leanKg = kiloVal - fatKg

    setResult({ fatPct, fatKg, leanKg })
  }

  const category = result ? getCategory(result.fatPct, gender) : null

  return (
    <Card>
      <CardHeader>
        <CardTitle>Skinfold Kaliper Ölçümü</CardTitle>
        <p className="text-xs text-[#6B7280]">Jackson & Pollock 3 Nokta Protokolü</p>
      </CardHeader>

      {/* Cinsiyet Toggle */}
      <div className="flex bg-[#FAFAFA] rounded-lg p-1 gap-1 mt-2 mb-5">
        <button
          type="button"
          onClick={() => handleGenderChange('erkek')}
          className={`flex-1 py-2.5 rounded-md text-sm font-medium transition-colors cursor-pointer ${
            gender === 'erkek'
              ? 'bg-white text-[#DC2626] border border-[#E5E7EB]'
              : 'text-[#6B7280] hover:text-[#0A0A0A]'
          }`}
        >
          Erkek
        </button>
        <button
          type="button"
          onClick={() => handleGenderChange('kadin')}
          className={`flex-1 py-2.5 rounded-md text-sm font-medium transition-colors cursor-pointer ${
            gender === 'kadin'
              ? 'bg-white text-[#DC2626] border border-[#E5E7EB]'
              : 'text-[#6B7280] hover:text-[#0A0A0A]'
          }`}
        >
          Kadın
        </button>
      </div>

      {/* Yaş + Kilo */}
      <div className="grid grid-cols-2 gap-3 mb-5">
        <div>
          <label className="block text-xs font-medium text-[#6B7280] uppercase tracking-wider mb-2">Yaş</label>
          <div className="relative">
            <input
              type="number"
              value={yas}
              onChange={(e) => setYas(e.target.value)}
              placeholder="25"
              min={15}
              max={90}
              className="w-full bg-[#FAFAFA] border border-[#E5E7EB] rounded-lg px-4 py-3 pr-12 text-[#0A0A0A] text-base outline-none focus:border-[#DC2626] transition-colors [appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none"
            />
            <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-[#6B7280]">yıl</span>
          </div>
        </div>
        <div>
          <label className="block text-xs font-medium text-[#6B7280] uppercase tracking-wider mb-2">Vücut Ağırlığı</label>
          <div className="relative">
            <input
              type="number"
              value={kilo}
              onChange={(e) => setKilo(e.target.value)}
              placeholder="75"
              min={30}
              max={250}
              className="w-full bg-[#FAFAFA] border border-[#E5E7EB] rounded-lg px-4 py-3 pr-12 text-[#0A0A0A] text-base outline-none focus:border-[#DC2626] transition-colors [appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none"
            />
            <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-[#6B7280]">kg</span>
          </div>
        </div>
      </div>

      {/* Divider */}
      <div className="h-px bg-border mb-5" />

      {/* Skinfold Alanları */}
      <div className="text-xs font-semibold text-[#DC2626] uppercase tracking-widest mb-4">
        Skinfold Ölçümleri (mm)
      </div>

      <div className="grid grid-cols-3 gap-3 mb-6">
        {foldConfig[gender].map((f) => (
          <div key={f.id}>
            <label className="block text-xs font-medium text-[#6B7280] uppercase tracking-wider mb-2">{f.label}</label>
            <div className="relative">
              <input
                type="number"
                value={folds[f.id] || ''}
                onChange={(e) => handleFoldChange(f.id, e.target.value)}
                placeholder="10"
                min={1}
                max={100}
                className="w-full bg-[#FAFAFA] border border-[#E5E7EB] rounded-lg px-3 py-3 pr-10 text-[#0A0A0A] text-base outline-none focus:border-[#DC2626] transition-colors [appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none"
              />
              <span className="absolute right-2 top-1/2 -translate-y-1/2 text-xs text-[#6B7280]">mm</span>
            </div>
          </div>
        ))}
      </div>

      {/* Hesapla Butonu */}
      <button
        type="button"
        onClick={hesapla}
        className="w-full py-3.5 rounded-lg bg-gradient-to-r from-[#DC2626] to-[#F97316] text-white font-semibold text-sm cursor-pointer hover:from-[#B91C1C] hover:to-[#EA580C] active:scale-[0.98] transition-all"
      >
        Hesapla
      </button>

      {/* Hata */}
      {error && <p className="text-sm text-[#DC2626] mt-3">{error}</p>}

      {/* Sonuç */}
      {result && (
        <div className="mt-6 bg-[#FAFAFA] border border-[#E5E7EB] rounded-xl p-5 animate-in fade-in slide-in-from-bottom-2 duration-300">
          <div className="flex justify-between items-center mb-3">
            <span className="text-sm text-[#6B7280]">Vücut Yağ Yüzdesi</span>
            <span className="text-2xl font-bold text-[#DC2626]">{result.fatPct.toFixed(1)}%</span>
          </div>
          <div className="flex justify-between items-center mb-3">
            <span className="text-sm text-[#6B7280]">Yağ Kütlesi</span>
            <span className="text-lg font-semibold text-blue-600">{result.fatKg.toFixed(1)} kg</span>
          </div>
          <div className="flex justify-between items-center mb-4">
            <span className="text-sm text-[#6B7280]">Yağsız Kütle</span>
            <span className="text-lg font-semibold text-blue-600">{result.leanKg.toFixed(1)} kg</span>
          </div>
          <div>
            <span className="text-sm text-[#6B7280]">Kategori</span>
            <br />
            {category && (
              <span className={`inline-block mt-2 px-3.5 py-1.5 rounded-full text-xs font-semibold uppercase tracking-wide ${category.cls}`}>
                {category.text}
              </span>
            )}
          </div>
        </div>
      )}

      {/* Uyarı */}
      <p className="text-[11px] text-[#6B7280] mt-5 leading-relaxed">
        Bu hesaplayıcı Jackson & Pollock formülünü kullanır. Sonuçlar klinik tanı değil, yönlendirici bir ölçümdür.
      </p>
    </Card>
  )
}
