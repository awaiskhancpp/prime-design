import { serviceFaqCategories, getFaqItems, getFaqItemsById } from '@/lib/faq.server'
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
  faqOrder,
}: {
  slug: string
  heading?: string
  description?: string
  /**
   * The section's own question order, from the CMS block, for a page that
   * runs the category in a different order from /faq. Empty on every page but
   * Home Remodeling — see `faqOrderField`.
   */
  faqOrder?: Array<number | string>
}) {
  // An explicit order wins, and names its own questions; otherwise the whole
  // category comes through in its own `sortOrder`.
  const items = faqOrder?.length
    ? await getFaqItemsById(faqOrder)
    : await (async () => {
        const entry = serviceFaqCategories[slug]
        return entry ? getFaqItems(entry.categoryTitle) : []
      })()
  if (!items.length) return null
  return <ServiceFaq items={items} heading={heading} description={description} />
}
