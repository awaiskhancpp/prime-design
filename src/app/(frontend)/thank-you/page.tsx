import type { Metadata } from 'next'

import { ThankYouPage } from '@/components/pages/ThankYouPage'

// A post-submission confirmation page has no business in search results —
// the same reasoning as the `noIndex` note on the SEO field.
export const metadata: Metadata = {
  title: 'Thank You | Prime Design & Build',
  description: 'Thanks for getting in touch — a member of our team will be with you shortly.',
  robots: { index: false, follow: true },
}

export default function ThankYouRoute() {
  return <ThankYouPage />
}
