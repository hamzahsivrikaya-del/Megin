'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import Card from '@/components/ui/Card'
import Button from '@/components/ui/Button'
import Input from '@/components/ui/Input'
import Select from '@/components/ui/Select'

const PRESET_PACKAGES = [
  { value: '10', label: '10 Ders', days: 40 },
  { value: '20', label: '20 Ders', days: 80 },
  { value: '30', label: '30 Ders', days: 120 },
]

function addDays(dateStr: string, days: number): string | null {
  const d = new Date(dateStr)
  if (isNaN(d.getTime())) return null
  d.setDate(d.getDate() + days)
  return d.toISOString().split('T')[0]
}

function formatDate(iso: string): string {
  const d = new Date(iso)
  if (isNaN(d.getTime())) return '—'
  return d.toLocaleDateString('tr-TR', {
    day: 'numeric', month: 'long', year: 'numeric',
  })
}

export default function PackageForm({ members }: { members: { id: string; full_name: string; is_active: boolean; hasActivePackage: boolean }[] }) {
  const router = useRouter()
  const [userId, setUserId] = useState('')
  const [packageType, setPackageType] = useState<'10' | '20' | '30' | 'custom'>('10')
  const [customLessons, setCustomLessons] = useState('')
  const [customDays, setCustomDays] = useState('')
  const [startDate, setStartDate] = useState(new Date().toISOString().split('T')[0])
  const [price, setPrice] = useState('')
  const [paymentStatus, setPaymentStatus] = useState<'paid' | 'unpaid'>('unpaid')
  const [saving, setSaving] = useState(false)
  const [success, setSuccess] = useState(false)
  const [error, setError] = useState('')

  const isCustom = packageType === 'custom'

  const totalLessons = isCustom
    ? parseInt(customLessons) || 0
    : parseInt(packageType)

  const validityDays = isCustom
    ? parseInt(customDays) || 0
    : (PRESET_PACKAGES.find((p) => p.value === packageType)?.days ?? 0)

  const expireDate = validityDays > 0 ? addDays(startDate, validityDays) : null

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!expireDate || totalLessons <= 0) {
      setError('Ders sayısı ve geçerlilik süresi gerekli')
      return
    }
    setSaving(true)
    setError('')
    setSuccess(false)

    const supabase = createClient()
    const { error: insertError } = await supabase.from('packages').insert({
      user_id: userId,
      total_lessons: totalLessons,
      start_date: startDate,
      expire_date: expireDate,
      status: 'active',
      price: price ? parseFloat(price) : null,
      payment_status: paymentStatus,
    })

    if (insertError) {
      setError(insertError.message)
    } else {
      setSuccess(true)
      setUserId('')
      setPackageType('10')
      setCustomLessons('')
      setCustomDays('')
      setPrice('')
      setPaymentStatus('unpaid')
      setTimeout(() => setSuccess(false), 2000)
      router.refresh()
    }

    setSaving(false)
  }

  const memberOptions = [
    { value: '', label: 'Üye seçin...' },
    ...members
      .filter((m) => !m.hasActivePackage)
      .map((m) => ({
        value: m.id,
        label: m.is_active ? m.full_name : `${m.full_name} (Pasif)`,
      })),
  ]

  const packageOptions = [
    ...PRESET_PACKAGES.map((p) => ({ value: p.value, label: `${p.label} (${p.days} gün)` })),
    { value: 'custom', label: 'Özel Paket' },
  ]

  return (
    <div className="max-w-lg mx-auto space-y-6">
      <h1 className="text-2xl heading-display">Paket Oluştur</h1>

      <Card>
        <form onSubmit={handleSubmit} className="space-y-4">
          <Select
            label="Üye"
            options={memberOptions}
            value={userId}
            onChange={(e) => setUserId(e.target.value)}
            required
          />

          <Select
            label="Paket"
            options={packageOptions}
            value={packageType}
            onChange={(e) => setPackageType(e.target.value as typeof packageType)}
          />

          {/* Özel paket alanları */}
          {isCustom && (
            <div className="bg-surface-hover rounded-xl p-4 space-y-3 border border-border">
              <p className="text-xs font-medium text-text-secondary uppercase tracking-wider">Özel Paket Detayları</p>
              <div className="grid grid-cols-2 gap-3">
                <Input
                  label="Ders Sayısı"
                  type="number"
                  min={1}
                  value={customLessons}
                  onChange={(e) => setCustomLessons(e.target.value)}
                  placeholder="Örn: 50"
                  required={isCustom}
                />
                <Input
                  label="Geçerlilik (gün)"
                  type="number"
                  min={1}
                  value={customDays}
                  onChange={(e) => setCustomDays(e.target.value)}
                  placeholder="Örn: 180"
                  required={isCustom}
                />
              </div>
            </div>
          )}

          <Input
            label="Başlangıç Tarihi"
            type="date"
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
            required
          />

          {/* Fiyat ve Ödeme */}
          <div className="grid grid-cols-2 gap-3">
            <Input
              label="Fiyat (TL)"
              type="number"
              min={0}
              step="0.01"
              value={price}
              onChange={(e) => setPrice(e.target.value)}
              placeholder="Örn: 15600"
            />
            <Select
              label="Ödeme Durumu"
              options={[
                { value: 'unpaid', label: 'Ödenmedi' },
                { value: 'paid', label: 'Ödendi' },
              ]}
              value={paymentStatus}
              onChange={(e) => setPaymentStatus(e.target.value as 'paid' | 'unpaid')}
            />
          </div>

          {/* Özet */}
          <div className="bg-surface-hover rounded-lg p-3 space-y-1 text-sm">
            {totalLessons > 0 && (
              <div className="flex justify-between">
                <span className="text-text-secondary">Ders sayısı</span>
                <span className="font-medium">{totalLessons} ders</span>
              </div>
            )}
            <div className="flex justify-between">
              <span className="text-text-secondary">Bitiş tarihi</span>
              <span className="font-medium">
                {expireDate ? formatDate(expireDate) : '—'}
              </span>
            </div>
            {price && (
              <div className="flex justify-between">
                <span className="text-text-secondary">Fiyat</span>
                <span className="font-medium">
                  {parseFloat(price).toLocaleString('tr-TR', { minimumFractionDigits: 2 })} TL
                </span>
              </div>
            )}
            <div className="flex justify-between">
              <span className="text-text-secondary">Ödeme</span>
              <span className={`font-medium ${paymentStatus === 'paid' ? 'text-success' : 'text-danger'}`}>
                {paymentStatus === 'paid' ? 'Ödendi' : 'Ödenmedi'}
              </span>
            </div>
          </div>

          {error && <p className="text-sm text-danger">{error}</p>}
          {success && <p className="text-sm text-success">Paket oluşturuldu!</p>}

          <Button type="submit" loading={saving} className="w-full">
            Paket Oluştur
          </Button>
        </form>
      </Card>
    </div>
  )
}
