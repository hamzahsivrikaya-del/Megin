import Link from 'next/link'

const legalLinks = [
  { href: '/yasal/mesafeli-satis-sozlesmesi', label: 'Mesafeli Satış Sözleşmesi' },
  { href: '/yasal/gizlilik-politikasi', label: 'Gizlilik Politikası' },
  { href: '/yasal/iade-ve-iptal', label: 'İade ve İptal' },
  { href: '/yasal/kullanim-kosullari', label: 'Kullanım Koşulları' },
]

export default function YasalLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-[#FAFAFA] text-[#1A1A1A]" style={{ fontFamily: 'var(--font-geist-sans), sans-serif' }}>
      {/* Navbar */}
      <nav className="sticky top-0 z-10 border-b border-[#E5E5E5] bg-white/80 backdrop-blur-md">
        <div className="max-w-2xl mx-auto px-6 py-4 flex items-center justify-between">
          <Link href="/" className="text-sm text-[#57534E] hover:text-[#1A1A1A] transition-colors flex items-center gap-2">
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            Ana Sayfa
          </Link>
          <span className="text-[10px] text-[#A8A29E] uppercase tracking-[0.2em] font-medium">Yasal Bilgiler</span>
        </div>
      </nav>

      {/* İçerik */}
      <main className="max-w-2xl mx-auto px-6 py-10 sm:py-16">
        {children}
      </main>

      {/* Footer */}
      <footer className="border-t border-[#E5E5E5] bg-white py-8 px-6">
        <div className="max-w-2xl mx-auto space-y-4">
          <div className="flex flex-wrap items-center justify-center gap-x-6 gap-y-2">
            {legalLinks.map((link) => (
              <Link key={link.href} href={link.href} className="text-xs text-[#A8A29E] hover:text-[#57534E] transition-colors">
                {link.label}
              </Link>
            ))}
          </div>
          <p className="text-center text-[10px] text-[#D6D3D1]">
            © 2026 Megin. Tüm hakları saklıdır.
          </p>
        </div>
      </footer>
    </div>
  )
}
