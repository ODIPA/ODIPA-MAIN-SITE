import type { Metadata } from 'next'
import SubscriberAdminDashboard from '@/components/SubscriberAdminDashboard'

export const metadata: Metadata = {
  title: 'Subscribers and Members',
  robots: { index: false, follow: false },
}

export default function AdminSubscribersPage() {
  return <SubscriberAdminDashboard />
}
