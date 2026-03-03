'use client'

import { useState } from 'react'
import Card, { CardHeader, CardTitle } from '@/components/ui/Card'
import Badge from '@/components/ui/Badge'
import type { ProgressPhoto, PhotoAngle } from '@/lib/types'

const ANGLE_LABELS: Record<PhotoAngle, string> = {
  front: 'Ön',
  side: 'Yan',
  back: 'Arka',
}

interface ClientProgressPhotosProps {
  photos: ProgressPhoto[]
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

export default function ClientProgressPhotos({ photos }: ClientProgressPhotosProps) {
  const [lightboxUrl, setLightboxUrl] = useState<string | null>(null)
  const [lightboxAlt, setLightboxAlt] = useState('')
  const [expanded, setExpanded] = useState(false)

  const photosByDate = groupByDate(photos)
  const sortedDates = Object.keys(photosByDate).sort(
    (a, b) => new Date(b).getTime() - new Date(a).getTime()
  )

  const visibleDates = expanded ? sortedDates : sortedDates.slice(0, 2)

  return (
    <>
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between w-full">
            <div className="flex items-center gap-2">
              <CardTitle>İlerleme Fotoğrafları</CardTitle>
              <Badge variant="primary">{sortedDates.length} çekim</Badge>
            </div>
          </div>
        </CardHeader>

        <div className="space-y-6">
          {visibleDates.map((date) => {
            const datePhotos = photosByDate[date]
            return (
              <div key={date} className="space-y-2">
                <div className="flex items-center gap-2">
                  <p className="text-sm font-semibold text-text-primary">{formatDateLabel(date)}</p>
                  <span className="text-xs text-text-tertiary">{datePhotos.length} fotoğraf</span>
                </div>

                {datePhotos[0]?.comment && (
                  <p className="text-xs text-text-secondary italic">{datePhotos[0].comment}</p>
                )}

                <div className="grid grid-cols-3 gap-2">
                  {(['front', 'side', 'back'] as PhotoAngle[]).map((angle) => {
                    const photo = datePhotos.find((p) => p.angle === angle)
                    return (
                      <div key={angle} className="space-y-1">
                        <p className="text-[10px] text-text-tertiary text-center font-medium uppercase tracking-wide">
                          {ANGLE_LABELS[angle]}
                        </p>
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
                            <span className="text-[10px] text-text-tertiary">—</span>
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

        {sortedDates.length > 2 && (
          <button
            onClick={() => setExpanded(!expanded)}
            className="mt-4 w-full text-sm text-primary hover:underline text-center transition-colors"
          >
            {expanded
              ? 'Daha az göster'
              : `${sortedDates.length - 2} çekim daha göster`}
          </button>
        )}
      </Card>

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
    </>
  )
}
