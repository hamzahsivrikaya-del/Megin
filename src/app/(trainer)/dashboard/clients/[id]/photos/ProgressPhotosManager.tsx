'use client'

import { useState, useRef, useCallback } from 'react'
import { createClient } from '@/lib/supabase/client'
import Card, { CardHeader, CardTitle } from '@/components/ui/Card'
import Button from '@/components/ui/Button'
import Badge from '@/components/ui/Badge'
import type { ProgressPhoto, PhotoAngle } from '@/lib/types'

const MAX_FILE_SIZE = 15 * 1024 * 1024 // 15MB

const ANGLE_LABELS: Record<PhotoAngle, string> = {
  front: 'Ön',
  side: 'Yan',
  back: 'Arka',
}

interface ProgressPhotosManagerProps {
  clientId: string
  clientName: string
  initialPhotos: ProgressPhoto[]
}

type PhotosByDate = Record<string, ProgressPhoto[]>

function groupByDate(photos: ProgressPhoto[]): PhotosByDate {
  return photos.reduce((acc, photo) => {
    const date = photo.taken_at
    if (!acc[date]) acc[date] = []
    acc[date].push(photo)
    return acc
  }, {} as PhotosByDate)
}

function formatDateLabel(dateStr: string): string {
  const date = new Date(dateStr + 'T00:00:00')
  return date.toLocaleDateString('tr-TR', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  })
}

export default function ProgressPhotosManager({
  clientId,
  initialPhotos,
}: ProgressPhotosManagerProps) {
  const [photos, setPhotos] = useState<ProgressPhoto[]>(initialPhotos)
  const [takenAt, setTakenAt] = useState(() => new Date().toISOString().split('T')[0])
  const [comment, setComment] = useState('')
  const [fileErrors, setFileErrors] = useState<Partial<Record<PhotoAngle, string>>>({})
  const [files, setFiles] = useState<Partial<Record<PhotoAngle, File>>>({})
  const [uploading, setUploading] = useState(false)
  const [uploadError, setUploadError] = useState('')
  const [deletingDate, setDeletingDate] = useState<string | null>(null)

  // Karşılaştırma modu
  const [compareMode, setCompareMode] = useState(false)
  const [selectedDates, setSelectedDates] = useState<string[]>([])

  // Lightbox
  const [lightboxUrl, setLightboxUrl] = useState<string | null>(null)
  const [lightboxAlt, setLightboxAlt] = useState('')

  const frontRef = useRef<HTMLInputElement>(null)
  const sideRef = useRef<HTMLInputElement>(null)
  const backRef = useRef<HTMLInputElement>(null)

  const angleRefs: Record<PhotoAngle, React.RefObject<HTMLInputElement | null>> = {
    front: frontRef,
    side: sideRef,
    back: backRef,
  }

  const handleFileChange = useCallback((angle: PhotoAngle, file: File | undefined) => {
    if (!file) {
      setFiles((prev) => { const next = { ...prev }; delete next[angle]; return next })
      setFileErrors((prev) => { const next = { ...prev }; delete next[angle]; return next })
      return
    }
    if (file.size > MAX_FILE_SIZE) {
      setFileErrors((prev) => ({ ...prev, [angle]: `Dosya 15MB'dan büyük olamaz` }))
      setFiles((prev) => { const next = { ...prev }; delete next[angle]; return next })
      return
    }
    setFileErrors((prev) => { const next = { ...prev }; delete next[angle]; return next })
    setFiles((prev) => ({ ...prev, [angle]: file }))
  }, [])

  const handleUpload = async () => {
    const angles = Object.keys(files) as PhotoAngle[]
    if (angles.length === 0) {
      setUploadError('En az bir fotoğraf seçin')
      return
    }
    if (!takenAt) {
      setUploadError('Tarih seçin')
      return
    }
    setUploadError('')
    setUploading(true)

    try {
      const supabase = createClient()
      const uploadedPhotos: ProgressPhoto[] = []

      for (const angle of angles) {
        const file = files[angle]!
        const ext = file.name.split('.').pop() || 'jpg'
        const path = `${clientId}/${takenAt}_${angle}.${ext}`

        const { error: storageError } = await supabase.storage
          .from('progress-photos')
          .upload(path, file, { upsert: true })

        if (storageError) throw new Error(`Yükleme hatası (${ANGLE_LABELS[angle]}): ${storageError.message}`)

        const { data: urlData } = supabase.storage
          .from('progress-photos')
          .getPublicUrl(path)

        const res = await fetch('/api/progress-photos', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            client_id: clientId,
            photo_url: urlData.publicUrl,
            angle,
            taken_at: takenAt,
            comment: comment || null,
          }),
        })

        if (!res.ok) {
          const err = await res.json()
          throw new Error(err.error || 'Kayıt hatası')
        }

        const { photo } = await res.json()
        uploadedPhotos.push(photo)
      }

      setPhotos((prev) => {
        // Aynı tarih+açı varsa güncelle, yoksa ekle
        const existing = prev.filter(
          (p) => !(uploadedPhotos.some((up) => up.taken_at === p.taken_at && up.angle === p.angle))
        )
        return [...uploadedPhotos, ...existing].sort(
          (a, b) => new Date(b.taken_at).getTime() - new Date(a.taken_at).getTime()
        )
      })

      // Sıfırla
      setFiles({})
      setComment('')
      ;(['front', 'side', 'back'] as PhotoAngle[]).forEach((a) => {
        if (angleRefs[a].current) angleRefs[a].current!.value = ''
      })
    } catch (err: unknown) {
      setUploadError(err instanceof Error ? err.message : 'Yükleme başarısız')
    } finally {
      setUploading(false)
    }
  }

  const handleDeleteDate = async (date: string) => {
    const datePhotos = photos.filter((p) => p.taken_at === date)
    if (datePhotos.length === 0) return
    if (!confirm(`${formatDateLabel(date)} tarihli ${datePhotos.length} fotoğraf silinsin mi?`)) return

    setDeletingDate(date)
    try {
      await Promise.all(
        datePhotos.map((photo) =>
          fetch('/api/progress-photos', {
            method: 'DELETE',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ id: photo.id }),
          })
        )
      )
      setPhotos((prev) => prev.filter((p) => p.taken_at !== date))
      setSelectedDates((prev) => prev.filter((d) => d !== date))
    } catch {
      alert('Silme işlemi başarısız')
    } finally {
      setDeletingDate(null)
    }
  }

  const toggleCompareDate = (date: string) => {
    setSelectedDates((prev) => {
      if (prev.includes(date)) return prev.filter((d) => d !== date)
      if (prev.length >= 2) return [prev[1], date]
      return [...prev, date]
    })
  }

  const photosByDate = groupByDate(photos)
  const sortedDates = Object.keys(photosByDate).sort((a, b) => new Date(b).getTime() - new Date(a).getTime())

  const compareAngles: PhotoAngle[] = ['front', 'side', 'back']

  return (
    <div className="space-y-6">
      {/* Yükleme Bölümü */}
      <Card>
        <CardHeader>
          <CardTitle>Yeni Fotoğraf Yükle</CardTitle>
        </CardHeader>

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-text-primary mb-1.5">Çekim Tarihi</label>
            <input
              type="date"
              value={takenAt}
              onChange={(e) => setTakenAt(e.target.value)}
              className="w-full rounded-xl border border-border bg-surface px-4 py-2.5 text-sm text-text-primary focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-colors"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {(['front', 'side', 'back'] as PhotoAngle[]).map((angle) => (
              <div key={angle} className="space-y-1.5">
                <label className="block text-sm font-medium text-text-primary">
                  {ANGLE_LABELS[angle]} Fotoğraf
                  {files[angle] && (
                    <Badge variant="success" className="ml-2">Seçildi</Badge>
                  )}
                </label>
                <label className="flex flex-col items-center justify-center border-2 border-dashed border-border rounded-xl p-4 cursor-pointer hover:border-primary hover:bg-primary/5 transition-all">
                  {files[angle] ? (
                    <div className="text-center">
                      <svg className="w-6 h-6 text-success mx-auto mb-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                      <p className="text-xs text-text-secondary truncate max-w-[140px]">{files[angle]!.name}</p>
                    </div>
                  ) : (
                    <div className="text-center">
                      <svg className="w-6 h-6 text-text-tertiary mx-auto mb-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                      </svg>
                      <p className="text-xs text-text-tertiary">Fotoğraf seç</p>
                    </div>
                  )}
                  <input
                    ref={angleRefs[angle] as React.RefObject<HTMLInputElement>}
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={(e) => handleFileChange(angle, e.target.files?.[0])}
                  />
                </label>
                {fileErrors[angle] && (
                  <p className="text-xs text-danger">{fileErrors[angle]}</p>
                )}
              </div>
            ))}
          </div>

          <div>
            <label className="block text-sm font-medium text-text-primary mb-1.5">
              Not <span className="text-text-tertiary font-normal">(isteğe bağlı)</span>
            </label>
            <input
              type="text"
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              placeholder="Bu çekim hakkında not..."
              className="w-full rounded-xl border border-border bg-surface px-4 py-2.5 text-sm text-text-primary placeholder:text-text-tertiary focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-colors"
            />
          </div>

          {uploadError && (
            <p className="text-sm text-danger">{uploadError}</p>
          )}

          <Button
            onClick={handleUpload}
            loading={uploading}
            disabled={uploading || Object.keys(files).length === 0}
            fullWidth
          >
            {uploading ? 'Yükleniyor...' : 'Fotoğrafları Yükle'}
          </Button>
        </div>
      </Card>

      {/* Galeri */}
      {sortedDates.length > 0 && (
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between w-full">
              <CardTitle>Fotoğraf Galerisi</CardTitle>
              <Button
                variant={compareMode ? 'primary' : 'outline'}
                size="sm"
                onClick={() => {
                  setCompareMode(!compareMode)
                  setSelectedDates([])
                }}
              >
                {compareMode ? 'Karşılaştırmayı Kapat' : 'Karşılaştır'}
              </Button>
            </div>
          </CardHeader>

          {compareMode && (
            <div className="mb-4 p-3 rounded-xl bg-primary/5 border border-primary/20">
              <p className="text-sm text-primary font-medium">
                {selectedDates.length === 0 && 'Karşılaştırmak için 2 tarih seçin'}
                {selectedDates.length === 1 && '1 tarih seçildi. Bir tarih daha seçin.'}
                {selectedDates.length === 2 && 'Karşılaştırma hazır. Aşağıda sonuçları görebilirsiniz.'}
              </p>
            </div>
          )}

          <div className="space-y-8">
            {sortedDates.map((date) => {
              const datePhotos = photosByDate[date]
              const isSelected = selectedDates.includes(date)

              return (
                <div key={date} className={`space-y-3 ${compareMode && isSelected ? 'ring-2 ring-primary rounded-xl p-3' : ''}`}>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      {compareMode && (
                        <button
                          onClick={() => toggleCompareDate(date)}
                          className={`w-5 h-5 rounded border-2 flex items-center justify-center flex-shrink-0 transition-colors ${
                            isSelected
                              ? 'bg-primary border-primary'
                              : 'border-border hover:border-primary'
                          }`}
                        >
                          {isSelected && (
                            <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                            </svg>
                          )}
                        </button>
                      )}
                      <h3 className="font-semibold text-text-primary">{formatDateLabel(date)}</h3>
                      <Badge variant="default">{datePhotos.length} fotoğraf</Badge>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleDeleteDate(date)}
                      disabled={deletingDate === date}
                      className="text-danger hover:text-danger hover:bg-danger/10"
                    >
                      {deletingDate === date ? 'Siliniyor...' : 'Sil'}
                    </Button>
                  </div>

                  {datePhotos[0]?.comment && (
                    <p className="text-sm text-text-secondary italic">{datePhotos[0].comment}</p>
                  )}

                  <div className="grid grid-cols-3 gap-2">
                    {(['front', 'side', 'back'] as PhotoAngle[]).map((angle) => {
                      const photo = datePhotos.find((p) => p.angle === angle)
                      return (
                        <div key={angle} className="space-y-1">
                          <p className="text-xs text-text-tertiary text-center font-medium">{ANGLE_LABELS[angle]}</p>
                          {photo ? (
                            <button
                              className="w-full aspect-[3/4] rounded-xl overflow-hidden bg-background hover:opacity-90 transition-opacity focus:outline-none focus:ring-2 focus:ring-primary"
                              onClick={() => {
                                setLightboxUrl(photo.photo_url)
                                setLightboxAlt(`${formatDateLabel(date)} - ${ANGLE_LABELS[angle]}`)
                              }}
                            >
                              {/* eslint-disable-next-line @next/next/no-img-element */}
                              <img
                                src={photo.photo_url}
                                alt={`${ANGLE_LABELS[angle]} - ${date}`}
                                className="w-full h-full object-cover"
                                loading="lazy"
                              />
                            </button>
                          ) : (
                            <div className="w-full aspect-[3/4] rounded-xl bg-background border border-dashed border-border flex items-center justify-center">
                              <span className="text-xs text-text-tertiary">Yok</span>
                            </div>
                          )}
                        </div>
                      )
                    })}
                  </div>
                </div>
              )
            })}
          </div>
        </Card>
      )}

      {/* Karşılaştırma görünümü */}
      {compareMode && selectedDates.length === 2 && (
        <Card>
          <CardHeader>
            <CardTitle>Karşılaştırma</CardTitle>
          </CardHeader>
          <div className="space-y-6">
            {compareAngles.map((angle) => {
              const before = photosByDate[selectedDates[0]]?.find((p) => p.angle === angle)
              const after = photosByDate[selectedDates[1]]?.find((p) => p.angle === angle)

              if (!before && !after) return null

              return (
                <div key={angle}>
                  <p className="text-sm font-semibold text-text-secondary mb-2 uppercase tracking-wider">
                    {ANGLE_LABELS[angle]}
                  </p>
                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-1">
                      <p className="text-xs text-center text-text-tertiary">{formatDateLabel(selectedDates[0])}</p>
                      {before ? (
                        <button
                          className="w-full aspect-[3/4] rounded-xl overflow-hidden hover:opacity-90 transition-opacity"
                          onClick={() => {
                            setLightboxUrl(before.photo_url)
                            setLightboxAlt(`Önce - ${ANGLE_LABELS[angle]}`)
                          }}
                        >
                          {/* eslint-disable-next-line @next/next/no-img-element */}
                          <img
                            src={before.photo_url}
                            alt={`Önce - ${ANGLE_LABELS[angle]}`}
                            className="w-full h-full object-cover"
                          />
                        </button>
                      ) : (
                        <div className="w-full aspect-[3/4] rounded-xl bg-background border border-dashed border-border flex items-center justify-center">
                          <span className="text-xs text-text-tertiary">Fotoğraf yok</span>
                        </div>
                      )}
                    </div>
                    <div className="space-y-1">
                      <p className="text-xs text-center text-text-tertiary">{formatDateLabel(selectedDates[1])}</p>
                      {after ? (
                        <button
                          className="w-full aspect-[3/4] rounded-xl overflow-hidden hover:opacity-90 transition-opacity"
                          onClick={() => {
                            setLightboxUrl(after.photo_url)
                            setLightboxAlt(`Sonra - ${ANGLE_LABELS[angle]}`)
                          }}
                        >
                          {/* eslint-disable-next-line @next/next/no-img-element */}
                          <img
                            src={after.photo_url}
                            alt={`Sonra - ${ANGLE_LABELS[angle]}`}
                            className="w-full h-full object-cover"
                          />
                        </button>
                      ) : (
                        <div className="w-full aspect-[3/4] rounded-xl bg-background border border-dashed border-border flex items-center justify-center">
                          <span className="text-xs text-text-tertiary">Fotoğraf yok</span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        </Card>
      )}

      {photos.length === 0 && (
        <Card className="text-center py-12">
          <svg className="w-12 h-12 text-text-tertiary mx-auto mb-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
          </svg>
          <p className="text-text-secondary font-medium">Henüz fotoğraf yüklenmedi</p>
          <p className="text-sm text-text-tertiary mt-1">Yukarıdan ilk fotoğrafları ekleyin</p>
        </Card>
      )}

      {/* Lightbox */}
      {lightboxUrl && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 p-4"
          onClick={() => setLightboxUrl(null)}
        >
          <button
            className="absolute top-4 right-4 text-white/70 hover:text-white transition-colors"
            onClick={() => setLightboxUrl(null)}
          >
            <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
          {lightboxAlt && (
            <p className="absolute top-4 left-1/2 -translate-x-1/2 text-white/70 text-sm">{lightboxAlt}</p>
          )}
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={lightboxUrl}
            alt={lightboxAlt}
            className="max-h-[90vh] max-w-[90vw] object-contain rounded-xl"
            onClick={(e) => e.stopPropagation()}
          />
        </div>
      )}
    </div>
  )
}
