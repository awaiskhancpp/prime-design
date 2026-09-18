import { Mail, MapPin, Phone } from 'lucide-react'

import website from '../../../website.json'
import { LeadForm } from '@/components/forms/LeadForm'
import { Section } from '@/components/ui/Section'
import { SectionHeader } from '@/components/ui/SectionHeader'
import { HighlightedText } from '@/components/ui/HighlightedText'
import type { PageHeadingContent } from '@/lib/pageSections'
import { richTextToPlainText } from '@/lib/richText'
import { resolveSiteSettings } from '@/lib/siteSettings'

/**
 * `intro` is the plain-text override used by callers whose copy is plain
 * strings rather than Lexical rich text — the landing pages' `contact-form`
 * block, which carries the WordPress eyebrow/heading/description verbatim.
 * When it is supplied it wins over `contactIntro` and over the homepage
 * defaults, so a landing page renders its own copy instead of the
 * homepage's.
 */
export async function HomeContact({
  contactIntro,
  intro,
  id,
}: {
  contactIntro?: PageHeadingContent
  intro?: { eyebrow?: string; heading?: string; description?: string }
  /** Anchor id override; defaults to the homepage's `contact`. */
  id?: string
}) {
  const settings = await resolveSiteSettings()
  const contactDetails = [
    { icon: Mail, label: settings.email, href: settings.emailLink },
    { icon: Phone, label: settings.phone, href: `tel:${settings.phoneClean}` },
    ...settings.addresses.map((item) => ({ icon: MapPin, label: item.address, href: item.link })),
  ]
  const description =
    intro?.description ||
    (contactIntro?.body
      ? richTextToPlainText(contactIntro.body)
      : "If you have any questions or you'd like to find out more about our services, please get in touch.")
  return (
    <Section id={id || 'contact'} className="bg-white">
      <div className="grid gap-12 border border-line p-8 md:p-12 lg:grid-cols-[0.85fr_1.15fr] lg:gap-20">
        <div>
          <SectionHeader
            eyebrow={intro?.eyebrow || contactIntro?.eyebrow || 'Contact'}
            title={
              <HighlightedText
                text={intro?.heading || contactIntro?.heading || website.contactForm.heading}
                highlight={contactIntro?.headingHighlight}
              />
            }
            description={description}
          />

          <div className="mt-8 grid gap-4">
            {contactDetails.map(({ icon: Icon, label, href }) =>
              href ? (
                <a
                  key={label}
                  href={href}
                  className="flex items-center gap-3 text-sm text-ink-2 transition-colors hover:text-brass-deep"
                >
                  <Icon className="h-4 w-4 shrink-0 text-brass" aria-hidden />
                  {label}
                </a>
              ) : (
                <span key={label} className="flex items-center gap-3 text-sm text-ink-2">
                  <Icon className="h-4 w-4 shrink-0 text-brass" aria-hidden />
                  {label}
                </span>
              ),
            )}
          </div>
        </div>

        <LeadForm submitLabel={website.contactForm.submitLabel} messagePlaceholder="Type your message..." />
      </div>
    </Section>
  )
}
