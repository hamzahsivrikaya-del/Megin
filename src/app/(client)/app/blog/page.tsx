import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { getTrainerPlan } from '@/lib/subscription'
import FeatureGate from '@/components/shared/FeatureGate'
import Card from '@/components/ui/Card'
import Link from 'next/link'
import { BlogPost } from '@/lib/types'

export default async function ClientBlogPage() {
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

  const { data: posts } = await supabase
    .from('blog_posts')
    .select('*')
    .eq('trainer_id', client.trainer_id)
    .eq('published', true)
    .order('created_at', { ascending: false })

  const blogPosts = (posts || []) as BlogPost[]

  function formatDate(dateStr: string) {
    const d = new Date(dateStr)
    return d.toLocaleDateString('tr-TR', { day: 'numeric', month: 'long', year: 'numeric' })
  }

  return (
    <FeatureGate plan={plan} feature="blog" role="client">
      <div className="space-y-6 panel-section-enter">
        <div>
          <Link href="/app" className="text-sm text-text-secondary hover:text-primary transition-colors">
            {'←'} Geri
          </Link>
          <h1 className="text-2xl font-bold mt-1">Blog</h1>
        </div>

        {blogPosts.length === 0 ? (
          <Card className="text-center py-8">
            <p className="text-text-secondary">Henuz blog yazisi yok.</p>
            <p className="text-sm text-text-tertiary mt-1">Antrenorunuz yazi paylastiginda burada gorunecek.</p>
          </Card>
        ) : (
          <div className="space-y-4">
            {blogPosts.map(post => (
              <Card key={post.id}>
                <h2 className="text-lg font-semibold text-text-primary mb-2">{post.title}</h2>
                <p className="text-xs text-text-tertiary mb-3">{formatDate(post.created_at)}</p>
                <p className="text-sm text-text-secondary whitespace-pre-wrap">{post.content}</p>
              </Card>
            ))}
          </div>
        )}
      </div>
    </FeatureGate>
  )
}
