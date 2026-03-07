'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import Card from '@/components/ui/Card'
import Button from '@/components/ui/Button'
import Input from '@/components/ui/Input'
import Select from '@/components/ui/Select'
import { notifyAdminMeasurement } from './actions'

function calculateBodyFat(gender: string, age: number, weight: number, sf1: number, sf2: number, sf3: number) {
  const sum = sf1 + sf2 + sf3
  const sum2 = sum * sum

  let density: number
  if (gender === 'erkek') {
    // Jackson & Pollock 3-site erkek (göğüs, karın, uyluk)
    density = 1.10938 - 0.0008267 * sum + 0.0000016 * sum2 - 0.0002574 * age
  } else {
    // Jackson & Pollock 3-site kadın (triceps, suprailiac, uyluk → burada göğüs, karın, uyluk kullanıyoruz)
    density = 1.0994921 - 0.0009929 * sum + 0.0000023 * sum2 - 0.0001392 * age
  }

  return (4.95 / density - 4.5) * 100
}

function getCategory(fatPct: number, gender: string) {
  if (gender === 'erkek') {
    if (fatPct < 6) return { text: 'Elite Sporcu', cls: 'bg-green-500/15 text-green-400 border border-green-500/30' }
    if (fatPct < 14) return { text: 'Fit', cls: 'bg-blue-500/15 text-blue-400 border border-blue-500/30' }
    if (fatPct < 18) return { text: 'Ortalama', cls: 'bg-yellow-500/15 text-yellow-400 border border-yellow-500/30' }
    if (fatPct < 25) return { text: 'Fazla Yağlı', cls: 'bg-orange-500/15 text-orange-400 border border-orange-500/30' }
    return { text: 'Obez', cls: 'bg-red-500/15 text-red-400 border border-red-500/30' }
  } else {
    if (fatPct < 14) return { text: 'Elite Sporcu', cls: 'bg-green-500/15 text-green-400 border border-green-500/30' }
    if (fatPct < 21) return { text: 'Fit', cls: 'bg-blue-500/15 text-blue-400 border border-blue-500/30' }
    if (fatPct < 25) return { text: 'Ortalama', cls: 'bg-yellow-500/15 text-yellow-400 border border-yellow-500/30' }
    if (fatPct < 32) return { text: 'Fazla Yağlı', cls: 'bg-orange-500/15 text-orange-400 border border-orange-500/30' }
    return { text: 'Obez', cls: 'bg-red-500/15 text-red-400 border border-red-500/30' }
  }
}

export default function MeasurementForm({ members }: { members: { id: string; full_name: string }[] }) {
  const router = useRouter()
  const [userId, setUserId] = useState('')
  const [date, setDate] = useState(new Date().toISOString().split('T')[0])
  const [measurements, setMeasurements] = useState({
    weight: '',
    height: '',
    chest: '',
    waist: '',
    arm: '',
    leg: '',
    sf_chest: '',
    sf_abdomen: '',
    sf_thigh: '',
  })
  const [sfGender, setSfGender] = useState('erkek')
  const [sfAge, setSfAge] = useState('')
  const [fatResult, setFatResult] = useState<{ pct: number; fatKg: number; leanKg: number } | null>(null)
  const [saving, setSaving] = useState(false)
  const [success, setSuccess] = useState(false)
  const [error, setError] = useState('')

  function handleCalculate() {
    const age = parseFloat(sfAge)
    const weight = parseFloat(measurements.weight)
    const sf1 = parseFloat(measurements.sf_chest)
    const sf2 = parseFloat(measurements.sf_abdomen)
    const sf3 = parseFloat(measurements.sf_thigh)

    const missing: string[] = []
    if (isNaN(weight) || weight <= 0) missing.push('Kilo (üstteki)')
    if (isNaN(age) || age <= 0) missing.push('Yaş')
    if (isNaN(sf1) || sf1 <= 0) missing.push('Göğüs (mm)')
    if (isNaN(sf2) || sf2 <= 0) missing.push('Karın (mm)')
    if (isNaN(sf3) || sf3 <= 0) missing.push('Uyluk (mm)')

    if (missing.length > 0) {
      setError('Eksik alanlar: ' + missing.join(', '))
      setFatResult(null)
      return
    }
    setError('')

    const pct = calculateBodyFat(sfGender, age, weight, sf1, sf2, sf3)
    const fatKg = (pct / 100) * weight
    const leanKg = weight - fatKg
    setFatResult({ pct, fatKg, leanKg })
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setSaving(true)
    setError('')
    setSuccess(false)

    const supabase = createClient()

    const { error: insertError } = await supabase.from('measurements').insert({
      user_id: userId,
      date,
      weight: measurements.weight ? parseFloat(measurements.weight) : null,
      height: measurements.height ? parseFloat(measurements.height) : null,
      chest: measurements.chest ? parseFloat(measurements.chest) : null,
      waist: measurements.waist ? parseFloat(measurements.waist) : null,
      arm: measurements.arm ? parseFloat(measurements.arm) : null,
      leg: measurements.leg ? parseFloat(measurements.leg) : null,
      sf_chest: measurements.sf_chest ? parseFloat(measurements.sf_chest) : null,
      sf_abdomen: measurements.sf_abdomen ? parseFloat(measurements.sf_abdomen) : null,
      sf_thigh: measurements.sf_thigh ? parseFloat(measurements.sf_thigh) : null,
      body_fat_pct: fatResult ? parseFloat(fatResult.pct.toFixed(1)) : null,
    })

    if (insertError) {
      setError(insertError.message)
    } else {
      setSuccess(true)
      notifyAdminMeasurement(userId)
      setUserId('')
      setMeasurements({ weight: '', height: '', chest: '', waist: '', arm: '', leg: '', sf_chest: '', sf_abdomen: '', sf_thigh: '' })
      setSfAge('')
      setFatResult(null)
      setTimeout(() => setSuccess(false), 2000)
      router.refresh()
    }

    setSaving(false)
  }

  const memberOptions = [
    { value: '', label: 'Üye seçin...' },
    ...members.map((m) => ({ value: m.id, label: m.full_name })),
  ]

  const measurementFields = [
    { key: 'weight', label: 'Kilo (kg)', placeholder: '75.5' },
    { key: 'height', label: 'Boy (cm)', placeholder: '178' },
    { key: 'chest', label: 'Göğüs (cm)', placeholder: '95' },
    { key: 'waist', label: 'Bel (cm)', placeholder: '80' },
    { key: 'arm', label: 'Kol (cm)', placeholder: '35' },
    { key: 'leg', label: 'Bacak (cm)', placeholder: '55' },
  ]

  const skinfoldFields = [
    { key: 'sf_chest', label: 'Göğüs (mm)', placeholder: '12' },
    { key: 'sf_abdomen', label: 'Karın (mm)', placeholder: '18' },
    { key: 'sf_thigh', label: 'Uyluk (mm)', placeholder: '15' },
  ]

  const category = fatResult ? getCategory(fatResult.pct, sfGender) : null

  return (
    <div className="max-w-lg mx-auto space-y-6">
      <h1 className="text-2xl heading-display">Ölçüm Gir</h1>

      <Card>
        <form onSubmit={handleSubmit} className="space-y-4">
          <Select
            label="Üye"
            options={memberOptions}
            value={userId}
            onChange={(e) => setUserId(e.target.value)}
            required
          />

          <Input
            label="Tarih"
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            required
          />

          <div className="grid grid-cols-2 gap-3">
            {measurementFields.map((field) => (
              <Input
                key={field.key}
                label={field.label}
                type="number"
                step="0.1"
                placeholder={field.placeholder}
                value={measurements[field.key as keyof typeof measurements]}
                onChange={(e) =>
                  setMeasurements({ ...measurements, [field.key]: e.target.value })
                }
              />
            ))}
          </div>

          {/* Skinfold Bölümü */}
          <div className="border-t border-border pt-4 mt-2">
            <h3 className="text-xs font-semibold text-primary uppercase tracking-widest mb-3">Skinfold Kaliper (mm)</h3>

            {/* Cinsiyet + Yaş */}
            <div className="grid grid-cols-2 gap-3 mb-3">
              <div>
                <label className="block text-sm font-medium text-text-secondary mb-1.5">Cinsiyet</label>
                <div className="flex bg-background rounded-lg p-1 gap-1">
                  <button
                    type="button"
                    onClick={() => { setSfGender('erkek'); setFatResult(null) }}
                    className={`flex-1 py-2 rounded-md text-xs font-medium transition-colors cursor-pointer ${
                      sfGender === 'erkek'
                        ? 'bg-surface text-primary border border-border'
                        : 'text-text-secondary hover:text-text-primary'
                    }`}
                  >
                    Erkek
                  </button>
                  <button
                    type="button"
                    onClick={() => { setSfGender('kadin'); setFatResult(null) }}
                    className={`flex-1 py-2 rounded-md text-xs font-medium transition-colors cursor-pointer ${
                      sfGender === 'kadin'
                        ? 'bg-surface text-primary border border-border'
                        : 'text-text-secondary hover:text-text-primary'
                    }`}
                  >
                    Kadın
                  </button>
                </div>
              </div>
              <Input
                label="Yaş"
                type="number"
                placeholder="25"
                value={sfAge}
                onChange={(e) => setSfAge(e.target.value)}
              />
            </div>

            {/* 3 Skinfold Alanı */}
            <div className="grid grid-cols-3 gap-3">
              {skinfoldFields.map((field) => (
                <Input
                  key={field.key}
                  label={field.label}
                  type="number"
                  step="0.1"
                  placeholder={field.placeholder}
                  value={measurements[field.key as keyof typeof measurements]}
                  onChange={(e) =>
                    setMeasurements({ ...measurements, [field.key]: e.target.value })
                  }
                />
              ))}
            </div>

            {/* Hesapla Butonu */}
            <button
              type="button"
              onClick={handleCalculate}
              className="mt-3 w-full py-2.5 rounded-lg bg-primary/10 border border-primary/30 text-primary text-sm font-semibold cursor-pointer hover:bg-primary/20 transition-colors"
            >
              Yağ % Hesapla
            </button>

            {/* Sonuç */}
            {fatResult && (
              <div className="mt-4 bg-background border border-border rounded-xl p-4">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-sm text-text-secondary">Vücut Yağ %</span>
                  <span className="text-xl font-bold text-primary">{fatResult.pct.toFixed(1)}%</span>
                </div>
                <div className="flex justify-between items-center mb-2">
                  <span className="text-sm text-text-secondary">Yağ Kütlesi</span>
                  <span className="text-base font-semibold text-blue-400">{fatResult.fatKg.toFixed(1)} kg</span>
                </div>
                <div className="flex justify-between items-center mb-3">
                  <span className="text-sm text-text-secondary">Yağsız Kütle</span>
                  <span className="text-base font-semibold text-blue-400">{fatResult.leanKg.toFixed(1)} kg</span>
                </div>
                {category && (
                  <span className={`inline-block px-3 py-1.5 rounded-full text-xs font-semibold uppercase tracking-wide ${category.cls}`}>
                    {category.text}
                  </span>
                )}
                <p className="text-[10px] text-text-secondary mt-2">Bu değer kaydet butonuyla birlikte veritabanına kaydedilecek.</p>
              </div>
            )}
          </div>

          {error && <p className="text-sm text-danger">{error}</p>}
          {success && <p className="text-sm text-success">Ölçüm kaydedildi!</p>}

          <Button type="submit" loading={saving} className="w-full">
            Kaydet
          </Button>
        </form>
      </Card>
    </div>
  )
}
