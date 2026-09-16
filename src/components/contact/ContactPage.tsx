import { PageSections, type PageSectionContext } from '@/components/pages/PageSections'
import { resolveConsultations } from '@/lib/consultations'
import { resolvePageBySlug } from '@/lib/pages'
import { resolveSiteSettings } from '@/lib/siteSettings'

/**
 * Contact page. Its sections live in the Pages collection (record `contact`),
 * like the homepage, About, Gallery, Testimonials and FAQ pages.
 *
 * The consultation cards are Consultations records and the phone number comes
 * from Site Settings, both passed through the section context rather than
 * stored on the page — the same split WordPress uses, where the page authors
 * the "Schedule Your Free Consultation" heading and repeats the cards beneath.
 */
export async function ContactPage() {
  const [page, consultations, settings] = await Promise.all([
    resolvePageBySlug('contact'),
    resolveConsultations(),
    resolveSiteSettings(),
  ])

  const context: PageSectionContext = {
    consultations,
    phone: settings.phone,
    phoneClean: settings.phoneClean,
  }

  return (
    <div className="min-h-screen">
      <PageSections sections={page?.layout ?? []} context={context} />
    </div>
  )
}
