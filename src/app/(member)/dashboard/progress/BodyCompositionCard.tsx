'use client'

import type { Gender, Measurement } from '@/lib/types'
import { formatDateShort } from '@/lib/utils'

function getCategory(pct: number, gender: Gender = 'male') {
  if (gender === 'female') {
    if (pct <= 13) return { label: 'Temel Yağ',  color: '#A855F7', bg: 'rgba(168,85,247,0.12)' }
    if (pct <= 20) return { label: 'Sporcu',      color: '#22C55E', bg: 'rgba(34,197,94,0.12)' }
    if (pct <= 24) return { label: 'Fit',          color: '#3B82F6', bg: 'rgba(59,130,246,0.12)' }
    if (pct <= 31) return { label: 'Normal',       color: '#F59E0B', bg: 'rgba(245,158,11,0.12)' }
    return                { label: 'Yüksek',       color: '#EF4444', bg: 'rgba(239,68,68,0.12)' }
  }
  if (pct <= 5)  return { label: 'Temel Yağ',  color: '#A855F7', bg: 'rgba(168,85,247,0.12)' }
  if (pct <= 13) return { label: 'Sporcu',      color: '#22C55E', bg: 'rgba(34,197,94,0.12)' }
  if (pct <= 17) return { label: 'Fit',          color: '#3B82F6', bg: 'rgba(59,130,246,0.12)' }
  if (pct <= 24) return { label: 'Normal',       color: '#F59E0B', bg: 'rgba(245,158,11,0.12)' }
  return                { label: 'Yüksek',       color: '#EF4444', bg: 'rgba(239,68,68,0.12)' }
}

function gaugeOffset(pct: number, max = 50): number {
  const r = 56
  const circumference = 2 * Math.PI * r
  const clamped = Math.min(Math.max(pct, 0), max)
  return circumference * (1 - clamped / max)
}

interface Props {
  measurements: Measurement[]
  gender?: Gender
}

export default function BodyCompositionCard({ measurements, gender = 'male' }: Props) {
  const withFat = [...measurements].reverse().filter((m) => m.body_fat_pct != null)
  if (withFat.length === 0) return null

  const latest = withFat[0]
  const pct    = Number(latest.body_fat_pct)
  const weight = Number(latest.weight ?? 0)
  const fatKg  = weight > 0 ? (pct / 100) * weight : null
  const leanKg = weight > 0 && fatKg != null ? weight - fatKg : null
  const fatPct = weight > 0 && fatKg != null ? (fatKg / weight) * 100 : pct
  const cat    = getCategory(pct, gender)

  const r             = 56
  const circumference = 2 * Math.PI * r
  const offset        = gaugeOffset(pct)

  const prev    = withFat[1]
  const prevPct = prev ? Number(prev.body_fat_pct) : null
  const fatDiff = prevPct != null ? pct - prevPct : null

  return (
    <div className="relative overflow-hidden rounded-2xl border border-border bg-surface p-4 sm:p-7">
      {/* Baslik */}
      <div className="flex items-center justify-between mb-5 sm:mb-7">
        <div>
          <p className="text-[11px] tracking-[3px] text-text-secondary uppercase mb-1">
            Vücut Kompozisyonu
          </p>
          <p className="text-[13px] text-text-secondary">
            {formatDateShort(latest.date)} ölçümü
          </p>
        </div>
        <span style={{
          padding: '6px 14px',
          borderRadius: '999px',
          fontSize: '12px',
          fontWeight: 700,
          letterSpacing: '1px',
          color: cat.color,
          background: cat.bg,
          border: `1px solid ${cat.color}40`,
          textTransform: 'uppercase',
        }}>
          {cat.label}
        </span>
      </div>

      {/* Ana icerik -- gauge + metrikler */}
      <div className="flex flex-col sm:flex-row items-center gap-5 sm:gap-8">

        {/* Gauge */}
        <div className="relative shrink-0 w-[120px] h-[120px] sm:w-[144px] sm:h-[144px]">
          <svg width="100%" height="100%" viewBox="0 0 144 144" style={{ transform: 'rotate(-90deg)' }}>
            <circle cx="72" cy="72" r={r} fill="none" className="stroke-border" strokeWidth="12" />
            <circle
              cx="72" cy="72" r={r}
              fill="none"
              stroke={cat.color}
              strokeWidth="12"
              strokeLinecap="round"
              strokeDasharray={circumference}
              strokeDashoffset={offset}
              style={{ transition: 'stroke-dashoffset 1.2s cubic-bezier(0.34,1.56,0.64,1)' }}
            />
          </svg>
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <span className="text-[26px] sm:text-[32px] font-extrabold leading-none" style={{ color: cat.color }}>
              {pct.toFixed(1)}
            </span>
            <span className="text-[12px] sm:text-[13px] text-text-secondary mt-0.5">Yağ %</span>
            {fatDiff != null && (
              <span className="text-[11px] mt-0.5 font-semibold" style={{
                color: fatDiff < 0 ? '#22C55E' : '#EF4444',
              }}>
                {fatDiff > 0 ? '+' : ''}{fatDiff.toFixed(1)}%
              </span>
            )}
          </div>
        </div>

        {/* Metrikler */}
        <div className="flex-1 w-full flex flex-col gap-3 sm:gap-4">

          {/* Yağ / Yağsız kütle split bar */}
          {fatKg != null && leanKg != null && (
            <div>
              <div className="flex justify-between mb-1.5">
                <span className="text-[11px] sm:text-[12px] text-orange-500 font-semibold">
                  Yağ {fatKg.toFixed(1)} kg
                </span>
                <span className="text-[11px] sm:text-[12px] text-blue-500 font-semibold">
                  Yağsız {leanKg.toFixed(1)} kg
                </span>
              </div>
              <div className="h-2 rounded bg-border overflow-hidden relative">
                <div className="absolute left-0 top-0 bottom-0 rounded transition-[width] duration-1000" style={{
                  width: `${fatPct}%`,
                  background: 'linear-gradient(90deg, #F97316, #EF4444)',
                }} />
                <div className="absolute right-0 top-0 bottom-0 rounded transition-[width] duration-1000" style={{
                  width: `${100 - fatPct}%`,
                  background: 'linear-gradient(90deg, #2563EB, #3B82F6)',
                }} />
              </div>
              <p className="text-[10px] text-text-secondary mt-1">
                * Yağsız Kütle = kas + kemik + su + organlar
              </p>
            </div>
          )}

          {/* Kilo kartlari */}
          {weight > 0 && (
            <div className="flex gap-2 sm:gap-2.5">
              <div className="flex-1 bg-surface-hover rounded-[10px] p-2.5 sm:p-3 border border-border">
                <div className="text-lg sm:text-xl font-bold text-text-primary">{weight}</div>
                <div className="text-[10px] sm:text-[11px] text-text-secondary mt-0.5">Toplam kg</div>
              </div>
              {fatKg != null && (
                <div className="flex-1 bg-surface-hover rounded-[10px] p-2.5 sm:p-3 border border-border">
                  <div className="text-lg sm:text-xl font-bold text-orange-500">{fatKg.toFixed(1)}</div>
                  <div className="text-[10px] sm:text-[11px] text-text-secondary mt-0.5">Yağ kg</div>
                </div>
              )}
              {leanKg != null && (
                <div className="flex-1 bg-surface-hover rounded-[10px] p-2.5 sm:p-3 border border-border">
                  <div className="text-lg sm:text-xl font-bold text-blue-500">{leanKg.toFixed(1)}</div>
                  <div className="text-[10px] sm:text-[11px] text-text-secondary mt-0.5">Yağsız kg</div>
                  <div className="text-[9px] text-text-secondary mt-px">kas+kemik+su</div>
                </div>
              )}
            </div>
          )}

          {/* Skinfold ölçümleri */}
          {(latest.sf_chest || latest.sf_abdomen || latest.sf_thigh) && (
            <div className="bg-surface-hover rounded-[10px] p-3 sm:p-4 border border-border">
              <p className="text-[10px] text-text-secondary tracking-[2px] uppercase mb-2.5">
                Skinfold Kaliper (mm)
              </p>
              <div className="flex gap-3 sm:gap-5 flex-wrap">
                {latest.sf_chest && (
                  <div className="text-center">
                    <div className="text-base sm:text-lg font-bold text-amber-500">{latest.sf_chest}</div>
                    <div className="text-[10px] text-text-secondary mt-px">Göğüs</div>
                  </div>
                )}
                {latest.sf_abdomen && (
                  <div className="text-center">
                    <div className="text-base sm:text-lg font-bold text-amber-500">{latest.sf_abdomen}</div>
                    <div className="text-[10px] text-text-secondary mt-px">Karın</div>
                  </div>
                )}
                {latest.sf_thigh && (
                  <div className="text-center">
                    <div className="text-base sm:text-lg font-bold text-amber-500">{latest.sf_thigh}</div>
                    <div className="text-[10px] text-text-secondary mt-px">Uyluk</div>
                  </div>
                )}
                {latest.sf_chest && latest.sf_abdomen && latest.sf_thigh && (
                  <>
                    <div className="w-px bg-border mx-1 hidden sm:block" />
                    <div className="text-center">
                      <div className="text-base sm:text-lg font-bold text-text-primary">
                        {Number(latest.sf_chest) + Number(latest.sf_abdomen) + Number(latest.sf_thigh)}
                      </div>
                      <div className="text-[10px] text-text-secondary mt-px">Toplam</div>
                    </div>
                  </>
                )}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Geçmiş yağ % tablosu */}
      {withFat.length > 1 && (
        <div className="mt-5 sm:mt-6 border-t border-border pt-4 sm:pt-5">
          <p className="text-[10px] text-text-secondary tracking-[2px] uppercase mb-3">
            Yağ % Geçmişi
          </p>
          <div className="flex flex-wrap gap-2">
            {withFat.slice(0, 8).reverse().map((m, i, arr) => {
              const p    = Number(m.body_fat_pct)
              const prev = arr[i - 1]
              const d    = prev ? p - Number(prev.body_fat_pct) : null
              const c    = getCategory(p, gender)
              return (
                <div key={m.id} className="bg-surface-hover border border-border rounded-[10px] py-2.5 px-3 text-center min-w-[64px] sm:min-w-[72px]">
                  <div className="text-[15px] sm:text-[17px] font-bold" style={{ color: c.color }}>{p.toFixed(1)}%</div>
                  <div className="text-[10px] text-text-secondary mt-0.5">{formatDateShort(m.date)}</div>
                  {d != null && d !== 0 && (
                    <div className="text-[10px] mt-0.5 font-semibold" style={{ color: d < 0 ? '#22C55E' : '#EF4444' }}>
                      {d > 0 ? '+' : ''}{d.toFixed(1)}
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        </div>
      )}
    </div>
  )
}
