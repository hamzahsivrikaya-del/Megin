'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import Card, { CardHeader, CardTitle } from '@/components/ui/Card'
import Input from '@/components/ui/Input'
import Button from '@/components/ui/Button'
import Link from 'next/link'

export default function ClientSettingsPage() {
  const [fullName, setFullName] = useState('')
  const [phone, setPhone] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [savingPassword, setSavingPassword] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [passwordError, setPasswordError] = useState('')
  const [passwordSuccess, setPasswordSuccess] = useState('')

  useEffect(() => {
    async function load() {
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return

      const { data } = await supabase
        .from('clients')
        .select('full_name, phone')
        .eq('user_id', user.id)
        .maybeSingle()

      if (data) {
        setFullName(data.full_name || '')
        setPhone(data.phone || '')
      }
      setLoading(false)
    }
    load()
  }, [])

  async function handleSaveProfile(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    setSuccess('')
    setSaving(true)

    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return

    const { error: updateError } = await supabase
      .from('clients')
      .update({
        full_name: fullName.trim(),
        phone: phone.trim() || null,
      })
      .eq('user_id', user.id)

    if (updateError) {
      setError(`Güncellenirken bir hata oluştu`)
    } else {
      setSuccess(`Profil güncellendi`)
      window.dispatchEvent(new Event('profile-updated'))
    }
    setSaving(false)
  }

  async function handleChangePassword(e: React.FormEvent) {
    e.preventDefault()
    setPasswordError('')
    setPasswordSuccess('')

    if (newPassword.length < 6) {
      setPasswordError(`Şifre en az 6 karakter olmalıdır`)
      return
    }

    if (newPassword !== confirmPassword) {
      setPasswordError(`Şifreler eşleşmiyor`)
      return
    }

    setSavingPassword(true)

    const supabase = createClient()
    const { error } = await supabase.auth.updateUser({ password: newPassword })

    if (error) {
      setPasswordError(`Şifre güncellenirken bir hata oluştu`)
    } else {
      setPasswordSuccess(`Şifre güncellendi`)
      setNewPassword('')
      setConfirmPassword('')
    }
    setSavingPassword(false)
  }

  if (loading) {
    return (
      <div className="space-y-6 animate-pulse">
        <div className="h-8 bg-border rounded w-32" />
        <div className="bg-surface rounded-xl border border-border p-6 space-y-4">
          <div className="h-10 bg-border rounded" />
          <div className="h-10 bg-border rounded" />
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6 max-w-lg">
      <div>
        <Link href="/app" className="text-sm text-text-secondary hover:text-primary transition-colors">
          ← Geri
        </Link>
        <h1 className="text-2xl font-bold mt-1">Profilim</h1>
      </div>

      {/* Profil bilgileri */}
      <Card>
        <CardHeader><CardTitle>Profil Bilgileri</CardTitle></CardHeader>
        <form onSubmit={handleSaveProfile} className="space-y-4">
          <Input
            label="Ad Soyad"
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
            required
          />
          <Input
            label="Telefon"
            type="tel"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            placeholder="05XX XXX XX XX"
          />

          {error && <div className="rounded-lg bg-danger/10 px-4 py-3 text-sm text-danger">{error}</div>}
          {success && <div className="rounded-lg bg-success/10 px-4 py-3 text-sm text-success">{success}</div>}

          <Button type="submit" loading={saving}>Kaydet</Button>
        </form>
      </Card>

      {/* Şifre değiştirme */}
      <Card>
        <CardHeader><CardTitle>Şifre Değiştir</CardTitle></CardHeader>
        <form onSubmit={handleChangePassword} className="space-y-4">
          <Input
            label="Yeni Şifre"
            type="password"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            placeholder="En az 6 karakter"
            autoComplete="new-password"
          />
          <Input
            label="Şifre Tekrar"
            type="password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            placeholder="Şifreni tekrar gir"
            autoComplete="new-password"
          />

          {passwordError && <div className="rounded-lg bg-danger/10 px-4 py-3 text-sm text-danger">{passwordError}</div>}
          {passwordSuccess && <div className="rounded-lg bg-success/10 px-4 py-3 text-sm text-success">{passwordSuccess}</div>}

          <Button type="submit" loading={savingPassword}>Şifreyi Güncelle</Button>
        </form>
      </Card>
    </div>
  )
}
