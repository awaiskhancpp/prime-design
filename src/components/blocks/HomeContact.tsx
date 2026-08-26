import { Mail, MapPin, Phone } from 'lucide-react'

import website from '../../../website.json'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Section } from '@/components/ui/Section'
import { SectionHeader } from '@/components/ui/SectionHeader'
import { Textarea } from '@/components/ui/Textarea'

const contactDetails = [
  { icon: Mail, label: website.header.email, href: `mailto:${website.header.email}` },
  {
    icon: Phone,
    label: website.footer.phone,
    href: `tel:${website.footer.phone.replace(/[^\d+]/g, '')}`,
  },
  { icon: MapPin, label: website.footer.addresses[0], href: undefined },
]

export function HomeContact() {
  return (
    <Section id="contact" className="bg-white">
      <div className="grid gap-12  border border-line  p-8 md:p-12 lg:grid-cols-[0.85fr_1.15fr] lg:gap-20">
        <div>
          <SectionHeader
            eyebrow="Contact"
            title={website.contactForm.heading}
            description="If you have any questions or you'd like to find out more about our services, please get in touch."
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

        <form className="grid gap-5">
          <div className="grid gap-5 sm:grid-cols-2">
            <label className="grid gap-2 text-sm font-medium text-ink-2">
              First Name*
              <Input name="firstName" autoComplete="given-name" required />
            </label>
            <label className="grid gap-2 text-sm font-medium text-ink-2">
              Last Name*
              <Input name="lastName" autoComplete="family-name" required />
            </label>
          </div>

          <div className="grid gap-5 sm:grid-cols-2">
            <label className="grid gap-2 text-sm font-medium text-ink-2">
              Email*
              <Input type="email" name="email" autoComplete="email" required />
            </label>
            <label className="grid gap-2 text-sm font-medium text-ink-2">
              Phone*
              <Input type="tel" name="phone" autoComplete="tel" required />
            </label>
          </div>

          <label className="grid gap-2 text-sm font-medium text-ink-2">
            Subject
            <Input name="subject" />
          </label>

          <label className="grid gap-2 text-sm font-medium text-ink-2">
            Tell Us About Your Project
            <Textarea name="message" placeholder="Type your message..." />
          </label>

          <Button type="submit" variant="primary" className="w-fit">
            {website.contactForm.submitLabel}
          </Button>
        </form>
      </div>
    </Section>
  )
}
