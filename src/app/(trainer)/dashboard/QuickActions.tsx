'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import AddClientModal from '@/components/shared/AddClientModal'
import type { AddClientResult } from '@/components/shared/AddClientModal'
import Modal from '@/components/ui/Modal'
import Button from '@/components/ui/Button'

interface QuickActionsProps {
  trainerUsername: string
}

export default function QuickActions({ trainerUsername }: QuickActionsProps) {
  const router = useRouter()
  const [addModalOpen, setAddModalOpen] = useState(false)
  const [invitePopupOpen, setInvitePopupOpen] = useState(false)
  const [inviteData, setInviteData] = useState<{
    name: string
    url: string
    phone: string | null
  } | null>(null)
  const [copied, setCopied] = useState(false)

  function handleClientAdded(data: AddClientResult) {
    setAddModalOpen(false)
    const url = `${window.location.origin}/${trainerUsername}/davet/${data.client.invite_token}`
    setInviteData({ name: data.client.full_name, url, phone: data.phone })
    setInvitePopupOpen(true)
    setCopied(false)
    router.refresh()
  }

  async function copyInviteLink() {
    if (!inviteData) return
    try {
      await navigator.clipboard.writeText(inviteData.url)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch {
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
      `Merhaba! Seni Megin üzerinden danışanım olarak ekledim. Bu linkten kaydını tamamlayabilirsin: ${inviteData.url}`
    )
    if (inviteData.phone) {
      const phone = inviteData.phone.replace(/\D/g, '')
      return `https://wa.me/${phone}?text=${message}`
    }
    return `https://wa.me/?text=${message}`
  }

  const btnBase = "inline-flex items-center justify-center sm:justify-start gap-2 px-3 sm:px-4 py-3 sm:py-2.5 rounded-xl text-xs sm:text-sm font-medium transition-colors"

  return (
    <>
      <div className="grid grid-cols-4 sm:flex sm:flex-wrap gap-2 sm:gap-3">
        <Link
          href="/dashboard/takvim"
          className={`${btnBase} bg-gradient-to-r from-[#DC2626] to-[#F97316] text-white shadow-sm hover:shadow-lg hover:shadow-red-500/20 active:shadow-sm`}
        >
          <svg className="w-4 h-4 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
          </svg>
          <span>Takvim</span>
        </Link>
        <Link
          href="/dashboard/lessons/new"
          data-tour="quick-add-lesson"
          className={`${btnBase} bg-surface border border-border text-text-primary hover:border-primary/20 hover:bg-surface-hover hover:shadow-sm hover:shadow-primary/5 active:bg-surface-hover`}
        >
          <svg className="w-4 h-4 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
          </svg>
          <span>Ders Ekle</span>
        </Link>
        <button
          onClick={() => setAddModalOpen(true)}
          data-tour="quick-add-client"
          className={`${btnBase} bg-surface border border-border text-text-primary hover:border-primary/20 hover:bg-surface-hover hover:shadow-sm hover:shadow-primary/5 active:bg-surface-hover cursor-pointer`}
        >
          <svg className="w-4 h-4 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
          </svg>
          <span>Danışan Ekle</span>
        </button>
        <Link
          href="/dashboard/measurements/new"
          data-tour="quick-add-measurement"
          className={`${btnBase} bg-surface border border-border text-text-primary hover:border-primary/20 hover:bg-surface-hover hover:shadow-sm hover:shadow-primary/5 active:bg-surface-hover`}
        >
          <svg className="w-4 h-4 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
          </svg>
          <span>Ölçüm Gir</span>
        </Link>
      </div>

      <AddClientModal
        open={addModalOpen}
        onClose={() => setAddModalOpen(false)}
        onSuccess={handleClientAdded}
      />

      <Modal
        open={invitePopupOpen}
        onClose={() => setInvitePopupOpen(false)}
        title="Davet Linki"
        size="sm"
      >
        <div className="text-center space-y-4">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-success/10">
            <svg className="h-7 w-7 text-success" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <p className="text-base font-semibold text-text-primary">
            {inviteData?.name} eklendi!
          </p>
          <div className="rounded-xl bg-background border border-border p-3">
            <p className="text-xs text-text-tertiary mb-1">Davet Linki</p>
            <p className="text-sm font-mono text-text-primary break-all">
              {inviteData?.url}
            </p>
          </div>
          <div className="flex gap-3">
            <Button variant="outline" fullWidth onClick={copyInviteLink}>
              {copied ? 'Kopyalandı!' : 'Kopyala'}
            </Button>
            <Button fullWidth onClick={() => window.open(getWhatsAppUrl(), '_blank')}>
              WhatsApp&apos;ta Gönder
            </Button>
          </div>
        </div>
      </Modal>
    </>
  )
}
