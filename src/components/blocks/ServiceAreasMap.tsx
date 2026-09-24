/**
 * ServiceAreasMap — the service-area coverage map, on mapcn + OpenFreeMap.
 *
 * Built on the vendored mapcn primitives in `src/components/ui/map.tsx`
 * (MapLibre GL underneath) with OpenFreeMap's vector tiles. It replaced a
 * Google Maps build that needed a billed API key and went blank when the demo
 * key hit its daily quota; OpenFreeMap needs no key and no account, so the map
 * renders the same in local development as in production.
 *
 * ── What is custom, and why ───────────────────────────────────────────────
 *
 *   1. **The terrain.** `paintSiteBasemap` in `src/lib/siteMapStyle.ts`
 *      repaints OpenFreeMap's `positron` in the site's tokens: paper ground,
 *      white roads on brass casings, water the only cool tone, rail and
 *      runways switched off. MapLibre's own controls are off wholesale.
 *
 *   2. **The cities, not the county.** Coverage is one pin per city the
 *      company actually serves, each with a soft brass halo at roughly the
 *      radius it works within, so the shape that emerges is the real service
 *      footprint. Nothing shades a county or a region: an administrative
 *      boundary is not what is being sold. The halos are real polygons in
 *      metres (`circlePolygon`), not MapLibre `circle` layers, which size in
 *      screen pixels and would drift against the land as you zoom.
 *
 *   3. **The pins.** A brass teardrop carrying a house glyph, seated on a
 *      ground shadow, that lifts on hover and opens a bordered card on click.
 *      Each is a real `<button>` with React state behind it, so the map is
 *      keyboard-operable — mapcn's own marker is a plain div. City names ride
 *      under the pins from zoom 11 up, and on hover at any zoom.
 *
 *   4. **The controls.** Ordinary React buttons overlaid on the canvas, so
 *      zoom and "fit all" speak the site's button language.
 *
 * The map only mounts once it scrolls near the viewport — this section sits at
 * the foot of almost every page, so loading MapLibre and a tile set everywhere
 * would be a sitewide cost for a mostly unseen element.
 */
'use client'

import { Crosshair, Minus, Plus } from 'lucide-react'
import dynamic from 'next/dynamic'
import { useCallback, useEffect, useMemo, useRef, useState } from 'react'

import type { MapRef } from '@/components/ui/map'
import { MapPinGradientDefs } from '@/components/ui/MapPin'
import { circlePolygon, paintSiteBasemap } from '@/lib/siteMapStyle'

/**
 * MapLibre and the mapcn primitives are ~287 KB gzipped and this section is in
 * the footer of nearly every page, so the whole canvas is a separate chunk
 * that is only fetched once the section is near the viewport. Nothing in this
 * file may import `@/components/ui/map` or `maplibre-gl` at runtime — a value
 * import here would pull the library straight back into every page's bundle,
 * which is exactly the state this replaced. Types are fine: they are erased.
 */
const ServiceAreasMapCanvas = dynamic(() => import('./ServiceAreasMapCanvas'), { ssr: false })

export type MapMarker = {
  name: string
  lat: number
  lng: number
  /**
   * Where the pin's card links to. Optional: the Google Ads landing pages
   * show the same map with nothing clickable on it, because sending an ad
   * click off to a city page is the one thing those pages must not do.
   * Without it the card is the city's name alone.
   */
  href?: string
}

/**
 * The zoom the controls start out assuming, before the map reports its own.
 * The real minimum and maximum come from the MapLibre instance
 * (`getMinZoom`/`getMaxZoom`) rather than being restated here — the canvas
 * module sets them, and two copies of a bound is how a disabled button and a
 * map end up disagreeing.
 */
const FALLBACK_ZOOM = 10

/** Keeps the fitted bounds clear of the overlaid controls and the cards. */
const FIT_PADDING = { top: 80, right: 80, bottom: 80, left: 80 }

/**
 * The coverage halo under each city, in metres. Wide enough that neighbouring
 * peninsula cities knit into one footprint, tight enough that the outlying
 * ones still read as separate places. Tune here, not in the paint below.
 */
const CITY_HALO_RADIUS_M = 4200

/** Below this, thirty permanent name labels would collide; above it they fit. */
const LABEL_ZOOM = 11

export function ServiceAreasMap({
  markers,
  locationsServed,
}: {
  markers: MapMarker[]
  locationsServed: number
}) {
  const wrapperRef = useRef<HTMLDivElement>(null)
  const mapRef = useRef<MapRef | null>(null)

  const [ready, setReady] = useState(false)
  const [zoom, setZoom] = useState(FALLBACK_ZOOM)
  const [limits, setLimits] = useState<{ min: number; max: number } | null>(null)
  const [openCity, setOpenCity] = useState<string | null>(null)
  // Starts `false` and is turned on by the effect below, so the server's markup
  // and the client's first render agree: deciding it in the initialiser (the
  // server has no `IntersectionObserver`, the browser does) made them disagree
  // and React threw the tree away on hydration, which is where this page's
  // "Hydration failed" console error came from.
  const [inView, setInView] = useState(false)

  // Keyed on coordinates, not array identity: a parent re-render that rebuilds
  // the marker array must not refit the map underneath the reader.
  const markerKey = markers.map((marker) => `${marker.lat},${marker.lng}`).join('|')

  const halos = useMemo(
    () => ({
      type: 'FeatureCollection' as const,
      features: markers.map((marker) => ({
        type: 'Feature' as const,
        properties: { name: marker.name },
        geometry: {
          type: 'Polygon' as const,
          coordinates: [circlePolygon(marker.lat, marker.lng, CITY_HALO_RADIUS_M)],
        },
      })),
    }),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [markerKey],
  )

  /* Defer MapLibre and the tiles until the section is nearly on screen. */
  useEffect(() => {
    const element = wrapperRef.current
    if (!element) return
    // Nothing to wait for without an observer: mount on the next frame. (On the
    // frame rather than in the effect body, which `react-hooks/set-state-in-effect`
    // rejects.)
    if (typeof IntersectionObserver === 'undefined') {
      const frame = requestAnimationFrame(() => setInView(true))
      return () => cancelAnimationFrame(frame)
    }
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries.some((entry) => entry.isIntersecting)) {
          setInView(true)
          observer.disconnect()
        }
      },
      { rootMargin: '300px' },
    )
    observer.observe(element)
    return () => observer.disconnect()
  }, [])

  const fitAll = useCallback(() => {
    const map = mapRef.current
    if (!map) return
    if (markers.length === 0) return
    if (markers.length === 1) {
      map.easeTo({ center: [markers[0].lng, markers[0].lat], zoom: 12 })
      return
    }
    // A plain bounding box rather than `new LngLatBounds(...)`: constructing
    // the class would mean a value import of `maplibre-gl` in this file and
    // the library would ship on every page again. `fitBounds` takes the
    // literal form just as happily.
    const lats = markers.map((marker) => marker.lat)
    const lngs = markers.map((marker) => marker.lng)
    map.fitBounds(
      [
        [Math.min(...lngs), Math.min(...lats)],
        [Math.max(...lngs), Math.max(...lats)],
      ],
      { padding: FIT_PADDING, duration: 0 },
    )
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [markerKey])

  /**
   * A ref callback rather than an effect: it runs the moment mapcn hands the
   * MapLibre instance over, and React 19 calls the returned function on
   * teardown, so the listeners never outlive the map they are bound to.
   */
  const attachMap = useCallback(
    (map: MapRef | null) => {
      mapRef.current = map
      if (!map) return

      const paint = () => paintSiteBasemap(map)
      // The canvas module owns the zoom limits; the controls read them back
      // off the instance so a disabled button can never disagree with the map.
      const syncZoom = () => {
        setZoom(map.getZoom())
        setLimits({ min: map.getMinZoom(), max: map.getMaxZoom() })
      }
      const closeCards = () => setOpenCity(null)
      const onReady = () => {
        paint()
        fitAll()
        syncZoom()
        setReady(true)
      }

      if (map.isStyleLoaded()) onReady()
      else map.once('style.load', onReady)
      // A style reload (the theme observer upstream) drops every paint
      // override, so re-apply rather than leave the map in OpenFreeMap grey.
      map.on('style.load', paint)
      map.on('zoom', syncZoom)
      map.on('click', closeCards)

      return () => {
        map.off('style.load', paint)
        map.off('zoom', syncZoom)
        map.off('click', closeCards)
        mapRef.current = null
      }
    },
    [fitAll],
  )

  const nudgeZoom = (delta: number) => {
    const map = mapRef.current
    if (!map) return
    map.easeTo({
      zoom: Math.min(map.getMaxZoom(), Math.max(map.getMinZoom(), map.getZoom() + delta)),
    })
  }

  const labelsPinned = zoom >= LABEL_ZOOM

  return (
    <div ref={wrapperRef} className="relative h-full w-full overflow-hidden bg-paper-2">
      <style>{MAP_CSS}</style>

      {/* Defined once and shared by every pin's `fill="url(#…)"`. The pins are
          portalled into MapLibre's marker elements, but that is the same
          document, so the reference resolves. */}
      <MapPinGradientDefs />

      <div
        className="absolute inset-0"
        role="application"
        aria-label={`Map of the ${markers.length} Silicon Valley cities Prime Design & Build serves`}
      >
        {inView ? (
          <ServiceAreasMapCanvas
            markers={markers}
            halos={halos}
            openCity={openCity}
            labelled={labelsPinned}
            onToggle={(name) => setOpenCity((current) => (current === name ? null : name))}
            onMap={attachMap}
          />
        ) : null}
      </div>

      {/* Hairline inset, so the map sits in the page rather than floating as a
          rectangle pasted on top of it. */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 ring-1 ring-inset ring-line"
      />

      {!ready ? (
        <div className="absolute inset-0 flex items-center justify-center bg-paper-2">
          <span className="h-1 w-24 animate-pulse bg-brass/40" />
          <span className="sr-only">Loading the service area map</span>
        </div>
      ) : null}

      {/* ── Custom controls ── */}
      <div className="absolute right-4 top-4 flex flex-col border border-line bg-paper shadow-sm shadow-ink/5">
        <MapControl
          label="Zoom in"
          onClick={() => nudgeZoom(1)}
          disabled={!ready || (limits !== null && zoom >= limits.max)}
        >
          <Plus className="h-4 w-4" aria-hidden />
        </MapControl>
        <MapControl
          label="Zoom out"
          onClick={() => nudgeZoom(-1)}
          disabled={!ready || (limits !== null && zoom <= limits.min)}
          className="border-t border-line"
        >
          <Minus className="h-4 w-4" aria-hidden />
        </MapControl>
        <MapControl
          label="Show every service area"
          onClick={fitAll}
          disabled={!ready}
          className="border-t border-line"
        >
          <Crosshair className="h-4 w-4" aria-hidden />
        </MapControl>
      </div>

      <MapCountChip count={locationsServed} />
    </div>
  )
}

/* ------------------------------------------------------------------ *
 * Overlaid chrome
 * ------------------------------------------------------------------ */

function MapControl({
  label,
  onClick,
  disabled,
  className,
  children,
}: {
  label: string
  onClick: () => void
  disabled?: boolean
  className?: string
  children: React.ReactNode
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      aria-label={label}
      title={label}
      className={[
        'flex h-9 w-9 items-center justify-center text-ink-2 transition-colors',
        'hover:bg-white hover:text-brass-deep disabled:cursor-default disabled:text-ink-2/25 disabled:hover:bg-transparent',
        className ?? '',
      ].join(' ')}
    >
      {children}
    </button>
  )
}

function MapCountChip({ count }: { count: number }) {
  if (!count) return null
  return (
    <p className="pointer-events-none absolute bottom-4 left-4 z-10 border border-line bg-paper/95 px-3 py-2 text-[11px] font-semibold uppercase tracking-[0.14em] text-brass-deep">
      {count} locations served
    </p>
  )
}

/* ------------------------------------------------------------------ *
 * The parts Tailwind cannot reach
 * ------------------------------------------------------------------ */

/**
 * Three things live outside React's tree here: MapLibre's marker elements (the
 * portal hosts), its attribution control, and the keyframes for the pin drop.
 * Everything else about the pin is Tailwind on elements this file renders.
 */
const MAP_CSS = `
.pdb-pin { z-index: 10; }
.pdb-pin:hover { z-index: 30; }
.pdb-pin.is-open { z-index: 40; }
.pdb-pin__content { line-height: 1; }

/* The lift. The shadow shrinks and softens at the same time, which is what
   sells the pin as being picked up rather than just scaled. */
.pdb-pin__button {
  transition: transform 220ms cubic-bezier(0.22, 1, 0.36, 1);
  animation: pdb-drop 520ms cubic-bezier(0.22, 1, 0.36, 1) both;
  animation-delay: var(--pdb-delay, 0ms);
}
.pdb-pin__button:hover,
.pdb-pin__button:focus-visible,
.pdb-pin.is-open .pdb-pin__button {
  transform: translateY(-5px) scale(1.12);
}
.pdb-pin__shadow {
  transition: transform 220ms cubic-bezier(0.22, 1, 0.36, 1), opacity 220ms ease;
}
.pdb-pin__button:hover ~ .pdb-pin__shadow,
.pdb-pin.is-open .pdb-pin__shadow {
  transform: translateX(-50%) translateY(2px) scale(0.72);
  opacity: 0.55;
}

@keyframes pdb-drop {
  0%   { opacity: 0; transform: translateY(-16px) scale(0.85); }
  60%  { opacity: 1; transform: translateY(2px) scale(1.02); }
  100% { opacity: 1; transform: translateY(0) scale(1); }
}

@media (prefers-reduced-motion: reduce) {
  .pdb-pin__button { animation: none; transition: none; }
  .pdb-pin__shadow { transition: none; }
}

/* OpenStreetMap's attribution is required and stays; it is only restyled to
   the site's type so it reads as a credit line rather than browser chrome. */
.maplibregl-ctrl-attrib {
  background: rgba(250, 247, 242, 0.9) !important;
  font-size: 10px;
  letter-spacing: 0.02em;
}
.maplibregl-ctrl-attrib a { color: #1f3358; }
.maplibregl-ctrl-bottom-right { z-index: 5; }
`
