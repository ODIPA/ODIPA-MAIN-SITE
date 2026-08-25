import type { Metadata } from 'next'
import InquiriesAdminDashboard from '@/components/InquiriesAdminDashboard'

export const metadata: Metadata = {
  title: 'Inquiry Inbox',
  robots: { index: false, follow: false },
}

export default function AdminInquiriesPage() {
  return <InquiriesAdminDashboard />
}
