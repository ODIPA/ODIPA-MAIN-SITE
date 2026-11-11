import type { Metadata } from 'next'
import ArticlesAdminDashboard from '@/components/ArticlesAdminDashboard'

export const metadata: Metadata = {
  title: 'Articles Dashboard',
  robots: { index: false, follow: false },
}

export default function AdminArticlesPage() {
  return <ArticlesAdminDashboard />
}
