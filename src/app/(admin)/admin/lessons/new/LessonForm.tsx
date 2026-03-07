'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import Card from '@/components/ui/Card'
import Button from '@/components/ui/Button'
import Input from '@/components/ui/Input'
import Select from '@/components/ui/Select'
import { sendLowLessonPush } from './actions'

interface ActivePackage {
  id: string
  user_id: string
  total_lessons: number
  used_lessons: number
  userName: string
}

export default function LessonForm({ activePackages }: { activePackages: ActivePackage[] }) {
  const router = useRouter()
  const [packageId, setPackageId] = useState('')
  const [date, setDate] = useState(new Date().toISOString().split('T')[0])
  const [notes, setNotes] = useState('')
  const [saving, setSaving] = useState(false)
  const [success, setSuccess] = useState(false)
  const [error, setError] = useState('')

  const selectedPkg = activePackages.find((p) => p.id === packageId)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setSaving(true)
    setError('')
    setSuccess(false)

    const supabase = createClient()

    if (!selectedPkg) {
      setError('Lütfen bir üye seçin')
      setSaving(false)
      return
    }

    // Gelecek tarih kontrolü
    const today = new Date().toISOString().split('T')[0]
    if (date > today) {
      setError('Gelecek tarih için ders eklenemez')
      setSaving(false)
      return
    }

    // Aynı gün aynı üyeye ders var mı kontrol et
    const { count } = await supabase
      .from('lessons')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', selectedPkg.user_id)
      .eq('date', date)

    if (count && count > 0) {
      setError('Bu üyeye bu tarihte zaten ders eklenmiş')
      setSaving(false)
      return
    }

    const { error: insertError } = await supabase.from('lessons').insert({
      package_id: packageId,
      user_id: selectedPkg.user_id,
      date,
      notes: notes || null,
    })

    if (insertError) {
      if (insertError.code === '23505') {
        setError('Bu üyeye bu tarihte zaten ders eklenmiş')
      } else {
        setError(insertError.message)
      }
    } else {
      // Kalan ders azsa push bildirimi gönder
      const remaining = selectedPkg.total_lessons - selectedPkg.used_lessons - 1
      if (remaining <= 2 && remaining >= 1) {
        await sendLowLessonPush(selectedPkg.user_id, remaining)
      }

      setSuccess(true)
      setPackageId('')
      setNotes('')
      setTimeout(() => setSuccess(false), 2000)
      router.refresh()
    }

    setSaving(false)
  }

  const packageOptions = [
    { value: '', label: 'Üye seçin...' },
    ...activePackages.map((p) => ({
      value: p.id,
      label: `${p.userName} (${p.used_lessons}/${p.total_lessons})`,
    })),
  ]

  return (
    <div className="max-w-lg mx-auto space-y-6">
      <h1 className="text-2xl heading-display">Ders Ekle</h1>

      <Card>
        <form onSubmit={handleSubmit} className="space-y-4">
          <Select
            label="Üye"
            options={packageOptions}
            value={packageId}
            onChange={(e) => setPackageId(e.target.value)}
            required
          />

          {selectedPkg && (
            <div className="text-sm text-text-secondary bg-surface-hover rounded-lg p-3">
              Kalan ders: <span className="text-text-primary font-medium">
                {selectedPkg.total_lessons - selectedPkg.used_lessons}
              </span>
            </div>
          )}

          <Input
            label="Tarih"
            type="date"
            value={date}
            max={new Date().toISOString().split('T')[0]}
            onChange={(e) => setDate(e.target.value)}
            required
          />

          <Input
            label="Notlar (opsiyonel)"
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="Ders hakkında notlar..."
          />

          {error && <p className="text-sm text-danger">{error}</p>}
          {success && <p className="text-sm text-success">Ders eklendi!</p>}

          <Button type="submit" loading={saving} className="w-full">
            Ders Ekle
          </Button>
        </form>
      </Card>
    </div>
  )
}
