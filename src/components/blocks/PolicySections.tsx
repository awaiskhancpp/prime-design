import { Section } from '@/components/ui/Section'
import type { PagePolicyContent } from '@/lib/pageSections'
import { resolveSiteSettings } from '@/lib/siteSettings'

/**
 * A numbered legal document: an opening paragraph, numbered sections each
 * holding one or more paragraphs, and the company's contact details at the
 * foot.
 *
 * The numbers come from the array order rather than the CMS, so inserting a
 * section renumbers the rest instead of leaving two sections claiming to be 4.
 *
 * The contact details are read from Site Settings, not stored with the policy.
 * The migrated WordPress text named "Prime Kitchens" at an address the company
 * left, and a policy is the last place on a site that should be able to drift
 * out of step with where the company actually is.
 */
export async function PolicySections({ content }: { content: PagePolicyContent }) {
  const settings = content.showContactDetails ? await resolveSiteSettings() : undefined
  const address = settings?.addresses?.[0]?.address

  return (
    <Section className="bg-white">
      <div className="mx-auto max-w-4xl">
        {content.intro ? (
          <p className="text-base leading-7 text-ink-2/75">{content.intro}</p>
        ) : null}

        <ol className="mt-12 grid gap-12">
          {content.sections.map((section, sectionIndex) => (
            <li key={section.title} id={`section-${sectionIndex + 1}`}>
              <h2 className="font-display text-2xl font-medium text-ink md:text-3xl">
                <span className="text-brass">{sectionIndex + 1}.</span> {section.title}
              </h2>
              <div className="mt-4 grid gap-4">
                {section.paragraphs.map((paragraph, index) => (
                  <p key={index} className="text-base leading-7 text-ink-2/75">
                    {paragraph.lead ? (
                      <span className="font-semibold text-ink-2">{paragraph.lead} </span>
                    ) : null}
                    {paragraph.body}
                  </p>
                ))}
              </div>
            </li>
          ))}
        </ol>

        {settings ? (
          <div className="mt-4 border-t border-line pt-8">
            <p className="text-base leading-7 text-ink-2/75">
              {settings.name}
              {address ? (
                <>
                  <br />
                  Address: {address}
                </>
              ) : null}
              {settings.email ? (
                <>
                  <br />
                  Email: {settings.email}
                </>
              ) : null}
            </p>
          </div>
        ) : null}
      </div>
    </Section>
  )
}
