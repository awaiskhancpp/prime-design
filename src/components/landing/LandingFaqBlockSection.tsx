import { getFaqItems } from '@/lib/faq.server'
import { richTextToPlainText } from '@/lib/richText'
import { LandingFaqSection } from './LandingFaqSection'

type ResolvedCategory = { title: string; items: Array<{ question: string; answer: string }> }

/**
 * Landing-page FAQ block.
 *
 * A block may author its own questions inline. When it only names a category,
 * the questions are read from the FAQs collection by that category's title —
 * the same records the FAQ page and the service pages use. This used to fall
 * back to a hardcoded copy of every question in `lib/faq.ts`, which meant a
 * landing page could render answers that no longer matched the CMS.
 *
 * `LandingFaqSection`'s design is a single line of copy per answer, so the
 * Lexical rich text is flattened here rather than in the collection.
 */
export async function LandingFaqBlockSection({
  heading,
  categories,
}: {
  heading?: string
  categories: ResolvedCategory[]
}) {
  const resolved = await Promise.all(
    categories.map(async (category) => {
      if (category.items.length) return category
      const items = await getFaqItems(category.title)
      return {
        title: category.title,
        items: items
          .map((item) => ({
            question: item.question,
            answer: richTextToPlainText(item.answer),
          }))
          .filter((item) => item.question && item.answer),
      }
    }),
  )

  return (
    <LandingFaqSection
      heading={heading}
      categories={resolved.filter((category) => category.items.length)}
    />
  )
}
