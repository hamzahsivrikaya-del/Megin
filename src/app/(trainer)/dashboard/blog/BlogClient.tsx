'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { BlogPost } from '@/lib/types'
import Card from '@/components/ui/Card'
import Button from '@/components/ui/Button'
import Input from '@/components/ui/Input'
import Textarea from '@/components/ui/Textarea'
import Modal from '@/components/ui/Modal'
import Badge from '@/components/ui/Badge'

interface BlogClientProps {
  posts: BlogPost[]
  trainerId: string
}

export default function BlogClient({ posts: initialPosts, trainerId }: BlogClientProps) {
  const supabase = createClient()
  const [posts, setPosts] = useState<BlogPost[]>(initialPosts)
  const [showEditor, setShowEditor] = useState(false)
  const [editingPost, setEditingPost] = useState<BlogPost | null>(null)
  const [title, setTitle] = useState('')
  const [content, setContent] = useState('')
  const [saving, setSaving] = useState(false)

  function openNew() {
    setEditingPost(null)
    setTitle('')
    setContent('')
    setShowEditor(true)
  }

  function openEdit(post: BlogPost) {
    setEditingPost(post)
    setTitle(post.title)
    setContent(post.content)
    setShowEditor(true)
  }

  function closeEditor() {
    setShowEditor(false)
    setEditingPost(null)
    setTitle('')
    setContent('')
  }

  async function handleSave() {
    if (!title.trim() || !content.trim()) return
    setSaving(true)

    if (editingPost) {
      const { data, error } = await supabase
        .from('blog_posts')
        .update({ title: title.trim(), content: content.trim(), updated_at: new Date().toISOString() })
        .eq('id', editingPost.id)
        .select()
        .single()

      if (!error && data) {
        setPosts(prev => prev.map(p => p.id === data.id ? data as BlogPost : p))
      }
    } else {
      const { data, error } = await supabase
        .from('blog_posts')
        .insert({ trainer_id: trainerId, title: title.trim(), content: content.trim(), published: false })
        .select()
        .single()

      if (!error && data) {
        setPosts(prev => [data as BlogPost, ...prev])
      }
    }

    setSaving(false)
    closeEditor()
  }

  async function handleTogglePublish(post: BlogPost) {
    const { data, error } = await supabase
      .from('blog_posts')
      .update({ published: !post.published, updated_at: new Date().toISOString() })
      .eq('id', post.id)
      .select()
      .single()

    if (!error && data) {
      setPosts(prev => prev.map(p => p.id === data.id ? data as BlogPost : p))
    }
  }

  async function handleDelete(postId: string) {
    if (!confirm('Bu yaziyi silmek istediginize emin misiniz?')) return

    const { error } = await supabase
      .from('blog_posts')
      .delete()
      .eq('id', postId)

    if (!error) {
      setPosts(prev => prev.filter(p => p.id !== postId))
    }
  }

  function formatDate(dateStr: string) {
    const d = new Date(dateStr)
    return d.toLocaleDateString('tr-TR', { day: 'numeric', month: 'long', year: 'numeric' })
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl heading-gradient">Blog Yazilari</h1>
        <Button onClick={openNew} size="sm">Yeni Yazi</Button>
      </div>

      {posts.length === 0 ? (
        <Card glow className="text-center py-12">
          <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-3">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-primary">
              <path d="M12 20h9" />
              <path d="M16.5 3.5a2.121 2.121 0 013 3L7 19l-4 1 1-4L16.5 3.5z" />
            </svg>
          </div>
          <p className="text-text-secondary">Henuz blog yazisi yok.</p>
          <p className="text-sm text-text-tertiary mt-1">Ilk yazinizi olusturmak icin "Yeni Yazi" butonuna tiklayin.</p>
        </Card>
      ) : (
        <div className="space-y-3">
          {posts.map(post => (
            <Card glow key={post.id}>
              <div className="flex items-start justify-between gap-4">
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <h3 className="font-semibold text-text-primary truncate">{post.title}</h3>
                    <Badge variant={post.published ? 'success' : 'default'}>
                      {post.published ? 'Yayinda' : 'Taslak'}
                    </Badge>
                  </div>
                  <p className="text-sm text-text-secondary line-clamp-2">{post.content}</p>
                  <p className="text-xs text-text-tertiary mt-2">{formatDate(post.created_at)}</p>
                </div>
                <div className="flex items-center gap-1 shrink-0">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleTogglePublish(post)}
                  >
                    {post.published ? 'Geri Cek' : 'Yayinla'}
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => openEdit(post)}
                  >
                    Duzenle
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleDelete(post.id)}
                    className="text-danger hover:text-danger"
                  >
                    Sil
                  </Button>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}

      <Modal
        open={showEditor}
        onClose={closeEditor}
        title={editingPost ? 'Yaziyi Duzenle' : 'Yeni Yazi'}
        size="lg"
      >
        <div className="space-y-4">
          <Input
            label="Baslik"
            value={title}
            onChange={e => setTitle(e.target.value)}
            placeholder="Yazi basligi..."
          />
          <Textarea
            label="Icerik"
            value={content}
            onChange={e => setContent(e.target.value)}
            placeholder="Yazi icerigini buraya yazin..."
            rows={12}
          />
          <div className="flex justify-end gap-2 pt-2">
            <Button variant="outline" onClick={closeEditor}>Iptal</Button>
            <Button
              onClick={handleSave}
              loading={saving}
              disabled={!title.trim() || !content.trim()}
            >
              {editingPost ? 'Guncelle' : 'Kaydet'}
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  )
}
