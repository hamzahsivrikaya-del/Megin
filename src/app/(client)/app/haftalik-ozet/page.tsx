import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { redirect } from 'next/navigation'
import Card, { CardHeader, CardTitle } from '@/components/ui/Card'
import Link from 'next/link'
import { getTrainerPlan } from '@/lib/subscription'
import FeatureGate from '@/components/shared/FeatureGate'

export default async function HaftalikOzetPage() {
  const supabase = await createClient()
  const { data: { session } } = await supabase.auth.getSession()
  if (!session?.user) redirect('/login')

  const { data: client } = await supabase
    .from('clients')
    .select('id, trainer_id')
    .eq('user_id', session.user.id)
    .maybeSingle()

  if (!client) redirect('/login')

  const plan = await getTrainerPlan(supabase, client.trainer_id)

  // Admin client ile RLS bypass
  const adminClient = createAdminClient()
  const { data: reports } = await adminClient
    .from('weekly_reports')
    .select('*')
    .eq('client_id', client.id)
    .order('week_start', { ascending: false })
    .limit(12)

  return (
    <FeatureGate plan={plan} feature="weekly_reports" role="client">
      <div className="space-y-6 panel-section-enter">
        <div>
          <Link href="/app" className="text-sm text-text-secondary hover:text-primary transition-colors">
            {'←'} Geri
          </Link>
          <h1 className="text-2xl font-bold mt-1">{`Haftalık Özet`}</h1>
        </div>

        {!reports || reports.length === 0 ? (
          <Card className="text-center py-8">
            <p className="text-text-secondary">{`Henüz haftalık rapor oluşturulmadı.`}</p>
            <p className="text-sm text-text-tertiary mt-1">{`Raporlar her hafta otomatik oluşturulur.`}</p>
          </Card>
        ) : (
          <div className="space-y-3">
            {reports.map((report) => {
              const weekStart = new Date(report.week_start)
              const weekEnd = new Date(weekStart)
              weekEnd.setDate(weekEnd.getDate() + 6)
              const format = (d: Date) => `${d.getDate()} ${['Oca','Şub','Mar','Nis','May','Haz','Tem','Ağu','Eyl','Eki','Kas','Ara'][d.getMonth()]}`

              return (
                <Card key={report.id || report.week_start}>
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium text-text-primary">
                        {format(weekStart)} - {format(weekEnd)}
                      </p>
                      <p className="text-xs text-text-secondary mt-0.5">
                        {weekEnd.getFullYear()}
                      </p>
                    </div>
                    <svg className="w-4 h-4 text-text-tertiary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </div>
                </Card>
              )
            })}
          </div>
        )}
      </div>
    </FeatureGate>
  )
}
