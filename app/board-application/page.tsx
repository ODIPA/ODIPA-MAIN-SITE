import type { Metadata } from 'next'
import BoardApplicationForm from '@/components/BoardApplicationForm'

export const metadata: Metadata = {
  title: 'Board of Directors — Apply',
  description: 'Apply for an open seat on the ODIPA Board of Directors. We are seeking qualified individuals for Vice Chair, Secretary, Treasurer, and two Director roles.',
  alternates: { canonical: 'https://odipa.org/board-application' },
}

export default function BoardApplicationPage() {
  return <BoardApplicationForm />
}
