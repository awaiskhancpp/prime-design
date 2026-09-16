import { Mail, MapPin, Phone } from 'lucide-react'

import website from '../../../website.json'
import { LeadForm } from '@/components/forms/LeadForm'
import { Section } from '@/components/ui/Section'
import { SectionHeader } from '@/components/ui/SectionHeader'
import { HighlightedText } from '@/components/ui/HighlightedText'
import type { PageHeadingContent } from '@/lib/pageSections'
import { richTextToPlainText } from '@/lib/richText'
import { resolveSiteSettings } from '@/lib/siteSettings'

export async function HomeContact({ contactIntro }: { contactIntro?: PageHeadingContent }) {
  const settings = await resolveSiteSettings()
  const contactDetails = [
    { icon: Mail, label: settings.email, href: settings.emailLink },
    { icon: Phone, label: settings.phone, href: `tel:${settings.phoneClean}` },
    ...settings.addresses.map((item) => ({ icon: MapPin, label: item.address, href: item.link })),
  ]
  const description = contactIntro?.body
    ? richTextToPlainText(contactIntro.body)
    : "If you have any questions or you'd like to find out more about our services, please get in touch."
  return (
    <Section id="contact" className="bg-white">
      <div className="grid gap-12 border border-line p-8 md:p-12 lg:grid-cols-[0.85fr_1.15fr] lg:gap-20">
        <div>
          <SectionHeader
            eyebrow={contactIntro?.eyebrow || 'Contact'}
            title={
              <HighlightedText
                text={contactIntro?.heading || website.contactForm.heading}
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
