'use client'

import { useEditor, EditorContent } from '@tiptap/react'
import StarterKit from '@tiptap/starter-kit'
import Underline from '@tiptap/extension-underline'
import TextAlign from '@tiptap/extension-text-align'
import { TextStyle } from '@tiptap/extension-text-style'
import Color from '@tiptap/extension-color'
import Image from '@tiptap/extension-image'
import FontFamily from '@tiptap/extension-font-family'
import Highlight from '@tiptap/extension-highlight'
import { useState, useRef, useCallback } from 'react'
import { createClient } from '@/lib/supabase/client'

interface Props {
  content: string
  onChange: (html: string) => void
}

const colorPresets = [
  // Beyazlar / Nötrler
  { label: 'Beyaz', value: '#F5F0E8' },
  { label: 'Gri', value: '#9CA3AF' },
  { label: 'Koyu Gri', value: '#6B7280' },
  // Kırmızılar
  { label: 'Kırmızı', value: '#DC2626' },
  { label: 'Açık Kırmızı', value: '#F87171' },
  { label: 'Bordo', value: '#991B1B' },
  // Turuncular
  { label: 'Turuncu', value: '#F97316' },
  { label: 'Amber', value: '#F59E0B' },
  // Sarılar
  { label: 'Sarı', value: '#EAB308' },
  { label: 'Limon', value: '#FACC15' },
  // Yeşiller
  { label: 'Yeşil', value: '#22C55E' },
  { label: 'Zümrüt', value: '#10B981' },
  { label: 'Koyu Yeşil', value: '#15803D' },
  // Maviler
  { label: 'Mavi', value: '#3B82F6' },
  { label: 'Açık Mavi', value: '#60A5FA' },
  { label: 'Koyu Mavi', value: '#1D4ED8' },
  // Morlar
  { label: 'Mor', value: '#8B5CF6' },
  { label: 'Eflatun', value: '#A855F7' },
  // Pembeler
  { label: 'Pembe', value: '#EC4899' },
  { label: 'Gül', value: '#F43F5E' },
]

const highlightColors = [
  { label: 'Sarı', value: '#FACC15' },
  { label: 'Yeşil', value: '#22C55E' },
  { label: 'Mavi', value: '#3B82F6' },
  { label: 'Mor', value: '#8B5CF6' },
  { label: 'Pembe', value: '#EC4899' },
  { label: 'Kırmızı', value: '#DC2626' },
]

const fontOptions = [
  { label: 'Varsayılan', value: '', family: 'var(--font-geist-sans)' },
  { label: 'Playfair', value: 'Playfair Display', family: 'var(--font-playfair)' },
  { label: 'Merriweather', value: 'Merriweather', family: 'var(--font-merriweather)' },
  { label: 'Raleway', value: 'Raleway', family: 'var(--font-raleway)' },
  { label: 'Oswald', value: 'Oswald', family: 'var(--font-oswald)' },
  { label: 'Lora', value: 'Lora', family: 'var(--font-lora)' },
]

export default function RichTextEditor({ content, onChange }: Props) {
  const [showColorPicker, setShowColorPicker] = useState(false)
  const [showHighlightPicker, setShowHighlightPicker] = useState(false)
  const [showFontPicker, setShowFontPicker] = useState(false)
  const [showImagePanel, setShowImagePanel] = useState(false)
  const [imageUrl, setImageUrl] = useState('')
  const [uploading, setUploading] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const editor = useEditor({
    immediatelyRender: false,
    extensions: [
      StarterKit.configure({
        heading: { levels: [2, 3] },
      }),
      Underline,
      TextStyle,
      Color,
      FontFamily,
      Highlight.configure({ multicolor: true }),
      TextAlign.configure({ types: ['heading', 'paragraph'] }),
      Image.configure({ inline: false }),
    ],
    content,
    onUpdate: ({ editor }) => {
      onChange(editor.getHTML())
    },
    editorProps: {
      attributes: {
        class: 'prose prose-invert max-w-none min-h-[200px] px-4 py-3 focus:outline-none text-sm leading-relaxed text-text-primary',
      },
    },
  })

  const handleFileUpload = useCallback(async (file: File) => {
    if (!editor) return
    if (!file.type.startsWith('image/')) return

    setUploading(true)
    try {
      const supabase = createClient()
      const ext = file.name.split('.').pop()
      const fileName = `blog/${Date.now()}-${Math.random().toString(36).slice(2, 8)}.${ext}`

      const { error } = await supabase.storage
        .from('blog-images')
        .upload(fileName, file)

      if (error) {
        // Bucket yoksa oluşturmayı dene
        if (error.message.includes('not found')) {
          alert('blog-images storage bucket\'ı bulunamadı. Supabase Dashboard\'dan oluşturun.')
          setUploading(false)
          return
        }
        throw error
      }

      const { data: urlData } = supabase.storage
        .from('blog-images')
        .getPublicUrl(fileName)

      editor.chain().focus().setImage({ src: urlData.publicUrl }).run()
    } catch (err) {
      console.error('Upload error:', err)
      alert('Görsel yüklenirken hata oluştu')
    }
    setUploading(false)
    setShowImagePanel(false)
  }, [editor])

  if (!editor) return null

  function addImageFromUrl() {
    if (imageUrl && editor) {
      editor.chain().focus().setImage({ src: imageUrl }).run()
      setImageUrl('')
      setShowImagePanel(false)
    }
  }

  // Dropdown'ları kapat (birini açınca diğerlerini kapat)
  function closeAllDropdowns() {
    setShowColorPicker(false)
    setShowHighlightPicker(false)
    setShowFontPicker(false)
    setShowImagePanel(false)
  }

  const currentFont = fontOptions.find(f => editor.isActive('textStyle', { fontFamily: f.value }))

  return (
    <div className="border border-border rounded-xl overflow-hidden bg-background">
      {/* Toolbar */}
      <div className="flex flex-wrap items-center gap-1 p-2 border-b border-border bg-surface">
        {/* Font Seçici */}
        <div className="relative">
          <button
            type="button"
            onClick={() => { closeAllDropdowns(); setShowFontPicker(!showFontPicker) }}
            className={`h-8 px-2 flex items-center gap-1 rounded-md transition-colors cursor-pointer text-xs ${
              showFontPicker
                ? 'bg-primary/20 text-primary'
                : 'text-text-secondary hover:text-text-primary hover:bg-surface-hover'
            }`}
            title="Yazı tipi"
          >
            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h8m-8 6h16" />
            </svg>
            <span className="max-w-[80px] truncate">{currentFont?.label || 'Font'}</span>
            <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </button>
          {showFontPicker && (
            <div className="absolute top-full left-0 mt-1 bg-surface border border-border rounded-lg py-1 z-20 shadow-xl min-w-[160px]">
              {fontOptions.map((f) => (
                <button
                  key={f.value}
                  onClick={() => {
                    if (f.value) {
                      editor.chain().focus().setFontFamily(f.value).run()
                    } else {
                      editor.chain().focus().unsetFontFamily().run()
                    }
                    setShowFontPicker(false)
                  }}
                  className={`w-full text-left px-3 py-1.5 text-sm transition-colors cursor-pointer flex items-center justify-between ${
                    (f.value && editor.isActive('textStyle', { fontFamily: f.value })) || (!f.value && !currentFont)
                      ? 'bg-primary/10 text-primary'
                      : 'text-text-primary hover:bg-surface-hover'
                  }`}
                  style={{ fontFamily: f.family }}
                >
                  {f.label}
                  {((f.value && editor.isActive('textStyle', { fontFamily: f.value })) || (!f.value && !currentFont)) && (
                    <svg className="w-3.5 h-3.5 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                    </svg>
                  )}
                </button>
              ))}
            </div>
          )}
        </div>

        <div className="w-px h-5 bg-border mx-1" />

        {/* Bold */}
        <ToolbarButton
          active={editor.isActive('bold')}
          onClick={() => editor.chain().focus().toggleBold().run()}
          title="Kalın"
        >
          <span className="font-bold text-xs">B</span>
        </ToolbarButton>

        {/* Italic */}
        <ToolbarButton
          active={editor.isActive('italic')}
          onClick={() => editor.chain().focus().toggleItalic().run()}
          title="İtalik"
        >
          <span className="italic text-xs">I</span>
        </ToolbarButton>

        {/* Underline */}
        <ToolbarButton
          active={editor.isActive('underline')}
          onClick={() => editor.chain().focus().toggleUnderline().run()}
          title="Altı çizili"
        >
          <span className="underline text-xs">U</span>
        </ToolbarButton>

        <div className="w-px h-5 bg-border mx-1" />

        {/* H2 */}
        <ToolbarButton
          active={editor.isActive('heading', { level: 2 })}
          onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
          title="Başlık 2"
        >
          <span className="text-xs font-semibold">H2</span>
        </ToolbarButton>

        {/* H3 */}
        <ToolbarButton
          active={editor.isActive('heading', { level: 3 })}
          onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}
          title="Başlık 3"
        >
          <span className="text-xs font-semibold">H3</span>
        </ToolbarButton>

        <div className="w-px h-5 bg-border mx-1" />

        {/* Bullet list */}
        <ToolbarButton
          active={editor.isActive('bulletList')}
          onClick={() => editor.chain().focus().toggleBulletList().run()}
          title="Madde listesi"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
          </svg>
        </ToolbarButton>

        <div className="w-px h-5 bg-border mx-1" />

        {/* Hizalama */}
        <ToolbarButton
          active={editor.isActive({ textAlign: 'left' })}
          onClick={() => editor.chain().focus().setTextAlign('left').run()}
          title="Sola hizala"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 6h18M3 12h12M3 18h18" />
          </svg>
        </ToolbarButton>

        <ToolbarButton
          active={editor.isActive({ textAlign: 'center' })}
          onClick={() => editor.chain().focus().setTextAlign('center').run()}
          title="Ortala"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 6h18M6 12h12M3 18h18" />
          </svg>
        </ToolbarButton>

        <ToolbarButton
          active={editor.isActive({ textAlign: 'right' })}
          onClick={() => editor.chain().focus().setTextAlign('right').run()}
          title="Sağa hizala"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 6h18M9 12h12M3 18h18" />
          </svg>
        </ToolbarButton>

        <div className="w-px h-5 bg-border mx-1" />

        {/* Metin Rengi */}
        <div className="relative">
          <ToolbarButton
            active={showColorPicker}
            onClick={() => { closeAllDropdowns(); setShowColorPicker(!showColorPicker) }}
            title="Metin rengi"
          >
            <div className="flex flex-col items-center gap-0.5">
              <span className="text-xs font-bold leading-none">A</span>
              <div className="w-4 h-1 rounded-full" style={{
                background: 'linear-gradient(90deg, #DC2626, #F97316, #3B82F6, #22C55E)'
              }} />
            </div>
          </ToolbarButton>
          {showColorPicker && (
            <div className="absolute top-full left-1/2 -translate-x-1/2 sm:left-0 sm:translate-x-0 mt-1 bg-surface border border-border rounded-xl p-3 z-20 shadow-xl w-[200px]">
              <div className="grid grid-cols-5 gap-0" style={{ gridTemplateColumns: 'repeat(5, 32px)', gridAutoRows: '32px' }}>
                {colorPresets.map((c) => (
                  <button
                    key={c.value}
                    onClick={() => {
                      editor.chain().focus().setColor(c.value).run()
                      setShowColorPicker(false)
                    }}
                    className="flex items-center justify-center cursor-pointer group"
                    title={c.label}
                  >
                    <span
                      className="w-6 h-6 rounded-full block border border-white/10 group-hover:scale-125 group-hover:border-white/30 transition-all shadow-sm"
                      style={{ backgroundColor: c.value }}
                    />
                  </button>
                ))}
              </div>
              <button
                onClick={() => {
                  editor.chain().focus().unsetColor().run()
                  setShowColorPicker(false)
                }}
                className="w-full text-[11px] text-text-secondary hover:text-text-primary py-1.5 mt-2 border-t border-border cursor-pointer transition-colors"
              >
                Rengi kaldır
              </button>
            </div>
          )}
        </div>

        {/* Vurgulama (Highlight) */}
        <div className="relative">
          <ToolbarButton
            active={showHighlightPicker || editor.isActive('highlight')}
            onClick={() => { closeAllDropdowns(); setShowHighlightPicker(!showHighlightPicker) }}
            title="Vurgula"
          >
            <div className="flex flex-col items-center gap-0.5">
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
              </svg>
              <div className="w-4 h-1 rounded-full bg-yellow-400/80" />
            </div>
          </ToolbarButton>
          {showHighlightPicker && (
            <div className="absolute top-full left-1/2 -translate-x-1/2 sm:left-0 sm:translate-x-0 mt-1 bg-surface border border-border rounded-xl p-3 z-20 shadow-xl">
              <div className="grid grid-cols-6 gap-0" style={{ gridTemplateColumns: 'repeat(6, 32px)', gridAutoRows: '32px' }}>
                {highlightColors.map((c) => (
                  <button
                    key={c.value}
                    onClick={() => {
                      editor.chain().focus().toggleHighlight({ color: c.value + '33' }).run()
                      setShowHighlightPicker(false)
                    }}
                    className="flex items-center justify-center cursor-pointer group"
                    title={c.label}
                  >
                    <span
                      className="w-6 h-6 rounded block border border-white/10 group-hover:scale-125 group-hover:border-white/30 transition-all"
                      style={{ backgroundColor: c.value + '33' }}
                    />
                  </button>
                ))}
              </div>
              <button
                onClick={() => {
                  editor.chain().focus().unsetHighlight().run()
                  setShowHighlightPicker(false)
                }}
                className="w-full text-[11px] text-text-secondary hover:text-text-primary py-1.5 mt-2 border-t border-border cursor-pointer transition-colors"
              >
                Vurguyu kaldır
              </button>
            </div>
          )}
        </div>

        <div className="w-px h-5 bg-border mx-1" />

        {/* Görsel */}
        <div className="relative">
          <ToolbarButton
            active={showImagePanel}
            onClick={() => { closeAllDropdowns(); setShowImagePanel(!showImagePanel) }}
            title="Görsel ekle"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
          </ToolbarButton>
          {showImagePanel && (
            <div className="absolute top-full right-0 mt-1 bg-surface border border-border rounded-lg p-3 z-20 shadow-xl w-[calc(100vw-2rem)] sm:w-auto sm:min-w-[300px] max-w-[320px] space-y-3">
              {/* Dosyadan yükle */}
              <div>
                <label className="text-[11px] text-text-secondary font-medium mb-1.5 block">Bilgisayardan Yükle</label>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={(e) => {
                    const file = e.target.files?.[0]
                    if (file) handleFileUpload(file)
                    e.target.value = ''
                  }}
                />
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  disabled={uploading}
                  className="w-full flex items-center justify-center gap-2 px-3 py-2.5 bg-background border border-dashed border-border rounded-lg text-xs text-text-secondary hover:text-text-primary hover:border-primary/50 transition-colors cursor-pointer disabled:opacity-50"
                >
                  {uploading ? (
                    <>
                      <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                      </svg>
                      Yükleniyor...
                    </>
                  ) : (
                    <>
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
                      </svg>
                      Görsel Seç
                    </>
                  )}
                </button>
              </div>

              {/* Ayırıcı */}
              <div className="flex items-center gap-2">
                <div className="flex-1 border-t border-border" />
                <span className="text-[10px] text-text-secondary">veya</span>
                <div className="flex-1 border-t border-border" />
              </div>

              {/* URL ile ekle */}
              <div>
                <label className="text-[11px] text-text-secondary font-medium mb-1.5 block">URL ile Ekle</label>
                <div className="flex gap-2">
                  <input
                    value={imageUrl}
                    onChange={(e) => setImageUrl(e.target.value)}
                    placeholder="https://..."
                    className="flex-1 bg-background border border-border rounded-lg px-3 py-1.5 text-xs text-text-primary placeholder:text-text-secondary/50 focus:border-primary/50 focus:outline-none"
                    onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), addImageFromUrl())}
                  />
                  <button
                    type="button"
                    onClick={addImageFromUrl}
                    className="px-3 py-1.5 bg-gradient-to-r from-[#DC2626] to-[#F97316] text-white text-xs rounded-lg shadow-sm hover:shadow-md transition-all cursor-pointer flex-shrink-0"
                  >
                    Ekle
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Editor */}
      <EditorContent editor={editor} />
    </div>
  )
}

function ToolbarButton({ active, onClick, title, children }: {
  active: boolean
  onClick: () => void
  title: string
  children: React.ReactNode
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      title={title}
      className={`w-8 h-8 flex items-center justify-center rounded-md transition-colors cursor-pointer ${
        active
          ? 'bg-primary/20 text-primary'
          : 'text-text-secondary hover:text-text-primary hover:bg-surface-hover'
      }`}
    >
      {children}
    </button>
  )
}
