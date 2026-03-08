import type { Metadata } from 'next'
import ResearchSponsorForm from '@/components/ResearchSponsorForm'

export const metadata: Metadata = {
  title: 'Sponsor Research — ODIPA',
  description: 'Fund independent privacy research through ODIPA. Choose from Research Brief, Special Investigation, Annual Report Section, or a Custom Research Partnership.',
  alternates: { canonical: 'https://odipa.org/sponsor-research' },
  openGraph: {
    title: 'Sponsor ODIPA Privacy Research',
    description: 'Fund credible, independent research that shapes policy and informs consumers.',
    url: 'https://odipa.org/sponsor-research',
    type: 'website',
  },
}

export default function SponsorResearchPage() {
  return <ResearchSponsorForm />
}
