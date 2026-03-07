import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import Card, { CardHeader, CardTitle } from '@/components/ui/Card'
import Badge from '@/components/ui/Badge'
import Link from 'next/link'
import { formatDate } from '@/lib/utils'
import { GoalMetricType, ClientGoal, Measurement, ProgressPhoto } from '@/lib/types'
import ClientProgressPhotos from './ClientProgressPhotos'
import DownloadPDFButton from '@/components/shared/DownloadPDFButton'
import GoalSetter from './GoalSetter'

const GOAL_METRIC_LABELS: Record<GoalMetricType, string> = {
  weight: 'Kilo',
  body_fat_pct: 'Yağ Oranı',
  chest: 'Göğüs',
  waist: 'Bel',
  arm: 'Kol',
  leg: 'Bacak',
}

const GOAL_METRIC_UNITS: Record<GoalMetricType, string> = {
  weight: 'kg',
  body_fat_pct: '%',
  chest: 'cm',
  waist: 'cm',
  arm: 'cm',
  leg: 'cm',
}

const LOWER_IS_BETTER: GoalMetricType[] = ['weight', 'body_fat_pct', 'waist']

function calcGoalProgress(metric: GoalMetricType, current: number, target: number, start: number): number {
  if (current === target) return 100
  if (LOWER_IS_BETTER.includes(metric)) {
    const totalNeeded = start - target
    if (totalNeeded <= 0) return current <= target ? 100 : 0
    const achieved = start - current
    return Math.min(100, Math.max(0, Math.round((achieved / totalNeeded) * 100)))
  } else {
    const totalNeeded = target - start
    if (totalNeeded <= 0) return current >= target ? 100 : 0
    const achieved = current - start
    return Math.min(100, Math.max(0, Math.round((achieved / totalNeeded) * 100)))
  }
}

export default async function ProgressPage() {
  const supabase = await createClient()
  const { data: { session } } = await supabase.auth.getSession()
  if (!session?.user) redirect('/login')

  const { data: client } = await supabase
    .from('clients')
    .select('id, trainer_id, full_name')
    .eq('user_id', session.user.id)
    .maybeSingle()

  if (!client) redirect('/login')

  const [
    { data: measurements },
    { data: goals },
    { data: photos },
  ] = await Promise.all([
    supabase
      .from('measurements')
      .select('*')
      .eq('client_id', client.id)
      .order('date', { ascending: false }),
    supabase
      .from('client_goals')
      .select('*')
      .eq('client_id', client.id)
      .order('created_at', { ascending: true }),
    supabase
      .from('progress_photos')
      .select('*')
      .eq('client_id', client.id)
      .order('taken_at', { ascending: false }),
  ])

  const METRICS = [
    { key: 'weight', label: 'Kilo', unit: 'kg' },
    { key: 'chest', label: 'Göğüs', unit: 'cm' },
    { key: 'waist', label: 'Bel', unit: 'cm' },
    { key: 'arm', label: 'Kol', unit: 'cm' },
    { key: 'leg', label: 'Bacak', unit: 'cm' },
    { key: 'body_fat_pct', label: 'Vücut Yağı', unit: '%' },
  ]

  return (
    <div className="space-y-6 panel-section-enter">
      <div className="flex items-end justify-between">
        <div>
          <Link href="/app" className="text-sm text-text-secondary hover:text-primary transition-colors">
            ← Geri
          </Link>
          <h1 className="text-2xl font-bold mt-1">İlerleme</h1>
        </div>
        {measurements && measurements.length > 0 && (
          <DownloadPDFButton
            clientName={client.full_name}
            measurements={measurements as Measurement[]}
          />
        )}
      </div>

      {/* İlerleme Fotoğrafları */}
      {photos && photos.length > 0 && (
        <ClientProgressPhotos photos={photos as ProgressPhoto[]} />
      )}

      {!measurements || measurements.length === 0 ? (
        <Card className="text-center py-8">
          <p className="text-text-secondary">Henüz ölçüm kaydı yok.</p>
          <p className="text-sm text-text-tertiary mt-1">Antrenörün ölçüm girdiğinde burada görünecek.</p>
        </Card>
      ) : (
        <>
          {/* Son ölçüm kartları */}
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            {METRICS.map(({ key, label, unit }) => {
              const latest = measurements[0]?.[key]
              const previous = measurements.length > 1 ? measurements[1]?.[key] : null
              if (!latest) return null

              const diff = previous ? (Number(latest) - Number(previous)).toFixed(1) : null
              const isDown = diff && Number(diff) < 0
              const isUp = diff && Number(diff) > 0

              return (
                <Card key={key}>
                  <div className="text-[11px] font-medium text-text-secondary mb-1">{label}</div>
                  <div className="flex items-baseline gap-1">
                    <span className="text-2xl font-bold text-text-primary">{latest}</span>
                    <span className="text-xs text-text-secondary">{unit}</span>
                  </div>
                  {diff && (
                    <div className={`text-xs mt-1 font-medium ${
                      key === 'weight' || key === 'waist' || key === 'body_fat_pct'
                        ? isDown ? 'text-success' : isUp ? 'text-danger' : ''
                        : isUp ? 'text-success' : isDown ? 'text-danger' : ''
                    }`}>
                      {isUp ? '↑' : '↓'} {Math.abs(Number(diff))} {unit}
                    </div>
                  )}
                </Card>
              )
            })}
          </div>

          {/* Hedef Belirleme */}
          <Card>
            <CardHeader><CardTitle>Hedeflerim</CardTitle></CardHeader>
            <GoalSetter
              clientId={client.id}
              trainerId={client.trainer_id}
              goals={(goals as ClientGoal[]) || []}
              currentValues={{
                weight: measurements[0]?.weight ? Number(measurements[0].weight) : null,
                body_fat_pct: measurements[0]?.body_fat_pct ? Number(measurements[0].body_fat_pct) : null,
                chest: measurements[0]?.chest ? Number(measurements[0].chest) : null,
                waist: measurements[0]?.waist ? Number(measurements[0].waist) : null,
                arm: measurements[0]?.arm ? Number(measurements[0].arm) : null,
                leg: measurements[0]?.leg ? Number(measurements[0].leg) : null,
              }}
              startValues={(() => {
                const first = measurements[measurements.length - 1]
                return {
                  weight: first?.weight ? Number(first.weight) : null,
                  body_fat_pct: first?.body_fat_pct ? Number(first.body_fat_pct) : null,
                  chest: first?.chest ? Number(first.chest) : null,
                  waist: first?.waist ? Number(first.waist) : null,
                  arm: first?.arm ? Number(first.arm) : null,
                  leg: first?.leg ? Number(first.leg) : null,
                }
              })()}
            />
          </Card>

          {/* Hedef Detayları */}
          {goals && goals.length > 0 && (() => {
            const latestM = measurements[0]
            const firstM = measurements[measurements.length - 1]
            return (
              <Card>
                <CardHeader><CardTitle>Hedef Detayları</CardTitle></CardHeader>
                <div className="space-y-5">
                  {(goals as ClientGoal[]).map((goal) => {
                    const metric = goal.metric_type as GoalMetricType
                    const rawVal = latestM?.[metric]
                    const current: number | null = typeof rawVal === 'number' ? rawVal : null
                    const rawStart = firstM?.[metric]
                    const start: number | null = typeof rawStart === 'number' ? rawStart : current
                    const unit = GOAL_METRIC_UNITS[metric]
                    const label = GOAL_METRIC_LABELS[metric]
                    const achieved = current !== null && (
                      LOWER_IS_BETTER.includes(metric)
                        ? current <= goal.target_value
                        : current >= goal.target_value
                    )
                    const progress = current !== null && start !== null
                      ? calcGoalProgress(metric, current, goal.target_value, start)
                      : null
                    const remaining = current !== null
                      ? Math.round(Math.abs(goal.target_value - current) * 10) / 10
                      : null

                    return (
                      <div key={goal.id} className="space-y-2">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <span className="text-sm font-semibold text-text-primary">{label}</span>
                            {achieved && (
                              <Badge variant="success">Hedefe Ulaştın!</Badge>
                            )}
                          </div>
                          <span className="text-xs text-text-secondary">
                            {current !== null ? `${current} ${unit}` : 'Ölçüm yok'} &rarr; {goal.target_value} {unit}
                          </span>
                        </div>

                        {progress !== null && (
                          <div className="space-y-1">
                            <div className="h-2 bg-border rounded-full overflow-hidden">
                              <div
                                className="h-full rounded-full transition-all duration-500"
                                style={{
                                  width: `${achieved ? 100 : progress}%`,
                                  backgroundColor: achieved ? '#22c55e' : '#DC2626',
                                }}
                              />
                            </div>
                            <div className={`text-xs text-right ${achieved ? 'text-success' : 'text-danger'}`}>
                              {achieved
                                ? 'Hedefe ulaştın!'
                                : `${remaining} ${unit} kaldı — %${progress}`
                              }
                            </div>
                          </div>
                        )}
                      </div>
                    )
                  })}
                </div>
              </Card>
            )
          })()}

          {/* Ölçüm geçmişi tablosu */}
          <Card>
            <CardHeader><CardTitle>Ölçüm Geçmişi</CardTitle></CardHeader>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border">
                    <th className="text-left py-2 text-text-secondary font-medium">Tarih</th>
                    <th className="text-right py-2 text-text-secondary font-medium">Kilo</th>
                    <th className="text-right py-2 text-text-secondary font-medium">Göğüs</th>
                    <th className="text-right py-2 text-text-secondary font-medium">Bel</th>
                    <th className="text-right py-2 text-text-secondary font-medium">Kol</th>
                    <th className="text-right py-2 text-text-secondary font-medium">Bacak</th>
                    <th className="text-right py-2 text-text-secondary font-medium">Yağ%</th>
                  </tr>
                </thead>
                <tbody>
                  {measurements.map((m) => (
                    <tr key={m.id} className="border-b border-border/50">
                      <td className="py-2 font-medium">{formatDate(m.date)}</td>
                      <td className="py-2 text-right">{m.weight || '-'}</td>
                      <td className="py-2 text-right">{m.chest || '-'}</td>
                      <td className="py-2 text-right">{m.waist || '-'}</td>
                      <td className="py-2 text-right">{m.arm || '-'}</td>
                      <td className="py-2 text-right">{m.leg || '-'}</td>
                      <td className="py-2 text-right">{m.body_fat_pct || '-'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Card>
        </>
      )}
    </div>
  )
}
