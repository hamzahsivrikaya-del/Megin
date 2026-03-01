'use client'

import { useState } from 'react'
import Image from 'next/image'
import type { ProgressPhoto, Measurement } from '@/lib/types'

const METRIC_LABELS: { key: keyof Measurement; label: string; unit: string }[] = [
  { key: 'weight', label: 'Kilo', unit: 'kg' },
  { key: 'body_fat_pct', label: 'Yağ %', unit: '%' },
  { key: 'chest', label: 'Göğüs', unit: 'cm' },
  { key: 'waist', label: 'Bel', unit: 'cm' },
  { key: 'arm', label: 'Kol', unit: 'cm' },
  { key: 'leg', label: 'Bacak', unit: 'cm' },
]

function findClosestMeasurement(measurements: Measurement[], date: string): Measurement | null {
  const target = new Date(date).getTime()
  let closest: Measurement | null = null
  let minDiff = 3 * 24 * 60 * 60 * 1000

  for (const m of measurements) {
    const diff = Math.abs(new Date(m.date).getTime() - target)
    if (diff < minDiff) {
      minDiff = diff
      closest = m
    }
  }
  return closest
}

interface Props {
  photos: ProgressPhoto[]
  measurements: Measurement[]
}

export default function ProgressPhotos({ photos, measurements }: Props) {
  const dateGroups = photos.reduce<Record<string, ProgressPhoto[]>>((acc, p) => {
    if (!acc[p.taken_at]) acc[p.taken_at] = []
    acc[p.taken_at].push(p)
    return acc
  }, {})

  const sortedDates = Object.keys(dateGroups).sort((a, b) => b.localeCompare(a))
  const [selectedDate, setSelectedDate] = useState<string | null>(null)
  const [compareMode, setCompareMode] = useState(false)
  const [compareDates, setCompareDates] = useState<string[]>([])
  const [lightboxPhoto, setLightboxPhoto] = useState<string | null>(null)

  if (sortedDates.length === 0) return null

  function toggleCompareDate(date: string) {
    setCompareDates((prev) => {
      if (prev.includes(date)) return prev.filter((d) => d !== date)
      if (prev.length >= 2) return [prev[1], date]
      return [...prev, date]
    })
    setSelectedDate(null)
  }

  function handleDateClick(date: string) {
    if (compareMode) {
      toggleCompareDate(date)
    } else {
      setSelectedDate(selectedDate === date ? null : date)
    }
  }

  const comparing = compareMode && compareDates.length === 2
  const [beforeDate, afterDate] = comparing
    ? [...compareDates].sort((a, b) => a.localeCompare(b))
    : [null, null]

  const beforeMeasurement = beforeDate ? findClosestMeasurement(measurements, beforeDate) : null
  const afterMeasurement = afterDate ? findClosestMeasurement(measurements, afterDate) : null

  function formatDateShort(dateStr: string) {
    const d = new Date(dateStr)
    return d.toLocaleDateString('tr-TR', { day: 'numeric', month: 'short' })
  }

  function formatDateLong(dateStr: string) {
    const d = new Date(dateStr)
    return d.toLocaleDateString('tr-TR', { day: 'numeric', month: 'long', year: 'numeric' })
  }

  return (
    <>
      <div className="rounded-2xl border border-border bg-surface overflow-hidden">
        <div className="px-4 pt-4 pb-2 flex items-center justify-between">
          <div>
            <h2 className="text-sm font-bold text-text-primary">İlerleme Fotoğrafları</h2>
            <p className="text-[11px] text-text-secondary mt-0.5">
              {compareMode
                ? compareDates.length < 2 ? `${compareDates.length}/2 tarih seçildi` : 'Karşılaştırma görüntüleniyor'
                : 'Tarih seçerek fotoğrafları görüntüleyin'}
            </p>
          </div>
          {sortedDates.length > 1 && (
            <button
              onClick={() => { setCompareMode(!compareMode); setCompareDates([]); setSelectedDate(null) }}
              className={`text-xs px-3 py-1.5 rounded-lg font-medium transition-all cursor-pointer ${
                compareMode ? 'bg-primary text-white' : 'bg-primary/10 text-primary hover:bg-primary/20'
              }`}
            >
              {compareMode ? 'Çık' : 'Karşılaştır'}
            </button>
          )}
        </div>

        {/* Tarih grid */}
        <div className="px-4 pb-3">
          <div className="flex flex-wrap gap-2">
            {sortedDates.map((date) => {
              const d = new Date(date)
              const isSelected = compareMode ? compareDates.includes(date) : selectedDate === date

              return (
                <button
                  key={date}
                  onClick={() => handleDateClick(date)}
                  className={`flex flex-col items-center gap-0.5 py-1.5 px-2.5 rounded-xl text-xs transition-all cursor-pointer ${
                    isSelected ? 'ring-2 ring-primary ring-offset-1 bg-primary/5' : 'hover:bg-surface-hover'
                  }`}
                >
                  <span className={`w-9 h-9 flex items-center justify-center rounded-full text-sm font-semibold ${
                    isSelected ? 'bg-primary text-white' : 'bg-primary/10 text-primary'
                  }`}>
                    {d.getDate()}
                  </span>
                  <span className="text-[10px] text-text-secondary">
                    {d.toLocaleDateString('tr-TR', { month: 'short' })}
                  </span>
                </button>
              )
            })}
          </div>
        </div>

        {/* Tek tarih görünümü */}
        {!compareMode && selectedDate && dateGroups[selectedDate] && (
          <div className="px-4 pb-4 border-t border-border pt-3 animate-fade-in">
            <p className="text-xs font-medium text-text-secondary mb-2">{formatDateLong(selectedDate)}</p>
            <div className="grid grid-cols-3 gap-1.5">
              {dateGroups[selectedDate].map((photo) => (
                <button key={photo.id} onClick={() => setLightboxPhoto(photo.photo_url)} className="relative aspect-[3/4] rounded-lg overflow-hidden cursor-pointer">
                  <Image src={photo.photo_url} alt="" fill className="object-cover" sizes="(max-width: 768px) 33vw, 150px" />
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Karşılaştırma */}
        {comparing && beforeDate && afterDate && (
          <div className="border-t border-border animate-fade-in">
            <div className="px-4 py-2 flex items-center justify-between">
              <span className="text-xs font-semibold text-text-secondary">{formatDateShort(beforeDate)}</span>
              <span className="text-[10px] text-primary font-bold uppercase tracking-wider">Karşılaştırma</span>
              <span className="text-xs font-semibold text-text-secondary">{formatDateShort(afterDate)}</span>
            </div>

            {(['front', 'side', 'back'] as const).map((angle) => {
              const beforePhoto = dateGroups[beforeDate]?.find((p) => p.angle === angle)
              const afterPhoto = dateGroups[afterDate]?.find((p) => p.angle === angle)
              if (!beforePhoto && !afterPhoto) return null

              return (
                <div key={angle} className="grid grid-cols-2 gap-[1px] bg-border">
                  <button onClick={() => beforePhoto && setLightboxPhoto(beforePhoto.photo_url)} className="bg-surface relative aspect-[3/4] cursor-pointer">
                    {beforePhoto ? <Image src={beforePhoto.photo_url} alt="" fill className="object-cover" sizes="50vw" /> : <div className="flex items-center justify-center h-full bg-surface-hover text-text-secondary text-xs">-</div>}
                  </button>
                  <button onClick={() => afterPhoto && setLightboxPhoto(afterPhoto.photo_url)} className="bg-surface relative aspect-[3/4] cursor-pointer">
                    {afterPhoto ? <Image src={afterPhoto.photo_url} alt="" fill className="object-cover" sizes="50vw" /> : <div className="flex items-center justify-center h-full bg-surface-hover text-text-secondary text-xs">-</div>}
                  </button>
                </div>
              )
            })}

            {/* Ölçüm farkları */}
            {(beforeMeasurement || afterMeasurement) && (
              <div className="px-4 py-3">
                <p className="text-[10px] text-text-secondary uppercase tracking-widest mb-2 font-semibold">Ölçüm Değişimi</p>
                <div className="grid grid-cols-3 gap-1.5">
                  {METRIC_LABELS.map(({ key, label, unit }) => {
                    const before = beforeMeasurement?.[key] as number | null
                    const after = afterMeasurement?.[key] as number | null
                    if (before == null && after == null) return null

                    const diff = before != null && after != null ? after - before : null
                    const isPositiveGood = key === 'chest' || key === 'arm' || key === 'leg'
                    const isGood = diff != null ? (isPositiveGood ? diff > 0 : diff < 0) : null

                    return (
                      <div key={key} className="bg-surface-hover rounded-lg p-2 text-center">
                        <p className="text-[10px] text-text-secondary">{label}</p>
                        {before != null && after != null ? (
                          <>
                            <p className="text-xs font-bold text-text-primary mt-0.5">
                              {before} → {after}
                            </p>
                            {diff !== null && diff !== 0 && (
                              <p className={`text-[10px] font-semibold ${isGood ? 'text-green-600' : 'text-red-500'}`}>
                                {diff > 0 ? '+' : ''}{Number(diff.toFixed(1))} {unit}
                              </p>
                            )}
                          </>
                        ) : (
                          <p className="text-xs font-bold text-text-primary mt-0.5">
                            {(before ?? after)} {unit}
                          </p>
                        )}
                      </div>
                    )
                  })}
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Lightbox */}
      {lightboxPhoto && (
        <div className="fixed inset-0 z-[60] bg-black/90 flex items-center justify-center" onClick={() => setLightboxPhoto(null)}>
          <button onClick={() => setLightboxPhoto(null)} className="absolute top-4 right-4 text-white/80 hover:text-white z-10 cursor-pointer">
            <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
          </button>
          <div className="relative w-full h-full max-w-lg max-h-[85vh] mx-4">
            <Image src={lightboxPhoto} alt="" fill className="object-contain" sizes="100vw" />
          </div>
        </div>
      )}
    </>
  )
}
