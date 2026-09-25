import { Check, CalendarDays, Phone } from 'lucide-react'

import { UtilityHero } from '@/components/layout/UtilityHero'
import { Button } from '@/components/ui/Button'
import { PageSections } from '@/components/pages/PageSections'
import { resolvePageBySlug } from '@/lib/pages'
import { resolveSiteSettings } from '@/lib/siteSettings'

/**
 * `/thank-you` — the page a submitted enquiry lands on.
 *
 * WordPress has this page with a heading and two sentences and nothing else.
 * The confirmation, the "What happens next" list and the "In the meantime"
 * links were written for this site, and until now they were written in this
 * file; they are now the page record's `hero`, a `next-steps` block and a
 * `link-list` block, so they can be edited without a deploy.
 *
 * The phone number still comes from Site Settings rather than the page, so it
 * stays in step with the header and footer rather than being a second copy.
 */
export async function ThankYouPage() {
  const [page, settings] = await Promise.all([resolvePageBySlug('thank-you'), resolveSiteSettings()])
  const hero = page?.hero
  const phone = settings.phone

  return (
    // `data-light-chrome`: plain white page, no dark hero — recolours the
    // overlaid header, including `SiteHeader`'s mobile bar, which ignores the
    // `tone` prop `FrontendTemplate` otherwise gets right for `/thank-you`.
    // See the CSS rule in `styles.css`.
    <div data-light-chrome className="min-h-screen bg-white">
      <UtilityHero
        eyebrow={hero?.eyebrow}
        display={
          <span
            className="flex h-20 w-20 items-center justify-center rounded-full border border-brass text-brass md:h-24 md:w-24"
            aria-hidden
          >
            <Check className="h-9 w-9 md:h-11 md:w-11" strokeWidth={1.5} />
          </span>
        }
        title={hero?.heading || page?.title || 'Thank you'}
        description={hero?.description}
      >
        {hero?.cta?.label ? (
          <Button href={hero.cta.href || '/contact'} variant="primary" size="lg">
            <CalendarDays className="h-4 w-4" aria-hidden />
            {hero.cta.label}
          </Button>
        ) : null}
        {phone ? (
          <Button href={`tel:${phone.replace(/[^\d+]/g, '')}`} variant="outline" size="lg">
            <Phone className="h-4 w-4" aria-hidden />
            {phone}
          </Button>
        ) : null}
      </UtilityHero>

      <PageSections sections={page?.layout ?? []} context={{}} />
    </div>
  )
}
