import { ImageResponse } from 'next/og'
import { createAdminClient } from '@/lib/supabase/admin'

export const dynamic = 'force-dynamic'

/* ─── Yardımcı ─────────────────────────────────────────── */
function formatShortDate(iso: string): string {
  return new Date(iso).toLocaleDateString('tr-TR', { day: 'numeric', month: 'long' })
}

async function loadGoogleFont(name: string, weight: number): Promise<ArrayBuffer> {
  // Firefox 3.0 UA → Google Fonts TTF döner (Satori sadece TTF/OTF destekler)
  // latin-ext subset → Türkçe karakterler dahil (İ ı Ş ş Ğ ğ Ö ö Ü ü Ç ç)
  const url = `https://fonts.googleapis.com/css?family=${encodeURIComponent(name)}:${weight}&subset=latin,latin-ext`
  const css = await fetch(url, {
    headers: {
      'User-Agent':
        'Mozilla/5.0 (Macintosh; U; Intel Mac OS X 10.5; en-US; rv:1.9) Gecko/2008061004 Firefox/3.0',
    },
  }).then((r) => r.text())
  // latin-ext bloğundaki TTF URL'ini tercih et
  const extMatch = css.match(/latin ext[\s\S]*?src: url\(([^)]+\.ttf[^)]*)\)/)
  const anyMatch = css.match(/src: url\(([^)]+\.ttf[^)]*)\)/) ?? css.match(/src: url\(([^)]+)\)/)
  const match = extMatch ?? anyMatch
  if (!match) throw new Error(`Font bulunamadı: ${name} ${weight}`)
  return fetch(match[1]).then((r) => r.arrayBuffer())
}

/* ─── Fact Bankası ─────────────────────────────────────── */
type Fact = { icon: string; text: string; source: string; minStreak?: number; minLessons?: number }

const FACTS: Fact[] = [
  { minStreak: 20, icon: '🧬', text: '5 ay kesintisiz spor yapanların telomer uzunluğu 10 yıl daha genç bireylere eşdeğer', source: '— British Journal of Sports Medicine, 2022' },
  { minStreak: 16, icon: '🏔', text: 'Tutarlı antrenman yapanların %94\'ü 4 ay sonra "bırakmak aklımdan geçmiyor" diyor', source: '— Journal of Sport & Exercise Psychology' },
  { minStreak: 12, icon: '🧠', text: '12 haftalık sürekli egzersiz beyin hacmini artırır ve depresyon riskini %47 azaltır', source: '— Harvard Medical School, 2023' },
  { minStreak: 10, icon: '⚙', text: '10 hafta sonra vücut egzersizi stres değil, ihtiyaç olarak kodlamaya başlıyor', source: '— Neuroscience & Biobehavioral Reviews' },
  { minStreak: 8,  icon: '❤', text: '8 haftalık tutarlı antrenman kardiyovasküler kapasiteyi %15-20 artırıyor', source: '— American Heart Association' },
  { minStreak: 6,  icon: '💤', text: '6 haftalık düzenli egzersiz uyku kalitesini %65 iyileştiriyor — ilaçsız en iyi uyku çözümü', source: '— Sleep Medicine Reviews, 2021' },
  { minStreak: 4,  icon: '🏆', text: 'Yeni alışkanlık kazananların %91\'i 4. haftayı geçemiyor — sen geçtin', source: '— European Journal of Social Psychology' },
  { minStreak: 3,  icon: '🔗', text: '21 günlük süreklilik yeni nöral yollar açıyor — beyin sporu varsayılan mod olarak kodluyor', source: '— Phillippa Lally, UCL, 2010' },
  { minStreak: 2,  icon: '🌱', text: '2 ardışık hafta: metabolik adaptasyon döngüsü başladı — değişim artık kaçınılmaz', source: '— Journal of Applied Physiology' },
  { minLessons: 6, icon: '⚡', text: 'Haftada 6-7 kez spor yapanlar dünya yetişkin nüfusunun yalnızca %1\'ini oluşturuyor', source: '— Global Wellness Institute, 2023' },
  { minLessons: 5, icon: '🌍', text: 'Haftada 5+ gün aktif olanlar tüm dünya nüfusunun %2\'sinden az — sen o azınlıktasın', source: '— WHO Global Health Observatory, 2023' },
  { minLessons: 4, icon: '🥇', text: 'WHO aktivite önerilerini karşılayan yetişkinler nüfusun sadece %23\'ü — sen çok ötesinde', source: '— World Health Organization, 2022' },
  { minLessons: 3, icon: '🌍', text: 'Dünya nüfusunun yalnızca %5\'i haftada 3+ kez düzenli spor yapıyor', source: '— WHO Global Physical Activity Report' },
  { minLessons: 2, icon: '📈', text: 'Haftada 2 kez antrenman yapmak tamamen hareketsiz yaşayanlardan %32 daha uzun ömür demek', source: '— British Journal of Sports Medicine' },
  { minLessons: 1, icon: '🚀', text: 'Haftada sadece 1 kez egzersiz bile kalp hastalığı riskini %14 azaltıyor', source: '— JAMA Internal Medicine, 2022' },
]

/* ─── Motivasyon Bankası ────────────────────────────────── */
type Motivation = { icon: string; text: string; minStreak: number }

const MOTIVATIONS: Motivation[] = [
  { minStreak: 20, icon: '🔥', text: '20 hafta! Artık bu senin kimliğin. Zincir seni tanımlıyor — o kadar güçlü ki kıramazsın.' },
  { minStreak: 16, icon: '⛓', text: '4 aylık zincir. Buraya kadar gelen %1\'lik gruba girdin. Yarın da gel — çünkü bırakmak artık yabancı hissettiriyor.' },
  { minStreak: 12, icon: '🏆', text: '3 aylık zincir kırılmaz oldu. Vücudun artık sporu bekliyor. Yarını da ona ver.' },
  { minStreak: 8,  icon: '⛓', text: '2 ay! En zor eşiği geçtin. Şimdi her atlanan gün zinciri kırmanın acısı kazanmanın sevincinden ağır basıyor.' },
  { minStreak: 6,  icon: '💪', text: '6 haftalık zincir — vücudun değiştiğini hissediyorsun. Bu his seni yarın da getirecek.' },
  { minStreak: 4,  icon: '⛓', text: 'Zincirin 4 halkası güçlendi. %91\'inin geçemediği bu engeli sen aştın — yarını da doldur.' },
  { minStreak: 3,  icon: '🔗', text: '3 halka: alışkanlık şekillenmeye başlıyor. Beynin sporu olağan olarak kodluyor — ritmi bozma.' },
  { minStreak: 2,  icon: '🌱', text: '2 haftadır devamdasın. Zincirin ilk halkası en zoru — gerisini sen zaten biliyorsun.' },
  { minStreak: 1,  icon: '✨', text: 'İlk halka oluştu. En uzun yolculuklar tek adımla başlar. Gelecek hafta ikinci halkayı tak.' },
]

function getBestFact(lessons: number, streak: number): Fact {
  const byStreak = FACTS.filter((f) => f.minStreak !== undefined && streak >= f.minStreak)
    .sort((a, b) => (b.minStreak ?? 0) - (a.minStreak ?? 0))
  if (byStreak.length > 0) return byStreak[0]
  const byLessons = FACTS.filter((f) => f.minLessons !== undefined && lessons >= f.minLessons)
    .sort((a, b) => (b.minLessons ?? 0) - (a.minLessons ?? 0))
  return byLessons.length > 0 ? byLessons[0] : FACTS[FACTS.length - 1]
}

function getBestMotivation(streak: number): Motivation {
  const match = MOTIVATIONS.filter((m) => streak >= m.minStreak)
    .sort((a, b) => b.minStreak - a.minStreak)
  return match.length > 0 ? match[0] : MOTIVATIONS[MOTIVATIONS.length - 1]
}

/* ─── Route Handler ─────────────────────────────────────── */
export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  const admin = createAdminClient()

  const { data: report } = await admin
    .from('weekly_reports')
    .select('*, users(full_name)')
    .eq('id', id)
    .single()

  if (!report) {
    return new Response('Rapor bulunamadı', { status: 404 })
  }

  const userName = (report.users as unknown as { full_name: string })?.full_name || 'Üye'
  const firstName = userName.split(' ')[0].toLocaleUpperCase('tr-TR')
  const weekLabel = `${formatShortDate(report.week_start)}  –  ${formatShortDate(report.week_end)}`
  const showStreak = (report.consecutive_weeks ?? 0) >= 2

  // Kullanıcının toplam ders sayısı
  const { count: totalLessons } = await admin
    .from('lessons')
    .select('*', { count: 'exact', head: true })
    .eq('user_id', report.user_id)

  const fact = getBestFact(report.lessons_count, report.consecutive_weeks ?? 0)
  const motivation = getBestMotivation(report.consecutive_weeks ?? 0)

  /* Font yükle */
  const [oswaldFont, barlowCondFont] = await Promise.all([
    loadGoogleFont('Oswald', 700),       // Bebas Neue yerine — tam Türkçe desteği
    loadGoogleFont('Barlow Condensed', 700),
  ])

  return new ImageResponse(
    (
      <div
        style={{
          width: '1080px',
          height: '1920px',
          backgroundColor: '#F6F1E7',
          display: 'flex',
          flexDirection: 'column',
          position: 'relative',
          fontFamily: '"Barlow Condensed"',
        }}
      >
        {/* Arka plan barbell */}
        <svg
          style={{ position: 'absolute', right: -55, bottom: 200, opacity: 0.04 }}
          width="960" height="360" viewBox="0 0 960 360"
        >
          <ellipse cx="85" cy="180" rx="80" ry="130" fill="#1A1A1A" />
          <ellipse cx="140" cy="180" rx="58" ry="108" fill="#1A1A1A" />
          <rect x="188" y="148" width="85" height="64" rx="10" fill="#1A1A1A" />
          <rect x="273" y="163" width="414" height="34" rx="10" fill="#1A1A1A" />
          <rect x="340" y="163" width="280" height="34" rx="6" fill="#2a2a2a" />
          <rect x="687" y="148" width="85" height="64" rx="10" fill="#1A1A1A" />
          <ellipse cx="820" cy="180" rx="58" ry="108" fill="#1A1A1A" />
          <ellipse cx="875" cy="180" rx="80" ry="130" fill="#1A1A1A" />
        </svg>

        {/* Arka plan dumbbell */}
        <svg
          style={{ position: 'absolute', left: -28, top: 820, opacity: 0.035 }}
          width="560" height="200" viewBox="0 0 560 200"
        >
          <ellipse cx="56" cy="100" rx="50" ry="82" fill="#1A1A1A" />
          <ellipse cx="93" cy="100" rx="35" ry="64" fill="#1A1A1A" />
          <rect x="120" y="82" width="54" height="40" rx="6" fill="#1A1A1A" />
          <rect x="174" y="90" width="212" height="22" rx="6" fill="#1A1A1A" />
          <rect x="386" y="82" width="54" height="40" rx="6" fill="#1A1A1A" />
          <ellipse cx="467" cy="100" rx="35" ry="64" fill="#1A1A1A" />
          <ellipse cx="504" cy="100" rx="50" ry="82" fill="#1A1A1A" />
        </svg>

        {/* Üst kırmızı şerit */}
        <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: '14px', backgroundColor: '#DC2626', display: 'flex' }} />

        {/* Köşe gradient */}
        <div style={{ position: 'absolute', top: 14, left: 0, width: '400px', height: '360px', background: 'linear-gradient(135deg, rgba(220,38,38,0.07) 0%, transparent 70%)', display: 'flex' }} />

        {/* Başlık */}
        <div style={{ position: 'absolute', top: '70px', left: '60px', right: '60px', display: 'flex', flexDirection: 'column' }}>
          <div style={{ display: 'flex', fontFamily: '"Oswald"', fontSize: '148px', color: '#DC2626', letterSpacing: '5px', lineHeight: 0.88 }}>
            {firstName}
          </div>
          <div style={{ display: 'flex', fontSize: '42px', fontWeight: 800, color: '#1A1A1A', letterSpacing: '4px', textTransform: 'uppercase', marginTop: '16px' }}>
            Haftalık Spor Özeti
          </div>
        </div>

        {/* Tarih rozeti */}
        <div style={{
          position: 'absolute', top: '70px', right: '60px',
          display: 'flex', backgroundColor: '#1A1A1A', borderRadius: '8px',
          padding: '14px 28px',
        }}>
          <div style={{ display: 'flex', color: '#F6F1E7', fontSize: '26px', fontWeight: 600, letterSpacing: '2px', textTransform: 'uppercase' }}>
            {weekLabel}
          </div>
        </div>

        {/* İstatistikler */}
        <div style={{ position: 'absolute', top: '320px', left: '60px', right: '60px', display: 'flex', gap: '24px' }}>

          {/* Bu hafta */}
          <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '4px', backgroundColor: '#1A1A1A', borderRadius: '20px', padding: '36px 20px 32px', borderTopWidth: '7px', borderTopStyle: 'solid', borderTopColor: '#DC2626' }}>
            <div style={{ display: 'flex', fontSize: '20px', fontWeight: 700, color: '#555', letterSpacing: '2.5px', textTransform: 'uppercase' }}>
              Bu Hafta
            </div>
            <div style={{ display: 'flex', fontFamily: '"Oswald"', fontSize: '108px', color: '#DC2626', lineHeight: 1, margin: '4px 0' }}>
              {String(report.lessons_count)}
            </div>
            <div style={{ display: 'flex', fontSize: '20px', fontWeight: 700, color: '#555', letterSpacing: '2.5px', textTransform: 'uppercase' }}>
              Ders
            </div>
          </div>

          {/* Toplam */}
          <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '4px', backgroundColor: '#1A1A1A', borderRadius: '20px', padding: '36px 20px 32px', borderTopWidth: '7px', borderTopStyle: 'solid', borderTopColor: '#DC2626' }}>
            <div style={{ display: 'flex', fontSize: '20px', fontWeight: 700, color: '#555', letterSpacing: '2.5px', textTransform: 'uppercase' }}>
              Toplam
            </div>
            <div style={{ display: 'flex', fontFamily: '"Oswald"', fontSize: '108px', color: '#DC2626', lineHeight: 1, margin: '4px 0' }}>
              {String(totalLessons ?? 0)}
            </div>
            <div style={{ display: 'flex', fontSize: '20px', fontWeight: 700, color: '#555', letterSpacing: '2.5px', textTransform: 'uppercase' }}>
              Ders
            </div>
          </div>

          {/* Seri — sadece 2+ haftada */}
          {showStreak ? (
            <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '4px', backgroundColor: '#1A1A1A', borderRadius: '20px', padding: '36px 20px 32px', borderTopWidth: '7px', borderTopStyle: 'solid', borderTopColor: '#F59E0B' }}>
              <div style={{ display: 'flex', fontSize: '20px', fontWeight: 700, color: '#555', letterSpacing: '2.5px', textTransform: 'uppercase' }}>
                Ardışık
              </div>
              <div style={{ display: 'flex', fontFamily: '"Oswald"', fontSize: '108px', color: '#F59E0B', lineHeight: 1, margin: '4px 0' }}>
                {String(report.consecutive_weeks)}
              </div>
              <div style={{ display: 'flex', fontSize: '20px', fontWeight: 700, color: '#555', letterSpacing: '2.5px', textTransform: 'uppercase' }}>
                Hafta
              </div>
            </div>
          ) : null}

        </div>

        {/* Haftalık mesaj */}
        {report.message ? (
          <div style={{
            position: 'absolute', top: '600px', left: '60px', right: '60px',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            backgroundColor: '#DC2626', borderRadius: '16px',
            padding: '32px 48px',
          }}>
            <div style={{ display: 'flex', fontSize: '36px', fontWeight: 700, color: '#ffffff', lineHeight: 1.3, textAlign: 'center' }}>
              {report.message}
            </div>
          </div>
        ) : null}

        {/* FACT kartı */}
        <div style={{
          position: 'absolute', top: '780px', left: '60px', right: '60px',
          display: 'flex', alignItems: 'center', gap: '36px',
          backgroundColor: '#ffffff', borderRadius: '20px',
          borderLeftWidth: '10px', borderLeftStyle: 'solid', borderLeftColor: '#DC2626',
          padding: '44px 52px 44px 48px',
        }}>
          {/* İkon */}
          <div style={{ display: 'flex', width: '110px', height: '110px', backgroundColor: '#DC2626', borderRadius: '16px', alignItems: 'center', justifyContent: 'center', fontSize: '52px', flexShrink: 0 }}>
            {fact.icon}
          </div>
          {/* İçerik */}
          <div style={{ display: 'flex', flexDirection: 'column', flex: 1 }}>
            <div style={{ display: 'flex', fontSize: '20px', fontWeight: 700, color: '#DC2626', letterSpacing: '3px', textTransform: 'uppercase', marginBottom: '10px' }}>
              Bunu Biliyor musunuz?
            </div>
            <div style={{ display: 'flex', fontSize: '36px', fontWeight: 700, color: '#1A1A1A', lineHeight: 1.25 }}>
              {fact.text}
            </div>
            <div style={{ display: 'flex', fontSize: '18px', color: '#aaa', marginTop: '12px' }}>
              {fact.source}
            </div>
          </div>
        </div>

        {/* Motivasyon kartı */}
        <div style={{
          position: 'absolute', top: '1160px', left: '60px', right: '60px',
          display: 'flex', alignItems: 'center', gap: '36px',
          backgroundColor: '#ffffff', borderRadius: '20px',
          borderLeftWidth: '10px', borderLeftStyle: 'solid', borderLeftColor: '#1A1A1A',
          padding: '40px 52px 40px 48px',
        }}>
          {/* İkon */}
          <div style={{ display: 'flex', width: '110px', height: '110px', backgroundColor: '#1A1A1A', borderRadius: '16px', alignItems: 'center', justifyContent: 'center', fontSize: '52px', flexShrink: 0 }}>
            {motivation.icon}
          </div>
          {/* İçerik */}
          <div style={{ display: 'flex', flexDirection: 'column', flex: 1 }}>
            <div style={{ display: 'flex', fontSize: '20px', fontWeight: 700, color: '#1A1A1A', letterSpacing: '3px', textTransform: 'uppercase', marginBottom: '10px' }}>
              Zinciri Kirma
            </div>
            <div style={{ display: 'flex', fontSize: '34px', fontWeight: 700, color: '#1A1A1A', lineHeight: 1.28 }}>
              {motivation.text}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div style={{
          position: 'absolute', bottom: 0, left: 0, right: 0, height: '170px',
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          backgroundColor: '#1A1A1A', padding: '0 60px',
        }}>
          <div style={{ display: 'flex', fontFamily: '"Oswald"', fontSize: '56px', color: '#DC2626', letterSpacing: '2px' }}>
            megin.ai
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '6px' }}>
            <div style={{ display: 'flex', fontSize: '24px', fontWeight: 700, color: '#555', letterSpacing: '2px', textTransform: 'uppercase' }}>
              Kisisel Antrenor
            </div>
            <div style={{ display: 'flex', fontSize: '17px', color: '#444', letterSpacing: '1px' }}>
              Antalya
            </div>
          </div>
        </div>
      </div>
    ),
    {
      width: 1080,
      height: 1920,
      fonts: [
        { name: 'Oswald', data: oswaldFont, style: 'normal', weight: 700 },
        { name: 'Barlow Condensed', data: barlowCondFont, style: 'normal', weight: 700 },
      ],
    }
  )
}
