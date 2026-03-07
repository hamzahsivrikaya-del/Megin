import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import Card from '@/components/ui/Card'
import Badge from '@/components/ui/Badge'
import Link from 'next/link'

const DAY_NAMES = ['Pazartesi', 'Salı', 'Çarşamba', 'Perşembe', 'Cuma', 'Cumartesi', 'Pazar']

const SECTIONS = [
  { key: 'warmup', label: 'Isınma' },
  { key: 'strength', label: 'Güç-Kuvvet' },
  { key: 'accessory', label: 'Aksesuar' },
  { key: 'cardio', label: 'Kardiyo-Metcon' },
]

export default async function ProgramPage() {
  const supabase = await createClient()
  const { data: { session } } = await supabase.auth.getSession()
  if (!session?.user) redirect('/login')

  const { data: client } = await supabase
    .from('clients')
    .select('id, trainer_id')
    .eq('user_id', session.user.id)
    .maybeSingle()

  if (!client) redirect('/login')

  // Bu haftanın pazartesi
  const now = new Date()
  const day = now.getDay()
  const diff = now.getDate() - day + (day === 0 ? -6 : 1)
  const monday = new Date(now.setDate(diff))
  const mondayStr = monday.toISOString().split('T')[0]

  // Hem public hem kişiye özel workoutları çek
  const { data: workouts } = await supabase
    .from('workouts')
    .select('*, exercises:workout_exercises(*)')
    .eq('trainer_id', client.trainer_id)
    .eq('week_start', mondayStr)
    .or(`type.eq.public,and(type.eq.client,client_id.eq.${client.id})`)
    .order('day_index')

  const todayIndex = (() => {
    const d = new Date().getDay()
    return d === 0 ? 6 : d - 1
  })()

  // Haftanın tarih aralığı
  const weekEnd = new Date(monday)
  weekEnd.setDate(weekEnd.getDate() + 6)
  const format = (d: Date) => `${d.getDate()} ${['Oca','Şub','Mar','Nis','May','Haz','Tem','Ağu','Eyl','Eki','Kas','Ara'][d.getMonth()]}`
  const weekRange = `${format(monday)} - ${format(weekEnd)} ${weekEnd.getFullYear()}`

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <Link href="/app" className="text-sm text-text-secondary hover:text-primary transition-colors">
            ← Geri
          </Link>
          <h1 className="text-2xl font-bold mt-1">Programım</h1>
        </div>
        <span className="text-sm text-text-secondary">{weekRange}</span>
      </div>

      {!workouts || workouts.length === 0 ? (
        <Card className="text-center py-8">
          <p className="text-text-secondary">Henüz program atanmadı.</p>
          <p className="text-sm text-text-tertiary mt-1">Antrenörün programını oluşturduğunda burada görünecek.</p>
        </Card>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {DAY_NAMES.map((dayName, index) => {
            // Kişiye özel varsa onu göster, yoksa public
            const clientWorkout = workouts.find((w) => w.day_index === index && w.type === 'client')
            const publicWorkout = workouts.find((w) => w.day_index === index && w.type === 'public')
            const workout = clientWorkout || publicWorkout
            const isToday = index === todayIndex
            const exercises = workout?.exercises?.sort((a: { order_num: number }, b: { order_num: number }) => a.order_num - b.order_num) || []

            return (
              <Card
                key={index}
                className={isToday ? 'border-primary/30 bg-primary/5' : ''}
              >
                <div className="flex items-center justify-between mb-3">
                  <span className={`text-sm font-medium ${isToday ? 'text-primary' : 'text-text-primary'}`}>
                    {dayName}
                  </span>
                  {isToday && <Badge variant="primary">Bugün</Badge>}
                </div>

                {workout ? (
                  <div className="space-y-3">
                    {workout.title && (
                      <p className="font-semibold text-text-primary">{workout.title}</p>
                    )}

                    {workout.warmup_text && (
                      <div>
                        <p className="text-[10px] uppercase tracking-wider text-text-tertiary font-medium mb-1">Isınma</p>
                        <p className="text-xs text-text-secondary whitespace-pre-line">{workout.warmup_text}</p>
                      </div>
                    )}

                    {exercises.length > 0 && (
                      <div className="space-y-1.5">
                        {exercises.map((ex: { id: string; name: string; sets: number | null; reps: string | null; weight: string | null; section: string }, idx: number) => (
                          <div key={ex.id || idx} className="flex items-center gap-2">
                            <span className="text-xs text-text-tertiary w-5 text-right">{idx + 1}.</span>
                            <span className="text-sm text-text-primary flex-1">{ex.name}</span>
                            <div className="flex gap-1">
                              {ex.sets && (
                                <span className="text-[10px] px-1.5 py-0.5 rounded bg-primary/10 text-primary font-medium">
                                  {ex.sets}x
                                </span>
                              )}
                              {ex.reps && (
                                <span className="text-[10px] px-1.5 py-0.5 rounded bg-background text-text-secondary">
                                  {ex.reps}
                                </span>
                              )}
                              {ex.weight && (
                                <span className="text-[10px] px-1.5 py-0.5 rounded bg-background text-text-secondary">
                                  {ex.weight}
                                </span>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    )}

                    {workout.cardio_text && (
                      <div>
                        <p className="text-[10px] uppercase tracking-wider text-text-tertiary font-medium mb-1">Kardiyo</p>
                        <p className="text-xs text-text-secondary whitespace-pre-line">{workout.cardio_text}</p>
                      </div>
                    )}
                  </div>
                ) : (
                  <p className="text-xs text-text-tertiary">Dinlenme günü</p>
                )}
              </Card>
            )
          })}
        </div>
      )}
    </div>
  )
}
