'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
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
  const [success, setSuccess] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')

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
      // 1. Kayıt oluştur
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

      // 2. Otomatik giriş yap
      const supabase = createClient()
      const { error: loginError } = await supabase.auth.signInWithPassword({
        email: clientEmail,
        password,
      })

      if (loginError) {
        // Login başarısız olursa yine de login sayfasına yönlendir
        router.push('/login?registered=true')
        return
      }

      // 3. Başarı ekranı göster, sonra yönlendir
      setSuccess(true)
      setTimeout(() => {
        router.push('/app')
        router.refresh()
      }, 2500)
    } catch {
      setError('Bir hata oluştu. Lütfen tekrar dene.')
      setLoading(false)
    }
  }

  // Başarı ekranı
  if (success) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background p-4">
        <div className="w-full max-w-md text-center">
          <div className="mb-6">
            <h1 className="font-display text-4xl font-bold text-primary tracking-tight">
              MEGIN
            </h1>
          </div>

          <div className="rounded-xl border border-border bg-surface p-10">
            {/* Animated checkmark */}
            <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-success/10">
              <svg
                className="w-10 h-10 text-success"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                style={{
                  strokeDasharray: 30,
                  strokeDashoffset: 30,
                  animation: 'checkmark 0.6s ease-out 0.2s forwards',
                }}
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
              </svg>
            </div>

            <h2 className="text-2xl font-bold text-text-primary mb-2">
              Hesabın Oluşturuldu!
            </h2>
            <p className="text-text-secondary mb-6">
              Hoş geldin, <span className="font-medium text-text-primary">{fullName.split(' ')[0]}</span>
            </p>

            {/* Loading bar */}
            <div className="w-full h-1.5 bg-background rounded-full overflow-hidden mb-4">
              <div
                className="h-full bg-primary rounded-full"
                style={{
                  animation: 'loadbar 2.2s ease-in-out forwards',
                }}
              />
            </div>

            <p className="text-sm text-text-tertiary">
              Paneline yönlendiriliyorsun...
            </p>
          </div>

          <style>{`
            @keyframes checkmark {
              to { stroke-dashoffset: 0; }
            }
            @keyframes loadbar {
              0% { width: 0%; }
              100% { width: 100%; }
            }
          `}</style>
        </div>
      </div>
    )
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
            <h2 className="text-2xl font-bold text-text-primary">Hoş Geldin!</h2>
            <p className="mt-2 text-text-secondary">
              <span className="font-medium text-text-primary">{trainerName}</span> seni davet etti.
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
