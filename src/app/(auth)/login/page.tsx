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

    // Turkce karakterleri normalize et
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
    <div className="min-h-screen flex">
      {/* Left — Dark branding panel */}
      <div
        className="hidden lg:flex lg:w-1/2 flex-col justify-between bg-[#0A0A0A] px-16 py-10 relative overflow-hidden"
        aria-hidden="true"
      >
        {/* Ambient glow */}
        <div className="absolute top-1/2 left-1/2 w-[500px] h-[500px] bg-[#DC2626]/[0.06] rounded-full blur-[150px] -translate-x-1/2 -translate-y-1/2 pointer-events-none" />

        {/* Dot pattern */}
        <div className="absolute inset-0 opacity-[0.015]" style={{ backgroundImage: 'radial-gradient(circle, rgba(255,255,255,0.8) 1px, transparent 1px)', backgroundSize: '32px 32px' }} />

        {/* Top */}
        <div className="relative">
          <Link href="/" className="font-display text-xl tracking-[0.15em] text-white">
            MEGIN<span className="text-[#DC2626]">.</span>
          </Link>
        </div>

        {/* Center */}
        <div className="space-y-6 relative">
          <h2 className="font-display text-5xl xl:text-6xl tracking-wide text-white uppercase leading-none">
            WELCOME<br />
            <span className="text-[#DC2626]">BACK.</span>
          </h2>
          <p className="text-white/50 text-base leading-relaxed max-w-sm">
            Danisanlariniz sizi bekliyor. Giris yapin ve kaldığınız yerden devam edin.
          </p>
        </div>

        {/* Bottom */}
        <div className="border-t border-white/10 pt-6 relative">
          <p className="text-xs text-white/20">
            megin.io — personal trainer&apos;lar icin platform
          </p>
        </div>
      </div>

      {/* Right — Login form */}
      <div className="w-full lg:w-1/2 flex flex-col bg-white px-6 py-10 sm:px-12 lg:px-16">
        {/* Mobile logo */}
        <div className="mb-10 lg:hidden">
          <Link
            href="/"
            className="font-display text-xl tracking-[0.15em] text-[#0A0A0A]"
          >
            MEGIN<span className="text-[#DC2626]">.</span>
          </Link>
        </div>

        <div className="flex-1 flex items-center">
          <div className="w-full max-w-md">
            <div className="mb-8">
              <h1 className="font-display text-3xl sm:text-4xl tracking-wide text-[#0A0A0A] uppercase leading-tight">
                Giris Yap
              </h1>
              <p className="text-sm text-[#6B7280] mt-2">
                Hesabiniza erisin
              </p>
            </div>

            <form onSubmit={handleLogin} className="space-y-5" noValidate>
              <div>
                <label
                  htmlFor="email"
                  className="block text-xs font-bold uppercase tracking-wider text-[#0A0A0A] mb-2"
                >
                  E-posta
                </label>
                <input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="ornek@email.com"
                  required
                  autoComplete="email"
                  className="w-full border border-[#E5E7EB] bg-white rounded-xl px-4 py-3 text-sm text-[#0A0A0A] placeholder:text-[#9CA3AF] focus:outline-none focus:border-[#DC2626] transition-colors"
                />
              </div>

              <div>
                <label
                  htmlFor="password"
                  className="block text-xs font-bold uppercase tracking-wider text-[#0A0A0A] mb-2"
                >
                  Sifre
                </label>
                <input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  required
                  autoComplete="current-password"
                  className="w-full border border-[#E5E7EB] bg-white rounded-xl px-4 py-3 text-sm text-[#0A0A0A] placeholder:text-[#9CA3AF] focus:outline-none focus:border-[#DC2626] transition-colors"
                />
              </div>

              {error && (
                <p className="text-sm text-[#DC2626] text-center">{error}</p>
              )}

              <button
                type="submit"
                disabled={loading}
                className="mkt-cta-gradient w-full mt-2 rounded-xl"
              >
                {loading ? 'Giris yapiliyor...' : 'Giris Yap'}
              </button>

              <div className="text-center">
                <Link
                  href="/login/forgot-password"
                  className="text-sm text-[#6B7280] hover:text-[#DC2626] transition-colors"
                >
                  Sifremi unuttum
                </Link>
              </div>
            </form>

            <p className="mt-8 text-sm text-center text-[#6B7280]">
              Hesabiniz yok mu?{' '}
              <Link
                href="/signup"
                className="font-semibold text-[#0A0A0A] hover:text-[#DC2626] transition-colors"
              >
                Kayit Ol
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
