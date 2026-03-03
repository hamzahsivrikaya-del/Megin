'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import Card from '@/components/ui/Card'
import Select from '@/components/ui/Select'
import Input from '@/components/ui/Input'
import Button from '@/components/ui/Button'

interface ActivePackage {
  id: string
  client_id: string
  total_lessons: number
  used_lessons: number
  clientName: string
}

interface LessonFormProps {
  activePackages: ActivePackage[]
  trainerId: string
}

export default function LessonForm({ activePackages, trainerId }: LessonFormProps) {
  const router = useRouter()
  const [selectedPackage, setSelectedPackage] = useState('')
  const [date, setDate] = useState(new Date().toISOString().split('T')[0])
  const [notes, setNotes] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)

  const pkg = activePackages.find((p) => p.id === selectedPackage)
  const remaining = pkg ? pkg.total_lessons - pkg.used_lessons : 0

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError('')

    if (!selectedPackage) {
      setError('Danışan seçiniz')
      return
    }

    if (!date) {
      setError('Tarih seçiniz')
      return
    }

    setLoading(true)

    try {
      const supabase = createClient()

      // Aynı gün aynı paket için ders var mı kontrol et
      const { data: existing } = await supabase
        .from('lessons')
        .select('id')
        .eq('package_id', selectedPackage)
        .eq('date', date)
        .maybeSingle()

      if (existing) {
        setError('Bu danışanın bu tarihte zaten dersi var')
        setLoading(false)
        return
      }

      const { error: insertError } = await supabase
        .from('lessons')
        .insert({
          package_id: selectedPackage,
          client_id: pkg!.client_id,
          trainer_id: trainerId,
          date,
          notes: notes.trim() || null,
        })

      if (insertError) {
        setError('Ders eklenirken bir hata oluştu')
        setLoading(false)
        return
      }

      // Paket ders sayısını güncelle
      await supabase
        .from('packages')
        .update({ used_lessons: pkg!.used_lessons + 1 })
        .eq('id', selectedPackage)

      setSuccess(true)
      setTimeout(() => {
        router.push('/dashboard/lessons/today')
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
        <h1 className="text-2xl font-bold">Manuel Ders Ekle</h1>
        <Card className="text-center py-8">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-success/10">
            <svg className="w-8 h-8 text-success" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <h2 className="text-lg font-bold text-text-primary">Ders Eklendi!</h2>
          <p className="text-sm text-text-secondary mt-1">Yönlendiriliyorsun...</p>
        </Card>
      </div>
    )
  }

  return (
    <div className="max-w-lg mx-auto space-y-6">
      <h1 className="text-2xl font-bold">Manuel Ders Ekle</h1>

      <Card>
        <form onSubmit={handleSubmit} className="space-y-4">
          <Select
            label="Danışan"
            value={selectedPackage}
            onChange={(e) => setSelectedPackage(e.target.value)}
            options={[
              { value: '', label: 'Danışan seçiniz' },
              ...activePackages.map((p) => ({
                value: p.id,
                label: `${p.clientName} (${p.used_lessons}/${p.total_lessons} ders)`,
              })),
            ]}
          />

          {pkg && remaining <= 2 && (
            <div className="rounded-lg bg-danger/10 px-4 py-3 text-sm text-danger">
              Bu danışanın son {remaining} dersi kaldı!
            </div>
          )}

          <Input
            label="Tarih"
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            max={new Date().toISOString().split('T')[0]}
          />

          <Input
            label="Not (Opsiyonel)"
            type="text"
            placeholder="Ders hakkında not..."
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
          />

          {error && (
            <div className="rounded-lg bg-danger/10 px-4 py-3 text-sm text-danger">
              {error}
            </div>
          )}

          <Button type="submit" fullWidth loading={loading} size="lg">
            Ders Ekle
          </Button>
        </form>
      </Card>
    </div>
  )
}
