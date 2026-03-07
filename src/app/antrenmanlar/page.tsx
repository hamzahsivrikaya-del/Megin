import { createClient } from '@/lib/supabase/server'
import LandingNavbar from '@/components/shared/LandingNavbar'
import WorkoutDayCard from '@/components/shared/WorkoutDayCard'
import { getMonday, formatWeekRange, getTodayDayIndex } from '@/lib/utils'
import type { Workout } from '@/lib/types'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Haftalık Antrenman Programı | Megin',
  description: 'Her hafta güncellenen ücretsiz antrenman programı. Pazartesi-Cumartesi antrenman, Pazar aktif dinlenme.',
  openGraph: {
    title: 'Haftalık Antrenman Programı | Megin',
    description: 'Her hafta güncellenen ücretsiz antrenman programı.',
  },
}

export default async function AntrenmanlarPage() {
  const supabase = await createClient()
  const monday = getMonday()

  const { data: workouts } = await supabase
    .from('workouts')
    .select('*, exercises:workout_exercises(*)')
    .eq('type', 'public')
    .eq('week_start', monday)
    .order('day_index')

  const todayIndex = getTodayDayIndex()

  return (
    <div className="min-h-screen bg-[#FAFAFA]">
      <LandingNavbar />

      <div className="pt-16">
        {/* Page Header */}
        <div className="border-b border-border bg-white">
          <div className="max-w-5xl mx-auto px-4 py-8 sm:py-12 text-center">
            <h1 className="font-display text-3xl sm:text-4xl tracking-wider mb-3">
              HAFTALIK <span className="text-primary">ANTRENMAN</span>
            </h1>
            <div className="inline-flex items-center gap-1.5 bg-primary/10 border border-primary/20 rounded-full px-3 py-1 mb-3">
              <svg className="w-3.5 h-3.5 text-primary" fill="currentColor" viewBox="0 0 24 24">
                <path d="M20.57 14.86L22 13.43 20.57 12 17 15.57 8.43 7 12 3.43 10.57 2 9.14 3.43 7.71 2 5.57 4.14 4.14 2.71 2.71 4.14l1.43 1.43L2 7.71l1.43 1.43L2 10.57 3.43 12 7 8.43 15.57 17 12 20.57 13.43 22l1.43-1.43L16.29 22l2.14-2.14 1.43 1.43 1.43-1.43-1.43-1.43L22 16.29z"/>
              </svg>
              <span className="text-xs font-medium text-primary">Her Hafta Güncellenir</span>
            </div>
            <p className="text-sm text-text-secondary">
              {formatWeekRange(monday)}
            </p>
          </div>
        </div>

        {/* Günler */}
        <div className="max-w-5xl mx-auto px-4 py-8 sm:py-10">
          <div className="grid gap-6 sm:grid-cols-2">
            {Array.from({ length: 7 }, (_, i) => {
              const workout = (workouts as Workout[] | null)?.find(w => w.day_index === i)
              return (
                <WorkoutDayCard
                  key={i}
                  dayIndex={i}
                  workout={workout}
                  isToday={i === todayIndex}
                  colSpan={i === 6}
                />
              )
            })}
          </div>
        </div>
      </div>
    </div>
  )
}
