import { createClient } from '@/lib/supabase/server'
import Image from 'next/image'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { formatDate } from '@/lib/utils'
import type { Metadata } from 'next'

/**
 * sanitizeHtml: Strips <script> tags, on* event handlers, and javascript: URLs.
 * Content comes from our own Supabase database (admin-authored only), not user input.
 */
function sanitizeHtml(html: string): string {
  return html
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
    .replace(/<script\b[^>]*>/gi, '')
    .replace(/\s+on[a-z]+\s*=\s*(?:"[^"]*"|'[^']*'|[^\s>]+)/gi, '')
    .replace(/(href\s*=\s*["'])\s*javascript\s*:[^"']*(["'])/gi, '$1#$2')
    .replace(/(src\s*=\s*["'])\s*javascript\s*:[^"']*(["'])/gi, '$1#$2')
}

function markdownToHtml(content: string): string {
  return content
    .replace(/^### (.*$)/gm, '<h3>$1</h3>')
    .replace(/^## (.*$)/gm, '<h2>$1</h2>')
    .replace(/^# (.*$)/gm, '<h1>$1</h1>')
    .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
    .replace(/\*(.*?)\*/g, '<em>$1</em>')
    .replace(/\n\n/g, '</p><p>')
    .replace(/\n/g, '<br/>')
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>
}): Promise<Metadata> {
  const { slug } = await params
  try {
    const supabase = await createClient()
    const { data: post } = await supabase
      .from('blog_posts')
      .select('title, content, cover_image')
      .eq('slug', slug)
      .eq('status', 'published')
      .single()
    if (!post) return { title: 'Post Not Found — Megin' }
    const description = post.content?.replace(/<[^>]*>/g, '').slice(0, 160) ?? ''
    return {
      title: `${post.title} — Megin`,
      description,
      openGraph: {
        title: `${post.title} — Megin`,
        description,
        type: 'article',
        ...(post.cover_image && { images: [{ url: post.cover_image, width: 1200, height: 630 }] }),
      },
      twitter: {
        card: 'summary_large_image',
        title: `${post.title} — Megin`,
        description,
        ...(post.cover_image && { images: [post.cover_image] }),
      },
    }
  } catch {
    return { title: 'Blog — Megin' }
  }
}

export default async function MarketingBlogPostPage({
  params,
}: {
  params: Promise<{ slug: string }>
}) {
  const { slug } = await params
  let post
  try {
    const supabase = await createClient()
    const { data } = await supabase
      .from('blog_posts')
      .select('*')
      .eq('slug', slug)
      .eq('status', 'published')
      .single()
    post = data
  } catch {
    notFound()
  }
  if (!post) notFound()

  const isHtml = post.content?.trim().startsWith('<') ?? false
  const htmlContent = post.content
    ? isHtml
      ? post.content
      : markdownToHtml(post.content)
    : ''

  const jsonLdData = {
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: post.title,
    description: post.content?.replace(/<[^>]*>/g, '').slice(0, 160) ?? '',
    datePublished: post.published_at ?? post.created_at,
    dateModified: post.created_at,
    author: {
      '@type': 'Organization',
      name: 'Megin',
    },
    publisher: {
      '@type': 'Organization',
      name: 'Megin',
      url: 'https://megin.io',
    },
    ...(post.cover_image && { image: post.cover_image }),
    url: `https://megin.io/blog/${post.slug}`,
  }

  const sanitizedContent = sanitizeHtml(htmlContent)

  return (
    <>
      {/* Article JSON-LD — static admin-authored data only */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLdData) }}
      />

      {/* Back navigation */}
      <div className="mkt-section pt-28 pb-0 bg-white">
        <div className="mkt-container">
          <Link
            href="/blog"
            className="inline-flex items-center gap-2 text-sm font-semibold text-[#57534E] hover:text-[#DC2626] transition-colors"
          >
            <svg
              width="16"
              height="16"
              viewBox="0 0 16 16"
              fill="none"
              aria-hidden="true"
            >
              <path
                d="M13 8H3M7 12l-4-4 4-4"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
            Back to Blog
          </Link>
        </div>
      </div>

      {/* Article */}
      <article className="mkt-section py-12 bg-white">
        <div className="max-w-3xl mx-auto">
          {/* Cover image */}
          {post.cover_image && (
            <div className="relative w-full aspect-video mb-8 overflow-hidden">
              <Image
                src={post.cover_image}
                alt={post.title}
                fill
                className="object-cover"
                sizes="(max-width: 768px) 100vw, 768px"
                priority
              />
            </div>
          )}

          {/* Title and date */}
          <header className="mb-10">
            <h1 className="mkt-heading-lg text-3xl sm:text-4xl md:text-5xl text-[#0A0A0A] leading-tight">
              {post.title}
            </h1>
            {post.published_at && (
              <p className="text-sm text-[#9CA3AF] mt-4">
                {formatDate(post.published_at)}
              </p>
            )}
          </header>

          {/* Blog content — sanitized admin-only HTML */}
          <div
            className="text-[#1A1A1A] leading-relaxed [&_h1]:mkt-heading-lg [&_h1]:text-2xl [&_h1]:mt-10 [&_h1]:mb-4 [&_h2]:mkt-heading-lg [&_h2]:text-xl [&_h2]:mt-8 [&_h2]:mb-3 [&_h3]:text-lg [&_h3]:font-bold [&_h3]:mt-6 [&_h3]:mb-2 [&_p]:mb-5 [&_p]:text-[#374151] [&_ul]:list-disc [&_ul]:pl-6 [&_ul]:mb-5 [&_ol]:list-decimal [&_ol]:pl-6 [&_ol]:mb-5 [&_li]:mb-2 [&_li]:text-[#374151] [&_img]:w-full [&_img]:my-8 [&_strong]:font-bold [&_strong]:text-[#0A0A0A] [&_em]:italic [&_a]:text-[#DC2626] [&_a]:underline [&_blockquote]:border-l-4 [&_blockquote]:border-[#DC2626] [&_blockquote]:pl-4 [&_blockquote]:my-6 [&_blockquote]:text-[#57534E] [&_blockquote]:italic"
            dangerouslySetInnerHTML={{ __html: sanitizedContent }}
          />
        </div>
      </article>

      {/* CTA Banner */}
      <section className="mkt-section py-20 mkt-section-dark">
        <div className="mkt-container text-center">
          <h2 className="mkt-heading-lg text-3xl sm:text-4xl text-white">
            Ready to level up your coaching?
          </h2>
          <p className="text-[#A8A29E] mt-4 max-w-xl mx-auto leading-relaxed">
            Join trainers using Megin to manage clients, track progress, and grow their business — free for up to 3 clients.
          </p>
          <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link href="/signup" className="mkt-cta-primary">
              Get Started Free
              <svg
                width="16"
                height="16"
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
            </Link>
            <Link href="/blog" className="mkt-cta-ghost border-[#374151] text-white hover:border-[#DC2626]">
              More Articles
            </Link>
          </div>
          <p className="text-xs text-[#57534E] mt-4">No credit card required</p>
        </div>
      </section>
    </>
  )
}
