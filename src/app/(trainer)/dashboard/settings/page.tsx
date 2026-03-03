'use client'

import { useState, useEffect, useRef } from 'react'
import { createClient } from '@/lib/supabase/client'
import { updateTrainerProfile } from './actions'
import Card, { CardHeader, CardTitle } from '@/components/ui/Card'
import Input from '@/components/ui/Input'
import Textarea from '@/components/ui/Textarea'
import Select from '@/components/ui/Select'
import Button from '@/components/ui/Button'

const EXPERTISE_OPTIONS = [
  { value: 'pt', label: 'Personal Training' },
  { value: 'pilates', label: 'Pilates' },
  { value: 'yoga', label: 'Yoga' },
  { value: 'dietitian', label: 'Diyetisyen' },
  { value: 'other', label: 'Diğer' },
]

export default function TrainerProfilePage() {
  const fileRef = useRef<HTMLInputElement>(null)

  // Profil state
  const [fullName, setFullName] = useState('')
  const [phone, setPhone] = useState('')
  const [bio, setBio] = useState('')
  const [expertise, setExpertise] = useState('pt')
  const [experienceYears, setExperienceYears] = useState('')
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null)
  const [memberSince, setMemberSince] = useState('')

  // UI state
  const [loading, setLoading] = useState(true)
  const [avatarUploading, setAvatarUploading] = useState(false)
  const [avatarError, setAvatarError] = useState('')
  const [profilLoading, setProfilLoading] = useState(false)
  const [profilMessage, setProfilMessage] = useState('')
  const [profilError, setProfilError] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [sifreLoading, setSifreLoading] = useState(false)
  const [sifreMessage, setSifreMessage] = useState('')
  const [sifreError, setSifreError] = useState('')

  useEffect(() => {
    async function load() {
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return

      const { data: trainer } = await supabase
        .from('trainers')
        .select('*')
        .eq('user_id', user.id)
        .maybeSingle()

      if (trainer) {
        setFullName(trainer.full_name || '')
        setPhone(trainer.phone || '')
        setBio(trainer.bio || '')
        setExpertise(trainer.expertise || 'pt')
        setExperienceYears(trainer.experience_years?.toString() || '')
        setAvatarUrl(trainer.avatar_url)
        setMemberSince(trainer.created_at)
      }
      setLoading(false)
    }
    load()
  }, [])

  async function handleAvatarChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return

    if (file.size > 15 * 1024 * 1024) {
      setAvatarError('Dosya boyutu en fazla 15MB olmalıdır')
      return
    }

    setAvatarUploading(true)
    setAvatarError('')

    try {
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return

      const ext = file.name.split('.').pop()
      const path = `trainers/${user.id}/avatar.${ext}`

      const { error: uploadError } = await supabase.storage
        .from('avatars')
        .upload(path, file, { upsert: true })

      if (uploadError) {
        setAvatarError('Yükleme başarısız')
        setAvatarUploading(false)
        return
      }

      const { data: urlData } = supabase.storage
        .from('avatars')
        .getPublicUrl(path)

      const publicUrl = urlData.publicUrl + '?t=' + Date.now()

      await supabase
        .from('trainers')
        .update({ avatar_url: publicUrl })
        .eq('user_id', user.id)

      setAvatarUrl(publicUrl)
      window.dispatchEvent(new Event('profile-updated'))
    } catch {
      setAvatarError('Bir hata oluştu')
    }
    setAvatarUploading(false)
  }

  async function handleProfilSubmit(e: React.FormEvent) {
    e.preventDefault()
    setProfilError('')
    setProfilMessage('')

    if (fullName.trim().length < 2) {
      setProfilError('Ad soyad en az 2 karakter olmalıdır')
      return
    }

    setProfilLoading(true)
    try {
      await updateTrainerProfile({
        full_name: fullName,
        phone,
        bio,
        expertise,
        experience_years: experienceYears ? Number(experienceYears) : null,
      })
      setProfilMessage('Profil güncellendi')
      window.dispatchEvent(new Event('profile-updated'))
    } catch {
      setProfilError('Güncellenirken bir hata oluştu')
    }
    setProfilLoading(false)
  }

  async function handleSifreSubmit(e: React.FormEvent) {
    e.preventDefault()
    setSifreError('')
    setSifreMessage('')

    if (newPassword.length < 6) {
      setSifreError('Şifre en az 6 karakter olmalıdır')
      return
    }
    if (newPassword !== confirmPassword) {
      setSifreError('Şifreler eşleşmiyor')
      return
    }

    setSifreLoading(true)
    try {
      const supabase = createClient()
      const { error } = await supabase.auth.updateUser({ password: newPassword })
      if (error) throw error
      setSifreMessage('Şifre güncellendi')
      setNewPassword('')
      setConfirmPassword('')
    } catch {
      setSifreError('Şifre güncellenirken bir hata oluştu')
    }
    setSifreLoading(false)
  }

  if (loading) {
    return (
      <div className="space-y-6 max-w-lg mx-auto animate-pulse">
        <div className="h-8 bg-border rounded w-40" />
        <div className="flex flex-col items-center gap-4">
          <div className="w-24 h-24 rounded-full bg-border" />
          <div className="h-5 bg-border rounded w-48" />
        </div>
        <div className="bg-surface rounded-xl border border-border p-6 space-y-4">
          <div className="h-5 bg-border rounded w-32" />
          <div className="h-10 bg-border rounded" />
          <div className="h-10 bg-border rounded" />
        </div>
      </div>
    )
  }

  const initials = fullName
    .split(' ')
    .map((n) => n.charAt(0))
    .join('')
    .toUpperCase()
    .slice(0, 2)

  return (
    <div className="space-y-6 max-w-lg mx-auto">
      <h1 className="text-2xl font-bold">Profilim</h1>

      {/* Avatar */}
      <div className="flex flex-col items-center gap-3">
        <button
          type="button"
          onClick={() => fileRef.current?.click()}
          className="relative group cursor-pointer"
          disabled={avatarUploading}
        >
          <div className="w-24 h-24 rounded-full border-3 border-border overflow-hidden bg-surface-hover">
            {avatarUrl ? (
              <img
                src={avatarUrl}
                alt={fullName}
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center">
                <span className="text-2xl font-bold text-text-secondary">{initials || '?'}</span>
              </div>
            )}
          </div>
          <div className="absolute inset-0 rounded-full bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
            {avatarUploading ? (
              <svg className="w-6 h-6 text-white animate-spin" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
              </svg>
            ) : (
              <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
            )}
          </div>
          <input
            ref={fileRef}
            type="file"
            accept="image/*"
            onChange={handleAvatarChange}
            className="hidden"
          />
        </button>
        <div className="text-center">
          <p className="font-semibold text-text-primary">{fullName}</p>
          {memberSince && (
            <p className="text-xs text-text-secondary mt-0.5">
              Üyelik: {new Date(memberSince).toLocaleDateString('tr-TR', { month: 'long', year: 'numeric' })}
            </p>
          )}
        </div>
        {avatarError && (
          <p className="text-xs text-danger">{avatarError}</p>
        )}
      </div>

      {/* Profil Bilgileri */}
      <Card>
        <CardHeader><CardTitle>Profil Bilgileri</CardTitle></CardHeader>
        <form onSubmit={handleProfilSubmit} className="space-y-4">
          <Input
            label="Ad Soyad"
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
            placeholder="Adınız Soyadınız"
          />
          <Input
            label="Telefon"
            type="tel"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            placeholder="05XX XXX XX XX"
          />
          <Textarea
            label="Hakkımda"
            value={bio}
            onChange={(e) => setBio(e.target.value)}
            placeholder="Kendinizi kısaca tanıtın..."
            rows={3}
          />
          <div className="grid grid-cols-2 gap-3">
            <Select
              label="Uzmanlık"
              value={expertise}
              onChange={(e) => setExpertise(e.target.value)}
              options={EXPERTISE_OPTIONS}
            />
            <Input
              label="Deneyim (Yıl)"
              type="number"
              value={experienceYears}
              onChange={(e) => setExperienceYears(e.target.value)}
              placeholder="5"
              min={0}
              max={50}
            />
          </div>

          {profilMessage && (
            <div className="rounded-lg bg-success/10 px-4 py-3 text-sm text-success">
              {profilMessage}
            </div>
          )}
          {profilError && (
            <div className="rounded-lg bg-danger/10 px-4 py-3 text-sm text-danger">
              {profilError}
            </div>
          )}

          <Button type="submit" fullWidth loading={profilLoading}>
            Profili Güncelle
          </Button>
        </form>
      </Card>

      {/* Şifre Değiştir */}
      <Card>
        <CardHeader><CardTitle>Şifre Değiştir</CardTitle></CardHeader>
        <form onSubmit={handleSifreSubmit} className="space-y-4">
          <Input
            label="Yeni Şifre"
            type="password"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            placeholder="En az 6 karakter"
          />
          <Input
            label="Şifre Tekrar"
            type="password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            placeholder="Şifreni tekrar gir"
          />

          {sifreMessage && (
            <div className="rounded-lg bg-success/10 px-4 py-3 text-sm text-success">
              {sifreMessage}
            </div>
          )}
          {sifreError && (
            <div className="rounded-lg bg-danger/10 px-4 py-3 text-sm text-danger">
              {sifreError}
            </div>
          )}

          <Button type="submit" fullWidth loading={sifreLoading} variant="secondary">
            Şifreyi Güncelle
          </Button>
        </form>
      </Card>
    </div>
  )
}
