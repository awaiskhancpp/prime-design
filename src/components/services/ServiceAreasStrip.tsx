import { LandscapingServiceAreas } from '@/components/blocks/LandscapingServiceAreas'

/**
 * "Areas we service" on a service page.
 *
 * This used to derive the city list itself and hand it to
 * `LandingServiceAreasSection`, the plain pill strip. It now renders
 * `LandscapingServiceAreas` — the section with the coverage map — which is the
 * same section every other page of the site already shows.
 *
 * The derivation that lived here is gone rather than passed along, because
 * `LandscapingServiceAreas` already does exactly the same thing: it resolves
 * the service's own location pages first and falls back to the shared Site
 * Settings list, and it applies the same rule about which service slug
 * prefixes the city links (only Kitchen, Bathroom and Home Remodeling keep
 * their own name; everything else uses `kitchen-remodeling`). Keeping a second
 * copy here is how the two drift apart.
 *
 * Nothing is lost in the swap: the trailing "And surrounding cities!" pill
 * this component used to append is already rendered by the target as its
 * trailing link to /contact (`website.json`'s `serviceAreas.trailingLabel`).
 */
export function ServiceAreasStrip({
  serviceSlug,
  heading,
}: {
  serviceSlug: string
  /** The service's `areasWeService.heading`, passed through exactly as Payload has it. */
  heading?: string
}) {
  return <LandscapingServiceAreas serviceSlug={serviceSlug} heading={heading} />
}
