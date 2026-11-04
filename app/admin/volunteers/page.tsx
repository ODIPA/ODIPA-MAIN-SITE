import type { Metadata } from 'next'
import VolunteersAdminDashboard from '@/components/VolunteersAdminDashboard'

export const metadata: Metadata = {
  title: 'Volunteers Dashboard',
  robots: { index: false, follow: false },
}

export default function AdminVolunteersPage() {
  return <VolunteersAdminDashboard />
}
