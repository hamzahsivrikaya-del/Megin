'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import Card from '@/components/ui/Card'
import Select from '@/components/ui/Select'
import Input from '@/components/ui/Input'
import Button from '@/components/ui/Button'
import Badge from '@/components/ui/Badge'

interface ClientInfo {
  id: string
  full_name: string
  is_active: boolean
  hasActivePackage: boolean
}

interface PackageFormProps {
  clients: ClientInfo[]
  trainerId: string
}

const PRESETS = [
  { lessons: 8, label: '8 Ders' },
  { lessons: 12, label: '12 Ders' },
  { lessons: 24, label: '24 Ders' },
]

export default function PackageForm({ clients, trainerId }: PackageFormProps) {
  const router = useRouter()
  const [selectedClient, setSelectedClient] = useState('')
  const [totalLessons, setTotalLessons] = useState(8)
  const [customLessons, setCustomLessons] = useState('')
  const [isCustom, setIsCustom] = useState(false)
  const [durationDays, setDurationDays] = useState('56')
  const [price, setPrice] = useState('')
  const [paymentStatus, setPaymentStatus] = useState('unpaid')
  const [startDate, setStartDate] = useState(new Date().toISOString().split('T')[0])
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)

  const client = clients.find((c) => c.id === selectedClient)
  const lessons = isCustom ? Number(customLessons) || 0 : totalLessons

  const days = Number(durationDays) || 0

  // Bitiş tarihi hesapla
  const expireDate = (() => {
    if (days <= 0) return ''
    const d = new Date(startDate)
    d.setDate(d.getDate() + days)
    return d.toISOString().split('T')[0]
  })()

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError('')

    if (!selectedClient) {
      setError('Danışan seçiniz')
      return
    }

    if (lessons < 1) {
      setError('Ders sayısı en az 1 olmalıdır')
      return
    }

    if (days < 1) {
      setError('Paket süresi en az 1 gün olmalıdır')
      return
    }

    setLoading(true)

    try {
      const supabase = createClient()

      const { error: insertError } = await supabase
        .from('packages')
        .insert({
          trainer_id: trainerId,
          client_id: selectedClient,
          total_lessons: lessons,
          used_lessons: 0,
          start_date: startDate,
          expire_date: expireDate,
          price: price ? Number(price) : null,
          payment_status: paymentStatus,
          status: 'active',
        })

      if (insertError) {
        setError('Paket oluşturulurken bir hata oluştu')
        setLoading(false)
        return
      }

      setSuccess(true)
      setTimeout(() => {
        router.push('/dashboard/clients')
        router.refresh()
      }, 1500)
    } catch {
      setError('Bir hata oluştu')
      setLoading(false)
    }
  }

  if (success) {
    return (
      <div className="max-w-lg mx-auto space-y-6">
        <h1 className="text-2xl font-bold">Paket Oluştur</h1>
        <Card className="text-center py-8">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-success/10">
            <svg className="w-8 h-8 text-success" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <h2 className="text-lg font-bold text-text-primary">Paket Oluşturuldu!</h2>
          <p className="text-sm text-text-secondary mt-1">Yönlendiriliyorsun...</p>
        </Card>
      </div>
    )
  }

  return (
    <div className="max-w-lg mx-auto space-y-6">
      <h1 className="text-2xl font-bold">Paket Oluştur</h1>

      <Card>
        <form onSubmit={handleSubmit} className="space-y-4">
          <Select
            label="Danışan"
            value={selectedClient}
            onChange={(e) => setSelectedClient(e.target.value)}
            options={[
              { value: '', label: 'Danışan seçiniz' },
              ...clients.map((c) => ({
                value: c.id,
                label: c.full_name + (c.hasActivePackage ? ' (aktif paketi var)' : ''),
              })),
            ]}
          />

          {client?.hasActivePackage && (
            <div className="rounded-lg bg-warning/10 px-4 py-3 text-sm text-warning">
              Bu danışanın zaten aktif bir paketi var. Yeni paket eklemek mevcut paketi değiştirmez.
            </div>
          )}

          {/* Ders sayısı seçimi */}
          <div className="space-y-1.5">
            <label className="block text-sm font-medium text-text-primary">Ders Sayısı</label>
            <div className="grid grid-cols-4 gap-2">
              {PRESETS.map((preset) => (
                <button
                  key={preset.lessons}
                  type="button"
                  onClick={() => { setIsCustom(false); setTotalLessons(preset.lessons) }}
                  className={`py-2 rounded-lg text-sm font-medium transition-colors cursor-pointer
                    ${!isCustom && totalLessons === preset.lessons
                      ? 'bg-primary text-white'
                      : 'bg-background border border-border text-text-primary hover:bg-surface-hover'
                    }`}
                >
                  {preset.label}
                </button>
              ))}
              <button
                type="button"
                onClick={() => setIsCustom(true)}
                className={`py-2 rounded-lg text-sm font-medium transition-colors cursor-pointer
                  ${isCustom
                    ? 'bg-primary text-white'
                    : 'bg-background border border-border text-text-primary hover:bg-surface-hover'
                  }`}
              >
                Özel
              </button>
            </div>
            {isCustom && (
              <Input
                type="number"
                placeholder="Ders sayısı girin"
                value={customLessons}
                onChange={(e) => setCustomLessons(e.target.value)}
                min={1}
              />
            )}
          </div>

          <Input
            label="Başlangıç Tarihi"
            type="date"
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
          />

          <div>
            <Input
              label="Paket Süresi (gün)"
              type="number"
              placeholder="56"
              value={durationDays}
              onChange={(e) => setDurationDays(e.target.value)}
              min={1}
            />
            {expireDate && (
              <p className="text-xs text-text-secondary mt-1">
                Bitiş: {new Date(expireDate + 'T00:00:00').toLocaleDateString('tr-TR', { day: 'numeric', month: 'long', year: 'numeric' })}
              </p>
            )}
          </div>

          <Input
            label="Ücret (TL)"
            type="number"
            placeholder="Opsiyonel"
            value={price}
            onChange={(e) => setPrice(e.target.value)}
            min={0}
          />

          {price && (
            <Select
              label="Ödeme Durumu"
              value={paymentStatus}
              onChange={(e) => setPaymentStatus(e.target.value)}
              options={[
                { value: 'unpaid', label: 'Ödenmedi' },
                { value: 'paid', label: 'Ödendi' },
              ]}
            />
          )}

          {/* Özet */}
          {selectedClient && lessons > 0 && (
            <div className="rounded-lg bg-background p-4 space-y-2">
              <p className="text-sm font-medium text-text-primary">Paket Özeti</p>
              <div className="grid grid-cols-2 gap-2 text-sm">
                <span className="text-text-secondary">Danışan:</span>
                <span className="font-medium">{client?.full_name}</span>
                <span className="text-text-secondary">Ders:</span>
                <span className="font-medium">{lessons} ders</span>
                <span className="text-text-secondary">Süre:</span>
                <span className="font-medium">{days} gün</span>
                <span className="text-text-secondary">Tarih:</span>
                <span className="font-medium">
                  {new Date(startDate + 'T00:00:00').toLocaleDateString('tr-TR', { day: 'numeric', month: 'short' })}
                  {' — '}
                  {expireDate ? new Date(expireDate + 'T00:00:00').toLocaleDateString('tr-TR', { day: 'numeric', month: 'short', year: 'numeric' }) : '-'}
                </span>
                {price && (
                  <>
                    <span className="text-text-secondary">Ücret:</span>
                    <span className="font-medium">{Number(price).toLocaleString('tr-TR')} TL</span>
                  </>
                )}
              </div>
            </div>
          )}

          {error && (
            <div className="rounded-lg bg-danger/10 px-4 py-3 text-sm text-danger">
              {error}
            </div>
          )}

          <Button type="submit" fullWidth loading={loading} size="lg">
            Paket Oluştur
          </Button>
        </form>
      </Card>
    </div>
  )
}
