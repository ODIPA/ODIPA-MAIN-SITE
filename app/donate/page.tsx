import type { Metadata } from 'next'
import DonateWidget from '@/components/DonateWidget'

export const metadata: Metadata = {
  title: 'Donate',
  description:
    'Support ODIPA\'s mission to protect consumer privacy. Your tax-deductible donation funds free education, policy advocacy, open-source tools, and research — 100% in service of the public.',
  alternates: { canonical: 'https://odipa.org/donate' },
  openGraph: {
    title: 'Donate to ODIPA — Support Digital Privacy for Everyone',
    description:
      'Your tax-deductible donation funds free privacy education, advocacy, and open-source tools for the public.',
    url: 'https://odipa.org/donate',
    type: 'website',
  },
}

export default function DonatePage() {
  return <DonateWidget />
}
