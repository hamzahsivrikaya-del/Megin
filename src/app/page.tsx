import Link from 'next/link'

export default function HomePage() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-background">
      <h1 className="font-display text-7xl font-bold text-primary tracking-tight">
        MEGIN
      </h1>
      <p className="mt-4 text-lg text-text-secondary max-w-md text-center">
        Personal Trainer Platformu — Danışanlarını takip et, ödemelerini kontrol et, antrenman programla.
      </p>
      <div className="mt-8 flex gap-4">
        <Link
          href="/signup"
          className="inline-flex items-center justify-center rounded-xl bg-primary px-6 py-3 text-sm font-medium text-white hover:bg-primary-dark transition-colors"
        >
          Kayıt Ol
        </Link>
        <Link
          href="/login"
          className="inline-flex items-center justify-center rounded-xl border border-border bg-surface px-6 py-3 text-sm font-medium text-text-primary hover:bg-background transition-colors"
        >
          Giriş Yap
        </Link>
      </div>
      <p className="mt-12 text-xs text-text-tertiary">
        Landing page Gürsu tarafından yapılıyor. Bu geçici sayfa.
      </p>
    </div>
  )
}
