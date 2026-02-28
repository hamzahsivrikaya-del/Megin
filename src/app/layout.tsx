import type { Metadata, Viewport } from 'next'
import { Geist, Geist_Mono, Teko, Oswald, Lora, Space_Mono, Nunito } from 'next/font/google'
import ServiceWorkerRegistration from '@/components/shared/ServiceWorkerRegistration'
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
  title: 'Hamza Sivrikaya | Kişisel Antrenör',
  description: 'Hamza Sivrikaya - Kişisel Antrenör | Üye takip sistemi',
  manifest: '/manifest.json',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'black-translucent',
    title: 'Hamza Sivrikaya',
  },
}

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  themeColor: '#0A0A0A',
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="tr">
      <head>
        <link rel="apple-touch-icon" href="/icons/icon-192.png" />
      </head>
      <body className={`${geistSans.variable} ${geistMono.variable} ${teko.variable} ${oswald.variable} ${lora.variable} ${spaceMono.variable} ${nunito.variable} antialiased`}>
        {children}
        <ServiceWorkerRegistration />
      </body>
    </html>
  )
}
