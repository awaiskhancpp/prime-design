import { Mail, MapPin, Phone } from 'lucide-react'

import website from '../../../website.json'
import { LeadForm } from '@/components/forms/LeadForm'
import { Section } from '@/components/ui/Section'
import { resolveSiteSettings } from '@/lib/siteSettings'

// WordPress contact-section walkthrough (template 1495/1584/1639) — the
// San Luis Ave tour, re-encoded and hosted in the company blob (the old
// tagmediaspace hotlink is kept as the media doc's sourceUrl provenance).
const CONTACT_VIDEO = '/api/media/file/prime-kitchens-san-luis.mp4'

/**
 * Poster frame for the clip above — a still taken from that same video, not a
 * marketing graphic. The WordPress `<video>` sets no poster and relies on the
 * browser painting the first frame, but this player uses `preload="none"`, so
 * with no poster the box renders empty until someone presses play. This shows
 * the frame WordPress would have shown. The CMS `poster` field still wins.
 */
const CONTACT_VIDEO_POSTER = '/api/media/file/prime-kitchens-san-luis-poster.jpg'

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

          <LeadForm
            className="mt-10 gap-6 bg-white p-8 shadow-sm border border-black/5"
            inputClassName="mt-1"
            textareaClassName="min-h-[120px]"
            submitClassName="w-full sm:w-fit mt-2"
            submitLabel={website.contactForm.submitLabel}
            messagePlaceholder="Type your message..."
          />
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
                preload="none"
                poster={poster ?? CONTACT_VIDEO_POSTER}
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
