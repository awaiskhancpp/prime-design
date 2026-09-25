import type { Metadata } from 'next'

import { buildSeoMetadata } from '@/lib/seo'
import { resolvePageBySlug } from '@/lib/pages'

import { ThankYouPage } from '@/components/pages/ThankYouPage'

// CMS-driven SEO, with one guard the other pages do not need: if the record
// is ever missing, `noIndex` defaults to true rather than to the collection
// default. A post-submission confirmation page has no business in search
// results (the same reasoning as the `noIndex` note on the SEO field), and a
// deleted record must not be able to quietly start indexing it. With the
// record present, the CMS value decides.
export async function generateMetadata(): Promise<Metadata> {
  const page = await resolvePageBySlug('thank-you')
  return buildSeoMetadata(
    page?.seo ?? { noIndex: true },
    {
      title: 'Thank You | Prime Design & Build',
      description: 'Thanks for getting in touch — a member of our team will be with you shortly.',
    },
    { path: '/thank-you' },
  )
}

export default function ThankYouRoute() {
  return <ThankYouPage />
}
