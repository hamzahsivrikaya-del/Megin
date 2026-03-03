import { createClient } from '@/lib/supabase/server'
import Image from 'next/image'
import Link from 'next/link'
import { formatDate } from '@/lib/utils'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Blog — Megin',
  description:
    'Insights, guides, and training tips for personal trainers who want to grow their business and deliver better results.',
  openGraph: {
    title: 'Blog — Megin',
    description:
      'Insights, guides, and training tips for personal trainers who want to grow their business.',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Blog — Megin',
    description: 'Insights, guides, and training tips for personal trainers.',
  },
}

interface BlogPost {
  id: string
  title: string
  slug: string
  content: string | null
  cover_image: string | null
  status: string
  published_at: string | null
  created_at: string
}

function getExcerpt(content: string | null): string {
  if (!content) return ''
  const stripped = content.replace(/<[^>]*>/g, '').trim()
  return stripped.length > 150 ? stripped.slice(0, 150) + '...' : stripped
}

export default async function MarketingBlogPage() {
  const supabase = await createClient()

  const { data: posts } = await supabase
    .from('blog_posts')
    .select('*')
    .eq('status', 'published')
    .order('published_at', { ascending: false })

  const typedPosts: BlogPost[] = posts ?? []
  const [featuredPost, ...restPosts] = typedPosts

  return (
    <>
      {/* Header */}
      <section className="mkt-section pt-32 pb-16 bg-white">
        <div className="mkt-container">
          <div className="max-w-2xl">
            <p className="text-xs font-bold tracking-widest uppercase text-[#FF2D2D] mb-3">
              Blog
            </p>
            <h1 className="mkt-heading-xl text-4xl sm:text-5xl md:text-6xl text-[#0A0A0A]">
              INSIGHTS FOR TRAINERS
            </h1>
            <p className="text-[#6B7280] mt-4 text-lg leading-relaxed">
              Guides, strategies, and tips to help you coach better and grow faster.
            </p>
          </div>
        </div>
      </section>

      {/* Posts */}
      <section className="mkt-section pb-24 bg-white">
        <div className="mkt-container">
          {typedPosts.length === 0 ? (
            <div className="border border-[#E5E7EB] p-16 text-center">
              <p className="text-[#6B7280] text-lg">No posts yet.</p>
              <p className="text-sm text-[#9CA3AF] mt-2">
                Check back soon — new content is on the way.
              </p>
            </div>
          ) : (
            <div className="space-y-12">
              {/* Featured post — full width */}
              {featuredPost && (
                <Link
                  href={`/blog/${featuredPost.slug}`}
                  className="group block border border-[#E5E7EB] hover:border-[#FF2D2D]/40 transition-colors overflow-hidden"
                  aria-label={`Read: ${featuredPost.title}`}
                >
                  <div className="grid md:grid-cols-2">
                    {/* Cover image */}
                    <div className="relative aspect-video md:aspect-auto md:min-h-[360px] bg-[#F5F5F5]">
                      {featuredPost.cover_image ? (
                        <Image
                          src={featuredPost.cover_image}
                          alt={featuredPost.title}
                          fill
                          className="object-cover group-hover:scale-[1.02] transition-transform duration-500"
                          sizes="(max-width: 768px) 100vw, 50vw"
                          priority
                        />
                      ) : (
                        <div className="absolute inset-0 flex items-center justify-center bg-[#F5F5F5]">
                          <div className="w-16 h-16 rounded-xl bg-[#FF2D2D]/10 flex items-center justify-center">
                            <svg
                              width="28"
                              height="28"
                              viewBox="0 0 24 24"
                              fill="none"
                              aria-hidden="true"
                            >
                              <path
                                d="M4 4h16v16H4zM4 9h16M9 4v16"
                                stroke="#FF2D2D"
                                strokeWidth="1.5"
                                strokeLinecap="round"
                                opacity="0.6"
                              />
                            </svg>
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Content */}
                    <div className="p-8 md:p-12 flex flex-col justify-center">
                      <span className="text-xs font-bold tracking-widest uppercase text-[#FF2D2D] mb-4 block">
                        Featured
                      </span>
                      <h2 className="mkt-heading-lg text-2xl sm:text-3xl text-[#0A0A0A] group-hover:text-[#FF2D2D] transition-colors leading-tight">
                        {featuredPost.title}
                      </h2>
                      <p className="text-[#6B7280] mt-4 leading-relaxed text-base">
                        {getExcerpt(featuredPost.content)}
                      </p>
                      <div className="flex items-center justify-between mt-6 pt-6 border-t border-[#E5E7EB]">
                        <span className="text-xs text-[#9CA3AF]">
                          {featuredPost.published_at
                            ? formatDate(featuredPost.published_at)
                            : ''}
                        </span>
                        <span className="text-xs font-bold tracking-wider uppercase text-[#FF2D2D] flex items-center gap-1.5">
                          Read Article
                          <svg
                            width="14"
                            height="14"
                            viewBox="0 0 16 16"
                            fill="none"
                            aria-hidden="true"
                          >
                            <path
                              d="M3 8h10M9 4l4 4-4 4"
                              stroke="currentColor"
                              strokeWidth="2"
                              strokeLinecap="round"
                              strokeLinejoin="round"
                            />
                          </svg>
                        </span>
                      </div>
                    </div>
                  </div>
                </Link>
              )}

              {/* Remaining posts — 2-col grid */}
              {restPosts.length > 0 && (
                <div className="grid sm:grid-cols-2 gap-6">
                  {restPosts.map((post) => (
                    <Link
                      key={post.id}
                      href={`/blog/${post.slug}`}
                      className="group block border border-[#E5E7EB] hover:border-[#FF2D2D]/40 transition-colors overflow-hidden"
                      aria-label={`Read: ${post.title}`}
                    >
                      {/* Cover image */}
                      <div className="relative aspect-video bg-[#F5F5F5]">
                        {post.cover_image ? (
                          <Image
                            src={post.cover_image}
                            alt={post.title}
                            fill
                            className="object-cover group-hover:scale-[1.02] transition-transform duration-500"
                            sizes="(max-width: 640px) 100vw, 50vw"
                          />
                        ) : (
                          <div className="absolute inset-0 flex items-center justify-center">
                            <div className="w-12 h-12 rounded-xl bg-[#FF2D2D]/10 flex items-center justify-center">
                              <svg
                                width="22"
                                height="22"
                                viewBox="0 0 24 24"
                                fill="none"
                                aria-hidden="true"
                              >
                                <path
                                  d="M4 4h16v16H4zM4 9h16M9 4v16"
                                  stroke="#FF2D2D"
                                  strokeWidth="1.5"
                                  strokeLinecap="round"
                                  opacity="0.6"
                                />
                              </svg>
                            </div>
                          </div>
                        )}
                      </div>

                      {/* Content */}
                      <div className="p-6">
                        <h2 className="mkt-heading-lg text-lg text-[#0A0A0A] group-hover:text-[#FF2D2D] transition-colors leading-tight">
                          {post.title}
                        </h2>
                        <p className="text-[#6B7280] mt-3 text-sm leading-relaxed line-clamp-3">
                          {getExcerpt(post.content)}
                        </p>
                        <div className="flex items-center justify-between mt-4 pt-4 border-t border-[#E5E7EB]">
                          <span className="text-xs text-[#9CA3AF]">
                            {post.published_at ? formatDate(post.published_at) : ''}
                          </span>
                          <span className="text-xs font-bold tracking-wider uppercase text-[#FF2D2D] flex items-center gap-1">
                            Read
                            <svg
                              width="12"
                              height="12"
                              viewBox="0 0 16 16"
                              fill="none"
                              aria-hidden="true"
                            >
                              <path
                                d="M3 8h10M9 4l4 4-4 4"
                                stroke="currentColor"
                                strokeWidth="2"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                              />
                            </svg>
                          </span>
                        </div>
                      </div>
                    </Link>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </section>
    </>
  )
}
