import { PageHero } from '@/components/layout/PageHero'
import { PageSections } from '@/components/pages/PageSections'
import { resolvePageBySlug } from '@/lib/pages'

import { LandscapingServiceAreas } from '../blocks/LandscapingServiceAreas'

/**
 * `/privacy-policy`.
 *
 * The policy itself is a `policy` block on the `privacy-policy` page record —
 * hero, opening paragraph, eight numbered sections and the contact details at
 * the foot. It used to be 178 lines of `const sections: PolicySection[]` here,
 * which meant nobody could correct a word of the site's own legal text without
 * a deploy. `scripts/seed-utility-page-content.ts` put the migrated WordPress
 * wording into the CMS.
 *
 * The closing contact details are not part of that copy: `PolicySections`
 * reads them from Site Settings, so the policy names the company and address
 * the rest of the site does.
 */
export async function PrivacyPolicyPage() {
  const page = await resolvePageBySlug('privacy-policy')

  return (
    <div className="min-h-screen bg-white">
      <PageHero
        eyebrow={page?.hero?.eyebrow}
        title={page?.hero?.heading || page?.title || 'Privacy Policy'}
        description={page?.hero?.description}
        image={page?.hero?.image}
        imageAlt={page?.title || 'Prime Design & Build project'}
        align="center"
      />

      <main>
        <PageSections sections={page?.layout ?? []} context={{}} />
      </main>

      <LandscapingServiceAreas />
    </div>
  )
}
