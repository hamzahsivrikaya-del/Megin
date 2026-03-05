'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import Card from '@/components/ui/Card'
import Select from '@/components/ui/Select'
import Input from '@/components/ui/Input'
import Button from '@/components/ui/Button'

interface ClientInfo {
  id: string
  full_name: string
}

interface MeasurementFormProps {
  clients: ClientInfo[]
  trainerId: string
}

const BODY_FIELDS = [
  { key: 'weight', label: 'Kilo (kg)', placeholder: '72.5' },
  { key: 'height', label: 'Boy (cm)', placeholder: '175' },
  { key: 'chest', label: 'Göğüs (cm)', placeholder: '95' },
  { key: 'waist', label: 'Bel (cm)', placeholder: '80' },
  { key: 'arm', label: 'Kol (cm)', placeholder: '32' },
  { key: 'leg', label: 'Bacak (cm)', placeholder: '55' },
  { key: 'body_fat_pct', label: 'Vücut Yağ Oranı (%)', placeholder: '18' },
]

const SKINFOLD_FIELDS = [
  { key: 'sf_chest', label: 'Göğüs (mm)', placeholder: '12' },
  { key: 'sf_abdomen', label: 'Karın (mm)', placeholder: '18' },
  { key: 'sf_thigh', label: 'Uyluk (mm)', placeholder: '15' },
]

const ALL_FIELDS = [...BODY_FIELDS, ...SKINFOLD_FIELDS]

export default function MeasurementForm({ clients, trainerId }: MeasurementFormProps) {
  const router = useRouter()
  const [selectedClient, setSelectedClient] = useState('')
  const [date, setDate] = useState(new Date().toISOString().split('T')[0])
  const [values, setValues] = useState<Record<string, string>>({})
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)

  function updateValue(key: string, value: string) {
    setValues((prev) => ({ ...prev, [key]: value }))
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError('')

    if (!selectedClient) {
      setError('Danışan seçiniz')
      return
    }

    // En az bir ölçüm girilmeli
    const hasValue = ALL_FIELDS.some((f) => values[f.key] && Number(values[f.key]) > 0)
    if (!hasValue) {
      setError('En az bir ölçüm giriniz')
      return
    }

    setLoading(true)

    try {
      const supabase = createClient()

      const measurement: Record<string, unknown> = {
        client_id: selectedClient,
        trainer_id: trainerId,
        date,
      }

      for (const field of ALL_FIELDS) {
        if (values[field.key] && Number(values[field.key]) > 0) {
          measurement[field.key] = Number(values[field.key])
        }
      }

      const { error: insertError } = await supabase
        .from('measurements')
        .insert(measurement)

      if (insertError) {
        setError('Ölçüm kaydedilirken bir hata oluştu')
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
        <h1 className="text-2xl font-bold">Ölçüm Gir</h1>
        <Card className="text-center py-8">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-success/10">
            <svg className="w-8 h-8 text-success" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <h2 className="text-lg font-bold text-text-primary">Ölçüm Kaydedildi!</h2>
          <p className="text-sm text-text-secondary mt-1">Yönlendiriliyorsun...</p>
        </Card>
      </div>
    )
  }

  return (
    <div className="max-w-lg mx-auto space-y-6">
      <h1 className="text-2xl font-bold">Ölçüm Gir</h1>

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
                label: c.full_name,
              })),
            ]}
          />

          <Input
            label="Tarih"
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            max={new Date().toISOString().split('T')[0]}
          />

          <div className="space-y-2">
            <h3 className="text-sm font-semibold text-text-primary">Vücut Ölçüleri</h3>
            <div className="grid grid-cols-2 gap-3">
              {BODY_FIELDS.map((field) => (
                <Input
                  key={field.key}
                  label={field.label}
                  type="number"
                  step="0.1"
                  placeholder={field.placeholder}
                  value={values[field.key] || ''}
                  onChange={(e) => updateValue(field.key, e.target.value)}
                />
              ))}
            </div>
          </div>

          <div className="rounded-xl bg-primary-50 border border-primary/15 p-4 space-y-2">
            <h3 className="text-sm font-bold text-primary">Skinfold Kaliper</h3>
            <p className="text-xs text-primary/60">Deri kıvrım kalınlığı ölçümleri (mm)</p>
            <div className="grid grid-cols-3 gap-3">
              {SKINFOLD_FIELDS.map((field) => (
                <Input
                  key={field.key}
                  label={field.label}
                  type="number"
                  step="0.1"
                  placeholder={field.placeholder}
                  value={values[field.key] || ''}
                  onChange={(e) => updateValue(field.key, e.target.value)}
                />
              ))}
            </div>
          </div>

          {error && (
            <div className="rounded-lg bg-danger/10 px-4 py-3 text-sm text-danger">
              {error}
            </div>
          )}

          <Button type="submit" fullWidth loading={loading} size="lg">
            Ölçüm Kaydet
          </Button>
        </form>
      </Card>
    </div>
  )
}
