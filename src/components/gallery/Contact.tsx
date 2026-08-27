import { Mail, MapPin, Phone } from 'lucide-react'

import website from '../../../website.json'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Section } from '@/components/ui/Section'
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

const reviewBadges = [
  { name: 'Google', ...website.reviewSummary.google },
  { name: 'Yelp', ...website.reviewSummary.yelp },
]

// Real project walkthrough footage already hosted for the site — using the
// team-intro clip since it reads as a testimonial in this spot. Swap for a
// different entry from website.json's `projectVideos` if a different one
// fits better.
const featuredVideo = website.projectVideos.find((video) => video.title === 'Client walkthrough')

export function Contact() {
  return (
    <Section id="contact" className="">
      <div className="grid gap-14 lg:grid-cols-[1fr_1fr] lg:gap-20">
        <div>
          <p className="mb-4 font-display text-lg italic text-brass-deep">
            Start crafting your dream project today
          </p>
          <h2 className="font-display text-4xl font-medium leading-tight tracking-tight text-ink md:text-5xl">
            Ready to discuss{' '}
            <span className="bg-gradient-to-r from-brass to-brass-deep bg-clip-text text-transparent">
              your needs?
            </span>
          </h2>

          <p className="mt-3 max-w-md text-sm leading-6 text-ink-2/65">
            To get in touch, simply fill out the form and we&rsquo;ll get back to you within
            2&ndash;3 hours on business days.
          </p>

          <form className="mt-8 grid gap-5">
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

        <div>
          {/* Offset brass frame — same motif as the intro section's photo —
              peeking out bottom-right behind the video panel. */}
          <div className="relative">
            <div
              className="absolute inset-0 translate-x-4 translate-y-4 border border-brass"
              aria-hidden
            />
            <div className="relative aspect-video overflow-hidden bg-ink">
              {featuredVideo ? (
                <video
                  className="h-full w-full object-cover"
                  controls
                  playsInline
                  poster="/services/kitchen-remodeling.jpeg"
                >
                  <source src={featuredVideo.videoUrl} type="video/mp4" />
                </video>
              ) : (
                <div className="flex h-full items-center justify-center text-sm text-white/60">
                  Video coming soon
                </div>
              )}
            </div>
          </div>

          <div className="mt-10 flex flex-col gap-4">
            {/* <p className="mt-5 text-base font-semibold text-ink-2">
              Give us a call at{' '}
              <a
                href={`tel:${website.footer.phone.replace(/[^\d+]/g, '')}`}
                className="text-brass-deep underline decoration-brass/50 underline-offset-4 hover:text-brass"
              >
                {website.footer.phone}
              </a>
            </p> */}
            <div className=" grid gap-3 pt-6 sm:grid-cols-1">
              {contactDetails.map(({ icon: Icon, label, href }) =>
                href ? (
                  <a
                    key={label}
                    href={href}
                    className="flex items-center gap-2 text-xs text-ink-2/75 transition-colors hover:text-brass-deep"
                  >
                    <Icon className="h-3.5 w-3.5 shrink-0 text-brass" aria-hidden />
                    {label}
                  </a>
                ) : (
                  <span key={label} className="flex items-center gap-2 text-xs text-ink-2/75">
                    <Icon className="h-3.5 w-3.5 shrink-0 text-brass" aria-hidden />
                    {label}
                  </span>
                ),
              )}
            </div>
          </div>
        </div>
      </div>
    </Section>
  )
}
