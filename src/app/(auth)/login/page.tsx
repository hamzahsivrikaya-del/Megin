'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import Button from '@/components/ui/Button'
import Input from '@/components/ui/Input'

export default function LoginPage() {
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  async function handleLogin(e: React.FormEvent) {
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

    try {
      const supabase = createClient()
      const { data, error } = await supabase.auth.signInWithPassword({
        email: normalizedEmail,
        password,
      })

      if (error || !data.user) {
        setError('E-posta veya şifre hatalı')
        setLoading(false)
        return
      }

      // Kullanıcı rolüne göre yönlendir
      const { data: profile } = await supabase
        .from('users')
        .select('role')
        .eq('id', data.user.id)
        .maybeSingle()

      router.push(profile?.role === 'admin' ? '/admin' : '/dashboard')
    } catch {
      setError('E-posta veya şifre hatalı')
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-4 relative overflow-hidden">
      {/* Arka plan */}
      <div className="absolute inset-0 bg-[#FAFAFA]" />
      <div className="absolute -top-40 -right-40 w-[600px] h-[600px] bg-primary/5 rounded-full blur-[120px]" />
      <div className="absolute -bottom-40 -left-40 w-[500px] h-[500px] bg-primary/4 rounded-full blur-[100px]" />

      {/* Geometrik pattern */}
      <svg className="absolute inset-0 w-full h-full opacity-[0.03]" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <pattern id="login-grid" width="60" height="60" patternUnits="userSpaceOnUse">
            <path d="M 60 0 L 0 60" stroke="#000000" strokeWidth="0.5" fill="none" />
          </pattern>
        </defs>
        <rect width="100%" height="100%" fill="url(#login-grid)" />
      </svg>

      <div className="relative w-full max-w-md">
        {/* Logo + Başlık */}
        <div className="text-center mb-10 animate-fade-up">
          <h1 className="font-display text-6xl tracking-wider text-[#0A0A0A]">
            MEGIN<span className="text-[#FF2D2D]">.</span>
          </h1>
          <div className="flex items-center justify-center gap-3 mt-3">
            <div className="h-px w-12 bg-gradient-to-r from-transparent to-primary/50" />
            <p className="text-xs text-text-secondary uppercase tracking-[0.3em]">The Platform for Personal Trainers</p>
            <div className="h-px w-12 bg-gradient-to-l from-transparent to-primary/50" />
          </div>
        </div>

        {/* Login formu */}
        <div className="animate-fade-up delay-200">
          <form
            onSubmit={handleLogin}
            className="bg-surface/80 backdrop-blur-md rounded-2xl border border-border p-8 space-y-5 card-glow"
          >
            <div className="text-center mb-2">
              <h3 className="text-lg font-semibold">Giriş Yap</h3>
              <p className="text-sm text-text-secondary mt-1">Hesabınıza erişin</p>
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

            <Input
              label="Şifre"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              required
              autoComplete="current-password"
            />

            {error && (
              <p className="text-sm text-danger text-center animate-fade-in">{error}</p>
            )}

            <Button type="submit" loading={loading} className="w-full press-effect">
              Giriş Yap
            </Button>

            <div className="text-center">
              <Link href="/login/forgot-password" className="text-sm text-text-secondary hover:text-primary transition-colors">
                Şifremi unuttum
              </Link>
            </div>
          </form>
        </div>

        {/* Alt yazı */}
        <p className="text-center text-xs text-text-secondary/50 mt-8 animate-fade-up delay-400">
          megin.io
        </p>
      </div>
    </div>
  )
}
