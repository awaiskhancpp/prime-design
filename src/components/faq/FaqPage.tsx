import { PageSections, type PageSectionContext } from '@/components/pages/PageSections'
import { resolvePageBySlug } from '@/lib/pages'
import { resolveFaqIndex } from '@/lib/faqIndex.server'

/**
 * FAQ page. Its sections live in the Pages collection (record `faq`), like the
 * homepage, About, Gallery and Testimonials pages, so the hero and the index's
 * copy are editable in the admin.
 *
 * The questions are FAQs collection records grouped by their FAQ Category
 * relationship and passed through the section context — never copied onto the
 * page. That is the same split WordPress uses, where this page is an authored
 * hero plus a Bricks query loop (`{term_name} Questions` -> `{post_title}` /
 * `{post_content}`) over the FAQ taxonomy, and it is why the service pages can
 * reuse the very same records.
 */
export async function FaqPage() {
  const page = await resolvePageBySlug('faq')
  const faqCategories = await resolveFaqIndex()

  const context: PageSectionContext = { faqCategories }

  return (
    <div className="min-h-screen">
      <PageSections sections={page?.layout ?? []} context={context} />
    </div>
  )
}
