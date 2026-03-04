'use client'

import { useState } from 'react'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import Button from '@/components/ui/Button'
import Input from '@/components/ui/Input'

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)
  const [sent, setSent] = useState(false)
  const [error, setError] = useState('')

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    setLoading(true)

    // Türkçe karakterleri normalize et (ı→i, ş→s vb.)
    const normalizedEmail = email.trim()
      .replace(/ı/g, 'i').replace(/İ/g, 'I')
      .replace(/ş/g, 's').replace(/Ş/g, 'S')
      .replace(/ç/g, 'c').replace(/Ç/g, 'C')
      .replace(/ğ/g, 'g').replace(/Ğ/g, 'G')
      .replace(/ü/g, 'u').replace(/Ü/g, 'U')
      .replace(/ö/g, 'o').replace(/Ö/g, 'O')
      .toLowerCase()

    const supabase = createClient()
    const { error } = await supabase.auth.resetPasswordForEmail(normalizedEmail, {
      redirectTo: `${window.location.origin}/api/auth/callback?next=/login/reset-password`,
    })

    if (error) {
      if (error.message.toLowerCase().includes('rate') || error.status === 429) {
        setError('Çok fazla deneme yaptınız. Lütfen birkaç dakika bekleyip tekrar deneyin.')
      } else {
        setError(error.message)
      }
    } else {
      setSent(true)
    }

    setLoading(false)
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-4 relative overflow-hidden">
      <div className="absolute inset-0 bg-[#FAFAFA]" />
      <div className="absolute -top-40 -right-40 w-[600px] h-[600px] bg-primary/5 rounded-full blur-[120px]" />

      <div className="relative w-full max-w-md">
        <div className="text-center mb-10 animate-fade-up">
          <h1 className="font-display text-5xl tracking-wider text-primary">ŞİFRE SIFIRLAMA</h1>
        </div>

        <div className="animate-fade-up delay-200">
          {sent ? (
            <div className="bg-surface/80 backdrop-blur-md rounded-2xl border border-border p-8 text-center">
              <div className="w-16 h-16 bg-success/10 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-success" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <h3 className="text-lg font-semibold mb-2">E-posta Gönderildi</h3>
              <p className="text-sm text-text-secondary mb-6">
                <strong>{email}</strong> adresine şifre sıfırlama linki gönderdik. E-postanızı kontrol edin.
              </p>
              <Link
                href="/login"
                className="text-sm text-primary hover:underline"
              >
                Giriş sayfasına dön
              </Link>
            </div>
          ) : (
            <form
              onSubmit={handleSubmit}
              className="bg-surface/80 backdrop-blur-md rounded-2xl border border-border p-8 space-y-5 card-glow"
            >
              <div className="text-center mb-2">
                <h3 className="text-lg font-semibold">Şifrenizi mi unuttunuz?</h3>
                <p className="text-sm text-text-secondary mt-1">
                  E-posta adresinizi girin, size şifre sıfırlama linki gönderelim.
                </p>
              </div>

              <Input
                label="E-posta"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="ornek@email.com"
                required
                autoComplete="email"
              />

              {error && (
                <p className="text-sm text-danger text-center animate-fade-in">{error}</p>
              )}

              <Button type="submit" loading={loading} className="w-full press-effect">
                Sıfırlama Linki Gönder
              </Button>

              <div className="text-center">
                <Link href="/login" className="text-sm text-text-secondary hover:text-text-primary transition-colors">
                  Giriş sayfasına dön
                </Link>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  )
}
