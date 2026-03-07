'use client'

import { useState, useEffect, Suspense } from 'react'
import Link from 'next/link'
import { useRouter, useSearchParams } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import Button from '@/components/ui/Button'
import Input from '@/components/ui/Input'

export default function LoginPage() {
  return (
    <Suspense>
      <LoginContent />
    </Suspense>
  )
}

function LoginContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (searchParams.get('error') === 'auth') {
      setError('Google ile giriş başarısız oldu. Lütfen tekrar deneyin.')
    }
  }, [searchParams])

  const handleEmailLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    const supabase = createClient()
    const { error: loginError } = await supabase.auth.signInWithPassword({
      email,
      password,
    })

    if (loginError) {
      setError('Email veya şifre hatalı.')
      setLoading(false)
      return
    }

    // Rol bazlı yönlendirme
    const { data: { user } } = await supabase.auth.getUser()
    if (user) {
      const { data: trainer } = await supabase
        .from('trainers')
        .select('id, onboarding_completed')
        .eq('user_id', user.id)
        .maybeSingle()

      if (trainer) {
        router.push(trainer.onboarding_completed ? '/dashboard' : '/onboarding')
        return
      }

      const { data: client } = await supabase
        .from('clients')
        .select('id, onboarding_completed')
        .eq('user_id', user.id)
        .maybeSingle()

      if (client) {
        router.push(client.onboarding_completed ? '/app' : '/app/onboarding')
        return
      }

      // Ne trainer ne client — onboarding'e yönlendir
      router.push('/onboarding')
    } else {
      router.push('/login')
    }
    router.refresh()
  }

  const handleGoogleLogin = async () => {
    const supabase = createClient()
    await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: `${window.location.origin}/auth/callback`,
      },
    })
  }

  return (
    <div>
      {/* Logo — mobilde görünür */}
      <div className="lg:hidden mb-8 text-center">
        <h1 className="font-display text-4xl font-bold text-primary tracking-tight">
          MEGIN
        </h1>
      </div>

      <div className="mb-8">
        <h2 className="text-2xl font-bold text-text-primary">Giriş Yap</h2>
        <p className="mt-2 text-text-secondary">
          Hesabına giriş yap ve devam et.
        </p>
      </div>

      {/* Google SSO */}
      <button
        onClick={handleGoogleLogin}
        className="w-full flex items-center justify-center gap-3 rounded-xl border border-border bg-surface px-4 py-3 text-sm font-medium text-text-primary hover:bg-background transition-colors"
      >
        <svg className="w-5 h-5" viewBox="0 0 24 24">
          <path
            d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 01-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z"
            fill="#4285F4"
          />
          <path
            d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
            fill="#34A853"
          />
          <path
            d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
            fill="#FBBC05"
          />
          <path
            d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
            fill="#EA4335"
          />
        </svg>
        Google ile giriş yap
      </button>

      {/* Divider */}
      <div className="relative my-6">
        <div className="absolute inset-0 flex items-center">
          <div className="w-full border-t border-border" />
        </div>
        <div className="relative flex justify-center text-xs">
          <span className="bg-surface px-4 text-text-tertiary">veya email ile</span>
        </div>
      </div>

      {/* Email Form */}
      <form onSubmit={handleEmailLogin} className="space-y-4">
        <Input
          label="Email"
          type="email"
          placeholder="ornek@email.com"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          autoComplete="email"
        />
        <Input
          label="Şifre"
          type="password"
          placeholder="Şifreni gir"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
          autoComplete="current-password"
        />

        <div className="flex justify-end">
          <Link
            href="/forgot-password"
            className="text-sm text-primary hover:text-primary-dark"
          >
            Şifremi unuttum
          </Link>
        </div>

        {error && (
          <div className="rounded-lg bg-danger/10 px-4 py-3 text-sm text-danger">
            {error}
          </div>
        )}

        <Button type="submit" fullWidth loading={loading} size="lg" variant="gradient">
          Giriş Yap
        </Button>
      </form>

      <p className="mt-6 text-center text-sm text-text-secondary">
        Hesabın yok mu?{' '}
        <Link href="/signup" className="font-medium text-primary hover:text-primary-dark">
          Kayıt Ol
        </Link>
      </p>

      <p className="mt-4 text-center text-xs text-text-tertiary">
        Danışan mısın? Antrenörünüzden davet linki isteyin.
      </p>
    </div>
  )
}
