import type { Metadata } from 'next'

import { NotFoundPage } from '@/components/errors/NotFoundPage'

export const metadata: Metadata = {
  title: 'Page Not Found | Prime Design & Build',
  description: "The page you're looking for doesn't exist or may have moved.",
  robots: { index: false, follow: false },
}

export default function NotFound() {
  return <NotFoundPage />
}
