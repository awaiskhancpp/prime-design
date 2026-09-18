/**
 * LandscapingServiceAreas — with interactive Leaflet map
 *
 * Map library: vanilla Leaflet loaded dynamically (avoids SSR hydration
 * mismatch that plagues react-leaflet in Next.js App Router).
 *
 * Tiles: CartoDB Positron — minimal, near-white, no API key required.
 * Markers: brass-coloured SVG circles, pulse-ring on hover.
 *
 * Install once:
 *   npm install leaflet
 *   npm install --save-dev @types/leaflet
 *
 * Add to next.config.ts transpilePackages if needed:
 *   transpilePackages: ['leaflet']
 */

import { ArrowUpRight } from 'lucide-react'

import website from '../../../website.json'
import { Section } from '@/components/ui/Section'
import { getServiceAreas } from '@/lib/serviceAreas.server'
import { resolveSiteAreas } from '@/lib/siteSettings'
import { Button } from '../ui/Button'
import { ServiceAreasMap } from './ServiceAreasMap'
import { Badge } from '../ui/Badge'

const citySlug = (city: string) =>
  city
    .toLowerCase()
    .replace(/\s+/g, '-')
    .replace(/[^a-z0-9-]/g, '')

const LOCATION_SERVICES = ['kitchen-remodeling', 'bathroom-remodeling', 'home-remodeling']
const locationPrefix = (serviceSlug?: string) =>
  serviceSlug && LOCATION_SERVICES.includes(serviceSlug) ? serviceSlug : 'kitchen-remodeling'

// Silicon Valley city coordinates — add / extend as location pages grow.
// These are the cities Prime Design & Build actually services.
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
}

export async function LandscapingServiceAreas({
  serviceSlug,
  heading: headingProp,
}: { serviceSlug?: string; heading?: string } = {}) {
  const { heading, cities, trailingLabel, trailingHref } = website.serviceAreas
  const configuredAreas = await resolveSiteAreas()
  const prefix = locationPrefix(serviceSlug)
  const hrefFor = (city: string) => `/services/${prefix}/${prefix}-in-${citySlug(city)}`

  let areaNames: string[] = []
  if (serviceSlug) {
    const areas = await getServiceAreas(serviceSlug)
    areaNames = areas.length
      ? areas.map((a) => a.location.name)
      : configuredAreas.length
        ? configuredAreas.map((a) => a.name)
        : cities
  } else {
    areaNames = configuredAreas.length ? configuredAreas.map((a) => a.name) : cities
  }

  const headingText = headingProp || heading

  // Build the marker list for the map — only cities we have coordinates for.
  const markers = areaNames
    .filter((city) => CITY_COORDS[city])
    .map((city) => ({
      name: city,
      lat: CITY_COORDS[city][0],
      lng: CITY_COORDS[city][1],
      href: hrefFor(city),
    }))

  return (
    <Section className="bg-white px-0 pb-0 pt-16 md:pt-24">
      <div className="grid gap-0 lg:grid-cols-[1fr_1.4fr]">
        {/* ── Left column: heading, city list, CTA ── */}
        <div className="flex flex-col justify-start px-6 pb-16 md:px-10 lg:px-14">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-brass-deep">
            Service areas
          </p>
          <h2 className="mt-3 max-w-sm font-display text-3xl font-medium leading-tight tracking-tight text-ink md:text-4xl">
            {headingText}
          </h2>
          <p className="mt-4 max-w-xs text-sm leading-6 text-ink-2/60">
            We serve homeowners across the entire Silicon Valley — from San Jose to Palo Alto and
            everywhere in between.
          </p>

          {/* City name list — compact, readable, linked */}
          <div className="mt-8 flex flex-wrap gap-x-2 gap-y-2">
            {areaNames.map((city, i) => (
              <span key={city} className="text-sm text-ink-2/70">
                <a href={hrefFor(city)} className="transition-colors hover:text-brass-deep">
                  <Badge>{city}</Badge>
                </a>
              </span>
            ))}
          </div>

          <Button href={trailingHref} variant="line" className="mt-8 self-start text-ink">
            {trailingLabel}
            <ArrowUpRight className="h-4 w-4" aria-hidden />
          </Button>
        </div>

        {/* ── Right column: Leaflet map ── */}
        <div className="relative min-h-[420px] lg:min-h-[560px]">
          <ServiceAreasMap markers={markers} />
        </div>
      </div>
    </Section>
  )
}
