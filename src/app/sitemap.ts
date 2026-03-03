import type { MetadataRoute } from 'next'
import { createClient } from '@/lib/supabase/server'

const BASE_URL = 'https://megin.io'

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const supabase = await createClient()
  const { data: posts } = await supabase
    .from('blog_posts')
    .select('slug, updated_at')
    .eq('status', 'published')

  const blogUrls = (posts ?? []).flatMap((post) => [
    { url: `${BASE_URL}/blog/${post.slug}`, lastModified: post.updated_at },
    { url: `${BASE_URL}/tr/blog/${post.slug}`, lastModified: post.updated_at },
  ])

  const toolSlugs = [
    'calorie-calculator',
    'one-rep-max',
    'bmi-calculator',
    'water-intake',
    'ideal-weight',
    'body-fat-skinfold',
    'body-fat-navy',
  ]
  const toolUrls = toolSlugs.flatMap((slug) => [
    { url: `${BASE_URL}/tools/${slug}`, changeFrequency: 'monthly' as const, priority: 0.5 },
    { url: `${BASE_URL}/tr/tools/${slug}`, changeFrequency: 'monthly' as const, priority: 0.5 },
  ])

  const marketingPages = ['', '/features', '/pricing', '/use-cases', '/tools', '/blog', '/contact']
  const pageUrls = marketingPages.flatMap((path) => [
    {
      url: `${BASE_URL}${path || '/'}`,
      lastModified: new Date(),
      changeFrequency: 'weekly' as const,
      priority: path === '' ? 1 : 0.8,
    },
    {
      url: `${BASE_URL}/tr${path}`,
      lastModified: new Date(),
      changeFrequency: 'weekly' as const,
      priority: path === '' ? 1 : 0.8,
    },
  ])

  const legalPages = ['/legal/privacy', '/legal/terms', '/legal/refund']
  const legalUrls = legalPages.flatMap((path) => [
    { url: `${BASE_URL}${path}`, changeFrequency: 'yearly' as const, priority: 0.3 },
    { url: `${BASE_URL}/tr${path}`, changeFrequency: 'yearly' as const, priority: 0.3 },
  ])

  return [...pageUrls, ...toolUrls, ...legalUrls, ...blogUrls]
}
