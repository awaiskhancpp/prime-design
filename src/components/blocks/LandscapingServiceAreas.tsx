/**
 * LandscapingServiceAreas — the "Areas we service" section.
 *
 * The left column lists every service area as a linked badge; the right is the
 * coverage map (`ServiceAreasMap`), which is built directly on the Google Maps
 * JavaScript API — no Leaflet, no map wrapper package. See that file for the
 * basemap and pin design.
 *
 * ── Where the pins come from ──────────────────────────────────────────────
 *
 * Each area's pin position is a Payload field: `locations.latitude` /
 * `locations.longitude`, editable per location in the admin. `CITY_COORDS`
 * below is the no-database fallback only.
 *
 * This used to be the other way round — `CITY_COORDS` was the source of truth
 * and the marker list was built with `.filter((city) => CITY_COORDS[city])`,
 * which dropped any area the hardcoded table did not happen to have a row
 * for. SiteSettings lists 15 service areas; the table knew 14 of them; so
 * "Silicon Valley" showed as a badge but never as a pin, and the section drew
 * 15 badges beside 14 markers with nothing reporting the mismatch. Anything
 * that still cannot be placed is now named in a server warning instead of
 * vanishing.
 */

import { ArrowUpRight } from 'lucide-react'

import website from '../../../website.json'
import { Section } from '@/components/ui/Section'
import { getServiceAreas } from '@/lib/serviceAreas.server'
import { resolveSiteAreas } from '@/lib/siteSettings'
import { Button } from '../ui/Button'
import { ServiceAreasMap, type MapMarker } from './ServiceAreasMap'
import { Badge } from '../ui/Badge'

const citySlug = (city: string) =>
  city
    .toLowerCase()
    .replace(/\s+/g, '-')
    .replace(/[^a-z0-9-]/g, '')

const LOCATION_SERVICES = ['kitchen-remodeling', 'bathroom-remodeling', 'home-remodeling']
const locationPrefix = (serviceSlug?: string) =>
  serviceSlug && LOCATION_SERVICES.includes(serviceSlug) ? serviceSlug : 'kitchen-remodeling'

/**
 * No-database fallback for the map pins, used when `DATABASE_URL` is unset so
 * the section still renders while working offline. Payload's
 * `locations.latitude` / `locations.longitude` are the source of truth — never
 * add a new area's coordinates only here, or it will be absent from the real
 * site. Seeded into Payload by `scripts/set-location-coordinates.ts`.
 *
 * "Silicon Valley" is in this table too: it is a service area but not a city,
 * so it had no entry and was the one area the old name lookup could not place.
 */
export const CITY_COORDS: Record<string, [number, number]> = {
  'San Jose': [37.3382, -121.8863],
  'Santa Clara': [37.3541, -121.9552],
  Sunnyvale: [37.3688, -122.0363],
  'Mountain View': [37.3861, -122.0839],
  'Palo Alto': [37.4419, -122.143],
  'Menlo Park': [37.453, -122.1817],
  'Redwood City': [37.4852, -122.2364],
  'San Mateo': [37.563, -122.3255],
  'Foster City': [37.5585, -122.2711],
  Burlingame: [37.5841, -122.3661],
  Millbrae: [37.5998, -122.3869],
  'San Bruno': [37.6305, -122.4111],
  Cupertino: [37.3229, -122.0322],
  'Los Altos': [37.3852, -122.1141],
  'Los Gatos': [37.2358, -121.9624],
  Saratoga: [37.2638, -122.023],
  Campbell: [37.2872, -121.95],
  Milpitas: [37.4323, -121.8996],
  Fremont: [37.5485, -121.9886],
  Newark: [37.5296, -122.0402],
  'Union City': [37.5934, -122.0438],
  Hayward: [37.6688, -122.0808],
  'San Leandro': [37.7249, -122.1561],
  Oakland: [37.8044, -122.2712],
  Berkeley: [37.8716, -122.2727],
  Atherton: [37.4613, -122.1977],
  'Portola Valley': [37.3774, -122.2186],
  Woodside: [37.4291, -122.2538],
  'Los Altos Hills': [37.358, -122.1469],
  'Monte Sereno': [37.2344, -121.9919],
  // The region, not a city. Moffett Park — the most central point in the
  // footprint that still clears every city pin by 6km, so the marker reads as
  // its own rather than stacking on Sunnyvale (which the true centroid of the
  // other pins, 37.3788/-122.0352, sits 1.1km from).
  'Silicon Valley': [37.4224, -122.0252],
}

export async function LandscapingServiceAreas({
  serviceSlug,
  heading: headingProp,
  eyebrow: eyebrowProp,
  description: descriptionProp,
  regionHeading,
  areas: areasProp,
  linked = true,
}: {
  serviceSlug?: string
  heading?: string
  /** Overrides the standing "Service areas" label. */
  eyebrow?: string
  /** Overrides the standing lede under the heading. */
  description?: string
  /**
   * The state the listed cities belong to ("California" in the WordPress
   * source), printed under the heading.
   */
  regionHeading?: string
  /**
   * An explicit list of areas, with the href each badge links to. Supplied by
   * the landing pages' `service-areas` block, which carries its own cities
   * rather than the site-wide list. When it is given it replaces the derived
   * list entirely, and the caller owns the link targets.
   */
  areas?: Array<{ label?: string; href?: string }>
  /**
   * Whether anything in the section navigates. The Google Ads landing pages
   * pass `false`: their whole job is the form on the page, and a city badge
   * or a map pin that leaves for a location page is a lost ad click. The
   * section still shows the coverage — the map, the pins, the badges — it
   * just does not offer to take anyone anywhere.
   */
  linked?: boolean
} = {}) {
  const { heading, cities, trailingLabel, trailingHref } = website.serviceAreas
  const configuredAreas = await resolveSiteAreas()
  const prefix = locationPrefix(serviceSlug)
  // NOT under `/services/` — that two-level path is reserved for kitchen
  // style sub-pages (`/services/kitchen-remodeling/shaker-kitchen`) and 404s
  // for anything else. Service-location pages live at the WordPress-style
  // root path (`/{service}/{service}-in-{city}`); see the same note in
  // `sitemap.ts` and `ServiceAreasStrip.tsx`, which build this href correctly.
  const hrefFor = (city: string) => `/${prefix}/${prefix}-in-${citySlug(city)}`

  // The badge list and the map are built from one list, so a badge can never
  // again exist without the map having been given the chance to place it.
  type Area = { name: string; latitude?: number; longitude?: number; href?: string }
  const fromCities = (names: string[]): Area[] => names.map((name) => ({ name }))

  // A caller-supplied list wins outright: a landing page's `service-areas`
  // block names its own cities, and silently swapping them for the site-wide
  // list would drop real CMS content.
  const supplied = areasProp?.filter((area) => area.label) ?? []

  let areas: Area[] = []
  if (supplied.length) {
    areas = supplied.map((area) => ({ name: area.label as string, href: area.href }))
  } else if (serviceSlug) {
    const serviceAreas = await getServiceAreas(serviceSlug)
    areas = serviceAreas.length
      ? serviceAreas.map((a) => ({
          name: a.location.name,
          latitude: a.location.latitude,
          longitude: a.location.longitude,
        }))
      : configuredAreas.length
        ? configuredAreas
        : fromCities(cities)
  } else {
    areas = configuredAreas.length ? configuredAreas : fromCities(cities)
  }

  const headingText = headingProp || heading
  const linkFor = (area: Area) => area.href ?? hrefFor(area.name)

  // Payload first, the offline table second, and a named report if neither can
  // place an area — the silent `.filter()` this replaces is exactly how the
  // section came to show one fewer pin than it had badges.
  const markers: MapMarker[] = []
  const unplaceable: string[] = []
  for (const area of areas) {
    const fallback = CITY_COORDS[area.name]
    const lat = area.latitude ?? fallback?.[0]
    const lng = area.longitude ?? fallback?.[1]
    if (typeof lat !== 'number' || typeof lng !== 'number') {
      unplaceable.push(area.name)
      continue
    }
    markers.push({ name: area.name, lat, lng, href: linked ? linkFor(area) : undefined })
  }
  // Only worth reporting for the derived list. A caller-supplied list owns its
  // own entries and legitimately contains things that are not cities — the
  // landing block's trailing "And surrounding cities!" pill, for one — so a
  // missing pin there is not a gap in the data.
  if (unplaceable.length && !supplied.length) {
    console.warn(
      `[LandscapingServiceAreas] ${unplaceable.length} of ${areas.length} service areas have no ` +
        `coordinates and are missing from the map: ${unplaceable.join(', ')}. ` +
        `Set latitude/longitude on the location in Payload.`,
    )
  }

  return (
    <Section className="bg-white px-0 pb-0 pt-16 md:pt-24">
      <div className="grid gap-0 lg:grid-cols-[1fr_1.4fr]">
        {/* ── Left column: heading, city list, CTA ── */}
        <div className="flex flex-col justify-start pr-6 pb-16 md:pr-10 lg:pr-14">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-brass-deep">
            {eyebrowProp || 'Service areas'}
          </p>
          <h2 className="mt-3 max-w-sm font-display text-3xl font-medium leading-tight tracking-tight text-ink md:text-4xl">
            {headingText}
          </h2>
          {regionHeading ? (
            <p className="mt-2 font-display text-xl font-medium text-ink">{regionHeading}</p>
          ) : null}
          <p className="mt-4 max-w-xs text-sm leading-6 text-ink-2/60">
            {descriptionProp ||
              'We serve homeowners across the entire Silicon Valley — from San Jose to Palo Alto and everywhere in between.'}
          </p>

          {/* City name list — compact, readable, linked */}
          <div className="mt-8 flex flex-wrap gap-x-2 gap-y-2">
            {areas.map((area) => (
              <span key={area.name} className="text-sm text-ink-2/70">
                {linked ? (
                  <a href={linkFor(area)} className="transition-colors hover:text-brass-deep">
                    <Badge>{area.name}</Badge>
                  </a>
                ) : (
                  <Badge>{area.name}</Badge>
                )}
              </span>
            ))}
          </div>

          {/* The trailing link goes to /contact, which is off the landing
              page entirely, so it goes with the rest of the navigation. */}
          {linked ? (
            <Button href={trailingHref} variant="line" className="mt-8 self-start text-ink">
              {trailingLabel}
              <ArrowUpRight className="h-4 w-4" aria-hidden />
            </Button>
          ) : null}
        </div>

        {/* ── Right column: Leaflet map ── */}
        <div className="relative min-h-[420px] lg:min-h-[560px]">
          <ServiceAreasMap markers={markers} />
        </div>
      </div>
    </Section>
  )
}
