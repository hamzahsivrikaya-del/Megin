'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import Button from '@/components/ui/Button'
import Input from '@/components/ui/Input'

export default function ResetPasswordPage() {
  const router = useRouter()
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)
  const [ready, setReady] = useState(false)
  const [expired, setExpired] = useState(false)

  useEffect(() => {
    const supabase = createClient()
    const params = new URLSearchParams(window.location.search)
    const tokenHash = params.get('token_hash')
    const type = params.get('type')

    // token_hash ile dogrudan dogrulama (PKCE code verifier gerektirmez)
    // Email hangi tarayicide acilirsa acilsin calisir
    if (tokenHash && type === 'recovery') {
      supabase.auth.verifyOtp({ token_hash: tokenHash, type: 'recovery' })
        .then(({ error }) => {
          if (!error) {
            setReady(true)
          } else {
            console.error('[reset-password] verifyOtp error:', error.message)
            setExpired(true)
          }
        })
      return
    }

    // Callback'ten sonra session cookie'de gelir (PKCE fallback)
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) setReady(true)
    })

    // Hash-based flow icin (fallback)
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event) => {
      if (event === 'PASSWORD_RECOVERY' || event === 'SIGNED_IN') {
        setReady(true)
      }
    })

    // 5 saniye sonra hala ready degilse suresinin dolmus olabilir
    const timeout = setTimeout(() => {
      setExpired(prev => {
        // Sadece ready degilse expired yap
        return !ready ? true : prev
      })
    }, 5000)

    return () => {
      subscription.unsubscribe()
      clearTimeout(timeout)
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError('')

    if (password !== confirmPassword) {
      setError('Şifreler eşleşmiyor')
      return
    }

    if (password.length < 6) {
      setError('Şifre en az 6 karakter olmalı')
      return
    }

    setLoading(true)

    const supabase = createClient()
    const { error } = await supabase.auth.updateUser({ password })

    if (error) {
      setError(error.message)
    } else {
      setSuccess(true)
      // Tum aktif sessionlari kapat — eski sifre artik gecersiz
      await supabase.auth.signOut({ scope: 'global' })
      setTimeout(() => router.push('/login'), 3000)
    }

    setLoading(false)
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-4 relative overflow-hidden">
      <div className="absolute inset-0 bg-[#FAFAFA]" />
      <div className="absolute -top-40 -right-40 w-[600px] h-[600px] bg-primary/5 rounded-full blur-[120px]" />

      <div className="relative w-full max-w-md">
        <div className="text-center mb-10 animate-fade-up">
          <h1 className="font-display text-5xl tracking-wider text-primary">YENİ ŞİFRE</h1>
        </div>

        <div className="animate-fade-up delay-200">
          {success ? (
            <div className="bg-surface/80 backdrop-blur-md rounded-2xl border border-border p-8 text-center">
              <div className="w-16 h-16 bg-success/10 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-success" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <h3 className="text-lg font-semibold mb-2">Şifre Güncellendi</h3>
              <p className="text-sm text-text-secondary">
                Yeni şifreniz kaydedildi. Giriş sayfasına yönlendiriliyorsunuz...
              </p>
            </div>
          ) : expired ? (
            <div className="bg-surface/80 backdrop-blur-md rounded-2xl border border-border p-8 text-center">
              <div className="w-16 h-16 bg-danger/10 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-danger" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.732-.833-2.5 0L4.27 16.5c-.77.833.192 2.5 1.732 2.5z" />
                </svg>
              </div>
              <h3 className="text-lg font-semibold mb-2">Link Geçersiz</h3>
              <p className="text-sm text-text-secondary mb-6">
                Şifre sıfırlama linkinin süresi dolmuş veya daha önce kullanılmış. Lütfen tekrar deneyin.
              </p>
              <Link
                href="/login/forgot-password"
                className="inline-block px-6 py-2 bg-gradient-to-r from-[#DC2626] to-[#F97316] text-white rounded-lg text-sm font-medium shadow-sm hover:shadow-md transition-all"
              >
                Tekrar Sıfırlama Linki Gönder
              </Link>
            </div>
          ) : !ready ? (
            <div className="bg-surface/80 backdrop-blur-md rounded-2xl border border-border p-8 text-center">
              <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4" />
              <p className="text-sm text-text-secondary">Oturum doğrulanıyor...</p>
            </div>
          ) : (
            <form
              onSubmit={handleSubmit}
              className="bg-surface/80 backdrop-blur-md rounded-2xl border border-border p-8 space-y-5 card-glow"
            >
              <div className="text-center mb-2">
                <h3 className="text-lg font-semibold">Yeni Şifre Belirleyin</h3>
                <p className="text-sm text-text-secondary mt-1">En az 6 karakter olmalı</p>
              </div>

              <Input
                label="Yeni Şifre"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                required
              />

              <Input
                label="Yeni Şifre (Tekrar)"
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="••••••••"
                required
              />

              {error && (
                <p className="text-sm text-danger text-center animate-fade-in">{error}</p>
              )}

              <Button type="submit" loading={loading} className="w-full press-effect">
                Şifreyi Güncelle
              </Button>
            </form>
          )}
        </div>
      </div>
    </div>
  )
}
