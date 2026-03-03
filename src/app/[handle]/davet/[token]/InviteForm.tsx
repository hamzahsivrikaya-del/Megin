'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import Button from '@/components/ui/Button'
import Input from '@/components/ui/Input'

interface InviteFormProps {
  token: string
  trainerName: string
  clientName: string
  clientEmail: string
}

export default function InviteForm({ token, trainerName, clientName, clientEmail }: InviteFormProps) {
  const router = useRouter()
  const [fullName, setFullName] = useState(clientName)
  const [password, setPassword] = useState('')
  const [passwordConfirm, setPasswordConfirm] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')

    // Validation
    if (!fullName.trim()) {
      setError('Ad soyad zorunludur')
      return
    }

    if (password.length < 6) {
      setError('Şifre en az 6 karakter olmalıdır')
      return
    }

    if (password !== passwordConfirm) {
      setError('Şifreler eşleşmiyor')
      return
    }

    setLoading(true)

    try {
      const res = await fetch('/api/invite/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          token,
          full_name: fullName.trim(),
          password,
        }),
      })

      const data = await res.json()

      if (!res.ok) {
        setError(data.error || 'Bir hata oluştu')
        setLoading(false)
        return
      }

      router.push('/login?registered=true')
    } catch {
      setError('Bir hata oluştu. Lütfen tekrar dene.')
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="mb-8 text-center">
          <h1 className="font-display text-4xl font-bold text-primary tracking-tight">
            MEGIN
          </h1>
        </div>

        {/* Card */}
        <div className="rounded-xl border border-border bg-surface p-8">
          <div className="mb-6">
            <h2 className="text-2xl font-bold text-text-primary">Hos Geldin!</h2>
            <p className="mt-2 text-text-secondary">
              {trainerName} seni davet etti.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <Input
              label="Ad Soyad"
              type="text"
              placeholder="Adını ve soyadını gir"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              required
              autoComplete="name"
            />

            {/* Email (readonly) */}
            <div className="space-y-1.5">
              <label className="block text-sm font-medium text-text-primary">
                E-posta
              </label>
              <div className="w-full rounded-xl border border-border bg-background px-4 py-2.5 text-sm text-text-secondary">
                {clientEmail}
              </div>
            </div>

            <Input
              label="Şifre"
              type="password"
              placeholder="En az 6 karakter"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              autoComplete="new-password"
              hint="En az 6 karakter"
            />

            <Input
              label="Şifre Tekrar"
              type="password"
              placeholder="Şifreni tekrar gir"
              value={passwordConfirm}
              onChange={(e) => setPasswordConfirm(e.target.value)}
              required
              autoComplete="new-password"
            />

            {error && (
              <div className="rounded-lg bg-danger/10 px-4 py-3 text-sm text-danger">
                {error}
              </div>
            )}

            <Button type="submit" fullWidth loading={loading} size="lg">
              Hesabımı Oluştur
            </Button>
          </form>
        </div>

        {/* Footer */}
        <p className="mt-6 text-center text-sm text-text-secondary">
          Zaten hesabın var mı?{' '}
          <Link href="/login" className="font-medium text-primary hover:text-primary-dark">
            Giriş Yap
          </Link>
        </p>
      </div>
    </div>
  )
}
