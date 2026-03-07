'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import Card from '@/components/ui/Card'
import Button from '@/components/ui/Button'
import Badge from '@/components/ui/Badge'
import Input from '@/components/ui/Input'
import RichTextEditor from '@/components/shared/RichTextEditor'
import Modal from '@/components/ui/Modal'
import Select from '@/components/ui/Select'
import { formatDate } from '@/lib/utils'
import type { BlogPost } from '@/lib/types'

function generateSlug(title: string): string {
  return title
    .toLowerCase()
    .replace(/[çÇ]/g, 'c')
    .replace(/[ğĞ]/g, 'g')
    .replace(/[ıİ]/g, 'i')
    .replace(/[öÖ]/g, 'o')
    .replace(/[şŞ]/g, 's')
    .replace(/[üÜ]/g, 'u')
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .trim()
}

export default function BlogManager({ initialPosts }: { initialPosts: BlogPost[] }) {
  const router = useRouter()
  const [posts, setPosts] = useState(initialPosts)
  const [showEditor, setShowEditor] = useState(false)
  const [editingPost, setEditingPost] = useState<BlogPost | null>(null)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  const [form, setForm] = useState({
    title: '',
    content: '',
    status: 'draft' as 'draft' | 'published',
    cover_image: '',
  })

  function openEditor(post?: BlogPost) {
    if (post) {
      setEditingPost(post)
      setForm({
        title: post.title,
        content: post.content,
        status: post.status,
        cover_image: post.cover_image || '',
      })
    } else {
      setEditingPost(null)
      setForm({ title: '', content: '', status: 'draft', cover_image: '' })
    }
    setShowEditor(true)
    setError('')
  }

  async function handleSave(e: React.FormEvent) {
    e.preventDefault()
    setSaving(true)
    setError('')

    const supabase = createClient()
    const slug = generateSlug(form.title)

    const postData = {
      title: form.title,
      slug,
      content: form.content,
      status: form.status,
      cover_image: form.cover_image || null,
      published_at: form.status === 'published' ? new Date().toISOString() : null,
    }

    if (editingPost) {
      const { error: updateError } = await supabase
        .from('blog_posts')
        .update(postData)
        .eq('id', editingPost.id)

      if (updateError) {
        setError(updateError.message)
        setSaving(false)
        return
      }
    } else {
      const { error: insertError } = await supabase
        .from('blog_posts')
        .insert(postData)

      if (insertError) {
        setError(insertError.message)
        setSaving(false)
        return
      }
    }

    setShowEditor(false)
    setSaving(false)
    router.refresh()
  }

  async function handleDelete(postId: string) {
    if (!confirm('Bu yazıyı silmek istediğinize emin misiniz?')) return

    const supabase = createClient()
    await supabase.from('blog_posts').delete().eq('id', postId)
    router.refresh()
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl heading-display">Blog Yönetimi</h1>
        <Button onClick={() => openEditor()}>Yeni Yazı</Button>
      </div>

      {/* Yazı listesi */}
      <div className="space-y-3">
        {posts.length === 0 ? (
          <Card>
            <p className="text-text-secondary text-center py-8">Henüz yazı yok</p>
          </Card>
        ) : (
          posts.map((post) => (
            <Card key={post.id}>
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <h3 className="font-medium">{post.title}</h3>
                    <Badge variant={post.status === 'published' ? 'success' : 'default'}>
                      {post.status === 'published' ? 'Yayında' : 'Taslak'}
                    </Badge>
                  </div>
                  <p className="text-sm text-text-secondary mt-1">
                    {formatDate(post.created_at)}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <Button variant="ghost" size="sm" onClick={() => openEditor(post)}>
                    Düzenle
                  </Button>
                  <Button variant="ghost" size="sm" onClick={() => handleDelete(post.id)}>
                    Sil
                  </Button>
                </div>
              </div>
            </Card>
          ))
        )}
      </div>

      {/* Editor Modal */}
      <Modal
        open={showEditor}
        onClose={() => setShowEditor(false)}
        title={editingPost ? 'Yazıyı Düzenle' : 'Yeni Yazı'}
        size="xl"
      >
        <form onSubmit={handleSave} className="space-y-4">
          <Input
            label="Başlık"
            value={form.title}
            onChange={(e) => setForm({ ...form, title: e.target.value })}
            required
          />

          <Input
            label="Kapak Görseli URL (opsiyonel)"
            value={form.cover_image}
            onChange={(e) => setForm({ ...form, cover_image: e.target.value })}
            placeholder="https://..."
          />

          <div>
            <label className="block text-sm font-medium text-text-primary mb-2">İçerik</label>
            <RichTextEditor
              content={form.content}
              onChange={(html) => setForm({ ...form, content: html })}
            />
          </div>

          <Select
            label="Durum"
            options={[
              { value: 'draft', label: 'Taslak' },
              { value: 'published', label: 'Yayında' },
            ]}
            value={form.status}
            onChange={(e) => setForm({ ...form, status: e.target.value as 'draft' | 'published' })}
          />

          {error && <p className="text-sm text-danger">{error}</p>}

          <div className="flex gap-3 justify-end">
            <Button variant="secondary" type="button" onClick={() => setShowEditor(false)}>
              İptal
            </Button>
            <Button type="submit" loading={saving}>
              {editingPost ? 'Güncelle' : 'Yayınla'}
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  )
}
