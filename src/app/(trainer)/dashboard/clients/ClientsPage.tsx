'use client'

import { useState, useMemo } from 'react'
import { useRouter } from 'next/navigation'
import { cn } from '@/lib/utils'
import Button from '@/components/ui/Button'
import Input from '@/components/ui/Input'
import Select from '@/components/ui/Select'
import Modal from '@/components/ui/Modal'

// ── Types ──
interface Package {
  id: string
  total_lessons: number
  used_lessons: number
  status: string
}

interface Client {
  id: string
  full_name: string
  email: string
  phone: string | null
  gender: string | null
  invite_accepted: boolean
  invite_token: string | null
  is_active: boolean
  created_at: string
  packages: Package[]
}

type FilterType = 'all' | 'active' | 'pending'

interface ClientsPageProps {
  clients: Client[]
  trainerUsername: string
}

// ── Helpers ──
function getInitials(name: string): string {
  return name
    .split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2)
}

function getPackageStatus(packages: Package[]): {
  label: string
  color: string
} {
  const activePackage = packages.find((p) => p.status === 'active')
  if (activePackage) {
    const remaining = activePackage.total_lessons - activePackage.used_lessons
    if (remaining <= 0) {
      return { label: 'Paket bitti', color: 'text-danger' }
    }
    return {
      label: `${remaining} ders kaldi`,
      color: remaining <= 2 ? 'text-warning' : 'text-success',
    }
  }
  return { label: 'Paket yok', color: 'text-text-tertiary' }
}

// ── Main Component ──
export default function ClientsPage({
  clients,
  trainerUsername,
}: ClientsPageProps) {
  const router = useRouter()

  // State
  const [search, setSearch] = useState('')
  const [filter, setFilter] = useState<FilterType>('all')
  const [addModalOpen, setAddModalOpen] = useState(false)
  const [invitePopupOpen, setInvitePopupOpen] = useState(false)
  const [inviteData, setInviteData] = useState<{
    name: string
    url: string
    phone: string | null
  } | null>(null)
  const [copied, setCopied] = useState(false)

  // Counts
  const pendingCount = clients.filter((c) => !c.invite_accepted).length
  const activeCount = clients.filter((c) => c.invite_accepted).length

  // Filtered clients
  const filteredClients = useMemo(() => {
    let result = clients

    // Filter
    if (filter === 'active') {
      result = result.filter((c) => c.invite_accepted)
    } else if (filter === 'pending') {
      result = result.filter((c) => !c.invite_accepted)
    }

    // Search
    if (search.trim()) {
      const q = search.toLowerCase()
      result = result.filter(
        (c) =>
          c.full_name.toLowerCase().includes(q) ||
          c.email.toLowerCase().includes(q)
      )
    }

    return result
  }, [clients, filter, search])

  // Invite popup handler
  function showInvitePopup(
    name: string,
    token: string | null,
    phone: string | null
  ) {
    if (!token) return
    const url = `${window.location.origin}/${trainerUsername}/davet/${token}`
    setInviteData({ name, url, phone })
    setInvitePopupOpen(true)
    setCopied(false)
  }

  async function copyInviteLink() {
    if (!inviteData) return
    try {
      await navigator.clipboard.writeText(inviteData.url)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch {
      // Fallback
      const textarea = document.createElement('textarea')
      textarea.value = inviteData.url
      document.body.appendChild(textarea)
      textarea.select()
      document.execCommand('copy')
      document.body.removeChild(textarea)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    }
  }

  function getWhatsAppUrl(): string {
    if (!inviteData) return '#'
    const message = encodeURIComponent(
      `Merhaba! Seni Megin uzerinden danisanim olarak ekledim. Bu linkten kaydini tamamlayabilirsin: ${inviteData.url}`
    )
    if (inviteData.phone) {
      const phone = inviteData.phone.replace(/\D/g, '')
      return `https://wa.me/${phone}?text=${message}`
    }
    return `https://wa.me/?text=${message}`
  }

  // Add client success handler
  function handleClientAdded(data: {
    client: { full_name: string; invite_token: string }
    inviteUrl: string
    phone: string | null
  }) {
    setAddModalOpen(false)
    showInvitePopup(
      data.client.full_name,
      data.client.invite_token,
      data.phone
    )
    router.refresh()
  }

  return (
    <div>
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold text-text-primary">Danisanlar</h1>
          <p className="mt-1 text-sm text-text-secondary">
            {clients.length} danisan
            {pendingCount > 0 && (
              <span className="ml-2 text-warning">
                ({pendingCount} bekleyen)
              </span>
            )}
          </p>
        </div>
        <Button onClick={() => setAddModalOpen(true)}>+ Yeni Danisan</Button>
      </div>

      {/* Search + Filter (only when there are clients) */}
      {clients.length > 0 && (
        <div className="flex flex-col sm:flex-row gap-3 mb-6">
          <div className="flex-1">
            <Input
              placeholder="Ad veya e-posta ile ara..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <div className="flex gap-2">
            <FilterButton
              active={filter === 'all'}
              onClick={() => setFilter('all')}
              count={clients.length}
            >
              Tumu
            </FilterButton>
            <FilterButton
              active={filter === 'active'}
              onClick={() => setFilter('active')}
              count={activeCount}
            >
              Aktif
            </FilterButton>
            <FilterButton
              active={filter === 'pending'}
              onClick={() => setFilter('pending')}
              count={pendingCount}
            >
              Bekleyen
            </FilterButton>
          </div>
        </div>
      )}

      {/* Client List */}
      {clients.length === 0 ? (
        <EmptyState onAdd={() => setAddModalOpen(true)} />
      ) : filteredClients.length === 0 ? (
        <div className="card-base text-center py-12">
          <p className="text-text-secondary">
            Aramanizla eslesen danisan bulunamadi.
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {filteredClients.map((client) => (
            <ClientCard
              key={client.id}
              client={client}
              onShowInvite={() =>
                showInvitePopup(
                  client.full_name,
                  client.invite_token,
                  client.phone
                )
              }
            />
          ))}
        </div>
      )}

      {/* Add Client Modal */}
      <AddClientModal
        open={addModalOpen}
        onClose={() => setAddModalOpen(false)}
        onSuccess={handleClientAdded}
      />

      {/* Invite Popup */}
      <Modal
        open={invitePopupOpen}
        onClose={() => setInvitePopupOpen(false)}
        title="Davet Linki"
        size="sm"
      >
        <div className="text-center space-y-4">
          {/* Success icon */}
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-success/10">
            <svg
              className="h-7 w-7 text-success"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M5 13l4 4L19 7"
              />
            </svg>
          </div>

          <p className="text-base font-semibold text-text-primary">
            {inviteData?.name} eklendi!
          </p>

          {/* Invite link */}
          <div className="rounded-xl bg-background border border-border p-3">
            <p className="text-xs text-text-tertiary mb-1">Davet Linki</p>
            <p className="text-sm font-mono text-text-primary break-all">
              {inviteData?.url}
            </p>
          </div>

          {/* Actions */}
          <div className="flex gap-3">
            <Button
              variant="outline"
              fullWidth
              onClick={copyInviteLink}
            >
              {copied ? 'Kopyalandi!' : 'Kopyala'}
            </Button>
            <Button
              fullWidth
              onClick={() => window.open(getWhatsAppUrl(), '_blank')}
            >
              WhatsApp&apos;ta Gonder
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  )
}

// ── Filter Button ──
function FilterButton({
  active,
  onClick,
  count,
  children,
}: {
  active: boolean
  onClick: () => void
  count: number
  children: React.ReactNode
}) {
  return (
    <button
      onClick={onClick}
      className={cn(
        'px-3 py-2 rounded-xl text-sm font-medium transition-colors whitespace-nowrap',
        active
          ? 'bg-primary text-white'
          : 'bg-surface border border-border text-text-secondary hover:bg-background'
      )}
    >
      {children}
      <span
        className={cn(
          'ml-1.5 text-xs',
          active ? 'text-white/70' : 'text-text-tertiary'
        )}
      >
        {count}
      </span>
    </button>
  )
}

// ── Client Card ──
function ClientCard({
  client,
  onShowInvite,
}: {
  client: Client
  onShowInvite: () => void
}) {
  const packageStatus = getPackageStatus(client.packages)
  const isPending = !client.invite_accepted

  return (
    <div className="card-base hover-lift flex items-center gap-4">
      {/* Avatar */}
      <div
        className={cn(
          'flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold',
          isPending
            ? 'bg-warning/10 text-warning'
            : 'bg-primary/10 text-primary'
        )}
      >
        {getInitials(client.full_name)}
      </div>

      {/* Info */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <p className="font-medium text-text-primary truncate">
            {client.full_name}
          </p>
          {isPending && (
            <span className="flex-shrink-0 text-xs bg-warning/10 text-warning px-2 py-0.5 rounded-lg font-medium">
              Bekleyen
            </span>
          )}
        </div>
        <p className="text-xs text-text-tertiary truncate">{client.email}</p>
      </div>

      {/* Package status */}
      <div className="hidden sm:block text-right">
        <p className={cn('text-xs font-medium', packageStatus.color)}>
          {packageStatus.label}
        </p>
      </div>

      {/* Invite link button for pending */}
      {isPending && client.invite_token && (
        <button
          onClick={(e) => {
            e.stopPropagation()
            onShowInvite()
          }}
          className="flex-shrink-0 p-2 rounded-lg text-text-tertiary hover:bg-background hover:text-primary transition-colors"
          title="Davet linkini goster"
        >
          <svg
            className="w-4 h-4"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={2}
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1"
            />
          </svg>
        </button>
      )}
    </div>
  )
}

// ── Empty State ──
function EmptyState({ onAdd }: { onAdd: () => void }) {
  return (
    <div className="card-base text-center py-12">
      <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-primary/10">
        <svg
          className="w-8 h-8 text-primary"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth={1.5}
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z"
          />
        </svg>
      </div>
      <h3 className="text-lg font-bold text-text-primary">
        Henuz danisan eklenmemis
      </h3>
      <p className="mt-2 text-sm text-text-secondary max-w-sm mx-auto">
        Ilk danisanini ekle, davet linkini gonder ve yonetmeye basla.
      </p>
      <div className="mt-6">
        <Button onClick={onAdd}>+ Yeni Danisan Ekle</Button>
      </div>
    </div>
  )
}

// ── Add Client Modal ──
function AddClientModal({
  open,
  onClose,
  onSuccess,
}: {
  open: boolean
  onClose: () => void
  onSuccess: (data: {
    client: { full_name: string; invite_token: string }
    inviteUrl: string
    phone: string | null
  }) => void
}) {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [form, setForm] = useState({
    full_name: '',
    email: '',
    phone: '',
    gender: '',
  })

  function updateField(field: string, value: string) {
    setForm((prev) => ({ ...prev, [field]: value }))
    setError('')
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()

    if (!form.full_name.trim() || form.full_name.trim().length < 2) {
      setError('Ad soyad en az 2 karakter olmalidir')
      return
    }
    if (!form.email.trim()) {
      setError('E-posta adresi zorunludur')
      return
    }

    setLoading(true)
    setError('')

    try {
      const res = await fetch('/api/trainer/clients', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          full_name: form.full_name.trim(),
          email: form.email.trim(),
          phone: form.phone.trim() || null,
          gender: form.gender || null,
        }),
      })

      const data = await res.json()

      if (!res.ok) {
        setError(data.error || 'Bir hata olustu')
        return
      }

      // Reset form
      setForm({ full_name: '', email: '', phone: '', gender: '' })
      onSuccess({ ...data, phone: form.phone.trim() || null })
    } catch {
      setError('Baglanti hatasi. Lutfen tekrar deneyin.')
    } finally {
      setLoading(false)
    }
  }

  function handleClose() {
    setForm({ full_name: '', email: '', phone: '', gender: '' })
    setError('')
    onClose()
  }

  return (
    <Modal open={open} onClose={handleClose} title="Yeni Danisan Ekle">
      <form onSubmit={handleSubmit} className="space-y-4">
        <Input
          label="Ad Soyad"
          placeholder="Ornek: Ahmet Yilmaz"
          value={form.full_name}
          onChange={(e) => updateField('full_name', e.target.value)}
          required
        />

        <Input
          label="E-posta"
          type="email"
          placeholder="ornek@email.com"
          value={form.email}
          onChange={(e) => updateField('email', e.target.value)}
          required
        />

        <Input
          label="Telefon"
          type="tel"
          placeholder="+90 5XX XXX XX XX"
          hint="WhatsApp ile davet gondermek icin"
          value={form.phone}
          onChange={(e) => updateField('phone', e.target.value)}
        />

        <Select
          label="Cinsiyet"
          value={form.gender}
          onChange={(e) => updateField('gender', e.target.value)}
          options={[
            { value: '', label: 'Seciniz' },
            { value: 'male', label: 'Erkek' },
            { value: 'female', label: 'Kadin' },
          ]}
        />

        {error && (
          <div className="rounded-xl bg-danger/10 border border-danger/20 p-3">
            <p className="text-sm text-danger">{error}</p>
          </div>
        )}

        <div className="flex gap-3 pt-2">
          <Button
            type="button"
            variant="outline"
            fullWidth
            onClick={handleClose}
          >
            Iptal
          </Button>
          <Button type="submit" fullWidth loading={loading}>
            Danisan Ekle
          </Button>
        </div>
      </form>
    </Modal>
  )
}
