import { createClient } from '@/lib/supabase/server'
import Image from 'next/image'
import Link from 'next/link'
import { formatDate } from '@/lib/utils'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Blog — Megin',
  description:
    'Kişisel antrenörler için içgörüler, rehberler ve antrenman ipuçları. İşinizi büyütün ve daha iyi sonuçlar elde edin.',
  openGraph: {
    title: 'Blog — Megin',
    description:
      'Kişisel antrenörler için içgörüler, rehberler ve antrenman ipuçları.',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Blog — Megin',
    description: 'Kişisel antrenörler için içgörüler ve ipuçları.',
  },
  alternates: {
    languages: {
      en: '/blog',
      tr: '/tr/blog',
    },
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

export default async function TurkishBlogPage() {
  let typedPosts: BlogPost[] = []
  try {
    const supabase = await createClient()
    const { data: posts } = await supabase
      .from('blog_posts')
      .select('*')
      .eq('status', 'published')
      .order('published_at', { ascending: false })
    typedPosts = (posts ?? []) as BlogPost[]
  } catch {
    typedPosts = []
  }
  const [featuredPost, ...restPosts] = typedPosts

  return (
    <>
      <section className="mkt-section pt-32 pb-16 bg-white">
        <div className="mkt-container">
          <div className="max-w-2xl">
            <p className="text-xs font-bold tracking-widest uppercase text-[#DC2626] mb-3">
              Blog
            </p>
            <h1 className="heading-display-xl text-4xl sm:text-5xl md:text-6xl text-[#0A0A0A]">
              ANTRENÖRLER İÇİN KAYNAKLAR
            </h1>
            <p className="text-[#6B7280] mt-4 text-lg leading-relaxed">
              Daha iyi koçluk yapmak ve daha hızlı büyümek için rehberler, stratejiler ve ipuçları.
            </p>
          </div>
        </div>
      </section>

      <section className="mkt-section pb-24 bg-white">
        <div className="mkt-container">
          {typedPosts.length === 0 ? (
            <div className="border border-[#E5E7EB] p-16 text-center">
              <p className="text-[#6B7280] text-lg">Henüz yazı yok.</p>
              <p className="text-sm text-[#9CA3AF] mt-2">
                Yakında geri kontrol edin — yeni içerik geliyor.
              </p>
            </div>
          ) : (
            <div className="space-y-12">
              {featuredPost && (
                <Link
                  href={`/tr/blog/${featuredPost.slug}`}
                  className="group block border border-[#E5E7EB] hover:border-[#DC2626]/40 transition-colors overflow-hidden"
                  aria-label={`Oku: ${featuredPost.title}`}
                >
                  <div className="grid md:grid-cols-2">
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
                          <div className="w-16 h-16 rounded-xl bg-[#DC2626]/10 flex items-center justify-center">
                            <svg
                              width="28"
                              height="28"
                              viewBox="0 0 24 24"
                              fill="none"
                              aria-hidden="true"
                            >
                              <path
                                d="M4 4h16v16H4zM4 9h16M9 4v16"
                                stroke="#DC2626"
                                strokeWidth="1.5"
                                strokeLinecap="round"
                                opacity="0.6"
                              />
                            </svg>
                          </div>
                        </div>
                      )}
                    </div>

                    <div className="p-8 md:p-12 flex flex-col justify-center">
                      <span className="text-xs font-bold tracking-widest uppercase text-[#DC2626] mb-4 block">
                        Öne Çıkan
                      </span>
                      <h2 className="heading-display text-2xl sm:text-3xl text-[#0A0A0A] group-hover:text-[#DC2626] transition-colors leading-tight">
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
                        <span className="text-xs font-bold tracking-wider uppercase text-[#DC2626] flex items-center gap-1.5">
                          Makaleyi Oku
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

              {restPosts.length > 0 && (
                <div className="grid sm:grid-cols-2 gap-6">
                  {restPosts.map((post) => (
                    <Link
                      key={post.id}
                      href={`/tr/blog/${post.slug}`}
                      className="group block border border-[#E5E7EB] hover:border-[#DC2626]/40 transition-colors overflow-hidden"
                      aria-label={`Oku: ${post.title}`}
                    >
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
                            <div className="w-12 h-12 rounded-xl bg-[#DC2626]/10 flex items-center justify-center">
                              <svg
                                width="22"
                                height="22"
                                viewBox="0 0 24 24"
                                fill="none"
                                aria-hidden="true"
                              >
                                <path
                                  d="M4 4h16v16H4zM4 9h16M9 4v16"
                                  stroke="#DC2626"
                                  strokeWidth="1.5"
                                  strokeLinecap="round"
                                  opacity="0.6"
                                />
                              </svg>
                            </div>
                          </div>
                        )}
                      </div>

                      <div className="p-6">
                        <h2 className="heading-display text-lg text-[#0A0A0A] group-hover:text-[#DC2626] transition-colors leading-tight">
                          {post.title}
                        </h2>
                        <p className="text-[#6B7280] mt-3 text-sm leading-relaxed line-clamp-3">
                          {getExcerpt(post.content)}
                        </p>
                        <div className="flex items-center justify-between mt-4 pt-4 border-t border-[#E5E7EB]">
                          <span className="text-xs text-[#9CA3AF]">
                            {post.published_at ? formatDate(post.published_at) : ''}
                          </span>
                          <span className="text-xs font-bold tracking-wider uppercase text-[#DC2626] flex items-center gap-1">
                            Oku
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
