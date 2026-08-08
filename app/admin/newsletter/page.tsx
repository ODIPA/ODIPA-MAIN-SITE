import type { Metadata } from 'next'
import NewsletterAdminDashboard from '@/components/NewsletterAdminDashboard'

export const metadata: Metadata = {
  title: 'Newsletter Dashboard',
  robots: { index: false, follow: false },
}

export default function AdminNewsletterPage() {
  return <NewsletterAdminDashboard />
}
