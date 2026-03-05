'use client'

import { useState } from 'react'
import Button from '@/components/ui/Button'
import Input from '@/components/ui/Input'
import Select from '@/components/ui/Select'
import Modal from '@/components/ui/Modal'

export interface AddClientResult {
  client: { full_name: string; invite_token: string }
  inviteUrl: string
  phone: string | null
}

interface AddClientModalProps {
  open: boolean
  onClose: () => void
  onSuccess: (data: AddClientResult) => void
}

export default function AddClientModal({ open, onClose, onSuccess }: AddClientModalProps) {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [form, setForm] = useState({
    full_name: '',
    email: '',
    phone: '',
    gender: '',
  })

  function updateField(field: string, value: string) {
    setForm((prev) => ({ ...prev, [field]: value }))
    setError('')
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()

    if (!form.full_name.trim() || form.full_name.trim().length < 2) {
      setError('Ad soyad en az 2 karakter olmalıdır')
      return
    }
    if (!form.email.trim()) {
      setError('E-posta adresi zorunludur')
      return
    }

    setLoading(true)
    setError('')

    try {
      const res = await fetch('/api/trainer/clients', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          full_name: form.full_name.trim(),
          email: form.email.trim(),
          phone: form.phone.trim() || null,
          gender: form.gender || null,
        }),
      })

      const data = await res.json()

      if (!res.ok) {
        setError(data.error || 'Bir hata oluştu')
        return
      }

      setForm({ full_name: '', email: '', phone: '', gender: '' })
      onSuccess({ ...data, phone: form.phone.trim() || null })
    } catch {
      setError('Bağlantı hatası. Lütfen tekrar deneyin.')
    } finally {
      setLoading(false)
    }
  }

  function handleClose() {
    setForm({ full_name: '', email: '', phone: '', gender: '' })
    setError('')
    onClose()
  }

  return (
    <Modal open={open} onClose={handleClose} title="Yeni Danışan Ekle">
      <form onSubmit={handleSubmit} className="space-y-4">
        <Input
          label="Ad Soyad"
          placeholder="Örnek: Ahmet Yılmaz"
          value={form.full_name}
          onChange={(e) => updateField('full_name', e.target.value)}
          required
        />

        <Input
          label="E-posta"
          type="email"
          placeholder="ornek@email.com"
          value={form.email}
          onChange={(e) => updateField('email', e.target.value)}
          required
        />

        <Input
          label="Telefon"
          type="tel"
          placeholder="+90 5XX XXX XX XX"
          hint="WhatsApp ile davet göndermek için"
          value={form.phone}
          onChange={(e) => updateField('phone', e.target.value)}
        />

        <Select
          label="Cinsiyet"
          value={form.gender}
          onChange={(e) => updateField('gender', e.target.value)}
          options={[
            { value: '', label: 'Seçiniz' },
            { value: 'male', label: 'Erkek' },
            { value: 'female', label: 'Kadın' },
          ]}
        />

        {error && (
          <div className="rounded-xl bg-danger/10 border border-danger/20 p-3">
            <p className="text-sm text-danger">{error}</p>
          </div>
        )}

        <div className="flex gap-3 pt-2">
          <Button
            type="button"
            variant="outline"
            fullWidth
            onClick={handleClose}
          >
            İptal
          </Button>
          <Button type="submit" fullWidth loading={loading}>
            Danışan Ekle
          </Button>
        </div>
      </form>
    </Modal>
  )
}
