import { Mail, MapPin, Phone } from 'lucide-react'

import website from '../../../website.json'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Section } from '@/components/ui/Section'
import { Textarea } from '@/components/ui/Textarea'
import { resolveSiteSettings } from '@/lib/siteSettings'

// WordPress contact-section walkthrough (template 1495/1584/1639).
const CONTACT_VIDEO =
  'https://tagmediaspace.b-cdn.net/Prime%20Kitchens/01.19.2023%20Prime%20Kitchens%201794%20San%20Luis%20Ave%20Mountain%20View.mp4'

export async function Contact({ city, poster }: { city?: string; poster?: string }) {
  const settings = await resolveSiteSettings()
  const contactDetails = [
    { icon: Mail, label: settings.email, href: settings.emailLink },
    { icon: Phone, label: settings.phone, href: `tel:${settings.phoneClean}` },
    ...settings.addresses.map((item) => ({ icon: MapPin, label: item.address, href: item.link })),
  ]

  return (
    <Section id="contact" className="relative ">
      {/* 
        Added `items-start` to the grid. 
        This is required for CSS `sticky` to work in a grid layout. 
      */}
      <div className="grid gap-14 lg:grid-cols-[1fr_1fr] lg:gap-20 items-start">
        {/* Left Column: Form & Details */}
        <div className="flex flex-col">
          <p className="mb-4 font-display text-lg italic text-brass-deep">
            {city
              ? `Start Crafting Your Dream Project in ${city} Today`
              : 'Start crafting your dream project today'}
          </p>
          <h2 className="font-display text-4xl font-medium leading-tight tracking-tight text-ink md:text-5xl">
            Ready to discuss{' '}
            <span className="bg-gradient-to-r from-brass to-brass-deep bg-clip-text text-transparent">
              your needs?
            </span>
          </h2>

          <p className="mt-3 max-w-md text-sm leading-6 text-ink-2/65">
            Give us a call at{' '}
            <a
              href={`tel:${settings.phoneClean}`}
              className="font-semibold text-brass-deep underline decoration-brass/40 underline-offset-4 hover:text-brass"
            >
              {settings.phoneClean}
            </a>
          </p>

          <p className="mt-3 max-w-md text-sm leading-6 text-ink-2/65">
            To get in touch, simply fill out the form on this page and we will get back to you
            within 2-3 hours on business days.
          </p>

          <div className="grid gap-3 pt-6 sm:grid-cols-1">
            {contactDetails.map(({ icon: Icon, label, href }) =>
              href ? (
                <a
                  key={label}
                  href={href}
                  className="flex items-center gap-3 text-sm text-ink-2/75 transition-colors hover:text-brass-deep"
                >
                  <span className="flex h-8 w-8 items-center justify-center ">
                    <Icon className="h-4 w-4 shrink-0 text-brass" aria-hidden />
                  </span>
                  {label}
                </a>
              ) : (
                <span key={label} className="flex items-center gap-3 text-sm text-ink-2/75">
                  <span className="flex h-8 w-8 items-center justify-center ">
                    <Icon className="h-4 w-4 shrink-0 text-brass" aria-hidden />
                  </span>
                  {label}
                </span>
              ),
            )}
          </div>

          <form className="mt-10 grid gap-6 bg-white p-8 shadow-sm border border-black/5 ">
            <div className="grid gap-5 sm:grid-cols-2">
              <label className="grid gap-2 text-sm font-medium text-ink-2">
                First Name*
                <Input name="firstName" autoComplete="given-name" required className="mt-1" />
              </label>
              <label className="grid gap-2 text-sm font-medium text-ink-2">
                Last Name*
                <Input name="lastName" autoComplete="family-name" required className="mt-1" />
              </label>
            </div>

            <div className="grid gap-5 sm:grid-cols-2">
              <label className="grid gap-2 text-sm font-medium text-ink-2">
                Email*
                <Input type="email" name="email" autoComplete="email" required className="mt-1" />
              </label>
              <label className="grid gap-2 text-sm font-medium text-ink-2">
                Phone*
                <Input type="tel" name="phone" autoComplete="tel" required className="mt-1" />
              </label>
            </div>

            <label className="grid gap-2 text-sm font-medium text-ink-2">
              Subject
              <Input name="subject" className="mt-1" />
            </label>

            <label className="grid gap-2 text-sm font-medium text-ink-2">
              Tell Us About Your Project
              <Textarea
                name="message"
                placeholder="Type your message..."
                className="mt-1 min-h-[120px]"
              />
            </label>

            <Button type="submit" variant="primary" className="w-full sm:w-fit mt-2">
              {website.contactForm.submitLabel}
            </Button>
          </form>
        </div>

        {/* Right Column: Sticky Media */}
        {/* Added sticky positioning and height limits */}
        <div className="sticky top-24 lg:top-32 h-fit hidden lg:block">
          <div className="relative w-full ml-auto">
            {/* The implemented brass offset frame from your comments */}

            <div className="relative  w-full overflow-hidden  bg-ink z-10">
              <video
                className="h-full w-full object-cover"
                controls
                playsInline
                poster={poster || '/services/kitchen-remodeling.jpeg'}
              >
                <source src={CONTACT_VIDEO} type="video/mp4" />
              </video>
            </div>
          </div>
        </div>
      </div>
    </Section>
  )
}
