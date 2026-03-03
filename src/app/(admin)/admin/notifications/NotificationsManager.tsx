'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import Card, { CardHeader, CardTitle } from '@/components/ui/Card'
import Button from '@/components/ui/Button'
import Badge from '@/components/ui/Badge'
import Input from '@/components/ui/Input'
import Textarea from '@/components/ui/Textarea'
import Select from '@/components/ui/Select'
import Modal from '@/components/ui/Modal'
import { timeAgo, getNotificationTypeLabel } from '@/lib/utils'
import type { Notification } from '@/lib/types'
import { sendManualPush } from './actions'

type NotifWithUser = Notification & { users: { full_name: string } }

interface Props {
  initialNotifications: NotifWithUser[]
  members: { id: string; full_name: string }[]
  adminNotifications: Notification[]
}

export default function NotificationsManager({ initialNotifications, members, adminNotifications }: Props) {
  const router = useRouter()
  const [notifications, setNotifications] = useState(initialNotifications)
  const [showSendModal, setShowSendModal] = useState(false)
  const [sending, setSending] = useState(false)
  const [deleting, setDeleting] = useState<string | null>(null)
  const [clearingRead, setClearingRead] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)

  const [form, setForm] = useState({ user_id: '', title: '', message: '', url: '' })

  const [activeTab, setActiveTab] = useState<'mine' | 'send'>('mine')
  const [myNotifications, setMyNotifications] = useState(adminNotifications)

  const readCount = notifications.filter((n) => n.is_read).length
  const unreadAdminCount = myNotifications.filter(n => !n.is_read).length

  // Mark admin notifications as read when "mine" tab is active
  useEffect(() => {
    if (activeTab !== 'mine') return
    const unreadIds = myNotifications.filter(n => !n.is_read).map(n => n.id)
    if (unreadIds.length === 0) return

    const supabase = createClient()
    supabase
      .from('notifications')
      .update({ is_read: true })
      .in('id', unreadIds)
      .then(() => {
        setMyNotifications(prev => prev.map(n => ({ ...n, is_read: true })))
      })
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeTab])
  // Note: We intentionally only depend on activeTab (not myNotifications) to avoid infinite loop

  async function handleDelete(id: string) {
    setDeleting(id)
    const supabase = createClient()
    const { error } = await supabase.from('notifications').delete().eq('id', id)
    if (!error) {
      setNotifications((prev) => prev.filter((n) => n.id !== id))
    }
    setDeleting(null)
  }

  async function handleClearRead() {
    if (!confirm(`${readCount} okunmuş bildirim silinecek. Emin misiniz?`)) return
    setClearingRead(true)
    const supabase = createClient()
    const readIds = notifications.filter((n) => n.is_read).map((n) => n.id)
    const { error } = await supabase.from('notifications').delete().in('id', readIds)
    if (!error) {
      setNotifications((prev) => prev.filter((n) => !n.is_read))
    }
    setClearingRead(false)
  }

  async function handleSend(e: React.FormEvent) {
    e.preventDefault()
    setSending(true)
    setError('')

    const supabase = createClient()

    if (form.user_id === 'all') {
      const inserts = members.map((m) => ({
        user_id: m.id,
        type: 'manual' as const,
        title: form.title,
        message: form.message,
      }))
      const { error: insertError } = await supabase.from('notifications').insert(inserts)
      if (insertError) { setError(insertError.message); setSending(false); return }
      await sendManualPush(members.map((m) => m.id), form.title, form.message, form.url || undefined)
    } else {
      const { error: insertError } = await supabase.from('notifications').insert({
        user_id: form.user_id,
        type: 'manual',
        title: form.title,
        message: form.message,
      })
      if (insertError) { setError(insertError.message); setSending(false); return }
      await sendManualPush([form.user_id], form.title, form.message, form.url || undefined)
    }

    setShowSendModal(false)
    setForm({ user_id: '', title: '', message: '', url: '' })
    setSending(false)
    setSuccess(true)
    setTimeout(() => setSuccess(false), 2000)
    router.refresh()
  }

  const memberOptions = [
    { value: '', label: 'Üye seçin...' },
    { value: 'all', label: 'Tüm Üyeler' },
    ...members.map((m) => ({ value: m.id, label: m.full_name })),
  ]

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Bildirimler</h1>
        <Button onClick={() => { setActiveTab('send'); setShowSendModal(true) }}>Bildirim Gönder</Button>
      </div>

      {success && (
        <div className="bg-success/10 border border-success/20 rounded-lg p-3 text-sm text-success">
          Bildirim gönderildi!
        </div>
      )}

      {/* Tab header */}
      <div className="flex gap-1 bg-surface-hover rounded-lg p-1">
        <button
          onClick={() => setActiveTab('mine')}
          className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-colors cursor-pointer ${
            activeTab === 'mine'
              ? 'bg-surface text-text-primary shadow-sm'
              : 'text-text-secondary hover:text-text-primary'
          }`}
        >
          Bildirimlerim
          {unreadAdminCount > 0 && (
            <span className="ml-2 bg-primary text-white text-xs rounded-full px-1.5 py-0.5">
              {unreadAdminCount}
            </span>
          )}
        </button>
        <button
          onClick={() => setActiveTab('send')}
          className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-colors cursor-pointer ${
            activeTab === 'send'
              ? 'bg-surface text-text-primary shadow-sm'
              : 'text-text-secondary hover:text-text-primary'
          }`}
        >
          Gönder & Geçmiş
        </button>
      </div>

      {/* Bildirimlerim tab */}
      {activeTab === 'mine' && (
        <Card>
          <CardHeader>
            <CardTitle>Bildirimlerim</CardTitle>
          </CardHeader>
          {myNotifications.length === 0 ? (
            <p className="text-sm text-text-secondary text-center py-8">Henüz bildirim yok</p>
          ) : (
            <div className="space-y-1">
              {myNotifications.map((n) => (
                <div
                  key={n.id}
                  className={`p-3 rounded-lg border ${
                    n.is_read ? 'border-border bg-surface' : 'border-primary/20 bg-primary/5'
                  }`}
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-medium">{n.title}</span>
                        <Badge variant="default">
                          {getNotificationTypeLabel(n.type)}
                        </Badge>
                      </div>
                      <p className="text-sm text-text-secondary mt-1 whitespace-pre-line">{n.message}</p>
                    </div>
                    <span className="text-xs text-text-secondary whitespace-nowrap">
                      {timeAgo(n.sent_at)}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </Card>
      )}

      {/* Gönder & Geçmiş tab -- existing notification log */}
      {activeTab === 'send' && (
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>Bildirim Geçmişi</CardTitle>
              {readCount > 0 && (
                <button
                  onClick={handleClearRead}
                  disabled={clearingRead}
                  className="text-xs text-text-secondary hover:text-danger transition-colors cursor-pointer disabled:opacity-50"
                >
                  {clearingRead ? 'Siliniyor...' : `${readCount} okunmuşu sil`}
                </button>
              )}
            </div>
          </CardHeader>

          {notifications.length === 0 ? (
            <p className="text-sm text-text-secondary text-center py-4">Bildirim yok</p>
          ) : (
            <div className="space-y-1">
              {notifications.map((notif) => (
                <div
                  key={notif.id}
                  className="flex items-start gap-3 py-3 border-b border-border/50 last:border-0"
                >
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-sm font-medium">{notif.title}</span>
                      <Badge variant={notif.is_read ? 'default' : 'primary'}>
                        {notif.is_read ? 'Okundu' : 'Okunmadı'}
                      </Badge>
                    </div>
                    <p className="text-xs text-text-secondary mt-0.5">
                      {notif.users?.full_name} • {getNotificationTypeLabel(notif.type)} • {timeAgo(notif.sent_at)}
                    </p>
                    <p className="text-sm text-text-secondary mt-1">{notif.message}</p>
                  </div>

                  {/* Sil butonu */}
                  <button
                    onClick={() => handleDelete(notif.id)}
                    disabled={deleting === notif.id}
                    title="Sil"
                    className="flex-shrink-0 p-1.5 text-text-secondary hover:text-danger hover:bg-danger/10 rounded-lg transition-all cursor-pointer disabled:opacity-40 mt-0.5"
                  >
                    {deleting === notif.id ? (
                      <span className="text-xs">...</span>
                    ) : (
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                          d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                    )}
                  </button>
                </div>
              ))}
            </div>
          )}
        </Card>
      )}

      {/* Bildirim gönder modal */}
      <Modal open={showSendModal} onClose={() => setShowSendModal(false)} title="Bildirim Gönder">
        <form onSubmit={handleSend} className="space-y-4">
          <Select
            label="Kime"
            options={memberOptions}
            value={form.user_id}
            onChange={(e) => setForm({ ...form, user_id: e.target.value })}
            required
          />
          <Input
            label="Başlık"
            value={form.title}
            onChange={(e) => setForm({ ...form, title: e.target.value })}
            required
            placeholder="Bildirim başlığı"
          />
          <Textarea
            label="Mesaj"
            value={form.message}
            onChange={(e) => setForm({ ...form, message: e.target.value })}
            required
            placeholder="Bildirim mesajı..."
          />
          <Input
            label="Yönlendirme URL (opsiyonel)"
            value={form.url}
            onChange={(e) => setForm({ ...form, url: e.target.value })}
            placeholder="/dashboard/progress"
          />
          {error && <p className="text-sm text-danger">{error}</p>}
          <div className="flex gap-3 justify-end">
            <Button variant="secondary" type="button" onClick={() => setShowSendModal(false)}>İptal</Button>
            <Button type="submit" loading={sending}>Gönder</Button>
          </div>
        </form>
      </Modal>
    </div>
  )
}
