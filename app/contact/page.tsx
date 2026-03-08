import type { Metadata } from 'next'
import { Suspense } from 'react'
import ContactForm from '@/components/ContactForm'

export const metadata: Metadata = {
  title: 'Contact Us',
  description: 'Get in touch with ODIPA — questions about our programs, volunteering, partnerships, press inquiries, or anything else. We respond within 2 business days.',
  alternates: { canonical: 'https://odipa.org/contact' },
  openGraph: {
    title: 'Contact ODIPA',
    description: 'Reach our team with questions about privacy education, volunteering, partnerships, or press inquiries.',
    url: 'https://odipa.org/contact',
    type: 'website',
  },
}

export default function ContactPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-cream" />}>
      <ContactForm />
    </Suspense>
  )
}
