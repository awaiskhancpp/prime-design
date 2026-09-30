import { FaqExplorer } from '@/components/faq/FaqExplorer'
import { getFaqItems, getFaqItemsById } from '@/lib/faq.server'
import { richTextToPlainText, type RichTextValue } from '@/lib/richText'
import type { FaqIndexCategory } from '@/lib/faqIndex.server'

type ResolvedCategory = {
  title: string
  /** FAQs-collection ids, in the order this page shows them. */
  faqOrder?: Array<number | string>
  items: Array<{ question: string; answer: string }>
}

/** A plain string answer, wrapped so `RichTextContent` can render it. */
const asRichText = (value: string): RichTextValue => ({
  root: {
    children: [
      {
        type: 'paragraph',
        version: 1,
        children: [{ type: 'text', text: value, version: 1, format: 0, mode: 'normal' }],
      },
    ],
  },
})

/** `Kitchen Remodel Questions` -> `kitchen-remodel-questions`. */
const slugify = (value: string) =>
  value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '')

/**
 * Landing-page FAQ block.
 *
 * A block may author its own questions inline. When it only names a category,
 * the questions are read from the FAQs collection by that category's title —
 * the same records the FAQ page and the service pages use. This used to fall
 * back to a hardcoded copy of every question in `lib/faq.ts`, which meant a
 * landing page could render answers that no longer matched the CMS.
 *
 * It renders `FaqExplorer` — the same component `/faq` uses — rather than the
 * landing pages' own accordion. The content is untouched: the same categories,
 * the same questions, in the same order. What changes is the presentation, and
 * two things come with it that the landing accordion did not have. Answers
 * keep their rich text instead of being flattened to a single line, so a list
 * inside an answer renders as a list rather than as one run-on paragraph. And
 * opening a question holds that question still on screen instead of shoving
 * the page down under the reader.
 *
 * `searchText` is filled in below because `FaqIndexItem` asks for it, not
 * because anything reads it: `FaqExplorer` has no search box. The field is
 * part of that type's contract and is left correct rather than stubbed.
 *
 * `LandingFaqSection`, the accordion this replaced, has been deleted — the
 * project owner asked for it removed once nothing referenced it any more.
 */
export async function LandingFaqBlockSection({
  heading,
  description,
  categories,
}: {
  heading?: string
  description?: string
  categories: ResolvedCategory[]
}) {
  const resolved: FaqIndexCategory[] = (
    await Promise.all(
      categories.map(async (category, index) => {
        /**
         * Inline answers arrive as plain strings; collection answers arrive as
         * Lexical and are passed through untouched. The old component took a
         * single line of copy, so this flattened everything on the way in —
         * which quietly dropped the bullet lists out of the longer answers.
         */
        const items = category.items.length
          ? category.items.map((item) => ({
              question: item.question,
              answer: asRichText(item.answer),
              searchText: `${item.question} ${item.answer}`.toLowerCase(),
            }))
          : (category.faqOrder?.length
              ? await getFaqItemsById(category.faqOrder)
              : await getFaqItems(category.title)
            )
              .filter((item) => item.question && item.answer)
              .map((item) => {
                const answer =
                  typeof item.answer === 'string' ? asRichText(item.answer) : item.answer
                return {
                  question: item.question,
                  answer,
                  searchText:
                    `${item.question} ${typeof item.answer === 'string' ? item.answer : richTextToPlainText(item.answer)}`.toLowerCase(),
                }
              })

        const slug = slugify(category.title) || `category-${index + 1}`

        return {
          id: slug,
          title: category.title,
          slug,
          // Ids only have to be unique within the page; the block has no
          // record ids of its own when its questions are authored inline.
          items: items.map((item, position) => ({ ...item, id: `${slug}-${position}` })),
        }
      }),
    )
  ).filter((category) => category.items.length)

  if (!resolved.length) return null

  return <FaqExplorer content={{ heading, description }} categories={resolved} />
}
