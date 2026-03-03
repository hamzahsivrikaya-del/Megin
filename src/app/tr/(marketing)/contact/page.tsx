import type { Metadata } from 'next'
import ContactForm from '@/app/(marketing)/contact/ContactForm'

export const metadata: Metadata = {
  title: 'İletişim — Megin',
  description:
    'Megin ekibiyle iletişime geçin. Sorular, ortaklıklar veya geri bildirim — her mesajı okuyoruz ve 1-2 iş günü içinde yanıtlıyoruz.',
  openGraph: {
    title: 'İletişim — Megin',
    description: 'Megin ekibiyle iletişime geçin.',
    type: 'website',
  },
  alternates: {
    languages: {
      en: '/contact',
      tr: '/tr/contact',
    },
  },
}

export default function TurkishContactPage() {
  return <ContactForm />
}
