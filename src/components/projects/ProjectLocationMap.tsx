import { MapPin } from 'lucide-react'

import { LocationMap } from '@/components/ui/LocationMap'
import type { ProjectMap } from '@/lib/projects'

/**
 * The project's location, on the site's own map.
 *
 * WordPress records the coordinates in an ACF Google Map field and shows a map
 * on the project page; this renders the same thing from the migrated
 * `address` data — the real latitude, longitude and zoom, not an address
 * looked up again at render time.
 *
 * It used to be a Google Maps embed, keyless for as long as no API key was
 * configured. That embed is gone the same way the service-area map's Google
 * build went: it pulls a third-party frame, hands Google the reader's
 * address, and depends on a keyed service to keep rendering. `LocationMap`
 * draws the same pin from OpenFreeMap's keyless tiles, in the site's own
 * basemap paint.
 *
 * `variant` sets the shape only:
 *   - `panel` fills the height of a neighbouring video on desktop
 *   - `wide`  is the standalone letterbox for projects with no video
 */
export function ProjectLocationMap({
  map,
  title,
  variant = 'wide',
}: {
  map: ProjectMap
  /** Project title — used for the map's accessible name. */
  title: string
  variant?: 'panel' | 'wide'
}) {
  // The WordPress ACF field stores these as numbers already; the migration
  // copied the object through unchanged.
  const query = `${map.lat},${map.lng}`
  const linkUrl = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(query)}`

  return (
    <figure className="flex min-w-0 flex-col">
      <div
        className={[
          'relative overflow-hidden bg-paper-2',
          variant === 'panel'
            ? // Portrait-ish on small screens, then stretches to match the
              // video beside it once the two sit in one row.
              'aspect-[4/3] sm:aspect-[16/9] lg:aspect-auto lg:min-h-[280px] lg:flex-1'
            : 'aspect-[4/3] sm:aspect-[16/7]',
        ].join(' ')}
      >
        <LocationMap
          places={[{ name: title, lat: map.lat, lng: map.lng }]}
          zoom={map.zoom}
          ariaLabel={`Map of ${title}${map.address ? ` — ${map.address}` : ''}`}
        />
      </div>

      {map.address ? (
        <figcaption className="mt-3 flex items-start gap-2 text-sm leading-6 text-ink-2/60">
          <MapPin className="mt-1 h-3.5 w-3.5 shrink-0 text-brass" aria-hidden />
          <span>
            {map.address}
            {' · '}
            <a
              href={linkUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="font-semibold text-brass-deep underline-offset-2 hover:underline"
            >
              Open in Google Maps
            </a>
          </span>
        </figcaption>
      ) : null}
    </figure>
  )
}
