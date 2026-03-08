import type { Metadata } from 'next'
import SponsorForm from '@/components/SponsorForm'

export const metadata: Metadata = {
  title: 'Become a Sponsor',
  description:
    'Partner with ODIPA to champion digital privacy. Explore our corporate sponsorship tiers and submit your interest to join our network of privacy-committed organizations.',
  alternates: { canonical: 'https://odipa.org/become-a-sponsor' },
  openGraph: {
    title: 'Become a Sponsor — ODIPA',
    description: 'Partner with ODIPA to champion digital privacy.',
    url: 'https://odipa.org/become-a-sponsor',
    type: 'website',
  },
}

export default function BecomeASponsor() {
  return <SponsorForm />
}
