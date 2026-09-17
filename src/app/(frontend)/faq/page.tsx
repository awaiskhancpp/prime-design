import type { Metadata } from 'next'

import { FaqPage } from '@/components/faq/FaqPage'
import { JsonLd } from '@/components/seo/JsonLd'
import { resolveFaqIndex } from '@/lib/faqIndex.server'
import { resolvePageBySlug } from '@/lib/pages'
import { richTextToPlainText } from '@/lib/richText'
import { buildSeoMetadata } from '@/lib/seo'
import { breadcrumbSchema, faqSchema, graph } from '@/lib/structuredData'

// CMS-driven SEO: the migrated WordPress (Rank Math) metadata for the `faq`
// page wins; the previous hardcoded strings remain the fallback.
export async function generateMetadata(): Promise<Metadata> {
  const page = await resolvePageBySlug('faq')
  return buildSeoMetadata(
    page?.seo,
    {
      title: 'FAQ | Home Remodeling Services by Prime Design & Build',
      description:
        "Explore FAQs about Prime Design & Build's home remodeling services in Silicon Valley. Find answers to common queries and insights into our process.",
    },
    { path: '/faq' },
  )
}

export default async function FaqRoute() {
  // FAQPage structured data is the one rich result this page can earn, and it
  // has to be built from the same CMS questions the page renders — Google
  // requires the marked-up Q&A to be visible on the page.
  const categories = await resolveFaqIndex()
  const items = categories.flatMap((category) =>
    category.items.map((item) => ({
      question: item.question,
      answer: richTextToPlainText(item.answer),
    })),
  )

  return (
    <>
      <FaqPage />
      <JsonLd
        data={graph(
          faqSchema(items),
          breadcrumbSchema([
            { name: 'Home', path: '/' },
            { name: 'FAQ', path: '/faq' },
          ]),
        )}
      />
    </>
  )
}
