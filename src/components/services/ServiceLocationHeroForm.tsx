import { ArrowRight } from 'lucide-react'

import Image from '@/components/ui/Image'

import { getPayload } from 'payload'

import configPromise from '@payload-config'
import { LeadForm } from '@/components/forms/LeadForm'
import { resolveFormServices } from '@/lib/formServices'
import { Container } from '@/components/ui/Container'
import { ServiceLocationHeader } from './ServiceLocationHeader'
import type { ServiceDetail } from '@/lib/services'
import type { Location, ServiceLocation } from '@/lib/serviceLocations'
import { resolveSiteSettings } from '@/lib/siteSettings'

type LocationFeature = { image: string; blurb: string }

/**
 * WordPress location-template hero copy, per service (templates 1495/1584/
 * 1639). `{City}` and `{Company}` are substituted per page.
 *
 * This is the LAST resort only. The copy now lives in Payload — on the parent
 * service as the per-family default, overridable per city on the
 * service-location record — and this template is what renders if the seed has
 * not run, matching how the Video, Don't Settle and Prime Difference sections
 * keep their built-in templates.
 */
const HERO_COPY: Record<
  string,
  { lede: string; body: string; formSubject: string; blurbs: string[] }
> = {
  'kitchen-remodeling': {
    lede: 'The recipe for a Dream Kitchen, Your Masterpiece.',
    body: 'Serving {City} with tailored kitchen remodeling solutions. At {Company}, we turn your vision into reality.',
    formSubject: 'kitchen',
    blurbs: [
      'Experience the joy of timeless elegance with a modern twist.',
      'Design your perfect kitchen with unmatched quality & service.',
      'Find out why people keep raving about "The Prime Difference".',
    ],
  },
  'bathroom-remodeling': {
    lede: 'From Vision to Reality: Your Dream Bathroom Awaits',
    body: "Transforming {City}'s bathrooms into dream havens, {Company} delivers tailored bathroom remodeling solutions that bring your vision to life.",
    formSubject: 'bathroom',
    blurbs: [
      'Indulge in the timeless elegance of modern bathroom transformations.',
      'Build your bathroom oasis with cutting edge technology & material.',
      'Find out why people keep raving about "The Prime Difference".',
    ],
  },
  'home-remodeling': {
    lede: "Dream, Design, Deliver: {Company}'s Home Remodeling Marvels",
    body: 'Transforming {City} Homes into Personalized Masterpieces. Your Vision, Our Craftsmanship',
    formSubject: 'home',
    blurbs: [
      'Seamless remodeling experience from start to finish',
      'Precision installation and meticulous finishes for lasting beauty',
      'Find out why people keep raving about "The Prime Difference".',
    ],
  },
}

type HeroCopy = { lede: string; body: string; formSubject: string; blurbs: string[] }

/**
 * City override -> parent-service default -> built-in template, resolved once
 * and passed to both consumers (the feature blurbs and the hero body) so the
 * two cannot drift apart.
 */
function resolveHeroCopy(
  service: ServiceDetail,
  override?: ServiceLocation['locationHero'],
): HeroCopy {
  const template = HERO_COPY[service.slug] ?? HERO_COPY['kitchen-remodeling']
  const fromService = service.locationHero
  return {
    lede: override?.lede ?? fromService?.lede ?? template.lede,
    body: override?.body ?? fromService?.body ?? template.body,
    formSubject: override?.formSubject ?? fromService?.formSubject ?? template.formSubject,
    // Blurbs are all-or-nothing: a partially filled array would silently drop
    // captions, so an empty array inherits the whole set rather than merging.
    blurbs: override?.blurbs?.length
      ? override.blurbs
      : fromService?.blurbs?.length
        ? fromService.blurbs
        : template.blurbs,
  }
}

function getLocationFeatures(service: ServiceDetail, copy: HeroCopy): LocationFeature[] {
  // The WordPress family template names three specific photos for these
  // blurbs. They come from `locationFeatureImages`; the service gallery is the
  // fallback for any slot the CMS has not filled (the home-remodeling family
  // still has two unimported originals).
  const featured = (service.locationFeatureImages ?? []).filter(Boolean)
  const gallery = [...new Set([...service.gallery, service.image])].filter(Boolean)
  return copy.blurbs.map((blurb, index) => ({
    image: featured[index] ?? gallery[index] ?? gallery[0] ?? service.image,
    blurb,
  }))
}

/**
 * The WordPress location hero section sits on a background image
 * ("Kitchen-And-Bathroom-Images-1920-×-1080-px-1.png", WP attachment 827 —
 * the same image on all three service templates) with a white overlay in
 * the original. Per the client: keep the background image at minimum
 * opacity and put NO color over it.
 */
async function resolveHeroBackground(): Promise<string | undefined> {
  if (!process.env.DATABASE_URL) return undefined
  try {
    const payload = await getPayload({ config: configPromise })
    const result = await payload.find({
      collection: 'media',
      where: { filename: { like: 'Kitchen-And-Bathroom-Images-1920-%1080-px-1.png' } },
      limit: 1,
    })
    const media = result.docs[0] as { url?: string | null; sourceUrl?: string | null } | undefined
    // Media #424 (the WordPress hero background) now has its blob file, so
    // prefer the local blob copy; the WordPress source URL remains the
    // fallback.
    return media?.url || media?.sourceUrl || undefined
  } catch (error) {
    console.error('ServiceLocationHeroForm: could not load the hero background media', error)
    return undefined
  }
}

export async function ServiceLocationHeroForm({
  service,
  location,
  heroOverride,
}: {
  service: ServiceDetail
  location: Location
  /** This city's hero copy override; any empty field inherits the service. */
  heroOverride?: ServiceLocation['locationHero']
}) {
  const heroCopy = resolveHeroCopy(service, heroOverride)
  const features = getLocationFeatures(service, heroCopy)
  const settings = await resolveSiteSettings()
  const heroBackground = await resolveHeroBackground()
  const fill = (text: string) =>
    text.replaceAll('{City}', location.name).replaceAll('{Company}', 'Prime Design & Build')
  const phone = settings.phone
  const phoneHref = `tel:${settings.phoneClean}`
  const tickerItem = `${service.title.toUpperCase()} · ${location.name.toUpperCase()} · CALL NOW`

  return (
    <>
      {/* A true page-wide sticky bar, not a within-section one: it is a
          sibling of the `<section>` below rather than nested inside its
          `overflow-hidden`, which would otherwise clip position:sticky to
          this component's own height instead of the whole page's scroll. */}
      <ServiceLocationHeader phone={phone} phoneHref={phoneHref} />

      <section className="relative isolate overflow-hidden pb-0 pt-12 md:pt-16">
        {heroBackground ? (
          <div className="pointer-events-none absolute inset-0 -z-10">
            <Image
              src={heroBackground}
              alt=""
              fill
              unoptimized
              priority
              className="object-cover opacity-[0.08]"
              sizes="100vw"
            />
          </div>
        ) : null}
        <Container>
          <div className="grid gap-10 pb-16 lg:grid-cols-[1.05fr_0.95fr] lg:gap-16">
            <div>
              <div className="flex items-center gap-2">
                <span aria-hidden className="h-1.5 w-1.5 shrink-0 bg-brass" />
                <p className="text-xs font-semibold uppercase tracking-[0.2em] text-brass-deep">
                  {fill(heroCopy.lede)}
                </p>
              </div>
              <h1 className="mt-4 font-display text-4xl font-medium leading-tight tracking-tight text-ink md:text-5xl lg:text-[3.25rem]">
                {service.title} in {location.name}
              </h1>
              <p className="mt-5 max-w-xl text-base leading-7 text-ink-2/70">
                {fill(heroCopy.body)}
              </p>

              <div className="mt-8 grid grid-cols-1 gap-4 sm:grid-cols-3">
                {features.map((feature, index) => (
                  <div
                    key={index}
                    className="group border border-line bg-white transition-shadow duration-300 hover:shadow-lg hover:shadow-ink/5"
                  >
                    <div className="relative aspect-[4/3] overflow-hidden bg-paper-2">
                      <Image
                        src={feature.image}
                        alt=""
                        fill
                        className="object-cover transition-transform duration-500 group-hover:scale-105"
                        sizes="(min-width: 1024px) 18vw, 45vw"
                      />
                    </div>
                    <p className="border-t border-line/70 p-3 text-sm font-medium leading-snug text-ink-2">
                      {fill(feature.blurb)}
                    </p>
                  </div>
                ))}
              </div>

              <p className="mt-8 inline-flex flex-wrap items-center gap-x-2 gap-y-1 border border-brass/20 bg-brass/5 px-4 py-3 text-sm text-ink-2 sm:text-base">
                Transform your home in{' '}
                <strong className="font-semibold text-ink">{location.name}</strong> by calling us
                at{' '}
                <a
                  href={phoneHref}
                  className="inline-flex items-center gap-1 font-semibold text-brass-deep underline decoration-brass/40 underline-offset-4 hover:text-brass"
                >
                  <span className="nimbata">{phone}</span>
                  <ArrowRight className="h-3.5 w-3.5" aria-hidden />
                </a>
              </p>
            </div>

            <div className="relative overflow-hidden border border-line bg-white p-6 shadow-2xl shadow-ink/10 sm:p-8 lg:p-10">
              <span
                aria-hidden
                className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-brass-deep via-brass to-brass-light"
              />
              <h2 className="font-display text-2xl font-medium leading-tight text-ink md:text-3xl">
                Let&apos;s talk about your dream {heroCopy.formSubject}.
              </h2>
              <p className="mt-3 text-sm leading-6 text-ink-2/70">
                Fill out the form below and one of our team members will contact you to help get
                started.
              </p>

              <LeadForm
                className="mt-6 gap-1"
                layout="stacked"
                requireSubject
                submitLabel="Request A Quote"
                submitClassName="mt-2 w-full justify-center"
                messagePlaceholder="Tell Us About Your Project"
                services={await resolveFormServices()}
                defaultServiceSlug={service.slug}
                // Named for the admin list: these pages carry this form in the
                // hero and the shared contact band at the foot.
                formName="Hero estimate form"
                source="location-page"
              />
            </div>
          </div>
        </Container>

        {/* The whole band is a link to the contact section, as it is on the
            original — there the marquee is wrapped in `<a href="#contact">`,
            and it is the only thing in that strip, so a visitor who reads
            "CALL NOW" and clicks anywhere on it lands on the form rather than
            on nothing. The repeated copies are decorative, so the link carries
            its own accessible name instead of announcing the ticker text. */}
        <a
          href="#contact"
          aria-label={`Contact us about ${service.title} in ${location.name}`}
          className="relative block overflow-hidden border-y border-brass-deep/20 bg-brass py-3 outline-offset-2 transition-colors hover:bg-brass-deep focus-visible:outline-2 focus-visible:outline-ink [-webkit-mask-image:linear-gradient(to_right,transparent,black_4%,black_96%,transparent)] [mask-image:linear-gradient(to_right,transparent,black_4%,black_96%,transparent)]"
        >
          {/* Real marquee: the content is duplicated exactly once (two
              identical copies, side by side), and the whole flex row
              animates translateX(0) -> translateX(-50%). Since the second
              copy starts at the halfway point, the moment the first copy
              has scrolled fully offscreen the second is in the exact
              position the first started in — the loop is invisible. Both
              copies are aria-hidden now: the link above names itself, so the
              text underneath it is decoration. */}
          <div
            aria-hidden
            className="flex w-max animate-marquee gap-3 whitespace-nowrap will-change-transform hover:[animation-play-state:paused]"
          >
            {[0, 1].map((copy) => (
              <div key={copy} className="flex shrink-0 items-center gap-3">
                {Array.from({ length: 8 }).map((_, index) => (
                  <span
                    key={index}
                    className="flex items-center gap-3 text-sm font-semibold uppercase tracking-[0.2em] text-white"
                  >
                    {tickerItem}
                    <span aria-hidden="true" className="text-white/50">
                      •
                    </span>
                  </span>
                ))}
              </div>
            ))}
          </div>
        </a>
      </section>
    </>
  )
}
