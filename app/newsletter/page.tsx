import type { Metadata } from 'next'
import NewsletterArchive from '@/components/NewsletterArchive'

export const metadata: Metadata = {
  title: 'Privacy Monthly Digest',
  description:
    'The ODIPA Privacy Monthly Digest. Breach alerts, new privacy laws, practical tips, and free open source tools to protect your data. Read past issues and subscribe.',
  alternates: { canonical: 'https://www.odipa.org/newsletter' },
}

export default function NewsletterPage() {
  return <NewsletterArchive />
}
