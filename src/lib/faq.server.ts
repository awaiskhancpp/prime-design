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

/**
 * Specific questions, in the order given.
 *
 * Used by a page whose FAQ section runs in a different order from the
 * category's own — see `faqOrderField`. Payload returns the matched records in
 * its own order, so they are re-sorted here into the order that was asked for;
 * an id that no longer exists is simply absent rather than leaving a hole.
 */
export async function getFaqItemsById(ids: Array<number | string>): Promise<FaqItem[]> {
  if (!process.env.DATABASE_URL || !ids.length) return []
  try {
    const { getPayload } = await import('payload')
    const configPromise = (await import('@payload-config')).default
    const payload = await getPayload({ config: configPromise })
    const faqs = await payload.find({
      collection: 'faqs',
      where: { id: { in: ids } },
      depth: 0,
      limit: 200,
    })
    const byId = new Map(
      (faqs.docs as Array<{ id: number | string; question?: string; answer?: unknown }>).map(
        (doc) => [String(doc.id), doc],
      ),
    )
    return ids
      .map((id) => byId.get(String(id)))
      .filter((doc): doc is { id: number | string; question: string; answer: unknown } =>
        Boolean(doc?.question && doc?.answer),
      )
      .map((doc) => ({ question: doc.question, answer: doc.answer as RichTextValue }))
  } catch (error) {
    console.error('getFaqItemsById: could not load the ordered FAQs', error)
    return []
  }
}

/** Every question in one FAQ category, in the category's own `sortOrder`. */
export async function getFaqItemsForCategory(categoryId: number | string): Promise<FaqItem[]> {
  if (!process.env.DATABASE_URL) return []
  try {
    const { getPayload } = await import('payload')
    const configPromise = (await import('@payload-config')).default
    const payload = await getPayload({ config: configPromise })
    const faqs = await payload.find({
      collection: 'faqs',
      where: { category: { equals: categoryId } },
      sort: 'sortOrder',
      depth: 0,
      limit: 200,
    })
    return (faqs.docs as Array<{ question?: string; answer?: unknown }>)
      .filter((doc) => doc.question && doc.answer)
      .map((doc) => ({ question: doc.question as string, answer: doc.answer as RichTextValue }))
  } catch (error) {
    console.error(`getFaqItemsForCategory: could not load FAQs for category ${categoryId}`, error)
    return []
  }
}

/** Every question in the category with this title (the landing pages' FAQ blocks name it). */
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
    return catId ? getFaqItemsForCategory(catId) : []
  } catch (error) {
    console.error(`getFaqItems: could not load FAQs for category "${categoryTitle}"`, error)
    return []
  }
}
