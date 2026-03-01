import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import ProgressChart from './ProgressChartLazy'
import ProgressPhotos from './ProgressPhotos'

export default async function ProgressPage() {
  const supabase = await createClient()
  const { data: { session } } = await supabase.auth.getSession()
  if (!session?.user) redirect('/login')
  const user = session.user

  const [{ data: measurements }, { data: profile }, { data: goals }, { data: photos }] = await Promise.all([
    supabase
      .from('measurements')
      .select('*')
      .eq('user_id', user.id)
      .order('date', { ascending: true }),
    supabase
      .from('users')
      .select('gender, full_name')
      .eq('id', user.id)
      .single(),
    supabase
      .from('member_goals')
      .select('*')
      .eq('user_id', user.id),
    supabase
      .from('progress_photos')
      .select('*')
      .eq('user_id', user.id)
      .order('taken_at', { ascending: false }),
  ])

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <Link href="/dashboard" className="p-2 -ml-2 text-text-secondary hover:text-text-primary transition-colors">
          <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
        </Link>
        <h1 className="text-2xl font-bold">İlerleme</h1>
      </div>
      {(photos?.length ?? 0) > 0 && (
        <ProgressPhotos photos={photos || []} measurements={measurements || []} />
      )}
      <ProgressChart
        measurements={measurements || []}
        gender={profile?.gender}
        goals={goals || []}
        goalsEnabled={true}
      />
    </div>
  )
}
