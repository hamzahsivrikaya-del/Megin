import type { Metadata } from 'next'
import ContactForm from './ContactForm'
import { en } from '@/lib/i18n/en'

export const metadata: Metadata = {
  title: 'Contact — Megin',
  description:
    'Get in touch with the Megin team. Questions, partnerships, or feedback — we read every message and reply within 1–2 business days.',
  openGraph: {
    title: 'Contact — Megin',
    description: 'Get in touch with the Megin team.',
    type: 'website',
  },
}

export default function ContactPage() {
  return <ContactForm t={en} />
}
