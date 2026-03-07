import Link from 'next/link'
import LandingNavbar from '@/components/shared/LandingNavbar'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Fitness Hesaplayıcıları | Megin',
  description: 'Kalori, 1RM, BMI, su ihtiyacı, ideal kilo ve deri kaliper hesaplayıcıları. Ücretsiz fitness araçları.',
}

const tools = [
  {
    href: '/araclar/kalori-hesaplayici',
    icon: 'M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z',
    title: 'Kalori & Makro',
    desc: 'Günlük kalori, protein, yağ ve karbonhidrat ihtiyacını hesapla.',
  },
  {
    href: '/araclar/1rm-hesaplayici',
    icon: 'M3 6h18M3 12h18M3 18h18',
    title: '1RM Hesaplayıcı',
    desc: 'Tahmini maksimum kaldırma ağırlığını ve yüzdelik tabloyu öğren.',
  },
  {
    href: '/araclar/bki-hesaplayici',
    icon: 'M3 6l3 1m0 0l-3 9a5.002 5.002 0 006.001 0M6 7l3 9M6 7l6-2m6 2l3-1m-3 1l-3 9a5.002 5.002 0 006.001 0M18 7l3 9m-3-9l-6-2m0-2v2m0 16V5m0 16H9m3 0h3',
    title: 'BMI Hesaplayıcı',
    desc: 'Vücut Kitle İndeksini hesapla, sağlıklı aralığı öğren.',
  },
  {
    href: '/araclar/su-ihtiyaci-hesaplayici',
    icon: 'M12 3v1m0 16v1m-6.364-2.636l.707-.707m10.314-10.314l.707-.707M3 12h1m16 0h1m-2.636 6.364l-.707-.707M6.343 6.343l-.707-.707',
    title: 'Su İhtiyacı',
    desc: 'Günlük su ihtiyacını ve içme planını hesapla.',
  },
  {
    href: '/araclar/ideal-kilo-hesaplayici',
    icon: 'M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z',
    title: 'İdeal Kilo',
    desc: '4 bilimsel formülle ideal kilonu öğren.',
  },
  {
    href: '/araclar/vucut-yag-hesaplayici',
    icon: 'M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z',
    title: 'Vücut Yağ Oranı',
    desc: 'Mezura ile çevre ölçümleriyle vücut yağ oranını hesapla.',
  },
  {
    href: '/araclar/deri-kaliper-hesaplayici',
    icon: 'M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z',
    title: 'Deri Kaliper',
    desc: 'Skinfold ölçümleriyle vücut yağ oranını hesapla.',
  },
]

export default function AraclarPage() {
  return (
    <div className="min-h-screen bg-[#FAFAFA]">
      <LandingNavbar />

      <div className="pt-16">
        {/* Page Header */}
        <div className="border-b border-border bg-white">
          <div className="max-w-6xl mx-auto px-4 py-8 sm:py-12 text-center">
            <h1 className="font-display text-3xl sm:text-4xl tracking-wider mb-2">HESAPLAYICILAR</h1>
            <p className="text-sm sm:text-base text-text-secondary">
              Fitness yolculuğunda sana yardımcı olacak ücretsiz araçlar
            </p>
          </div>
        </div>

        {/* Kartlar */}
        <div className="max-w-6xl mx-auto px-4 py-8 sm:py-10">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {tools.map((tool) => (
              <Link
                key={tool.href}
                href={tool.href}
                className="group bg-primary hover:bg-primary-hover rounded-xl p-7 transition-all active:scale-[0.97] shadow-sm hover:shadow-md"
              >
                <div className="flex flex-col gap-4">
                  <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center">
                    <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d={tool.icon} />
                    </svg>
                  </div>
                  <div>
                    <h2 className="text-lg font-bold text-white mb-1">{tool.title}</h2>
                    <p className="text-sm text-white/90 leading-relaxed font-medium">{tool.desc}</p>
                  </div>
                  <div className="flex items-center gap-1 text-white/70 group-hover:text-white transition-colors mt-auto">
                    <span className="text-sm font-medium">Hesapla</span>
                    <svg className="w-4 h-4 group-hover:translate-x-1 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
