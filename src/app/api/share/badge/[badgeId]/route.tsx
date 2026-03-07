import { ImageResponse } from 'next/og'
import { createAdminClient } from '@/lib/supabase/admin'
import { BADGE_DEFINITIONS } from '@/lib/badges'

/* ─── Font cache (modül seviyesinde, cold start'ta bir kez yüklenir) ── */
const fontCache = new Map<string, ArrayBuffer>()

async function loadGoogleFont(name: string, weight: number): Promise<ArrayBuffer> {
  const key = `${name}:${weight}`
  const cached = fontCache.get(key)
  if (cached) return cached

  const url = `https://fonts.googleapis.com/css?family=${encodeURIComponent(name)}:${weight}&subset=latin,latin-ext`
  const css = await fetch(url, {
    headers: {
      'User-Agent':
        'Mozilla/5.0 (Macintosh; U; Intel Mac OS X 10.5; en-US; rv:1.9) Gecko/2008061004 Firefox/3.0',
    },
  }).then((r) => r.text())
  const extMatch = css.match(/latin ext[\s\S]*?src: url\(([^)]+\.ttf[^)]*)\)/)
  const anyMatch = css.match(/src: url\(([^)]+\.ttf[^)]*)\)/) ?? css.match(/src: url\(([^)]+)\)/)
  const match = extMatch ?? anyMatch
  if (!match) throw new Error(`Font bulunamadi: ${name} ${weight}`)
  const buf = await fetch(match[1]).then((r) => r.arrayBuffer())
  fontCache.set(key, buf)
  return buf
}

/* ─── Dinamik font boyutu ────────────────────────────── */
function getFireTextStyle(name: string): { fontSize: number; letterSpacing: string } {
  const len = name.length
  if (len <= 6) return { fontSize: 210, letterSpacing: '12px' }
  if (len <= 9) return { fontSize: 160, letterSpacing: '10px' }
  if (len <= 12) return { fontSize: 120, letterSpacing: '8px' }
  return { fontSize: 90, letterSpacing: '5px' }
}

/* ─── Spor ekipman dekorasyonları ────────────────────── */
function EquipmentDecorations() {
  return (
    <>
      {/* Dumbbell — sag ust */}
      <div style={{
        position: 'absolute', top: '140px', right: '-30px',
        opacity: 0.06, display: 'flex', transform: 'rotate(15deg)',
      }}>
        <svg width="200" height="200" viewBox="0 0 64 64" fill="none">
          <rect x="8" y="14" width="12" height="36" fill="rgba(255,87,34,0.8)" />
          <rect x="44" y="14" width="12" height="36" fill="rgba(255,87,34,0.8)" />
          <rect x="1" y="19" width="9" height="26" fill="rgba(255,87,34,0.6)" />
          <rect x="54" y="19" width="9" height="26" fill="rgba(255,87,34,0.6)" />
          <rect x="20" y="27" width="24" height="10" fill="rgba(255,87,34,0.7)" />
        </svg>
      </div>

      {/* Kettlebell — sol alt */}
      <div style={{
        position: 'absolute', bottom: '380px', left: '30px',
        opacity: 0.05, display: 'flex', transform: 'rotate(-10deg)',
      }}>
        <svg width="160" height="200" viewBox="0 0 48 62" fill="none">
          <path d="M14 8 L14 2 L34 2 L34 8" stroke="rgba(232,67,10,0.8)" strokeWidth="4" fill="none" />
          <rect x="11" y="8" width="26" height="8" fill="rgba(232,67,10,0.3)" />
          <rect x="5" y="16" width="38" height="42" rx="2" fill="rgba(232,67,10,0.2)" stroke="rgba(232,67,10,0.7)" strokeWidth="2.5" />
        </svg>
      </div>

      {/* Plaka — sag orta */}
      <div style={{
        position: 'absolute', top: '850px', right: '40px',
        opacity: 0.04, display: 'flex',
      }}>
        <svg width="160" height="160" viewBox="0 0 56 56" fill="none">
          <rect x="2" y="2" width="52" height="52" stroke="rgba(200,155,60,0.7)" strokeWidth="3" fill="rgba(200,155,60,0.06)" />
          <rect x="12" y="12" width="32" height="32" stroke="rgba(200,155,60,0.4)" strokeWidth="1.5" fill="none" />
          <circle cx="28" cy="28" r="5" fill="rgba(200,155,60,0.15)" stroke="rgba(200,155,60,0.6)" strokeWidth="2" />
        </svg>
      </div>

      {/* Barbell — sag alt */}
      <div style={{
        position: 'absolute', bottom: '650px', right: '-40px',
        opacity: 0.04, display: 'flex', transform: 'rotate(25deg)',
      }}>
        <svg width="250" height="130" viewBox="0 0 88 40" fill="none">
          <rect x="0" y="2" width="18" height="36" fill="rgba(212,148,10,0.6)" />
          <rect x="18" y="7" width="8" height="26" fill="rgba(212,148,10,0.4)" />
          <rect x="26" y="15" width="36" height="10" fill="rgba(212,148,10,0.5)" />
          <rect x="62" y="7" width="8" height="26" fill="rgba(212,148,10,0.4)" />
          <rect x="70" y="2" width="18" height="36" fill="rgba(212,148,10,0.6)" />
        </svg>
      </div>

      {/* Dumbbell 2 — sol ust */}
      <div style={{
        position: 'absolute', top: '500px', left: '-20px',
        opacity: 0.035, display: 'flex', transform: 'rotate(-20deg)',
      }}>
        <svg width="170" height="170" viewBox="0 0 64 64" fill="none">
          <rect x="8" y="14" width="12" height="36" fill="rgba(232,67,10,0.7)" />
          <rect x="44" y="14" width="12" height="36" fill="rgba(232,67,10,0.7)" />
          <rect x="1" y="19" width="9" height="26" fill="rgba(232,67,10,0.5)" />
          <rect x="54" y="19" width="9" height="26" fill="rgba(232,67,10,0.5)" />
          <rect x="20" y="27" width="24" height="10" fill="rgba(232,67,10,0.6)" />
        </svg>
      </div>
    </>
  )
}

/* ─── Route Handler ─────────────────────────────────── */
export async function GET(
  request: Request,
  { params }: { params: Promise<{ badgeId: string }> }
) {
  const { badgeId } = await params
  const { searchParams } = new URL(request.url)
  const userId = searchParams.get('u')

  const admin = createAdminClient()

  const badgeDef = BADGE_DEFINITIONS.find(b => b.id === badgeId)
  if (!badgeDef) {
    return new Response('Rozet tanimi bulunamadi', { status: 404 })
  }

  let query = admin
    .from('member_badges')
    .select('*, users(full_name)')
    .eq('badge_id', badgeId)

  if (userId) {
    query = query.eq('user_id', userId)
  }

  const { data: earnedBadge } = await query
    .order('earned_at', { ascending: false })
    .limit(1)
    .single()

  if (!earnedBadge) {
    return new Response('Rozet bulunamadi', { status: 404 })
  }

  const userName = (earnedBadge.users as unknown as { full_name: string })?.full_name || 'Uye'
  const firstName = userName.split(' ')[0].toLocaleUpperCase('tr-TR')
  const earnedAt = new Date(earnedBadge.earned_at)
  const dateStr = `${String(earnedAt.getDate()).padStart(2, '0')} / ${String(earnedAt.getMonth() + 1).padStart(2, '0')} / ${earnedAt.getFullYear()}`

  const badgeName = badgeDef.name.toLocaleUpperCase('tr-TR')
  const fireStyle = getFireTextStyle(badgeName)
  const isSpecial = badgeDef.trigger === 'admin'

  const [tekoFont, spaceMonoFont] = await Promise.all([
    loadGoogleFont('Teko', 700),
    loadGoogleFont('Space Mono', 400),
  ])

  return new ImageResponse(
    (
      <div
        style={{
          width: '1080px',
          height: '1920px',
          display: 'flex',
          flexDirection: 'column',
          position: 'relative',
          overflow: 'hidden',
          fontFamily: '"Space Mono"',
        }}
      >
        {/* Arka plan gradient — vibrant kirmizi */}
        <div style={{
          position: 'absolute', top: 0, left: 0, right: 0, bottom: 0,
          background: 'linear-gradient(175deg, #1A0A04 0%, #2D0E06 20%, #3A1208 35%, #2E1008 55%, #220C04 75%, #180804 100%)',
          display: 'flex',
        }} />

        {/* Ust sol glow */}
        <div style={{
          position: 'absolute', top: '-150px', left: '-150px',
          width: '800px', height: '800px', borderRadius: '50%',
          backgroundColor: 'rgba(232,67,10,0.07)',
          display: 'flex',
        }} />

        {/* Alt sag glow */}
        <div style={{
          position: 'absolute', bottom: '-100px', right: '-120px',
          width: '600px', height: '900px', borderRadius: '50%',
          backgroundColor: 'rgba(232,67,10,0.04)',
          display: 'flex',
        }} />

        {/* Orta glow */}
        <div style={{
          position: 'absolute', top: '500px', left: '300px',
          width: '480px', height: '600px', borderRadius: '50%',
          backgroundColor: 'rgba(232,67,10,0.04)',
          display: 'flex',
        }} />

        {/* Edge cizgiler */}
        <div style={{
          position: 'absolute', top: 0, left: 0,
          width: '250px', height: '5px',
          background: 'linear-gradient(90deg, #FF5722, transparent)',
          opacity: 0.7, display: 'flex',
        }} />
        <div style={{
          position: 'absolute', top: 0, right: 0,
          width: '5px', height: '250px',
          background: 'linear-gradient(180deg, #FF7043, transparent)',
          opacity: 0.6, display: 'flex',
        }} />
        <div style={{
          position: 'absolute', bottom: 0, right: 0,
          width: '250px', height: '5px',
          background: 'linear-gradient(270deg, #FF5722, transparent)',
          opacity: 0.7, display: 'flex',
        }} />

        {/* Ekipman dekorasyonlari */}
        <EquipmentDecorations />

        {/* Icerik */}
        <div style={{
          position: 'relative', display: 'flex', flexDirection: 'column',
          width: '100%', height: '100%', padding: '60px',
        }}>
          {/* Ust satir — tarih + etiket */}
          <div style={{
            display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start',
          }}>
            <span style={{
              fontFamily: '"Space Mono"', fontSize: '28px',
              color: 'rgba(242,232,213,0.3)', letterSpacing: '2px',
              display: 'flex',
            }}>
              {dateStr}
            </span>
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end' }}>
              <span style={{
                fontFamily: '"Teko"', fontSize: '34px', fontWeight: 700,
                color: '#E8430A', letterSpacing: '10px', textTransform: 'uppercase',
                display: 'flex',
              }}>
                Yeni Rozet
              </span>
              <div style={{
                width: '180px', height: '4px', background: '#E8430A',
                opacity: 0.4, display: 'flex',
              }} />
            </div>
          </div>

          {/* Hero bolumu */}
          <div style={{
            flex: 1, display: 'flex', flexDirection: 'column',
            justifyContent: 'center',
          }}>
            {/* tebrikler */}
            <span style={{
              fontFamily: '"Space Mono"', fontSize: '28px',
              color: '#C89B3C', letterSpacing: '8px', textTransform: 'uppercase',
              opacity: 0.7, marginBottom: '10px', display: 'flex',
            }}>
              {'\u25CF'} tebrikler
            </span>

            {/* Isim */}
            <div style={{
              fontFamily: '"Teko"', fontSize: '170px', fontWeight: 700,
              color: '#F2E8D5', letterSpacing: '12px', lineHeight: 0.95,
              textTransform: 'uppercase', display: 'flex',
            }}>
              {firstName},
            </div>

            {/* Rozet adi — fire rengi */}
            <div style={{
              fontFamily: '"Teko"', fontSize: fireStyle.fontSize, fontWeight: 700,
              color: '#FF5722', letterSpacing: fireStyle.letterSpacing,
              lineHeight: 1.05, textTransform: 'uppercase', display: 'flex',
            }}>
              {badgeName}
            </div>

            {/* ROZETI KAZANDIN! */}
            <div style={{
              fontFamily: '"Teko"', fontSize: '110px', fontWeight: 700,
              color: '#F2E8D5', letterSpacing: '8px', lineHeight: 1.05,
              textTransform: 'uppercase', marginTop: '5px', display: 'flex',
            }}>
              {`ROZET\u0130 KAZANDIN!`}
            </div>

            {/* Ayirici cizgi */}
            <div style={{
              width: '100px', height: '6px', background: '#E8430A',
              margin: '35px 0', opacity: 0.6, display: 'flex',
            }} />

            {/* Alinti */}
            <div style={{
              fontFamily: '"Space Mono"', fontSize: '28px',
              color: 'rgba(242,232,213,0.45)', lineHeight: 1.6,
              maxWidth: '700px', letterSpacing: '0.5px', display: 'flex',
            }}>
              {`\u201C${badgeDef.quote}\u201D`}
            </div>

            {/* Stat blogu */}
            {!isSpecial && (
              <div style={{
                display: 'flex', alignItems: 'stretch',
                marginTop: '35px', border: '2px solid rgba(232,67,10,0.15)',
              }}>
                <div style={{
                  fontFamily: '"Teko"', fontSize: '110px', fontWeight: 700,
                  color: '#E8430A', lineHeight: 1, padding: '15px 35px',
                  background: 'rgba(232,67,10,0.06)', display: 'flex',
                  alignItems: 'center',
                }}>
                  {badgeDef.threshold}
                </div>
                <div style={{
                  display: 'flex', flexDirection: 'column', justifyContent: 'center',
                  padding: '15px 30px', gap: '5px',
                  borderLeft: '2px solid rgba(232,67,10,0.15)',
                }}>
                  <span style={{
                    fontFamily: '"Teko"', fontSize: '40px', fontWeight: 700,
                    color: '#F2E8D5', letterSpacing: '5px', textTransform: 'uppercase',
                    lineHeight: 1, display: 'flex',
                  }}>
                    {badgeDef.statLabel}
                  </span>
                  <span style={{
                    fontFamily: '"Space Mono"', fontSize: '22px',
                    color: 'rgba(242,232,213,0.3)', letterSpacing: '2px',
                    textTransform: 'uppercase', display: 'flex',
                  }}>
                    {badgeDef.statSub}
                  </span>
                </div>
              </div>
            )}
          </div>

          {/* Alt kisim — branding */}
          <div style={{
            display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end',
            paddingTop: '30px',
          }}>
            <span style={{
              fontFamily: '"Teko"', fontSize: '40px', fontWeight: 700,
              color: '#C89B3C', letterSpacing: '5px', textTransform: 'uppercase',
              display: 'flex',
            }}>
              megin.ai
            </span>
          </div>
        </div>
      </div>
    ),
    {
      width: 1080,
      height: 1920,
      fonts: [
        { name: 'Teko', data: tekoFont, style: 'normal', weight: 700 },
        { name: 'Space Mono', data: spaceMonoFont, style: 'normal', weight: 400 },
      ],
      headers: {
        'Cache-Control': 'public, max-age=86400, s-maxage=604800, stale-while-revalidate=86400',
      },
    }
  )
}
