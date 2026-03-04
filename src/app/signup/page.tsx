import type { Metadata } from 'next'
import SignupForm from './SignupForm'

export const metadata: Metadata = {
  title: 'Sign Up — Megin',
  description:
    'Create your free Megin account. Manage clients, track progress, and grow your coaching business — free for up to 5 clients, no credit card required.',
  openGraph: {
    title: 'Sign Up — Megin',
    description: 'Free for up to 5 clients. No credit card required.',
    type: 'website',
  },
}

export default function SignupPage() {
  return <SignupForm />
}
