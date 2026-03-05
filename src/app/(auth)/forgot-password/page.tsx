'use client'

import { useState } from 'react'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import Button from '@/components/ui/Button'
import Input from '@/components/ui/Input'

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('')
  const [sent, setSent] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    const supabase = createClient()
    const { error: resetError } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/reset-password`,
    })

    if (resetError) {
      setError(resetError.message)
      setLoading(false)
      return
    }

    setSent(true)
    setLoading(false)
  }

  if (sent) {
    return (
      <div className="text-center">
        <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-full bg-success/10">
          <svg className="h-8 w-8 text-success" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
          </svg>
        </div>
        <h2 className="text-2xl font-bold text-text-primary">Email gönderildi</h2>
        <p className="mt-2 text-text-secondary">
          <strong>{email}</strong> adresine şifre sıfırlama linki gönderdik.
        </p>
        <Link href="/login" className="mt-6 inline-block text-sm text-primary hover:text-primary-dark">
          Giriş sayfasına dön
        </Link>
      </div>
    )
  }

  return (
    <div>
      <div className="lg:hidden mb-8 text-center">
        <h1 className="font-display text-4xl font-bold text-primary tracking-tight">MEGIN</h1>
      </div>

      <div className="mb-8">
        <h2 className="text-2xl font-bold text-text-primary">Şifremi Unuttum</h2>
        <p className="mt-2 text-text-secondary">
          Email adresini gir, sana şifre sıfırlama linki gönderelim.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <Input
          label="Email"
          type="email"
          placeholder="ornek@email.com"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          autoComplete="email"
        />

        {error && (
          <div className="rounded-lg bg-danger/10 px-4 py-3 text-sm text-danger">{error}</div>
        )}

        <Button type="submit" fullWidth loading={loading} size="lg">
          Sıfırlama Linki Gönder
        </Button>
      </form>

      <p className="mt-6 text-center text-sm text-text-secondary">
        <Link href="/login" className="font-medium text-primary hover:text-primary-dark">
          Giriş sayfasına dön
        </Link>
      </p>
    </div>
  )
}
