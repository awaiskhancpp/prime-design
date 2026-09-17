import Image from 'next/image'
import Link from 'next/link'
import { ArrowRight, ArrowUpRight, MapPin, Plus } from 'lucide-react'

import { Section } from '@/components/ui/Section'
import { SectionHeader } from '@/components/ui/SectionHeader'
import { getServiceAreas } from '@/lib/serviceAreas.server'
import type { ServiceDetail } from '@/lib/services'

const serviceAreaLabels: Record<string, string> = {
  'kitchen-remodeling': 'Kitchen remodeling',
  'bathroom-remodeling': 'Bathroom remodeling',
  'home-remodeling': 'Home remodeling',
  adu: 'ADU & garage conversions',
  additions: 'Room additions',
  'complete-renovation': 'Complete home renovation',
  'european-kitchen': 'European kitchen remodeling',
  'custom-kitchen': 'Custom kitchen remodeling',
  'shaker-kitchen': 'Shaker kitchen remodeling',
}

export async function ServiceAreasSection({ service }: { service: ServiceDetail }) {
  const locations = await getServiceAreas(service.slug)
  if (!locations.length) return null

  const serviceLabel = serviceAreaLabels[service.slug] || service.title

  return (
    <Section className="bg-white">
      <SectionHeader
        align="center"
        // WordPress 3261: "We offer top {post_title} in the following areas".
        title={`We offer top ${service.title} in the following areas`}
      />

      <div className="mt-12 grid gap-x-4 gap-y-6 sm:grid-cols-2 lg:grid-cols-4">
        {locations.map((entry) => {
          const href = `/${entry.serviceSlug}/${entry.slug}`
          const description = `Bring ${serviceLabel.toLowerCase()} in ${entry.location.name} to life with thoughtful design, quality craftsmanship, and a process built around your home.`
          // WordPress gives every city card its own image
          // ("Home-Remodeling-in-Campbell.png", etc.) — the location's
          // featured image. Only fall back to the service hero photo when a
          // location has no image of its own.
          const cardImage = entry.featuredImage || service.image

          return (
            <article key={entry.slug} className="flex h-full flex-col border border-line bg-white">
              <Link href={href} className="relative block aspect-[4/3] overflow-hidden bg-paper-2">
                <Image
                  src={cardImage}
                  alt={`${serviceLabel} in ${entry.location.name}`}
                  fill
                  className="object-cover transition-transform duration-500 ease-out hover:scale-105"
                  sizes="(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw"
                />
              </Link>

              <div className="flex flex-1 flex-col p-5">
                <div className="flex items-center gap-2">
                  <MapPin className="h-5 w-5 shrink-0 text-brass" aria-hidden />
                  <h3 className="font-display text-2xl font-medium leading-tight text-ink-2">
                    {entry.location.name}
                  </h3>
                </div>
                <p className="mt-2 line-clamp-2 text-base leading-7 text-ink-2/70">{description}</p>

                <div className="mt-auto pt-3">
                  <Link
                    href={href}
                    className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.12em] text-brass-deep transition-colors hover:text-brass"
                  >
                    View area
                    <ArrowUpRight className="h-3.5 w-3.5" aria-hidden />
                  </Link>
                </div>
              </div>
            </article>
          )
        })}

        {/* "And all surrounding cities!" card — matches the WordPress pill. */}
        {/* "And all surrounding cities!" card — no location photo to show, so a
    solid ink-2 block with the Plus glyph fills the same aspect-[4/3] slot
    the photo cards use, keeping this card the same visual weight and grid
    height as its siblings instead of just floating text in empty space. */}
        <article className="flex h-full flex-col border border-line bg-white">
          <div className="relative flex aspect-[4/3] items-center justify-center overflow-hidden bg-ink-2">
            <Plus
              aria-hidden
              className="pointer-events-none absolute h-40 w-40 text-white/[0.06]"
            />
            <Plus className="relative h-20 w-20 text-brass/70" aria-hidden />
          </div>

          <div className="flex flex-1 flex-col p-5">
            <div className="flex items-center gap-2">
              <MapPin className="h-5 w-5 shrink-0 text-brass" aria-hidden />
              <h3 className="font-display text-2xl font-medium leading-tight text-ink-2">
                All surrounding cities
              </h3>
            </div>
            <p className="mt-3 line-clamp-2 text-base leading-7 text-ink-2/70">
              Don&apos;t see your city listed? We likely serve it too.
            </p>

            <div className="mt-auto pt-5">
              <Link
                href="/contact"
                className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.12em] text-brass-deep transition-colors hover:text-brass"
              >
                Contact us
                <ArrowRight className="h-3.5 w-3.5" aria-hidden />
              </Link>
            </div>
          </div>
        </article>
      </div>
    </Section>
  )
}
