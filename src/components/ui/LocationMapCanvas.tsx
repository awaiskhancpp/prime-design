'use client'

/**
 * `LocationMap`'s canvas — everything that touches MapLibre.
 *
 * Split out for the same reason as the service-area map's: MapLibre is ~287 KB
 * gzipped, and a static import put it in the bundle of every page carrying a
 * project or an office map whether or not the reader ever scrolled to one. The
 * parent loads this with `next/dynamic` once the map is near the viewport, and
 * because both maps' canvases import the same module, a page showing two of
 * them still downloads the library once.
 */

import { Map as MapCanvas, MapMarker, MarkerContent, type MapRef } from '@/components/ui/map'
import { MapPinGlyph } from '@/components/ui/MapPin'

import type { MapPlace } from './LocationMap'

const MIN_ZOOM = 3
const MAX_ZOOM = 18

export default function LocationMapCanvas({
  places,
  center,
  zoom,
  onMap,
}: {
  places: MapPlace[]
  center: [number, number]
  zoom: number
  /** Handed the MapLibre instance on mount; may return a teardown. */
  onMap: (map: MapRef | null) => void | (() => void)
}) {
  return (
    <MapCanvas
      ref={onMap}
      // Pinned to light: the basemap paint (`paintSiteBasemap`) is written
      // against OpenFreeMap's positron layer names, so letting mapcn follow the
      // OS dark-mode preference would paint the `dark` style instead and leave
      // the map in raw dark grey.
      theme="light"
      center={center}
      zoom={zoom}
      minZoom={MIN_ZOOM}
      maxZoom={MAX_ZOOM}
      // An ordinary scroll has to keep scrolling the page; ctrl/⌘ + wheel
      // zooms. These maps are read, not explored.
      cooperativeGestures
      dragRotate={false}
      pitchWithRotate={false}
      touchZoomRotate={false}
      className="h-full w-full"
    >
      {places.map((place) => (
        <MapMarker
          key={`${place.name}-${place.lat}-${place.lng}`}
          longitude={place.lng}
          latitude={place.lat}
          anchor="bottom"
        >
          <MarkerContent>
            <span className="relative block h-9 w-[26px]">
              {/* Ground shadow: the pin stands on the map rather than floating
                  over it. */}
              <span
                aria-hidden
                className="absolute bottom-0 left-1/2 h-[5px] w-[15px] -translate-x-1/2 translate-y-[2px] rounded-full bg-ink/25 blur-[1.5px]"
              />
              <MapPinGlyph className="relative block drop-shadow-[0_2px_3px_rgba(20,33,61,0.22)]" />
            </span>
          </MarkerContent>
        </MapMarker>
      ))}
    </MapCanvas>
  )
}
