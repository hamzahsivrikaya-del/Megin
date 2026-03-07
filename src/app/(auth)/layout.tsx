export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen flex">
      {/* Sol taraf — Branding */}
      <div className="hidden lg:flex lg:w-1/2 relative overflow-hidden items-center justify-center">
        <div className="absolute inset-0 bg-gradient-to-br from-[#DC2626] via-[#E04E2C] to-[#F97316]" />
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-20 left-20 w-72 h-72 rounded-full bg-white/20 blur-3xl" />
          <div className="absolute bottom-20 right-20 w-96 h-96 rounded-full bg-white/10 blur-3xl" />
        </div>
        <div className="relative z-10 text-center px-12">
          <h1 className="font-display text-6xl font-bold text-white tracking-tight mb-4">
            MEGIN
          </h1>
          <p className="text-white/80 text-lg max-w-md mx-auto leading-relaxed">
            Danışanlarını takip et, ödemelerini kontrol et, antrenman programla.
            Tek platform, sınırsız danışan.
          </p>
          <div className="mt-12 flex items-center justify-center gap-8 text-white/60 text-sm">
            <div className="text-center">
              <div className="text-3xl font-display font-bold text-white">500+</div>
              <div>Personal Trainer</div>
            </div>
            <div className="w-px h-12 bg-white/20" />
            <div className="text-center">
              <div className="text-3xl font-display font-bold text-white">10K+</div>
              <div>Danışan</div>
            </div>
            <div className="w-px h-12 bg-white/20" />
            <div className="text-center">
              <div className="text-3xl font-display font-bold text-white">%95</div>
              <div>Memnuniyet</div>
            </div>
          </div>
        </div>
      </div>

      {/* Sağ taraf — Form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-6 sm:p-12">
        <div className="w-full max-w-md">{children}</div>
      </div>
    </div>
  )
}
