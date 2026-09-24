'use client'

/**
 * The service-area map's canvas — everything that touches MapLibre.
 *
 * Split out of `ServiceAreasMap` for one reason: weight. MapLibre is ~287 KB
 * gzipped, this section sits in the footer of almost every page on the site,
 * and a static import meant every visitor downloaded and parsed the whole
 * library whether or not they ever scrolled far enough to see a map. The
 * parent loads this module with `next/dynamic` only once the section is near
 * the viewport, so the cost is paid by the readers who actually get one.
 *
 * Nothing here holds state of its own. The parent owns which card is open, the
 * zoom-dependent labels and the controls; this renders the map and hands the
 * MapLibre instance back through `onMap`.
 */

import type { FeatureCollection, Polygon } from 'geojson'
import { useEffect, useRef } from 'react'

import {
  Map as MapCanvas,
  MapGeoJSON,
  MapMarker as MapcnMarker,
  MarkerContent,
  type MapRef,
} from '@/components/ui/map'
import { MapPinGlyph } from '@/components/ui/MapPin'

import type { MapMarker } from './ServiceAreasMap'

/** Roughly the centroid of the service area, used before bounds are fitted. */
const FALLBACK_CENTER: [number, number] = [-121.98, 37.41]
const FALLBACK_ZOOM = 10
const MIN_ZOOM = 8
const MAX_ZOOM = 15

/**
 * Halos sit under every label but over the ground. `waterway_line_label` is
 * the first symbol layer in OpenFreeMap's positron style — which is the style
 * this map is pinned to (`theme="light"` below), so the layer is always there.
 * The theme has to be pinned: mapcn otherwise follows the OS's dark-mode
 * preference into OpenFreeMap's `dark` style, whose layer names are entirely
 * different (no `waterway_line_label`, and `place_*` instead of `label_*`) —
 * that made the halos throw "Cannot add layer before non-existing layer" and
 * left every city label in the dark style's blurred, dotted look.
 */
const HALO_BEFORE_LAYER = 'waterway_line_label'

export default function ServiceAreasMapCanvas({
  markers,
  halos,
  openCity,
  labelled,
  onToggle,
  onMap,
}: {
  markers: MapMarker[]
  halos: FeatureCollection<Polygon, { name: string }>
  openCity: string | null
  labelled: boolean
  onToggle: (name: string) => void
  /** Handed the MapLibre instance on mount; may return a teardown. */
  onMap: (map: MapRef | null) => void | (() => void)
}) {
  return (
    <MapCanvas
      ref={onMap}
      // Pinned to the light positron style. The basemap paint in
      // `paintSiteBasemap` is written against positron's layer names, so
      // following the OS dark-mode preference would render OpenFreeMap's
      // `dark` style, skip nearly every paint override, and break the halo
      // layer below.
      theme="light"
      center={FALLBACK_CENTER}
      zoom={FALLBACK_ZOOM}
      minZoom={MIN_ZOOM}
      maxZoom={MAX_ZOOM}
      // The section spans the full page width, so an ordinary scroll has to
      // keep scrolling the page; ctrl/⌘ + wheel zooms.
      cooperativeGestures
      // Rotation and tilt say "explore me"; this map is a claim about where
      // the company works, and north-up is how that reads.
      dragRotate={false}
      pitchWithRotate={false}
      touchZoomRotate={false}
      className="h-full w-full"
    >
      <MapGeoJSON
        data={halos}
        beforeId={HALO_BEFORE_LAYER}
        fillPaint={{ 'fill-color': '#C19A5B', 'fill-opacity': 0.09 }}
        linePaint={{ 'line-color': '#C19A5B', 'line-opacity': 0.22, 'line-width': 1 }}
      />

      {markers.map((marker, index) => (
        <MapcnMarker
          key={`${marker.name}-${marker.lat}-${marker.lng}`}
          longitude={marker.lng}
          latitude={marker.lat}
          anchor="bottom"
        >
          <AreaPin
            marker={marker}
            index={index}
            open={openCity === marker.name}
            labelled={labelled}
            onToggle={() => onToggle(marker.name)}
          />
        </MapcnMarker>
      ))}
    </MapCanvas>
  )
}

/* ------------------------------------------------------------------ *
 * The pin
 * ------------------------------------------------------------------ */

/**
 * One city.
 *
 * The teardrop carries the house glyph this company actually builds. Its tip
 * is the bottom edge of this element, and the marker is anchored `bottom`, so
 * the tip — not the middle — is what marks the city.
 *
 * `is-open` is written onto MapLibre's own marker element, one level above
 * anything React renders here, because that element is the positioned box the
 * browser stacks: raising the card from inside would still leave it under the
 * next marker in the DOM.
 */
function AreaPin({
  marker,
  index,
  open,
  labelled,
  onToggle,
}: {
  marker: MapMarker
  index: number
  open: boolean
  labelled: boolean
  onToggle: () => void
}) {
  const rootRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const host = rootRef.current?.parentElement
    if (!host) return
    host.classList.add('pdb-pin')
    host.classList.toggle('is-open', open)
  }, [open])

  return (
    <MarkerContent className="pdb-pin__content">
      <div
        ref={rootRef}
        className="group relative h-9 w-[26px]"
        // Staggers the drop-in so thirty pins land as a sweep, not a flash.
        style={{ ['--pdb-delay' as string]: `${Math.min(index * 28, 700)}ms` }}
      >
        {/* Ground shadow: the pin is standing on the map, not floating over it. */}
        <span
          aria-hidden
          className="pdb-pin__shadow absolute bottom-0 left-1/2 h-[5px] w-[15px] -translate-x-1/2 translate-y-[2px] rounded-full bg-ink/25 blur-[1.5px]"
        />

        <button
          type="button"
          onClick={(event) => {
            // Without this the map's own click handler closes the card in the
            // same gesture that opened it.
            event.stopPropagation()
            onToggle()
          }}
          aria-expanded={open}
          aria-label={`${marker.name} — view service area`}
          className="pdb-pin__button absolute inset-0 origin-bottom cursor-pointer outline-offset-[3px] focus-visible:outline-2 focus-visible:outline-ink"
        >
          <MapPinGlyph className="block drop-shadow-[0_2px_3px_rgba(20,33,61,0.22)]" />
        </button>

        {/* The city name: always on hover, permanently once zoomed past
            LABEL_ZOOM, and never while its own card is open. */}
        <span
          aria-hidden
          className={[
            'pointer-events-none absolute left-1/2 top-full mt-[7px] -translate-x-1/2 whitespace-nowrap',
            'border border-line bg-paper/95 px-[7px] py-[3px] text-[11px] font-semibold tracking-[0.03em] text-ink',
            'transition-opacity duration-150',
            open ? 'opacity-0' : labelled ? 'opacity-100' : 'opacity-0 group-hover:opacity-100',
          ].join(' ')}
        >
          {marker.name}
        </span>

        {/* Card: square corners, hairline border, brass rule on top — the same
            language as the bordered panels elsewhere on the site. */}
        {open ? (
          <div className="absolute bottom-[44px] left-1/2 min-w-[158px] -translate-x-1/2 border border-line border-t-2 border-t-brass bg-white px-[14px] pb-[13px] pt-3 shadow-[0_10px_30px_rgba(20,33,61,0.14)]">
            <p className="text-sm font-semibold text-ink">{marker.name}</p>
            {/* No href means no link at all, rather than an anchor going
                nowhere: an `<a>` with no target is still announced as a link
                and still takes a tab stop. */}
            {marker.href ? (
              <a
                href={marker.href}
                className="mt-[7px] inline-block border-b border-brass-deep/35 pb-[2px] text-[10px] font-bold uppercase tracking-[0.14em] text-brass-deep transition-colors hover:border-brass-deep"
              >
                View service area
              </a>
            ) : null}
          </div>
        ) : null}
      </div>
    </MarkerContent>
  )
}
