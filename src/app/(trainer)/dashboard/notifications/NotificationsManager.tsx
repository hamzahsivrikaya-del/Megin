'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import Card, { CardHeader, CardTitle } from '@/components/ui/Card'
import Badge from '@/components/ui/Badge'
import Button from '@/components/ui/Button'
import Input from '@/components/ui/Input'
import Select from '@/components/ui/Select'
import Textarea from '@/components/ui/Textarea'

interface Notification {
  id: string
  client_id: string | null
  type: string
  title: string
  message: string
  is_read: boolean
  sent_at: string
  clients?: { full_name: string } | null
}

interface ClientInfo {
  id: string
  full_name: string
}

interface NotificationsManagerProps {
  initialNotifications: Notification[]
  clients: ClientInfo[]
  trainerId: string
}

export default function NotificationsManager({ initialNotifications, clients, trainerId }: NotificationsManagerProps) {
  const [notifications, setNotifications] = useState(initialNotifications)
  const [target, setTarget] = useState('')
  const [title, setTitle] = useState('')
  const [message, setMessage] = useState('')
  const [sending, setSending] = useState(false)
  const [error, setError] = useState('')
  const [successMsg, setSuccessMsg] = useState('')

  async function handleSend(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    setSuccessMsg('')

    if (!title.trim() || !message.trim()) {
      setError('Başlık ve mesaj zorunludur')
      return
    }

    setSending(true)

    try {
      const supabase = createClient()

      if (target === 'all' || target === '') {
        // Tüm danışanlara gönder
        const inserts = clients.map((c) => ({
          trainer_id: trainerId,
          client_id: c.id,
          user_id: null,
          type: 'manual',
          title: title.trim(),
          message: message.trim(),
          is_read: false,
        }))

        if (inserts.length > 0) {
          await supabase.from('notifications').insert(inserts)
        }
      } else {
        // Tek danışana gönder
        await supabase.from('notifications').insert({
          trainer_id: trainerId,
          client_id: target,
          user_id: null,
          type: 'manual',
          title: title.trim(),
          message: message.trim(),
          is_read: false,
        })
      }

      setTitle('')
      setMessage('')
      setTarget('')
      setSuccessMsg('Bildirim gönderildi!')

      // Listeyi yenile
      const { data: updated } = await supabase
        .from('notifications')
        .select('*, clients(full_name)')
        .eq('trainer_id', trainerId)
        .order('sent_at', { ascending: false })
        .limit(50)

      if (updated) setNotifications(updated)
    } catch {
      setError('Gönderilirken bir hata oluştu')
    }

    setSending(false)
  }

  async function deleteNotification(id: string) {
    const supabase = createClient()
    await supabase.from('notifications').delete().eq('id', id)
    setNotifications((prev) => prev.filter((n) => n.id !== id))
  }

  function timeAgo(dateStr: string) {
    const diff = Date.now() - new Date(dateStr).getTime()
    const mins = Math.floor(diff / 60000)
    if (mins < 60) return `${mins} dk önce`
    const hours = Math.floor(mins / 60)
    if (hours < 24) return `${hours} saat önce`
    const days = Math.floor(hours / 24)
    return `${days} gün önce`
  }

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Bildirimler</h1>

      {/* Gönderme formu */}
      <Card>
        <CardHeader><CardTitle>Bildirim Gönder</CardTitle></CardHeader>
        <form onSubmit={handleSend} className="space-y-4">
          <Select
            label="Alıcı"
            value={target}
            onChange={(e) => setTarget(e.target.value)}
            options={[
              { value: '', label: 'Tüm danışanlar' },
              ...clients.map((c) => ({ value: c.id, label: c.full_name })),
            ]}
          />
          <Input
            label="Başlık"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Bildirim başlığı"
          />
          <Textarea
            label="Mesaj"
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder="Bildirim mesajı..."
          />

          {error && <div className="rounded-lg bg-danger/10 px-4 py-3 text-sm text-danger">{error}</div>}
          {successMsg && <div className="rounded-lg bg-success/10 px-4 py-3 text-sm text-success">{successMsg}</div>}

          <Button type="submit" loading={sending}>
            Gönder
          </Button>
        </form>
      </Card>

      {/* Geçmiş bildirimler */}
      <Card>
        <CardHeader><CardTitle>Gönderilen Bildirimler</CardTitle></CardHeader>
        {notifications.length === 0 ? (
          <p className="text-sm text-text-secondary">Henüz bildirim gönderilmemiş.</p>
        ) : (
          <div className="space-y-2">
            {notifications.map((n) => (
              <div key={n.id} className="flex items-start justify-between p-3 rounded-lg bg-background">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <p className="text-sm font-medium text-text-primary truncate">{n.title}</p>
                    <Badge variant={n.is_read ? 'default' : 'primary'}>
                      {n.is_read ? 'Okundu' : 'Okunmadı'}
                    </Badge>
                  </div>
                  <p className="text-xs text-text-secondary mt-0.5 line-clamp-1">{n.message}</p>
                  <p className="text-xs text-text-tertiary mt-1">
                    {(n.clients as unknown as { full_name: string })?.full_name || 'Tüm danışanlar'} · {n.sent_at ? timeAgo(n.sent_at) : ''}
                  </p>
                </div>
                <button
                  onClick={() => deleteNotification(n.id)}
                  className="p-1 text-text-tertiary hover:text-danger transition-colors cursor-pointer ml-2"
                >
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            ))}
          </div>
        )}
      </Card>
    </div>
  )
}
