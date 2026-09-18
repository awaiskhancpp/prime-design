import { PageSections, type PageSectionContext } from '@/components/pages/PageSections'
import { resolvePageBySlug } from '@/lib/pages'
import { resolveAllTestimonials } from '@/lib/testimonialsCollection.server'

/**
 * Testimonials page. Its sections live in the Pages collection (record
 * `testimonials`), so they can be added, reordered and removed from the admin
 * panel like any other page — the same arrangement the homepage, About and
 * Gallery pages use.
 *
 * The reviews themselves are Testimonials collection records passed through
 * the section context, never copied onto the page. That is the direct
 * equivalent of the WordPress page, whose review slider is a Bricks query loop
 * over the `testimonial` post type rather than authored slides.
 */
export async function TestimonialsPage() {
  const page = await resolvePageBySlug('testimonials')
  // The whole set, not just the featured 14: the review wall pages through
  // all of them, 20 at a time.
  const testimonials = await resolveAllTestimonials()

  const context: PageSectionContext = { testimonials }

  return (
    <div className="min-h-screen ">
      <PageSections sections={page?.layout ?? []} context={context} />
    </div>
  )
}
