import { getPayload } from 'payload'
import configPromise from '@payload-config'

import { richTextToPlainText, type RichTextValue } from './richText'

/**
 * The FAQ page's questions, grouped by category.
 *
 * WordPress builds this page from a Bricks query loop — `{term_name}
 * Questions` over the FAQ taxonomy, then `{post_title}` / `{post_content}` per
 * question. This is the Payload equivalent: the FAQs collection grouped by its
 * `category` relationship to FAQ Categories. Nothing here is page content, so
 * the same questions can feed the service pages without being duplicated.
 */
export type FaqIndexItem = {
  id: string
  question: string
  answer: RichTextValue
  /** Flattened question + answer, so the client can filter without Lexical. */
  searchText: string
}

export type FaqIndexCategory = {
  id: string
  title: string
  slug: string
  items: FaqIndexItem[]
}

type CategoryDoc = { id: number | string; title?: string | null; slug?: string | null }
type FaqDoc = {
  id: number | string
  question?: string | null
  answer?: unknown
  category?: CategoryDoc | number | string | null
}

const categoryId = (value: FaqDoc['category']) =>
  value && typeof value === 'object' ? String(value.id) : value != null ? String(value) : null

/**
 * Every visible FAQ, grouped into its category and ordered by `sortOrder`.
 * Categories with no visible questions are dropped so the page never renders
 * an empty heading. Returns an empty list when there is no database — the
 * section then renders its own copy with no questions rather than falling back
 * to hardcoded ones.
 */
export async function resolveFaqIndex(): Promise<FaqIndexCategory[]> {
  if (!process.env.DATABASE_URL) return []
  try {
    const payload = await getPayload({ config: configPromise })

    const [categories, faqs] = await Promise.all([
      payload.find({ collection: 'faq-categories', depth: 0, limit: 200, sort: 'title' }),
      payload.find({
        collection: 'faqs',
        where: { visible: { equals: true } },
        sort: 'sortOrder',
        depth: 1,
        limit: 500,
      }),
    ])

    const grouped = new Map<string, FaqIndexItem[]>()
    for (const doc of faqs.docs as FaqDoc[]) {
      if (!doc.question || !doc.answer) continue
      const key = categoryId(doc.category)
      if (!key) continue
      const item: FaqIndexItem = {
        id: String(doc.id),
        question: doc.question,
        answer: doc.answer as RichTextValue,
        searchText: `${doc.question} ${richTextToPlainText(doc.answer)}`.toLowerCase(),
      }
      const bucket = grouped.get(key)
      if (bucket) bucket.push(item)
      else grouped.set(key, [item])
    }

    return (categories.docs as CategoryDoc[])
      .filter((category) => category.title && grouped.get(String(category.id))?.length)
      .map((category) => ({
        id: String(category.id),
        title: category.title as string,
        slug: category.slug || String(category.id),
        items: grouped.get(String(category.id)) as FaqIndexItem[],
      }))
  } catch (error) {
    console.error('resolveFaqIndex: could not load FAQ categories or questions', error)
    return []
  }
}
