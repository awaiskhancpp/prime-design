import { MapPin } from 'lucide-react'

import type { ProjectMap } from '@/lib/projects'

/**
 * The project's location, as an embedded Google map.
 *
 * WordPress records the coordinates in an ACF Google Map field and shows a
 * map on the project page; this renders the same thing from the migrated
 * `address` data.
 *
 * No Maps API key is configured on this project, so the keyless embed URL is
 * used. If `NEXT_PUBLIC_GOOGLE_MAPS_API_KEY` is ever set, the official Embed
 * API is used instead without any other change.
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
  /** Project title — used for the iframe's accessible name. */
  title: string
  variant?: 'panel' | 'wide'
}) {
  const query = `${map.lat},${map.lng}`
  const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY
  const embedUrl = apiKey
    ? `https://www.google.com/maps/embed/v1/place?key=${apiKey}&q=${encodeURIComponent(query)}&zoom=${map.zoom}`
    : `https://www.google.com/maps?q=${encodeURIComponent(query)}&z=${map.zoom}&output=embed`
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
        <iframe
          src={embedUrl}
          title={`Map of ${title}${map.address ? ` — ${map.address}` : ''}`}
          loading="lazy"
          referrerPolicy="no-referrer-when-downgrade"
          allowFullScreen
          className="absolute inset-0 h-full w-full border-0"
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
