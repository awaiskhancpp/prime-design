import Image from 'next/image'

import { BrandMark } from '@/components/layout/BrandMark'
import { Button } from '@/components/ui/Button'
import { Container } from '@/components/ui/Container'
import { Input } from '@/components/ui/Input'
import { Textarea } from '@/components/ui/Textarea'
import type { ServiceDetail } from '@/lib/services'
import type { Location } from '@/lib/serviceLocations'
import website from '../../../website.json'

type LocationFeature = { image: string; blurb: string }

function getLocationFeatures(service: ServiceDetail): LocationFeature[] {
  const gallery = [...new Set([...service.gallery, service.image])].filter(Boolean)
  const blurbs = [
    'Experience the joy of timeless elegance with a modern twist.',
    `Design your perfect ${service.title.toLowerCase()} with unmatched quality & service.`,
    'Find out why people keep raving about "The Prime Difference".',
  ]
  return blurbs.map((blurb, index) => ({
    image: gallery[index] ?? gallery[0] ?? service.image,
    blurb,
  }))
}

export function ServiceLocationHeroForm({
  service,
  location,
}: {
  service: ServiceDetail
  location: Location
}) {
  const features = getLocationFeatures(service)
  const phone = website.footer.phone
  const phoneHref = `tel:${phone.replace(/[^\d+]/g, '')}`
  const tickerItem = `${service.title.toUpperCase()} · ${location.name.toUpperCase()} · CALL NOW`

  return (
    <section className=" pb-0 pt-10">
      <Container>
        <div className="mt-8 flex flex-col items-start justify-between gap-6  px-6 py-6 sm:flex-row sm:items-center sm:px-8">
          <BrandMark />
          <div className="text-left sm:text-right">
            <p className="text-lg text-ink-2">
              We&apos;re <strong className="font-semibold text-ink">ready to discuss</strong>{' '}
              <em className="italic">your</em> needs!
            </p>
            <a
              href={phoneHref}
              className="mt-1 inline-block text-lg font-semibold text-brass-deep underline decoration-brass/40 underline-offset-4 hover:text-brass"
            >
              Call us at {phone}
            </a>
          </div>
        </div>

        <div className="grid gap-10 pb-16 pt-10 lg:grid-cols-[1.05fr_0.95fr] lg:gap-16">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-brass-deep">
              The recipe for a dream {service.title.toLowerCase()}, your masterpiece
            </p>
            <h1 className="mt-4 font-display text-4xl font-medium leading-tight tracking-tight text-ink md:text-5xl">
              {service.title} in {location.name}
            </h1>
            <p className="mt-5 max-w-xl text-base leading-7 text-ink-2/70">
              Serving {location.name} with tailored {service.title.toLowerCase()} solutions. At
              Prime Design &amp; Build, we turn your vision into reality.
            </p>

            <div className="mt-8 grid grid-cols-1 gap-4 sm:grid-cols-3">
              {features.map((feature, index) => (
                <div key={index} className="border border-line bg-white">
                  <div className="relative aspect-[4/3] overflow-hidden bg-paper-2">
                    <Image
                      src={feature.image}
                      alt=""
                      fill
                      className="object-cover"
                      sizes="(min-width: 1024px) 18vw, 45vw"
                    />
                  </div>
                  <p className="p-3 text-sm font-medium leading-snug text-ink-2">{feature.blurb}</p>
                </div>
              ))}
            </div>

            <p className="mt-8 text-base text-ink-2">
              Transform your home in{' '}
              <strong className="font-semibold text-ink">{location.name}</strong> by calling us at{' '}
              <a
                href={phoneHref}
                className="font-semibold text-brass-deep underline decoration-brass/40 underline-offset-4 hover:text-brass"
              >
                {phone} →
              </a>
            </p>
          </div>

          <div className="border border-line bg-white p-6 shadow-xl shadow-ink/5 sm:p-8">
            <h2 className="font-display text-2xl font-medium leading-tight text-ink md:text-3xl">
              Let&apos;s talk about your dream {service.title.toLowerCase()}.
            </h2>
            <p className="mt-3 text-sm leading-6 text-ink-2/70">
              Fill out the form below and one of our team members will contact you to help get
              started.
            </p>

            <form className="mt-6 grid gap-4">
              <div className="grid gap-4 sm:grid-cols-2">
                <label className="grid gap-2 text-sm font-medium text-ink-2">
                  First Name*
                  <Input name="firstName" autoComplete="given-name" required />
                </label>
                <label className="grid gap-2 text-sm font-medium text-ink-2">
                  Last Name*
                  <Input name="lastName" autoComplete="family-name" required />
                </label>
              </div>

              <label className="grid gap-2 text-sm font-medium text-ink-2">
                Email*
                <Input type="email" name="email" autoComplete="email" required />
              </label>

              <label className="grid gap-2 text-sm font-medium text-ink-2">
                Phone*
                <Input type="tel" name="phone" autoComplete="tel" required />
              </label>

              <label className="grid gap-2 text-sm font-medium text-ink-2">
                Subject*
                <Input name="subject" required />
              </label>

              <label className="grid gap-2 text-sm font-medium text-ink-2">
                Tell Us About Your Project*
                <Textarea name="message" placeholder="Tell Us About Your Project" required />
              </label>

              <Button type="submit" variant="primary" className="mt-2 w-full justify-center">
                Request A Quote
              </Button>
            </form>
          </div>
        </div>
      </Container>

      <div className="overflow-hidden border-y border-brass-deep/20 bg-brass py-3">
        <div className="">
          {Array.from({ length: 8 }).map((_, index) => (
            <span
              key={index}
              className="text-sm font-semibold uppercase tracking-[0.2em] text-white"
            >
              {tickerItem}
            </span>
          ))}
        </div>
      </div>
    </section>
  )
}
