'use client'

/**
 * LocationMap — one small map with a pin per place, on mapcn + OpenFreeMap.
 *
 * This is the primer that `ServiceAreasMap` is not: that one is the coverage
 * map, and everything about it — the halos, the keyboard-operable cards, the
 * city labels, the count chip — is the claim that the company works across
 * thirty cities. This one answers the smaller question a page asks about a
 * specific place: where a finished project is, or where the offices are.
 *
 * It shares the two things that must not diverge: the basemap paint
 * (`paintSiteBasemap`) and the brass pin (`MapPin`). Everything else here is
 * deliberately plain — pins, a fit to the pins, and nothing overlaid on top,
 * because a second set of zoom controls on a 320px map is chrome for chrome's
 * sake.
 *
 * OpenFreeMap needs no key and no account, so this renders identically in local
 * development and in production — the reason the Google Maps embeds it
 * replaces were replaced.
 *
 * Tiles are deferred until the map is nearly on screen: these sit beside videos
 * and below the fold, and paying for a tile set the reader never reaches is a
 * cost with nothing to show for it.
 */

import dynamic from 'next/dynamic'
import { useCallback, useEffect, useMemo, useRef, useState } from 'react'

import type { MapRef } from '@/components/ui/map'
import { MapPinGradientDefs } from '@/components/ui/MapPin'
import { paintSiteBasemap } from '@/lib/siteMapStyle'
import { cn } from '@/lib/utils'

/**
 * The canvas is a separate chunk, fetched only once the map is near the
 * viewport. Nothing in this file may import `@/components/ui/map` or
 * `maplibre-gl` for a value — that would put the library back in the bundle of
 * every page that merely *contains* a map. Type imports are erased and fine.
 */
const LocationMapCanvas = dynamic(() => import('./LocationMapCanvas'), { ssr: false })

export type MapPlace = {
  /** Used for the marker's own label and the accessible summary. */
  name: string
  lat: number
  lng: number
}

/** Keeps the fitted pins clear of the container's edges. */
const FIT_PADDING = { top: 56, right: 56, bottom: 56, left: 56 }

/** What a single place is shown at unless the caller knows better. */
const SINGLE_PLACE_ZOOM = 15

/** Where a multi-pin map starts before `fitAll` replaces it — see below. */
const MULTI_PLACE_ZOOM = 9

/**
 * How far a fit may zoom in.
 *
 * Two offices 30km apart in a wide letterbox fit on latitude alone, which left
 * the pins in the middle third of a band that was otherwise ocean and East
 * Bay. Capping the fit keeps a two-pin map from framing more than it has
 * anything to say about; a single place is not fitted and ignores this.
 */
const FIT_MAX_ZOOM = 12

export function LocationMap({
  places,
  zoom,
  ariaLabel,
  className,
}: {
  places: MapPlace[]
  /**
   * Starting zoom. Ignored when there is more than one place, where the pins
   * are fitted instead — one zoom cannot suit both Campbell and San Mateo.
   */
  zoom?: number
  /** Accessible name for the map. Falls back to a count of the pins. */
  ariaLabel?: string
  className?: string
}) {
  const wrapperRef = useRef<HTMLDivElement>(null)
  const mapRef = useRef<MapRef | null>(null)
  const [ready, setReady] = useState(false)
  // Starts `false` and is turned on by the effect below, so the server's markup
  // and the client's first render agree. Deciding it in the initialiser — where
  // the server has no `IntersectionObserver` and the browser does — makes the
  // two disagree and React throws the tree away on hydration.
  const [inView, setInView] = useState(false)

  // Keyed on the coordinates rather than on array identity: a parent that
  // rebuilds the array on each render would otherwise hand this component new
  // `places`, re-run `fitAll`, and yank the map back to the fitted view under
  // someone who had just panned it.
  const placeKey = places.map((place) => `${place.lat},${place.lng}`).join('|')

  // A coordinate that is not a number would reach MapLibre as NaN and blank the
  // canvas, so anything unplaceable is dropped before it gets that far.
  const placeable = useMemo(
    () => places.filter((place) => Number.isFinite(place.lat) && Number.isFinite(place.lng)),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [placeKey],
  )

  const center: [number, number] = placeable.length ? [placeable[0].lng, placeable[0].lat] : [0, 0]

  /**
   * Several pins are fitted on load, so their starting zoom only has to be
   * somewhere sane for the frame or two before `fitAll` runs — but it has to
   * be *out*, not in: starting at street zoom and fitting outward shows a
   * blurred overzoomed tile for that frame. A caller's `zoom` is for the
   * single-place case, which is never fitted.
   */
  const initialZoom = placeable.length > 1 ? MULTI_PLACE_ZOOM : (zoom ?? SINGLE_PLACE_ZOOM)

  const fitAll = useCallback(() => {
    const map = mapRef.current
    if (!map || placeable.length < 2) return
    // A literal bounding box rather than `new LngLatBounds(...)`: constructing
    // the class would be a value import of `maplibre-gl` in this file, which
    // is exactly what the dynamic import above exists to avoid.
    const lats = placeable.map((place) => place.lat)
    const lngs = placeable.map((place) => place.lng)
    map.fitBounds(
      [
        [Math.min(...lngs), Math.min(...lats)],
        [Math.max(...lngs), Math.max(...lats)],
      ],
      { padding: FIT_PADDING, maxZoom: FIT_MAX_ZOOM, duration: 0 },
    )
  }, [placeable])

  /* Defer MapLibre and the tiles until the map is nearly on screen. */
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
      const onReady = () => {
        paint()
        fitAll()
        setReady(true)
      }

      if (map.isStyleLoaded()) onReady()
      else map.once('style.load', onReady)
      // A style reload (the theme observer in mapcn) drops every paint
      // override, so re-apply rather than leave the map in OpenFreeMap grey.
      map.on('style.load', paint)

      return () => {
        map.off('style.load', paint)
        mapRef.current = null
      }
    },
    [fitAll],
  )

  // Nothing placeable means nothing to draw: render nothing at all rather than a
  // loading state that would never finish. The caller's own caption or address
  // list still carries the information.
  if (!placeable.length) return null

  return (
    <div
      ref={wrapperRef}
      className={cn('relative h-full w-full overflow-hidden bg-paper-2', className)}
    >
      <MapPinGradientDefs />

      <div
        className="absolute inset-0"
        role="application"
        aria-label={
          ariaLabel ?? `Map of ${placeable.length} location${placeable.length === 1 ? '' : 's'}`
        }
      >
        {inView ? (
          <LocationMapCanvas
            places={placeable}
            center={center}
            zoom={initialZoom}
            onMap={attachMap}
          />
        ) : null}
      </div>

      {/* Hairline inset, so the map sits in the page rather than reading as a
          rectangle pasted on top of it. */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 ring-1 ring-inset ring-line"
      />

      {!ready ? (
        <div className="absolute inset-0 flex items-center justify-center bg-paper-2">
          <span className="h-1 w-24 animate-pulse bg-brass/40" />
          <span className="sr-only">Loading the map</span>
        </div>
      ) : null}
    </div>
  )
}
