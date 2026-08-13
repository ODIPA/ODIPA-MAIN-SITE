import type { Metadata } from 'next'
import NewsletterArchive from '@/components/NewsletterArchive'

export const metadata: Metadata = {
  title: 'Privacy Monthly Digest',
  description:
    'The ODIPA Privacy Monthly Digest. Breach alerts, new privacy laws, practical tips, and free open source tools to protect your data. Read past issues and subscribe.',
  alternates: { canonical: 'https://www.odipa.org/newsletter' },
  openGraph: {
    title: 'ODIPA Privacy Monthly Digest',
    description:
      'Breach alerts, new privacy laws, practical tips, and free open source tools. Written for normal people, not lawyers or engineers. Free, every month.',
    url: 'https://www.odipa.org/newsletter',
    images: ['https://www.odipa.org/og-image.png'],
  },
}

export default function NewsletterPage() {
  return <NewsletterArchive />
}
