import type { Metadata } from 'next'

import { TestimonialsPage } from '@/components/testimonials/TestimonialsPage'

export const metadata: Metadata = {
  title: 'Testimonials | Prime Design & Build',
  description: 'Read reviews from homeowners who worked with Prime Design & Build across Silicon Valley.',
}

export default function TestimonialsRoute() {
  return <TestimonialsPage />
}
