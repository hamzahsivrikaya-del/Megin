import Link from 'next/link'
import Image from 'next/image'
import LandingNavbar from '@/components/shared/LandingNavbar'

export default function HomePage() {
  return (
    <div className="min-h-screen bg-[#FAFAFA] text-[#1A1A1A]" style={{ fontFamily: 'var(--font-oswald), sans-serif' }}>
      <LandingNavbar />

      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            '@context': 'https://schema.org',
            '@type': 'LocalBusiness',
            name: 'Hamza Sivrikaya - Kişisel Antrenör',
            description: 'Antalya\'da kişisel antrenman, CrossFit, HYROX ve beslenme danışmanlığı hizmetleri.',
            url: 'https://hamzasivrikaya.com',
            telephone: '+905456814776',
            address: {
              '@type': 'PostalAddress',
              addressLocality: 'Antalya',
              addressCountry: 'TR',
            },
            sameAs: [
              'https://instagram.com/hamzasivrikayaa',
              'https://wa.me/905456814776',
            ],
            priceRange: '$$',
          }),
        }}
      />

      {/* ==================== HERO (Image right + Text left) ==================== */}
      <section id="hakkimda" className="relative min-h-screen flex items-center overflow-hidden bg-[#1A1A1A]">
        {/* Image — right side on desktop, full background on mobile */}
        <div className="absolute inset-0 md:left-[40%]">
          <Image
            src="/images/hamza-about.jpg"
            alt="Hamza Sivrikaya - Kişisel Antrenör"
            fill
            className="object-cover object-top"
            priority
            sizes="(max-width: 768px) 100vw, 60vw"
          />
          {/* Gradient overlays for text readability */}
          <div className="absolute inset-0 bg-gradient-to-t from-[#1A1A1A] via-[#1A1A1A]/60 to-transparent md:bg-gradient-to-r md:from-[#1A1A1A] md:via-[#1A1A1A]/80 md:to-transparent" />
          <div className="absolute inset-0 bg-[#1A1A1A]/40 md:bg-transparent" />
        </div>

        {/* Content — left side */}
        <div className="relative w-full max-w-6xl mx-auto px-4 pt-28 pb-16 sm:pt-32 sm:pb-20">
          <div className="max-w-xl">
            {/* Label */}
            <p className="text-xs uppercase tracking-[0.35em] text-white/65 font-medium mb-5 animate-fade-up">
              Kişisel Antrenör · Antalya
            </p>

            {/* Main heading — HWPO-style massive bold */}
            <h1 className="font-display text-5xl sm:text-7xl md:text-7xl lg:text-8xl tracking-wide leading-[0.9] text-white mb-5 animate-fade-up delay-100">
              DAHA GÜÇLÜ<br />
              <span className="text-primary">BİR SEN</span><br />İNŞA ET
            </h1>

            {/* Italic subheading — editorial contrast */}
            <p className="text-lg sm:text-xl md:text-2xl text-white/65 leading-snug mb-6 animate-fade-up delay-200" style={{ fontFamily: 'var(--font-lora), serif', fontStyle: 'italic' }}>
              Sağlığını, özgüvenini ve devamlılığını destekleyen antrenman — 2026 ve sonrası için.
            </p>

            {/* Short about */}
            <p className="text-sm sm:text-base text-white/60 leading-relaxed mb-8 animate-fade-up delay-300">
              Kişiye özel programlar, doğru teknik ve sürekli takiple hedefinize ulaşmanız için
              yanınızdayım. İster yeni başlayın, ister seviyenizi yükseltin — bulunduğunuz
              yerden başlıyoruz.
            </p>

            {/* CTAs */}
            <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 animate-fade-up delay-400">
              <a href="#iletisim" className="w-full sm:w-auto text-center px-8 py-4 sm:py-3.5 bg-primary text-white text-sm font-bold uppercase tracking-widest hover:bg-primary-hover transition-all press-effect">
                Ücretsiz Görüşme
              </a>
              <a href="#hizmetler" className="w-full sm:w-auto text-center px-8 py-4 sm:py-3.5 border border-white/20 text-white/70 text-sm font-bold uppercase tracking-widest hover:border-white/50 hover:text-white transition-all press-effect">
                Hizmetleri Gör
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* ==================== ACCENT STRIP ==================== */}
      <div className="bg-primary py-4 overflow-hidden">
        <div className="flex items-center justify-center gap-4 sm:gap-8 font-display text-sm sm:text-base md:text-lg tracking-[0.25em] text-white whitespace-nowrap">
          <span>HEDEF BELİRLE</span>
          <span className="text-white/40">·</span>
          <span>ÇALIŞ</span>
          <span className="text-white/40">·</span>
          <span>SONUÇ AL</span>
          <span className="text-white/40">·</span>
          <span>TEKRAR ET</span>
        </div>
      </div>

      {/* ==================== SERVICES (Photo collage background) ==================== */}
      <section id="hizmetler" className="relative py-20 sm:py-28 px-4 overflow-hidden">
        {/* Background — single image on mobile, 3 photos on lg+ */}
        <div className="absolute inset-0 lg:hidden">
          <Image src="/images/hamza-hyrox.jpg" alt="" fill className="object-cover object-top" sizes="100vw" />
        </div>
        <div className="absolute inset-0 hidden lg:grid grid-cols-3">
          <div className="relative overflow-hidden">
            <Image src="/images/hamza-running.jpg" alt="" fill className="object-cover object-center" sizes="33vw" />
          </div>
          <div className="relative overflow-hidden">
            <Image src="/images/hamza-hyrox.jpg" alt="" fill className="object-cover object-top" sizes="33vw" />
          </div>
          <div className="relative overflow-hidden">
            <Image src="/images/hamza-gym.jpg" alt="" fill className="object-cover object-center" sizes="33vw" />
          </div>
        </div>
        {/* Dark overlay */}
        <div className="absolute inset-0 bg-black/60" />
        <div className="absolute inset-0 bg-gradient-to-b from-black/20 via-transparent to-black/20" />

        <div className="relative max-w-6xl mx-auto">
          <div className="text-center mb-16 animate-fade-up">
            <p className="text-xs uppercase tracking-[0.3em] text-primary font-semibold mb-4">Neler Sunuyorum</p>
            <h2 className="font-display text-3xl sm:text-4xl md:text-5xl tracking-wider text-white">HİZMETLER</h2>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {/* Birebir Antrenman */}
            <div className="group bg-black/65 backdrop-blur-md border border-white/10 p-6 transition-all duration-300 animate-fade-up delay-100 cursor-default">
              <div className="flex items-start gap-4">
                <div className="shrink-0 w-11 h-11 bg-white/10 flex items-center justify-center">
                  <svg className="w-5 h-5 text-white/70" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg>
                </div>
                <div>
                  <h3 className="text-white font-bold mb-1">Birebir Antrenman</h3>
                  <p className="text-sm text-white/60 leading-relaxed">Tamamen size özel tasarlanmış antrenman programları. Tek odak noktam sizin hedefiniz.</p>
                </div>
              </div>
            </div>

            {/* CrossFit */}
            <div className="group bg-black/65 backdrop-blur-md border border-white/10 p-6 transition-all duration-300 animate-fade-up delay-200 cursor-default">
              <div className="flex items-start gap-4">
                <div className="shrink-0 w-11 h-11 bg-white/10 flex items-center justify-center">
                  <svg className="w-5 h-5 text-white/70" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>
                </div>
                <div>
                  <h3 className="text-white font-bold mb-1">CrossFit & HYROX</h3>
                  <p className="text-sm text-white/60 leading-relaxed">Doğru teknik, güvenli ilerleme. Olimpik kaldırışlardan jimnastiğe, seviyenize uygun CrossFit.</p>
                </div>
              </div>
            </div>

            {/* Beslenme */}
            <div className="group bg-black/65 backdrop-blur-md border border-white/10 p-6 transition-all duration-300 animate-fade-up delay-300 cursor-default">
              <div className="flex items-start gap-4">
                <div className="shrink-0 w-11 h-11 bg-white/10 flex items-center justify-center">
                  <svg className="w-5 h-5 text-white/70" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" /></svg>
                </div>
                <div>
                  <h3 className="text-white font-bold mb-1">Beslenme Danışmanlığı</h3>
                  <p className="text-sm text-white/60 leading-relaxed">Hedeflerinize uygun, sürdürülebilir ve yaşam tarzınıza entegre beslenme planları.</p>
                </div>
              </div>
            </div>

            {/* Ölçüm & Takip */}
            <div className="group bg-black/65 backdrop-blur-md border border-white/10 p-6 transition-all duration-300 animate-fade-up delay-400 cursor-default">
              <div className="flex items-start gap-4">
                <div className="shrink-0 w-11 h-11 bg-white/10 flex items-center justify-center">
                  <svg className="w-5 h-5 text-white/70" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" /></svg>
                </div>
                <div>
                  <h3 className="text-white font-bold mb-1">Ölçüm & Takip</h3>
                  <p className="text-sm text-white/60 leading-relaxed">Düzenli vücut analizleri ve ilerleme raporlarıyla nerede olduğunuzu her zaman bilin.</p>
                </div>
              </div>
            </div>

            {/* Atletik Performans */}
            <div className="group bg-black/65 backdrop-blur-md border border-white/10 p-6 transition-all duration-300 animate-fade-up delay-500 cursor-default">
              <div className="flex items-start gap-4">
                <div className="shrink-0 w-11 h-11 bg-white/10 flex items-center justify-center">
                  <svg className="w-5 h-5 text-white/70" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" /></svg>
                </div>
                <div>
                  <h3 className="text-white font-bold mb-1">Atletik Performans Koçluğu</h3>
                  <p className="text-sm text-white/60 leading-relaxed">Hız, çeviklik ve patlayıcı güç odaklı programlarla performansınızı bir üst seviyeye taşıyın.</p>
                </div>
              </div>
            </div>

            {/* Online Program */}
            <div className="group bg-black/65 backdrop-blur-md border border-white/10 p-6 transition-all duration-300 animate-fade-up delay-600 cursor-default">
              <div className="flex items-start gap-4">
                <div className="shrink-0 w-11 h-11 bg-white/10 flex items-center justify-center">
                  <svg className="w-5 h-5 text-white/70" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" /></svg>
                </div>
                <div>
                  <h3 className="text-white font-bold mb-1">Online Program</h3>
                  <p className="text-sm text-white/60 leading-relaxed">Nerede olursanız olun, size özel hazırlanan haftalık program ve takiple antrenmanınızı sürdürün.</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ==================== DIVIDER 1 ==================== */}
      <div className="bg-white py-4 sm:py-5 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <p className="font-display text-sm sm:text-base md:text-lg tracking-[0.25em] text-[#1A1A1A]">
            SADECE ANTRENMAN DEĞİL, <span className="text-primary">YAŞAM TARZI</span>
          </p>
        </div>
      </div>

      {/* ==================== FREE TRAINING (Split layout — image left, text right) ==================== */}
      <section className="relative min-h-[70vh] sm:min-h-[80vh] flex items-center overflow-hidden bg-[#1A1A1A]">
        {/* Image — right side on desktop, full background on mobile */}
        <div className="absolute inset-0 md:left-[45%]">
          <Image
            src="/images/hamza-rope.jpg"
            alt="Hamza Sivrikaya ip tırmanışı"
            fill
            className="object-cover object-bottom"
            sizes="(max-width: 768px) 100vw, 55vw"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-[#1A1A1A] via-[#1A1A1A]/60 to-transparent md:bg-gradient-to-r md:from-[#1A1A1A] md:via-[#1A1A1A]/80 md:to-transparent" />
          <div className="absolute inset-0 bg-[#1A1A1A]/50 md:bg-transparent" />
        </div>

        {/* Content — left side */}
        <div className="relative w-full max-w-6xl mx-auto px-4 py-20 sm:py-28">
          <div className="md:max-w-[50%]">
            <p className="text-xs uppercase tracking-[0.35em] text-primary font-semibold mb-5 animate-fade-up">
              Ücretsiz · Her Hafta Güncellenir
            </p>
            <h2 className="font-display text-4xl sm:text-5xl md:text-6xl lg:text-7xl tracking-wider text-white leading-[0.95] mb-6 animate-fade-up delay-100">
              FORMDA KALMANIN<br /><span className="text-primary">BEDELİ YOK</span>
            </h2>
            <p className="text-white/65 text-base sm:text-lg leading-relaxed mb-5 animate-fade-up delay-200">
              Her pazartesi yepyeni bir program. Yapılandırılmış, detaylı set ve tekrar bilgileriyle
              hazırlanmış haftalık antrenmanlarla kendi hızında ilerle.
            </p>
            <p className="text-white/55 text-sm leading-relaxed mb-10 animate-fade-up delay-300" style={{ fontFamily: 'var(--font-lora), serif', fontStyle: 'italic' }}>
              &ldquo;Başlamak için mükemmel zamanı bekleme. Bugün başla, yarın daha güçlü ol.&rdquo;
            </p>
            <Link href="/antrenmanlar" className="inline-flex items-center gap-3 px-10 py-4 bg-primary text-white text-sm font-bold uppercase tracking-widest hover:bg-primary-hover transition-all press-effect animate-fade-up delay-400">
              Programa Git
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg>
            </Link>
          </div>
        </div>
      </section>

      {/* ==================== DIVIDER 2 (Red accent) ==================== */}
      <div className="bg-primary py-4 overflow-hidden">
        <div className="flex items-center justify-center gap-4 sm:gap-8 font-display text-sm sm:text-base md:text-lg tracking-[0.25em] text-white whitespace-nowrap">
          <span>SINIRLARINI ZORLA</span>
          <span className="text-white/40">·</span>
          <span>SONUÇLARINI GÖR</span>
        </div>
      </div>

      {/* ==================== CALCULATORS ==================== */}
      <section className="relative py-20 sm:py-28 px-4 bg-white overflow-hidden">
        <div className="relative max-w-6xl mx-auto">
          <div className="text-center mb-16 animate-fade-up">
            <p className="text-xs uppercase tracking-[0.3em] text-primary font-semibold mb-4">Ücretsiz Araçlar</p>
            <h2 className="font-display text-3xl sm:text-4xl md:text-5xl tracking-wider text-[#1A1A1A]">HESAPLAYICILAR</h2>
            <p className="text-[#57534E] mt-4 max-w-lg mx-auto">Fitness yolculuğunda sana yardımcı olacak ücretsiz araçlar</p>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-7">
            {/* Kalori & Makro */}
            <Link href="/araclar/kalori-hesaplayici" className="group relative bg-primary p-10 overflow-hidden transition-all duration-300 hover:scale-[1.02] hover:shadow-xl hover:bg-primary-hover animate-fade-up delay-100">
              {/* Graffiti — tabak, çatal, bıçak */}
              <svg className="absolute -bottom-4 -right-4 w-40 h-40 text-white/[0.15] group-hover:text-white/[0.25] transition-colors" fill="currentColor" viewBox="0 0 100 100">
                <circle cx="50" cy="55" r="30" strokeWidth="3" stroke="currentColor" fill="none" />
                <circle cx="50" cy="55" r="20" strokeWidth="1.5" stroke="currentColor" fill="none" />
                <rect x="18" y="15" width="3" height="45" rx="1.5" transform="rotate(-15 18 15)" />
                <rect x="12" y="16" width="3" height="40" rx="1.5" transform="rotate(-20 12 16)" />
                <path d="M7 18c0-8 3-14 3-14s3 6 3 14-1.5 12-3 12-3-4-3-12z" transform="rotate(-25 10 25)" />
                <rect x="80" y="12" width="3" height="50" rx="1.5" transform="rotate(15 80 12)" />
                <path d="M85 10l2 18h-7l2-18z" transform="rotate(10 86 19)" />
              </svg>
              <div className="relative">
                <h3 className="text-white font-bold text-xl mb-3">Kalori & Makro</h3>
                <p className="text-white/85 leading-relaxed">Yaş, kilo, boy ve aktivite seviyene göre günlük kalori, protein, yağ ve karbonhidrat ihtiyacını hesapla.</p>
                <div className="mt-6 text-sm text-white/70 group-hover:text-white font-semibold uppercase tracking-wider flex items-center gap-1 transition-colors">
                  Hesapla
                  <svg className="w-4 h-4 group-hover:translate-x-1 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg>
                </div>
              </div>
            </Link>

            {/* 1RM Hesaplayıcı */}
            <Link href="/araclar/1rm-hesaplayici" className="group relative bg-primary p-10 overflow-hidden transition-all duration-300 hover:scale-[1.02] hover:shadow-xl hover:bg-primary-hover animate-fade-up delay-200">
              {/* Graffiti — halter barı */}
              <svg className="absolute -bottom-4 -right-4 w-40 h-40 text-white/[0.15] group-hover:text-white/[0.25] transition-colors" fill="currentColor" viewBox="0 0 100 100">
                <rect x="10" y="46" width="80" height="8" rx="2" />
                <rect x="5" y="30" width="14" height="40" rx="2" />
                <rect x="81" y="30" width="14" height="40" rx="2" />
                <rect x="0" y="36" width="9" height="28" rx="2" />
                <rect x="91" y="36" width="9" height="28" rx="2" />
              </svg>
              <div className="relative">
                <h3 className="text-white font-bold text-xl mb-3">1RM Hesaplayıcı</h3>
                <p className="text-white/85 leading-relaxed">Kaldırdığın ağırlık ve tekrar sayısından tahmini maksimum kaldırma ağırlığını ve yüzdelik tabloyu öğren.</p>
                <div className="mt-6 text-sm text-white/70 group-hover:text-white font-semibold uppercase tracking-wider flex items-center gap-1 transition-colors">
                  Hesapla
                  <svg className="w-4 h-4 group-hover:translate-x-1 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg>
                </div>
              </div>
            </Link>

            {/* BMI Hesaplayıcı */}
            <Link href="/araclar/bki-hesaplayici" className="group relative bg-primary p-10 overflow-hidden transition-all duration-300 hover:scale-[1.02] hover:shadow-xl hover:bg-primary-hover animate-fade-up delay-300">
              {/* Graffiti — terazi */}
              <svg className="absolute -bottom-4 -right-4 w-40 h-40 text-white/[0.15] group-hover:text-white/[0.25] transition-colors" fill="currentColor" viewBox="0 0 100 100">
                <rect x="47" y="15" width="6" height="55" />
                <rect x="28" y="70" width="44" height="7" rx="3" />
                <path d="M18 35 L50 18 L82 35" strokeWidth="5" stroke="currentColor" fill="none" strokeLinecap="round" />
                <path d="M10 35 Q18 52 26 35" strokeWidth="4" stroke="currentColor" fill="none" />
                <path d="M74 35 Q82 52 90 35" strokeWidth="4" stroke="currentColor" fill="none" />
              </svg>
              <div className="relative">
                <h3 className="text-white font-bold text-xl mb-3">BMI Hesaplayıcı</h3>
                <p className="text-white/85 leading-relaxed">Boy ve kilona göre Vücut Kitle İndeksini hesapla, sağlıklı aralıkta olup olmadığını öğren.</p>
                <div className="mt-6 text-sm text-white/70 group-hover:text-white font-semibold uppercase tracking-wider flex items-center gap-1 transition-colors">
                  Hesapla
                  <svg className="w-4 h-4 group-hover:translate-x-1 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg>
                </div>
              </div>
            </Link>

            {/* Su İhtiyacı */}
            <Link href="/araclar/su-ihtiyaci-hesaplayici" className="group relative bg-primary p-10 overflow-hidden transition-all duration-300 hover:scale-[1.02] hover:shadow-xl hover:bg-primary-hover animate-fade-up delay-400">
              {/* Graffiti — su damlası */}
              <svg className="absolute -bottom-6 -right-4 w-44 h-44 text-white/[0.15] group-hover:text-white/[0.25] transition-colors" fill="currentColor" viewBox="0 0 100 100">
                <path d="M50 8 C50 8 20 45 20 62 C20 79 33 92 50 92 C67 92 80 79 80 62 C80 45 50 8 50 8Z" />
                <ellipse cx="38" cy="56" rx="7" ry="12" fill="white" opacity="0.25" transform="rotate(-15 38 56)" />
              </svg>
              <div className="relative">
                <h3 className="text-white font-bold text-xl mb-3">Su İhtiyacı</h3>
                <p className="text-white/85 leading-relaxed">Kilona ve antrenman yoğunluğuna göre günlük su ihtiyacını ve saatlik içme planını hesapla.</p>
                <div className="mt-6 text-sm text-white/70 group-hover:text-white font-semibold uppercase tracking-wider flex items-center gap-1 transition-colors">
                  Hesapla
                  <svg className="w-4 h-4 group-hover:translate-x-1 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg>
                </div>
              </div>
            </Link>

            {/* İdeal Kilo */}
            <Link href="/araclar/ideal-kilo-hesaplayici" className="group relative bg-primary p-10 overflow-hidden transition-all duration-300 hover:scale-[1.02] hover:shadow-xl hover:bg-primary-hover animate-fade-up delay-500">
              {/* Graffiti — insan silueti */}
              <svg className="absolute -bottom-4 -right-2 w-36 h-44 text-white/[0.15] group-hover:text-white/[0.25] transition-colors" fill="currentColor" viewBox="0 0 60 100">
                <circle cx="30" cy="14" r="10" />
                <path d="M30 25 C18 25 12 35 12 45 L18 45 L20 70 L25 70 L27 90 L33 90 L35 70 L40 70 L42 45 L48 45 C48 35 42 25 30 25Z" />
              </svg>
              <div className="relative">
                <h3 className="text-white font-bold text-xl mb-3">İdeal Kilo</h3>
                <p className="text-white/85 leading-relaxed">Devine, Robinson, Miller ve Hamwi formülleriyle sana en uygun ideal kilo aralığını öğren.</p>
                <div className="mt-6 text-sm text-white/70 group-hover:text-white font-semibold uppercase tracking-wider flex items-center gap-1 transition-colors">
                  Hesapla
                  <svg className="w-4 h-4 group-hover:translate-x-1 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg>
                </div>
              </div>
            </Link>

            {/* Deri Kaliper */}
            <Link href="/araclar/deri-kaliper-hesaplayici" className="group relative bg-primary p-10 overflow-hidden transition-all duration-300 hover:scale-[1.02] hover:shadow-xl hover:bg-primary-hover animate-fade-up delay-600">
              {/* Graffiti — kaliper aleti */}
              <svg className="absolute -bottom-4 -right-4 w-40 h-40 text-white/[0.15] group-hover:text-white/[0.25] transition-colors" fill="currentColor" viewBox="0 0 100 100">
                <path d="M25 20 L25 80 L35 80 L35 55 Q50 45 65 55 L65 80 L75 80 L75 20 L65 20 L65 45 Q50 55 35 45 L35 20 Z" />
                <rect x="20" y="15" width="20" height="6" rx="2" />
                <rect x="60" y="15" width="20" height="6" rx="2" />
              </svg>
              <div className="relative">
                <h3 className="text-white font-bold text-xl mb-3">Deri Kaliper</h3>
                <p className="text-white/85 leading-relaxed">Skinfold kaliper ölçümleriyle vücut yağ oranını hesapla, yağsız kütle ve yağ kütleni öğren.</p>
                <div className="mt-6 text-sm text-white/70 group-hover:text-white font-semibold uppercase tracking-wider flex items-center gap-1 transition-colors">
                  Hesapla
                  <svg className="w-4 h-4 group-hover:translate-x-1 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg>
                </div>
              </div>
            </Link>
          </div>
          <div className="mt-10 text-center animate-fade-up delay-700">
            <Link href="/araclar" className="inline-flex items-center gap-2 text-primary hover:underline text-sm font-semibold uppercase tracking-wider">
              Tüm Araçları Gör
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg>
            </Link>
          </div>
        </div>
      </section>

      {/* ==================== DIVIDER 3 (Red accent) ==================== */}
      <div className="bg-primary py-4 overflow-hidden">
        <div className="flex items-center justify-center gap-4 sm:gap-8 font-display text-sm sm:text-base md:text-lg tracking-[0.25em] text-white whitespace-nowrap">
          <span>EN İYİ YATIRIM</span>
          <span className="text-white/40">·</span>
          <span>KENDİNE YAPTIĞINDIR</span>
        </div>
      </div>

      {/* ==================== BLOG ==================== */}
      <section className="relative py-20 sm:py-28 px-4 bg-[#F5F5F5]">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12 animate-fade-up">
            <p className="text-xs uppercase tracking-[0.3em] text-primary font-semibold mb-4">Daha Fazlası</p>
            <h2 className="font-display text-3xl sm:text-4xl md:text-5xl tracking-wider text-[#1A1A1A]">BLOG</h2>
          </div>
          <div className="max-w-md mx-auto">
            <Link href="/blog" className="group bg-white border-2 border-[#E5E5E5] p-8 text-center block transition-all duration-300 hover:scale-[1.03] hover:shadow-xl hover:border-[#CCC] animate-fade-up delay-100">
              <div className="w-14 h-14 bg-[#F0F0F0] flex items-center justify-center mx-auto mb-5 group-hover:bg-[#E8E8E8] transition-colors">
                <svg className="w-7 h-7 text-[#57534E]" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9a2 2 0 00-2-2h-2m-4-3H9M7 16h6M7 8h6v4H7V8z" /></svg>
              </div>
              <h3 className="text-lg font-bold mb-1 text-[#1A1A1A]">Fitness & Sağlık Yazıları</h3>
              <p className="text-sm text-[#57534E]">Antrenman teknikleri, beslenme ve sağlıklı yaşam hakkında yazılar</p>
              <div className="mt-4 text-sm text-primary font-semibold uppercase tracking-wider flex items-center justify-center gap-1">
                Yazıları Oku
                <svg className="w-4 h-4 group-hover:translate-x-1 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg>
              </div>
            </Link>
          </div>
        </div>
      </section>

      {/* ==================== DIVIDER 4 (Red accent) ==================== */}
      <div className="bg-primary py-4 overflow-hidden">
        <div className="flex items-center justify-center gap-4 sm:gap-8 font-display text-sm sm:text-base md:text-lg tracking-[0.25em] text-white whitespace-nowrap">
          <span>GÜÇLÜ OLMAK</span>
          <span className="text-white/40">·</span>
          <span>BİR TERCİHTİR</span>
        </div>
      </div>

      {/* ==================== CONTACT ==================== */}
      <section id="iletisim" className="relative py-20 sm:py-28 px-4 bg-white">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16 animate-fade-up">
            <p className="text-xs uppercase tracking-[0.3em] text-primary font-semibold mb-4">Hemen Ulaşın</p>
            <h2 className="font-display text-3xl sm:text-4xl md:text-5xl tracking-wider text-[#1A1A1A]">İLETİŞİM</h2>
            <p className="text-[#57534E] mt-4">Ücretsiz ön görüşme için hemen ulaşın</p>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6 max-w-3xl mx-auto">
            <a href="https://wa.me/905456814776" target="_blank" rel="noopener noreferrer" className="group bg-[#FAFAFA] border-2 border-[#E5E5E5] p-8 text-center transition-all duration-300 hover:scale-[1.03] hover:shadow-xl hover:border-[#CCC] animate-fade-up delay-100">
              <div className="w-12 h-12 bg-green-500/10 flex items-center justify-center mx-auto mb-4 group-hover:bg-green-500/20 transition-colors">
                <svg className="w-6 h-6 text-green-600" fill="currentColor" viewBox="0 0 24 24"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" /></svg>
              </div>
              <h3 className="font-bold text-[#1A1A1A] mb-1">WhatsApp</h3>
              <p className="text-sm text-[#57534E]">0545 681 4776</p>
            </a>
            <a href="https://instagram.com/hamzasivrikayaa" target="_blank" rel="noopener noreferrer" className="group bg-[#FAFAFA] border-2 border-[#E5E5E5] p-8 text-center transition-all duration-300 hover:scale-[1.03] hover:shadow-xl hover:border-[#CCC] animate-fade-up delay-200">
              <div className="w-12 h-12 bg-pink-500/10 flex items-center justify-center mx-auto mb-4 group-hover:bg-pink-500/20 transition-colors">
                <svg className="w-6 h-6 text-pink-600" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z" /></svg>
              </div>
              <h3 className="font-bold text-[#1A1A1A] mb-1">Instagram</h3>
              <p className="text-sm text-[#57534E]">@hamzasivrikayaa</p>
            </a>
            <a href="tel:+905456814776" className="group bg-[#FAFAFA] border-2 border-[#E5E5E5] p-8 text-center transition-all duration-300 hover:scale-[1.03] hover:shadow-xl hover:border-[#CCC] animate-fade-up delay-300">
              <div className="w-12 h-12 bg-primary/10 flex items-center justify-center mx-auto mb-4 group-hover:bg-primary/20 transition-colors">
                <svg className="w-6 h-6 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" /></svg>
              </div>
              <h3 className="font-bold text-[#1A1A1A] mb-1">Telefon</h3>
              <p className="text-sm text-[#57534E]">0545 681 4776</p>
            </a>
          </div>
        </div>
      </section>

      {/* ==================== FOOTER ==================== */}
      <footer className="py-8 px-4 border-t border-[#E5E5E5] bg-[#FAFAFA]">
        <div className="max-w-6xl mx-auto space-y-4">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="text-sm text-[#57534E]">© 2026 Hamza Sivrikaya. Tüm hakları saklıdır.</div>
            <div className="flex items-center gap-6">
              <Link href="/blog" className="text-sm text-[#57534E] hover:text-[#1A1A1A] transition-colors">Blog</Link>
              <Link href="/login" className="text-sm text-[#57534E] hover:text-[#1A1A1A] transition-colors">Üye Girişi</Link>
            </div>
          </div>
          <div className="flex flex-wrap items-center justify-center gap-4 pt-3 border-t border-[#E5E5E5]">
            <Link href="/yasal/mesafeli-satis-sozlesmesi" className="text-xs text-[#A8A29E] hover:text-[#57534E] transition-colors">Mesafeli Satış Sözleşmesi</Link>
            <Link href="/yasal/gizlilik-politikasi" className="text-xs text-[#A8A29E] hover:text-[#57534E] transition-colors">Gizlilik Politikası</Link>
            <Link href="/yasal/iade-ve-iptal" className="text-xs text-[#A8A29E] hover:text-[#57534E] transition-colors">İade ve İptal</Link>
            <Link href="/yasal/kullanim-kosullari" className="text-xs text-[#A8A29E] hover:text-[#57534E] transition-colors">Kullanım Koşulları</Link>
          </div>
        </div>
      </footer>
    </div>
  )
}
