import type { Metadata } from 'next'

import { buildSeoMetadata } from '@/lib/seo'
import { resolvePageBySlug } from '@/lib/pages'

import { ContactPage } from '@/components/contact/ContactPage'

// The `contact` page record drives this; the WordPress (Rank Math) title and
// description are the fallback so the page is correct even before the CMS
// fields are filled.
export async function generateMetadata(): Promise<Metadata> {
  const page = await resolvePageBySlug('contact')
  return buildSeoMetadata(
    page?.seo,
    {
      title: 'Contact Prime Design & Build | Home Remodeling Experts in Silicon Valley',
      description:
        'Contact Prime Design & Build for expert remodeling services in Silicon Valley. Schedule your free consultation today and start transforming your home. Reach out now!',
    },
    { path: '/contact' },
  )
}

export default function ContactRoute() {
  return <ContactPage />
}
