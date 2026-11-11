import type { Metadata } from 'next'
import ArticlesPublic from '@/components/ArticlesPublic'

export const metadata: Metadata = {
  title: 'Articles',
  description:
    'Short, plain-language articles from ODIPA on current privacy topics, written for people who are not privacy experts. Free to read and free to subscribe.',
  alternates: { canonical: 'https://www.odipa.org/articles' },
  openGraph: {
    title: 'ODIPA Articles',
    description: 'Short, plain-language articles on current privacy topics from ODIPA.',
    url: 'https://www.odipa.org/articles',
    images: ['https://www.odipa.org/og-image.png'],
  },
}

export default function ArticlesPage() {
  return <ArticlesPublic />
}
