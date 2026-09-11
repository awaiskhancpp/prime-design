import { serviceFaqCategories, getFaqItems } from '@/lib/faq.server'
import { ServiceFaq } from './ServiceFaq'

// Server-side FAQ loader: pulls the Q&A from the Payload `faqs` collection
// (grouped by the service's FAQ category) so FAQ content is CMS-editable.
export async function ServiceFaqLoader({ slug }: { slug: string }) {
  const entry = serviceFaqCategories[slug]
  if (!entry) return null
  const items = await getFaqItems(entry.categoryTitle)
  if (!items.length) return null
  return <ServiceFaq items={items} />
}
