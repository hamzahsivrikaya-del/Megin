import type { Metadata, Viewport } from 'next'
import { Geist, Geist_Mono, Teko, Oswald, Lora, Space_Mono, Nunito } from 'next/font/google'
import ServiceWorkerRegistration from '@/components/shared/ServiceWorkerRegistration'
import SilentErrorTracker from '@/components/shared/SilentErrorTracker'
import './globals.css'

const geistSans = Geist({
  variable: '--font-geist-sans',
  subsets: ['latin'],
})

const geistMono = Geist_Mono({
  variable: '--font-geist-mono',
  subsets: ['latin'],
})

const teko = Teko({
  variable: '--font-display',
  subsets: ['latin', 'latin-ext'],
  weight: ['400', '700'],
})

const oswald = Oswald({
  variable: '--font-oswald',
  subsets: ['latin'],
})

const lora = Lora({
  variable: '--font-lora',
  subsets: ['latin'],
})

const spaceMono = Space_Mono({
  variable: '--font-space-mono',
  subsets: ['latin', 'latin-ext'],
  weight: ['400', '700'],
})

const nunito = Nunito({
  variable: '--font-nunito',
  subsets: ['latin', 'latin-ext'],
  weight: ['600', '700', '800', '900'],
})

export const metadata: Metadata = {
  title: {
    default: 'Megin — The Platform for Personal Trainers',
    template: '%s | Megin',
  },
  description: 'Client tracking, workout programming, nutrition management — all in one platform.',
  manifest: '/manifest.json',
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'),
  appleWebApp: {
    capable: true,
    statusBarStyle: 'black-translucent',
    title: 'Megin',
  },
}

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  themeColor: '#DC2626',
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en">
      <head>
        <link rel="apple-touch-icon" href="/icons/icon-192.png" />
      </head>
      <body className={`${geistSans.variable} ${geistMono.variable} ${teko.variable} ${oswald.variable} ${lora.variable} ${spaceMono.variable} ${nunito.variable} min-h-screen bg-background text-text-primary antialiased`}>
        {children}
        <SilentErrorTracker />
        <ServiceWorkerRegistration />
      </body>
    </html>
  )
}
