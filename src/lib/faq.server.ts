import type { RichTextValue } from './richText'

/**
 * A question and its answer, as the service and landing FAQ sections render
 * them. `answer` is Lexical rich text on every record in the FAQs collection
 * (the column is jsonb); the plain-string form stays in the union because the
 * landing sections flatten it for their single-line design.
 *
 * These types used to live in `lib/faq.ts` alongside a hardcoded copy of every
 * question. That file is gone — the FAQs collection is the only source now.
 */
export type FaqItem = { question: string; answer: string | RichTextValue }
export type FaqCategory = { title: string; items: FaqItem[] }

// Which Payload FAQ category feeds each service page. The Q&A itself comes
// from the `faqs` collection — no static copy.
export const serviceFaqCategories: Record<string, { categoryTitle: string }> = {
  'kitchen-remodeling': { categoryTitle: 'Kitchen Remodel Questions' },
  'custom-kitchen': { categoryTitle: 'Custom Kitchen Questions' },
  'european-kitchen': { categoryTitle: 'European Kitchen Questions' },
  'shaker-kitchen': { categoryTitle: 'Shaker Kitchen Questions' },
  'bathroom-remodeling': { categoryTitle: 'Bathroom Remodel Questions' },
  'home-remodeling': { categoryTitle: 'Home Remodel Questions' },
  'complete-renovation': { categoryTitle: 'Complete Renovations Questions' },
  adu: { categoryTitle: 'ADU Questions' },
  additions: { categoryTitle: 'Room Additions Questions' },
  finance: { categoryTitle: 'Finance Questions' },
}

export async function getFaqItems(categoryTitle: string): Promise<FaqItem[]> {
  if (!process.env.DATABASE_URL) return []
  try {
    const { getPayload } = await import('payload')
    const configPromise = (await import('@payload-config')).default
    const payload = await getPayload({ config: configPromise })
    const category = await payload.find({
      collection: 'faq-categories',
      where: { title: { equals: categoryTitle } },
      depth: 0,
      limit: 1,
    })
    const catId = (category.docs[0] as { id?: number | string } | undefined)?.id
    if (!catId) return []
    const faqs = await payload.find({
      collection: 'faqs',
      where: { category: { equals: catId } },
      sort: 'sortOrder',
      depth: 0,
      limit: 200,
    })
    return (faqs.docs as Array<{ question?: string; answer?: unknown }>)
      .filter((doc) => doc.question && doc.answer)
      .map((doc) => ({ question: doc.question as string, answer: doc.answer as RichTextValue }))
  } catch {
    return []
  }
}
