import { serviceFaqCategories, getFaqItems } from '@/lib/faq.server'
import { ServiceFaq } from './ServiceFaq'

// Server-side FAQ loader: pulls the Q&A from the Payload `faqs` collection
// (grouped by the service's FAQ category) so FAQ content is CMS-editable.
// `heading`/`description` come from the service's `sections[blockType=faq]`
// CMS block (see ServiceSectionRenderer) — pass them through rather than
// hardcoding, since that block's copy is real, migrated WordPress content.
export async function ServiceFaqLoader({
  slug,
  heading,
  description,
}: {
  slug: string
  heading?: string
  description?: string
}) {
  const entry = serviceFaqCategories[slug]
  if (!entry) return null
  const items = await getFaqItems(entry.categoryTitle)
  if (!items.length) return null
  return <ServiceFaq items={items} heading={heading} description={description} />
}
