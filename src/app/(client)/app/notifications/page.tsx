import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import Card from '@/components/ui/Card'
import Badge from '@/components/ui/Badge'
import Link from 'next/link'

export default async function ClientNotificationsPage() {
  const supabase = await createClient()
  const { data: { session } } = await supabase.auth.getSession()
  if (!session?.user) redirect('/login')

  const { data: client } = await supabase
    .from('clients')
    .select('id')
    .eq('user_id', session.user.id)
    .maybeSingle()

  if (!client) redirect('/login')

  const { data: notifications } = await supabase
    .from('notifications')
    .select('*')
    .order('sent_at', { ascending: false })
    .limit(50)

  // Okunmamışları okundu olarak işaretle
  const unreadIds = (notifications || []).filter((n) => !n.is_read).map((n) => n.id)
  if (unreadIds.length > 0) {
    await supabase
      .from('notifications')
      .update({ is_read: true })
      .in('id', unreadIds)
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

  const typeLabels: Record<string, string> = {
    manual: 'Bildirim',
    low_lessons: 'Paket Uyarısı',
    weekly_report: 'Haftalık Rapor',
    nutrition_reminder: 'Beslenme',
    badge_earned: 'Rozet',
    inactive: 'Hatırlatma',
  }

  return (
    <div className="space-y-6">
      <div>
        <Link href="/app" className="text-sm text-text-secondary hover:text-primary transition-colors">
          ← Geri
        </Link>
        <h1 className="text-2xl font-bold mt-1">Bildirimler</h1>
      </div>

      {!notifications || notifications.length === 0 ? (
        <Card className="text-center py-8">
          <p className="text-text-secondary">Henüz bildirim yok.</p>
        </Card>
      ) : (
        <div className="space-y-2">
          {notifications.map((n) => (
            <Card key={n.id}>
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center shrink-0 mt-0.5">
                  <svg className="w-4 h-4 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                      d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                  </svg>
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <p className="text-sm font-medium text-text-primary">{n.title}</p>
                    <Badge variant="default">{typeLabels[n.type] || n.type}</Badge>
                  </div>
                  <p className="text-sm text-text-secondary mt-0.5">{n.message}</p>
                  <p className="text-xs text-text-tertiary mt-1">{n.sent_at ? timeAgo(n.sent_at) : ''}</p>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
