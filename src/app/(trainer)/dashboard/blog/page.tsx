import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { getTrainerPlan } from '@/lib/subscription'
import FeatureGate from '@/components/shared/FeatureGate'
import BlogClient from './BlogClient'
import { BlogPost } from '@/lib/types'

export default async function BlogPage() {
  const supabase = await createClient()
  const { data: { session } } = await supabase.auth.getSession()
  if (!session?.user) redirect('/login')

  const { data: trainer } = await supabase
    .from('trainers')
    .select('id')
    .eq('user_id', session.user.id)
    .single()

  if (!trainer) redirect('/login')

  const plan = await getTrainerPlan(supabase, trainer.id)

  const { data: posts } = await supabase
    .from('blog_posts')
    .select('*')
    .eq('trainer_id', trainer.id)
    .order('created_at', { ascending: false })

  return (
    <FeatureGate plan={plan} feature="blog" role="trainer">
      <BlogClient posts={(posts || []) as BlogPost[]} trainerId={trainer.id} />
    </FeatureGate>
  )
}
