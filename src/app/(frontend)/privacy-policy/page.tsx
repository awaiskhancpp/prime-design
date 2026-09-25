import type { Metadata } from 'next'

import { buildSeoMetadata } from '@/lib/seo'
import { resolvePageBySlug } from '@/lib/pages'

import { PrivacyPolicyPage } from '@/components/legal/PrivacyPolicyPage'

// CMS-driven SEO: the migrated WordPress (Rank Math) metadata for the
// `privacy-policy` page wins; the previous hardcoded strings remain the
// fallback.
export async function generateMetadata(): Promise<Metadata> {
  const page = await resolvePageBySlug('privacy-policy')
  return buildSeoMetadata(
    page?.seo,
    {
      title: 'Privacy Policy | Prime Design & Build',
      description:
        "Read Prime Kitchens' Privacy Policy to understand how we collect, use, and protect your personal information when you visit our website or use our services.",
    },
    { path: '/privacy-policy' },
  )
}

export default function PrivacyPolicyRoute() {
  return <PrivacyPolicyPage />
}
