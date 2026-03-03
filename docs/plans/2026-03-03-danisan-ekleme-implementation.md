# Danışan Ekleme & Davet Linki — Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** PT'nin danışan ekleyip davet linki göndermesi, danışanın linkten kaydolup kendi dashboard'una düşmesi.

**Architecture:** PT dashboard'a clients sayfası eklenir (liste + ekleme modal + davet popup). Public `/[handle]/davet/[token]` rotası danışan kayıt formunu sunar. Login sonrası rol algılanarak doğru dashboard'a yönlendirilir. Mevcut `clients.invite_token` ve `clients.invite_accepted` alanları kullanılır — ayrı tablo gerekmez.

**Tech Stack:** Next.js 16 (App Router), Supabase (Auth + DB), Tailwind CSS v4, TypeScript

**Design Doc:** `docs/plans/2026-03-03-danisan-ekleme-davet-design.md`

---

## Task 1: Modal ve Select UI Bileşenleri

**Files:**
- Create: `src/components/ui/Modal.tsx`
- Create: `src/components/ui/Select.tsx`

**Step 1: Modal bileşeni oluştur**

```tsx
// src/components/ui/Modal.tsx
'use client'

import { useEffect } from 'react'
import { cn } from '@/lib/utils'

interface ModalProps {
  open: boolean
  onClose: () => void
  title: string
  children: React.ReactNode
  size?: 'sm' | 'md' | 'lg'
}

export default function Modal({ open, onClose, title, children, size = 'md' }: ModalProps) {
  useEffect(() => {
    if (open) document.body.style.overflow = 'hidden'
    else document.body.style.overflow = ''
    return () => { document.body.style.overflow = '' }
  }, [open])

  if (!open) return null

  const widths = { sm: 'max-w-sm', md: 'max-w-md', lg: 'max-w-lg' }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/50" onClick={onClose} />
      <div className={cn('relative w-full bg-surface rounded-2xl shadow-xl max-h-[85vh] overflow-y-auto', widths[size])}>
        <div className="flex items-center justify-between p-5 border-b border-border-light">
          <h3 className="text-lg font-bold text-text-primary">{title}</h3>
          <button onClick={onClose} className="p-1 rounded-lg hover:bg-background transition-colors text-text-tertiary hover:text-text-primary">
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        <div className="p-5">{children}</div>
      </div>
    </div>
  )
}
```

**Step 2: Select bileşeni oluştur**

```tsx
// src/components/ui/Select.tsx
'use client'

import { cn } from '@/lib/utils'

interface SelectOption {
  value: string
  label: string
}

interface SelectProps extends Omit<React.SelectHTMLAttributes<HTMLSelectElement>, 'children'> {
  label?: string
  error?: string
  options: SelectOption[]
}

export default function Select({ label, error, options, className, id, ...props }: SelectProps) {
  const selectId = id || label?.toLowerCase().replace(/\s+/g, '-')

  return (
    <div className="space-y-1.5">
      {label && (
        <label htmlFor={selectId} className="block text-sm font-medium text-text-primary">
          {label}
        </label>
      )}
      <select
        id={selectId}
        className={cn(
          'w-full rounded-xl border bg-surface px-4 py-2.5 text-sm text-text-primary',
          'transition-colors duration-150',
          'focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary',
          error ? 'border-danger' : 'border-border hover:border-text-tertiary',
          className
        )}
        {...props}
      >
        {options.map((opt) => (
          <option key={opt.value} value={opt.value}>{opt.label}</option>
        ))}
      </select>
      {error && <p className="text-xs text-danger">{error}</p>}
    </div>
  )
}
```

**Step 3: Build kontrol**

Run: `npm run build 2>&1 | tail -5`
Expected: Build success

**Step 4: Commit**

```bash
git add src/components/ui/Modal.tsx src/components/ui/Select.tsx
git commit -m "feat: add Modal and Select UI components"
```

---

## Task 2: Danışan Ekleme API Route'u

**Files:**
- Create: `src/app/api/trainer/clients/route.ts`
- Modify: `src/lib/utils.ts` (generateToken helper)

**Step 1: Token üretici helper ekle**

`src/lib/utils.ts` dosyasının sonuna ekle:

```ts
export function generateInviteToken(): string {
  const chars = 'abcdefghijklmnopqrstuvwxyz0123456789'
  let token = ''
  for (let i = 0; i < 24; i++) {
    token += chars[Math.floor(Math.random() * chars.length)]
  }
  return token
}
```

**Step 2: API route oluştur**

```ts
// src/app/api/trainer/clients/route.ts
import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { generateInviteToken, normalizeEmail } from '@/lib/utils'

export async function POST(request: Request) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.json({ error: 'Giriş yapmalısın' }, { status: 401 })
  }

  // Trainer kontrolü
  const { data: trainer } = await supabase
    .from('trainers')
    .select('id, username')
    .eq('user_id', user.id)
    .maybeSingle()

  if (!trainer) {
    return NextResponse.json({ error: 'Trainer bulunamadı' }, { status: 403 })
  }

  const body = await request.json()
  const { full_name, email, phone, gender } = body

  // Validasyon
  if (!full_name?.trim() || full_name.trim().length < 2) {
    return NextResponse.json({ error: 'Ad soyad en az 2 karakter olmalı' }, { status: 400 })
  }

  if (!email?.trim()) {
    return NextResponse.json({ error: 'Email zorunlu' }, { status: 400 })
  }

  const normalizedEmail = normalizeEmail(email)

  // Email benzersizlik kontrolü (bu trainer altında)
  const { data: existing } = await supabase
    .from('clients')
    .select('id')
    .eq('trainer_id', trainer.id)
    .eq('email', normalizedEmail)
    .maybeSingle()

  if (existing) {
    return NextResponse.json({ error: 'Bu email ile zaten bir danışan var' }, { status: 400 })
  }

  // Token üret
  const inviteToken = generateInviteToken()

  // Client oluştur (henüz Supabase Auth kullanıcısı yok)
  const { data: client, error: insertError } = await supabase
    .from('clients')
    .insert({
      trainer_id: trainer.id,
      full_name: full_name.trim(),
      email: normalizedEmail,
      phone: phone?.trim() || null,
      gender: gender || null,
      invite_token: inviteToken,
      invite_accepted: false,
    })
    .select('id, full_name, email, invite_token')
    .single()

  if (insertError) {
    return NextResponse.json({ error: 'Danışan eklenemedi' }, { status: 500 })
  }

  return NextResponse.json({
    client,
    inviteUrl: `/${trainer.username}/davet/${inviteToken}`,
  }, { status: 201 })
}

export async function GET() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.json({ error: 'Giriş yapmalısın' }, { status: 401 })
  }

  const { data: trainer } = await supabase
    .from('trainers')
    .select('id')
    .eq('user_id', user.id)
    .maybeSingle()

  if (!trainer) {
    return NextResponse.json({ error: 'Trainer bulunamadı' }, { status: 403 })
  }

  const { data: clients } = await supabase
    .from('clients')
    .select('*, packages(id, total_lessons, used_lessons, status)')
    .eq('trainer_id', trainer.id)
    .order('created_at', { ascending: false })

  return NextResponse.json({ clients: clients ?? [] })
}
```

**Step 3: Build kontrol**

Run: `npm run build 2>&1 | tail -5`
Expected: Build success

**Step 4: Commit**

```bash
git add src/lib/utils.ts src/app/api/trainer/clients/route.ts
git commit -m "feat: add client creation API with invite token"
```

---

## Task 3: Danışan Listesi Sayfası + Ekleme Modal

**Files:**
- Create: `src/app/(trainer)/dashboard/clients/page.tsx`
- Create: `src/app/(trainer)/dashboard/clients/ClientsPage.tsx`

**Step 1: Server component (page.tsx)**

```tsx
// src/app/(trainer)/dashboard/clients/page.tsx
import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import ClientsPage from './ClientsPage'

export default async function ClientsRoute() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) redirect('/login')

  const { data: trainer } = await supabase
    .from('trainers')
    .select('id, username')
    .eq('user_id', user.id)
    .maybeSingle()

  if (!trainer) redirect('/onboarding')

  const { data: clients } = await supabase
    .from('clients')
    .select('*, packages(id, total_lessons, used_lessons, status)')
    .eq('trainer_id', trainer.id)
    .order('created_at', { ascending: false })

  return <ClientsPage clients={clients ?? []} trainerUsername={trainer.username} />
}
```

**Step 2: Client component (ClientsPage.tsx)**

Bu dosya büyük olacak — danışan listesi, ekleme modal, davet popup içerecek. frontend-design skill kullanılacak.

```tsx
// src/app/(trainer)/dashboard/clients/ClientsPage.tsx
'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Button from '@/components/ui/Button'
import Input from '@/components/ui/Input'
import Select from '@/components/ui/Select'
import Modal from '@/components/ui/Modal'
import { cn } from '@/lib/utils'

interface ClientWithPackages {
  id: string
  full_name: string
  email: string | null
  phone: string | null
  gender: string | null
  avatar_url: string | null
  is_active: boolean
  invite_accepted: boolean
  invite_token: string | null
  created_at: string
  packages: { id: string; total_lessons: number; used_lessons: number; status: string }[]
}

interface Props {
  clients: ClientWithPackages[]
  trainerUsername: string
}

const GENDER_OPTIONS = [
  { value: '', label: 'Seçiniz' },
  { value: 'male', label: 'Erkek' },
  { value: 'female', label: 'Kadın' },
]

export default function ClientsPage({ clients, trainerUsername }: Props) {
  const router = useRouter()
  const [search, setSearch] = useState('')
  const [filter, setFilter] = useState<'all' | 'active' | 'pending'>('all')

  // Add modal
  const [addOpen, setAddOpen] = useState(false)
  const [adding, setAdding] = useState(false)
  const [addError, setAddError] = useState('')
  const [form, setForm] = useState({ full_name: '', email: '', phone: '', gender: '' })

  // Invite popup
  const [inviteData, setInviteData] = useState<{ name: string; url: string; phone: string | null } | null>(null)
  const [copied, setCopied] = useState(false)

  const siteUrl = typeof window !== 'undefined' ? window.location.origin : ''

  // Filtreleme
  const filtered = clients.filter((c) => {
    const matchesSearch =
      c.full_name.toLowerCase().includes(search.toLowerCase()) ||
      (c.email?.toLowerCase().includes(search.toLowerCase()) ?? false)

    if (filter === 'active') return matchesSearch && c.invite_accepted
    if (filter === 'pending') return matchesSearch && !c.invite_accepted
    return matchesSearch
  })

  const handleAdd = async () => {
    setAddError('')

    if (!form.full_name.trim()) {
      setAddError('Ad soyad girin')
      return
    }
    if (!form.email.trim()) {
      setAddError('Email girin')
      return
    }

    setAdding(true)
    try {
      const res = await fetch('/api/trainer/clients', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      })
      const data = await res.json()

      if (!res.ok) {
        setAddError(data.error || 'Bir hata oluştu')
        return
      }

      // Başarı — invite popup göster
      setAddOpen(false)
      setForm({ full_name: '', email: '', phone: '', gender: '' })
      setInviteData({
        name: data.client.full_name,
        url: `${siteUrl}${data.inviteUrl}`,
        phone: form.phone || null,
      })
      router.refresh()
    } catch {
      setAddError('Bağlantı hatası')
    } finally {
      setAdding(false)
    }
  }

  const handleCopy = async () => {
    if (!inviteData) return
    await navigator.clipboard.writeText(inviteData.url)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const handleWhatsApp = () => {
    if (!inviteData) return
    const text = encodeURIComponent(`Merhaba! Megin'e katılmak için bu linke tıkla: ${inviteData.url}`)
    const phoneNum = inviteData.phone?.replace(/\D/g, '') || ''
    const url = phoneNum ? `https://wa.me/${phoneNum}?text=${text}` : `https://wa.me/?text=${text}`
    window.open(url, '_blank')
  }

  const pendingCount = clients.filter((c) => !c.invite_accepted).length

  return (
    <div>
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-text-primary">Danışanlar</h1>
          <p className="mt-1 text-sm text-text-secondary">
            {clients.length} danışan{pendingCount > 0 && ` · ${pendingCount} bekleyen`}
          </p>
        </div>
        <Button onClick={() => setAddOpen(true)}>
          + Yeni Danışan
        </Button>
      </div>

      {/* Search + Filter */}
      {clients.length > 0 && (
        <div className="flex flex-col sm:flex-row gap-3 mb-6">
          <div className="flex-1">
            <Input
              placeholder="İsim veya email ara..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <div className="flex gap-2">
            {(['all', 'active', 'pending'] as const).map((f) => (
              <button
                key={f}
                onClick={() => setFilter(f)}
                className={cn(
                  'px-4 py-2.5 rounded-xl text-sm font-medium transition-colors',
                  filter === f
                    ? 'bg-primary text-white'
                    : 'bg-surface border border-border text-text-secondary hover:bg-background'
                )}
              >
                {f === 'all' ? 'Tümü' : f === 'active' ? 'Aktif' : 'Bekleyen'}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Client List */}
      {filtered.length === 0 ? (
        <div className="card-base text-center py-12">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-primary/10">
            <span className="text-3xl">👥</span>
          </div>
          <h3 className="text-lg font-bold text-text-primary">
            {clients.length === 0 ? 'Henüz danışan yok' : 'Sonuç bulunamadı'}
          </h3>
          <p className="mt-2 text-sm text-text-secondary max-w-sm mx-auto">
            {clients.length === 0
              ? 'İlk danışanını ekle ve davet linkini gönder.'
              : 'Farklı bir arama dene.'}
          </p>
          {clients.length === 0 && (
            <Button onClick={() => setAddOpen(true)} className="mt-4">
              + Danışan Ekle
            </Button>
          )}
        </div>
      ) : (
        <div className="grid gap-3">
          {filtered.map((client) => {
            const activePackage = client.packages?.find((p) => p.status === 'active')
            const remaining = activePackage
              ? activePackage.total_lessons - activePackage.used_lessons
              : null

            return (
              <div
                key={client.id}
                className="card-base hover-lift cursor-pointer flex items-center justify-between"
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-lg font-medium text-primary">
                    {client.full_name.charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <p className="font-medium text-text-primary">{client.full_name}</p>
                      {!client.invite_accepted && (
                        <span className="text-xs bg-warning/10 text-warning px-2 py-0.5 rounded-full font-medium">
                          Bekleyen
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-text-tertiary">{client.email}</p>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  {/* Paket durumu */}
                  {activePackage ? (
                    <span className={cn(
                      'text-xs px-2 py-1 rounded-lg font-medium',
                      remaining === 0 ? 'bg-danger/10 text-danger' :
                      remaining !== null && remaining <= 2 ? 'bg-warning/10 text-warning' :
                      'bg-success/10 text-success'
                    )}>
                      {remaining === 0 ? 'Bitti' : `${remaining} ders kaldı`}
                    </span>
                  ) : (
                    <span className="text-xs bg-background text-text-tertiary px-2 py-1 rounded-lg">
                      Paket yok
                    </span>
                  )}

                  {/* Bekleyen danışan için davet linki butonu */}
                  {!client.invite_accepted && client.invite_token && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation()
                        setInviteData({
                          name: client.full_name,
                          url: `${siteUrl}/${trainerUsername}/davet/${client.invite_token}`,
                          phone: client.phone,
                        })
                      }}
                      className="p-2 rounded-lg hover:bg-background transition-colors text-text-tertiary hover:text-primary"
                      title="Davet linkini göster"
                    >
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
                      </svg>
                    </button>
                  )}
                </div>
              </div>
            )
          })}
        </div>
      )}

      {/* ── Add Client Modal ── */}
      <Modal open={addOpen} onClose={() => { setAddOpen(false); setAddError('') }} title="Yeni Danışan Ekle">
        <div className="space-y-4">
          <Input
            label="Ad Soyad"
            placeholder="Ayşe Yılmaz"
            value={form.full_name}
            onChange={(e) => setForm({ ...form, full_name: e.target.value })}
            required
          />
          <Input
            label="Email"
            type="email"
            placeholder="ayse@email.com"
            value={form.email}
            onChange={(e) => setForm({ ...form, email: e.target.value })}
            required
          />
          <Input
            label="Telefon"
            type="tel"
            placeholder="05XX XXX XX XX"
            value={form.phone}
            onChange={(e) => setForm({ ...form, phone: e.target.value })}
            hint="WhatsApp ile davet göndermek için"
          />
          <Select
            label="Cinsiyet"
            options={GENDER_OPTIONS}
            value={form.gender}
            onChange={(e) => setForm({ ...form, gender: e.target.value })}
          />

          {addError && (
            <div className="rounded-lg bg-danger/10 px-4 py-3 text-sm text-danger">
              {addError}
            </div>
          )}

          <div className="flex gap-3 justify-end pt-2">
            <Button variant="outline" onClick={() => { setAddOpen(false); setAddError('') }}>
              İptal
            </Button>
            <Button onClick={handleAdd} loading={adding}>
              Danışan Ekle
            </Button>
          </div>
        </div>
      </Modal>

      {/* ── Invite Popup ── */}
      <Modal
        open={!!inviteData}
        onClose={() => { setInviteData(null); setCopied(false) }}
        title="Davet Linki"
        size="sm"
      >
        {inviteData && (
          <div className="text-center space-y-4">
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-success/10">
              <svg className="w-7 h-7 text-success" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <p className="font-medium text-text-primary">
              {inviteData.name} eklendi!
            </p>

            <div className="bg-background rounded-xl p-3">
              <p className="text-xs text-text-tertiary mb-1">Davet linki</p>
              <p className="text-sm text-text-primary break-all font-mono">
                {inviteData.url}
              </p>
            </div>

            <div className="flex gap-3">
              <Button variant="outline" fullWidth onClick={handleCopy}>
                {copied ? 'Kopyalandı!' : 'Kopyala'}
              </Button>
              <Button fullWidth onClick={handleWhatsApp}>
                WhatsApp&apos;ta Gönder
              </Button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  )
}
```

**Step 3: Build kontrol**

Run: `npm run build 2>&1 | tail -10`
Expected: Build success

**Step 4: Commit**

```bash
git add src/app/\(trainer\)/dashboard/clients/
git commit -m "feat: add clients page with add modal and invite popup"
```

---

## Task 4: Davet Sayfası (Public — Danışan Kayıt)

**Files:**
- Create: `src/app/[handle]/davet/[token]/page.tsx`
- Create: `src/app/api/invite/register/route.ts`

**Step 1: Invite register API route**

```ts
// src/app/api/invite/register/route.ts
import { NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { createClient } from '@/lib/supabase/server'

export async function POST(request: Request) {
  const body = await request.json()
  const { token, full_name, password } = body

  if (!token || !password || password.length < 6) {
    return NextResponse.json({ error: 'Şifre en az 6 karakter olmalı' }, { status: 400 })
  }

  const supabase = await createClient()

  // Token ile client bul
  const { data: client } = await supabase
    .from('clients')
    .select('id, email, trainer_id, invite_accepted')
    .eq('invite_token', token)
    .maybeSingle()

  if (!client || client.invite_accepted) {
    return NextResponse.json({ error: 'Geçersiz veya kullanılmış davet linki' }, { status: 400 })
  }

  if (!client.email) {
    return NextResponse.json({ error: 'Email bilgisi eksik' }, { status: 400 })
  }

  // Supabase Auth ile kullanıcı oluştur (admin client gerekli)
  const adminClient = createAdminClient()
  const { data: authData, error: authError } = await adminClient.auth.admin.createUser({
    email: client.email,
    password,
    email_confirm: true, // Davet linkinden geldiği için email onaylı
    user_metadata: {
      full_name: full_name?.trim() || client.email,
      role: 'client',
    },
  })

  if (authError) {
    if (authError.message.includes('already been registered')) {
      return NextResponse.json({ error: 'Bu email ile zaten bir hesap var. Giriş yapmayı dene.' }, { status: 400 })
    }
    return NextResponse.json({ error: 'Hesap oluşturulamadı' }, { status: 500 })
  }

  // Client kaydını güncelle
  await adminClient
    .from('clients')
    .update({
      user_id: authData.user.id,
      full_name: full_name?.trim() || undefined,
      invite_accepted: true,
      onboarding_completed: true,
    })
    .eq('id', client.id)

  return NextResponse.json({ success: true })
}
```

**Step 2: Davet sayfası (public)**

```tsx
// src/app/[handle]/davet/[token]/page.tsx
import { createClient } from '@/lib/supabase/server'
import { notFound } from 'next/navigation'
import InviteForm from './InviteForm'

interface Props {
  params: Promise<{ handle: string; token: string }>
}

export default async function InvitePage({ params }: Props) {
  const { handle, token } = await params
  const supabase = await createClient()

  // Trainer bul
  const { data: trainer } = await supabase
    .from('trainers')
    .select('id, full_name, avatar_url, username')
    .eq('username', handle)
    .maybeSingle()

  if (!trainer) notFound()

  // Token ile client bul
  const { data: client } = await supabase
    .from('clients')
    .select('id, full_name, email, invite_accepted')
    .eq('invite_token', token)
    .eq('trainer_id', trainer.id)
    .maybeSingle()

  if (!client) notFound()

  // Zaten kabul edilmişse
  if (client.invite_accepted) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4 bg-background">
        <div className="w-full max-w-sm text-center">
          <div className="card-base py-10 space-y-4">
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-success/10">
              <svg className="w-7 h-7 text-success" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <p className="font-medium text-text-primary">Bu davet linki zaten kullanılmış.</p>
            <a
              href="/login"
              className="inline-flex items-center justify-center rounded-xl bg-primary px-6 py-2.5 text-sm font-medium text-white hover:bg-primary-dark transition-colors"
            >
              Giriş Yap
            </a>
          </div>
        </div>
      </div>
    )
  }

  return (
    <InviteForm
      token={token}
      trainerName={trainer.full_name}
      clientName={client.full_name}
      clientEmail={client.email ?? ''}
    />
  )
}
```

**Step 3: Invite form client component**

```tsx
// src/app/[handle]/davet/[token]/InviteForm.tsx
'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Button from '@/components/ui/Button'
import Input from '@/components/ui/Input'

interface Props {
  token: string
  trainerName: string
  clientName: string
  clientEmail: string
}

export default function InviteForm({ token, trainerName, clientName, clientEmail }: Props) {
  const router = useRouter()
  const [fullName, setFullName] = useState(clientName)
  const [password, setPassword] = useState('')
  const [passwordConfirm, setPasswordConfirm] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')

    if (!fullName.trim()) {
      setError('Ad soyad girin')
      return
    }
    if (password.length < 6) {
      setError('Şifre en az 6 karakter olmalı')
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
        body: JSON.stringify({ token, full_name: fullName, password }),
      })
      const data = await res.json()

      if (!res.ok) {
        setError(data.error || 'Bir hata oluştu')
        return
      }

      // Başarı — login sayfasına yönlendir
      router.push('/login?registered=true')
    } catch {
      setError('Bağlantı hatası')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-background">
      <div className="w-full max-w-sm">
        <div className="text-center mb-8">
          <h1 className="font-display text-4xl font-bold text-primary tracking-tight">
            MEGIN
          </h1>
        </div>

        <div className="card-base">
          <div className="text-center mb-6">
            <h2 className="text-xl font-bold text-text-primary">Hoş Geldin!</h2>
            <p className="mt-2 text-sm text-text-secondary">
              <span className="font-medium text-text-primary">{trainerName}</span> seni davet etti.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <Input
              label="Ad Soyad"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              required
            />
            <div className="space-y-1.5">
              <label className="block text-sm font-medium text-text-primary">Email</label>
              <div className="w-full rounded-xl border border-border bg-background px-4 py-2.5 text-sm text-text-tertiary">
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

        <p className="mt-6 text-center text-xs text-text-tertiary">
          Zaten hesabın var mı?{' '}
          <a href="/login" className="font-medium text-primary hover:text-primary-dark">
            Giriş Yap
          </a>
        </p>
      </div>
    </div>
  )
}
```

**Step 4: Build kontrol**

Run: `npm run build 2>&1 | tail -10`
Expected: Build success

**Step 5: Commit**

```bash
git add src/app/\[handle\]/davet/ src/app/api/invite/
git commit -m "feat: add public invite page and client registration API"
```

---

## Task 5: Middleware + Login Rol Yönlendirmesi Güncelleme

**Files:**
- Modify: `src/lib/supabase/middleware.ts` (davet rotalarını public yap)
- Modify: `src/app/(auth)/auth/callback/route.ts` (rol bazlı yönlendirme)
- Modify: `src/app/(auth)/login/page.tsx` (rol algılama + danışan notu)
- Modify: `src/app/(auth)/signup/page.tsx` (danışan notu)

**Step 1: Middleware — davet rotalarını public yap**

`src/lib/supabase/middleware.ts` dosyasındaki `isPublicPath` kontrolünü güncelle:

```ts
// Mevcut:
const isPublicPath = publicPaths.some(
  (path) =>
    request.nextUrl.pathname === path ||
    request.nextUrl.pathname.startsWith('/api/') ||
    request.nextUrl.pathname.match(/^\/[a-z0-9_-]+$/) // /<username> public profil
)

// Yeni:
const isPublicPath = publicPaths.some(
  (path) =>
    request.nextUrl.pathname === path ||
    request.nextUrl.pathname.startsWith('/api/') ||
    request.nextUrl.pathname.match(/^\/[a-z0-9_-]+$/) || // /<username> public profil
    request.nextUrl.pathname.match(/^\/[a-z0-9_-]+\/davet\/[a-z0-9]+$/) // /<handle>/davet/<token>
)
```

**Step 2: Login sayfası — rol bazlı yönlendirme + danışan notu**

`src/app/(auth)/login/page.tsx` dosyasında `handleEmailLogin` fonksiyonundaki yönlendirmeyi güncelle:

```ts
// Mevcut (satır 34):
router.push('/dashboard')

// Yeni — rol algılama:
// Login sonrası kullanıcı rolünü kontrol et
const { data: trainer } = await supabase
  .from('trainers')
  .select('id')
  .eq('user_id', (await supabase.auth.getUser()).data.user?.id ?? '')
  .maybeSingle()

if (trainer) {
  router.push('/dashboard')
} else {
  router.push('/app')
}
```

Ve signup sayfasının altına (form'un altındaki "Hesabın yok mu?" paragrafından sonra) danışan notu ekle:

```tsx
<p className="mt-4 text-center text-xs text-text-tertiary">
  Danışan mısın? Antrenörünüzden davet linki isteyin.
</p>
```

**Step 3: Signup sayfasına da aynı notu ekle**

`src/app/(auth)/signup/page.tsx` — en alttaki terms paragrafından önce:

```tsx
<p className="mt-4 text-center text-xs text-text-tertiary">
  Danışan mısın? Antrenörünüzden davet linki isteyin.
</p>
```

**Step 4: Auth callback — rol bazlı yönlendirme**

`src/app/(auth)/auth/callback/route.ts` dosyasını güncelle:

```ts
import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url)
  const code = searchParams.get('code')

  if (code) {
    const supabase = await createClient()
    const { error } = await supabase.auth.exchangeCodeForSession(code)
    if (!error) {
      // Rol bazlı yönlendirme
      const { data: { user } } = await supabase.auth.getUser()
      if (user) {
        const { data: trainer } = await supabase
          .from('trainers')
          .select('id, onboarding_completed')
          .eq('user_id', user.id)
          .maybeSingle()

        if (trainer) {
          return NextResponse.redirect(`${origin}${trainer.onboarding_completed ? '/dashboard' : '/onboarding'}`)
        }
        // Client ise
        return NextResponse.redirect(`${origin}/app`)
      }
      // Fallback — yeni kayıt, onboarding'e git
      return NextResponse.redirect(`${origin}/onboarding`)
    }
  }

  return NextResponse.redirect(`${origin}/login?error=auth`)
}
```

**Step 5: Build kontrol**

Run: `npm run build 2>&1 | tail -10`
Expected: Build success

**Step 6: Commit**

```bash
git add src/lib/supabase/middleware.ts src/app/\(auth\)/
git commit -m "feat: role-based routing and invite route middleware"
```

---

## Task 6: Danışan Dashboard Placeholder

**Files:**
- Create: `src/app/(client)/app/page.tsx`
- Create: `src/app/(client)/layout.tsx`

**Step 1: Client layout**

```tsx
// src/app/(client)/layout.tsx
export default function ClientLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-lg mx-auto p-4 pt-8">
        {children}
      </div>
    </div>
  )
}
```

**Step 2: Client dashboard placeholder**

```tsx
// src/app/(client)/app/page.tsx
import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'

export default async function ClientDashboard() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) redirect('/login')

  const { data: client } = await supabase
    .from('clients')
    .select('full_name, trainer_id, trainers:trainer_id(full_name)')
    .eq('user_id', user.id)
    .maybeSingle()

  if (!client) redirect('/login')

  return (
    <div>
      <div className="text-center mb-8">
        <h1 className="font-display text-3xl font-bold text-primary tracking-tight">
          MEGIN
        </h1>
      </div>
      <div className="card-base text-center py-10">
        <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-primary/10">
          <span className="text-3xl">💪</span>
        </div>
        <h2 className="text-xl font-bold text-text-primary">
          Hoş geldin, {client.full_name.split(' ')[0]}!
        </h2>
        <p className="mt-2 text-sm text-text-secondary">
          Danışan panelin yakında burada olacak.
        </p>
      </div>
    </div>
  )
}
```

**Step 3: Middleware — /app rotasını koru**

`/app` rotası zaten korunuyor (publicPaths'te değil), yani login gerektirir. Ek değişiklik gerekmez.

**Step 4: Build kontrol**

Run: `npm run build 2>&1 | tail -10`
Expected: Build success

**Step 5: Commit**

```bash
git add src/app/\(client\)/
git commit -m "feat: add client dashboard placeholder with layout"
```

---

## Task 7: Final Doğrulama

**Step 1: Tam build**

Run: `npm run build 2>&1 | tail -20`
Expected: Tüm sayfalar listelenir, hata yok

**Step 2: Dev server testi**

Run: `npm run dev`
Manuel test:
1. `/dashboard/clients` → boş liste + "Danışan Ekle" butonu
2. Butona tıkla → modal açılır
3. Formu doldur → başarılı → davet popup görünür
4. Kopyala + WhatsApp butonları çalışır
5. Davet linkini aç → danışan kayıt formu
6. Kayıt ol → login'e yönlendir
7. Danışan login → `/app` placeholder

**Step 3: Tüm değişiklikleri commit**

```bash
git add -A
git commit -m "feat: complete client invite system - add, invite link, registration, role routing"
```
