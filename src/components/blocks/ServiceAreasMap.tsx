/**
 * ServiceAreasMap — the service-area coverage map, on Google Maps.
 *
 * Built directly against the Google Maps JavaScript API: no Leaflet, no
 * `@googlemaps/js-api-loader`, no React wrapper package. `src/lib/googleMaps.ts`
 * inserts Google's script once and hands back a typed handle; everything from
 * the basemap paint down to the pins is this project's own design.
 *
 * ── What is custom, and why ───────────────────────────────────────────────
 *
 *   1. **The terrain.** `SERVICE_AREAS_MAP_STYLE` repaints the basemap as a
 *      brass-and-paper topographic survey: the valley floor in `--color-paper`,
 *      the Santa Cruz Mountains and the Diablo Range rising into brass, water
 *      the only cool tone. Google's own controls are off wholesale
 *      (`disableDefaultUI`). See that file for why the relief is tinted rather
 *      than colour-filled.
 *
 *   2. **The cities, not the county.** Coverage is shown as one pin per city
 *      the company actually serves, each with a soft brass halo at roughly the
 *      radius it works within — so the shape that emerges is the real service
 *      footprint. Nothing shades a whole county or region: an administrative
 *      boundary is not what is being sold.
 *
 *   3. **The pins.** Real DOM drawn through `OverlayView`, not `Marker` image
 *      sprites: a brass teardrop carrying a house glyph, seated on a ground
 *      shadow, that lifts on hover and opens a bordered card on click. Each is
 *      a `<button>`, so the map is keyboard-operable. City names ride under
 *      the pins from zoom 11 up, and on hover at any zoom.
 *
 *   4. **The controls.** Ordinary React buttons overlaid on the canvas, so
 *      zoom and "fit all" speak the site's button language, not Google's.
 *
 * The map only starts loading once it scrolls near the viewport — this section
 * sits at the foot of almost every page on the site, so eagerly loading the
 * Maps script everywhere would be a sitewide cost for a mostly unseen element.
 *
 * With no `NEXT_PUBLIC_GOOGLE_MAPS_API_KEY` set (and if the script fails to
 * load) it falls back to Google's keyless embed — plain Google chrome, none of
 * the above. If this section looks like an ordinary Google map, the key is
 * missing; that is the only thing that branch can mean.
 */
'use client'

import { Crosshair, Minus, Plus } from 'lucide-react'
import { useCallback, useEffect, useRef, useState } from 'react'

import {
  GOOGLE_MAPS_API_KEY,
  loadGoogleMaps,
  type GCircle,
  type GMap,
  type GMapsEventListener,
  type GOverlayView,
  type GoogleMapsApi,
} from '@/lib/googleMaps'

import { SERVICE_AREAS_MAP_STYLE } from './serviceAreasMapStyle'

export type MapMarker = {
  name: string
  lat: number
  lng: number
  href: string
}

/** Roughly the centroid of the service area, used before bounds are fitted. */
const FALLBACK_CENTER = { lat: 37.41, lng: -121.98 }
const FALLBACK_ZOOM = 10
const MIN_ZOOM = 8
const MAX_ZOOM = 15

/** Keeps the fitted bounds clear of the overlaid controls and the card popups. */
const FIT_PADDING = { top: 80, right: 80, bottom: 80, left: 80 }

/**
 * The coverage halo under each city, in metres. Wide enough that neighbouring
 * peninsula cities knit into one footprint, tight enough that the outlying
 * ones still read as separate places. Tune here, not in the styles below.
 */
const CITY_HALO_RADIUS_M = 4200

/** Below this, thirty permanent name labels would collide; above it they fit. */
const LABEL_ZOOM = 11

/** SVG gradient id, defined once in the React tree and shared by every pin. */
const PIN_GRADIENT_ID = 'pdb-pin-gradient'

type Status = 'idle' | 'loading' | 'ready' | 'error'

/* ------------------------------------------------------------------ *
 * Pins
 * ------------------------------------------------------------------ */

type AreaPin = GOverlayView & {
  setOpen(open: boolean): void
  setLabelPinned(pinned: boolean): void
  readonly isOpen: boolean
}

type AreaPinCtor = new (data: MapMarker, index: number, onOpen: (pin: AreaPin) => void) => AreaPin

/**
 * The teardrop, with the house glyph this company actually builds inside it.
 * The tip sits at (13, 36) — the anchor geometry below depends on that.
 */
const PIN_SVG = `
<svg class="pdb-marker__svg" viewBox="0 0 26 36" width="26" height="36" aria-hidden="true" focusable="false">
  <path class="pdb-marker__body"
        d="M13 0C5.82 0 0 5.82 0 13c0 9.75 13 23 13 23s13-13.25 13-23C26 5.82 20.18 0 13 0z"
        fill="url(#${PIN_GRADIENT_ID})" />
  <path d="M8.2 13.4 13 9.1l4.8 4.3" fill="none" stroke="#FAF7F2" stroke-width="1.7"
        stroke-linecap="round" stroke-linejoin="round" />
  <path d="M9.7 12.6v5.5h6.6v-5.5" fill="none" stroke="#FAF7F2" stroke-width="1.7"
        stroke-linecap="round" stroke-linejoin="round" />
</svg>`

/**
 * `OverlayView` can only be subclassed once the API is on the page, so the
 * class is built on first use and cached against the API object it was built
 * from. Rebuilding it per pin would give every marker its own class.
 */
let pinClassCache: { api: GoogleMapsApi; ctor: AreaPinCtor } | null = null

function getPinClass(api: GoogleMapsApi): AreaPinCtor {
  if (pinClassCache?.api === api) return pinClassCache.ctor

  const Base = api.OverlayView

  class AreaMarkerPin extends Base implements AreaPin {
    private readonly data: MapMarker
    private readonly index: number
    private readonly onOpen: (pin: AreaPin) => void
    private root: HTMLDivElement | null = null
    private button: HTMLButtonElement | null = null
    private link: HTMLAnchorElement | null = null
    private open = false
    private labelPinned = false

    constructor(data: MapMarker, index: number, onOpen: (pin: AreaPin) => void) {
      super()
      this.data = data
      this.index = index
      this.onOpen = onOpen
    }

    override onAdd() {
      // A zero-size anchor: `left`/`top` land exactly on the coordinate and
      // every child positions itself around that one point, so the pin's tip
      // — not its middle — is what marks the city.
      const root = document.createElement('div')
      root.className = 'pdb-marker'
      // Staggers the drop-in so thirty pins land as a sweep, not a flash.
      root.style.setProperty('--pdb-delay', `${Math.min(this.index * 28, 700)}ms`)
      if (this.labelPinned) root.classList.add('is-labelled')

      const shadow = document.createElement('span')
      shadow.className = 'pdb-marker__shadow'

      const button = document.createElement('button')
      button.type = 'button'
      button.className = 'pdb-marker__pin'
      button.setAttribute('aria-expanded', 'false')
      button.setAttribute('aria-label', `${this.data.name} — view service area`)
      button.innerHTML = PIN_SVG

      // The city name: always on hover, permanently once zoomed in.
      const name = document.createElement('span')
      name.className = 'pdb-marker__name'
      name.textContent = this.data.name

      const card = document.createElement('div')
      card.className = 'pdb-marker__card'

      const title = document.createElement('p')
      title.className = 'pdb-marker__title'
      title.textContent = this.data.name

      const link = document.createElement('a')
      link.className = 'pdb-marker__link'
      link.href = this.data.href
      link.textContent = 'View service area'
      // Not reachable until the card is open, or tabbing the map would walk
      // through thirty invisible links.
      link.tabIndex = -1

      card.append(title, link)
      root.append(shadow, button, name, card)

      button.addEventListener('click', (event) => {
        event.stopPropagation()
        this.onOpen(this)
      })

      this.root = root
      this.button = button
      this.link = link
      this.getPanes()?.overlayMouseTarget.appendChild(root)
    }

    override draw() {
      const point = this.getProjection()?.fromLatLngToDivPixel({
        lat: this.data.lat,
        lng: this.data.lng,
      })
      if (!this.root || !point) return
      this.root.style.left = `${point.x}px`
      this.root.style.top = `${point.y}px`
    }

    override onRemove() {
      this.root?.remove()
      this.root = null
      this.button = null
      this.link = null
    }

    setOpen(open: boolean) {
      this.open = open
      this.root?.classList.toggle('is-open', open)
      this.button?.setAttribute('aria-expanded', String(open))
      if (this.link) this.link.tabIndex = open ? 0 : -1
    }

    setLabelPinned(pinned: boolean) {
      this.labelPinned = pinned
      this.root?.classList.toggle('is-labelled', pinned)
    }

    get isOpen() {
      return this.open
    }
  }

  pinClassCache = { api, ctor: AreaMarkerPin }
  return pinClassCache.ctor
}

/* ------------------------------------------------------------------ *
 * Component
 * ------------------------------------------------------------------ */

export function ServiceAreasMap({ markers }: { markers: MapMarker[] }) {
  const containerRef = useRef<HTMLDivElement>(null)
  const mapRef = useRef<GMap | null>(null)
  const fitAllRef = useRef<(() => void) | null>(null)

  const [status, setStatus] = useState<Status>('idle')
  const [zoom, setZoom] = useState(FALLBACK_ZOOM)
  // Lazily initialised rather than set from the effect below: a browser with
  // no IntersectionObserver has nothing to wait for, so it starts in view.
  // `inView` never reaches the markup, so the server evaluating this as `true`
  // (there is no observer there either) cannot desynchronise hydration.
  const [inView, setInView] = useState(() => typeof IntersectionObserver === 'undefined')

  // Keyed on coordinates, not array identity: a parent re-render that rebuilds
  // the marker array must not tear the map down and rebuild it.
  const markerKey = markers.map((marker) => `${marker.lat},${marker.lng}`).join('|')

  /* Defer the Maps script until the section is nearly on screen. */
  useEffect(() => {
    const element = containerRef.current
    if (!element || inView) return
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
  }, [inView])

  /* Build the map. */
  useEffect(() => {
    const container = containerRef.current
    if (!inView || !container || !GOOGLE_MAPS_API_KEY) return

    /**
     * The API load is async and this cleanup is not. Under StrictMode React
     * mounts, unmounts and remounts, so without a synchronous flag the first
     * run's promise resolves after its own teardown and builds a map into a
     * node the second run is also building into.
     */
    let cancelled = false
    let pins: AreaPin[] = []
    let halos: GCircle[] = []
    let listeners: GMapsEventListener[] = []

    // Google mutates the node it is given and leaves its own DOM behind. A
    // throwaway host per run means teardown is a single `remove()` and a
    // remount never inherits the previous map's leftovers.
    const host = document.createElement('div')
    host.style.position = 'absolute'
    host.style.inset = '0'
    container.appendChild(host)

    setStatus('loading')

    loadGoogleMaps()
      .then((api) => {
        if (cancelled) return

        const map = new api.Map(host, {
          center: FALLBACK_CENTER,
          zoom: FALLBACK_ZOOM,
          minZoom: MIN_ZOOM,
          maxZoom: MAX_ZOOM,
          // Every control is replaced by this component's own.
          disableDefaultUI: true,
          // The section spans the full page width, so an ordinary scroll must
          // keep scrolling the page; ctrl/⌘ + wheel zooms.
          gestureHandling: 'cooperative',
          // Google's own POI pins would compete with the service-area pins.
          clickableIcons: false,
          backgroundColor: '#f1ece3',
          styles: SERVICE_AREAS_MAP_STYLE,
        })
        mapRef.current = map

        // The coverage footprint: one soft halo per served city, drawn under
        // the pins. Deliberately not a county or region polygon — the company
        // serves cities, so cities are what is shaded.
        halos = markers.map(
          ({ lat, lng }) =>
            new api.Circle({
              map,
              center: { lat, lng },
              radius: CITY_HALO_RADIUS_M,
              fillColor: '#C19A5B',
              fillOpacity: 0.09,
              strokeColor: '#C19A5B',
              strokeOpacity: 0.22,
              strokeWeight: 1,
              // The pin is the click target; the halo must not swallow drags.
              clickable: false,
              zIndex: 1,
            }),
        )

        const PinClass = getPinClass(api)
        const closeAll = (except?: AreaPin) => {
          pins.forEach((pin) => pin.setOpen(pin === except))
        }

        pins = markers.map(
          (marker, index) =>
            new PinClass(marker, index, (self) => {
              // Second click on the open pin closes it.
              closeAll(self.isOpen ? undefined : self)
            }),
        )
        pins.forEach((pin) => pin.setMap(map))

        const applyZoom = () => {
          const next = map.getZoom() ?? FALLBACK_ZOOM
          setZoom(next)
          pins.forEach((pin) => pin.setLabelPinned(next >= LABEL_ZOOM))
        }

        const fitAll = () => {
          if (markers.length === 0) {
            map.setCenter(FALLBACK_CENTER)
            map.setZoom(FALLBACK_ZOOM)
            return
          }
          if (markers.length === 1) {
            map.setCenter({ lat: markers[0].lat, lng: markers[0].lng })
            map.setZoom(12)
            return
          }
          const bounds = new api.LatLngBounds()
          markers.forEach(({ lat, lng }) => bounds.extend({ lat, lng }))
          map.fitBounds(bounds, FIT_PADDING)
        }
        fitAllRef.current = fitAll
        fitAll()

        listeners = [
          // Clicking bare map dismisses an open card, the way the rest of the
          // site's popovers behave.
          map.addListener('click', () => closeAll()),
          map.addListener('zoom_changed', applyZoom),
        ]
        applyZoom()

        setStatus('ready')
      })
      .catch((error: unknown) => {
        if (cancelled) return
        // Loud on purpose: the fallback below still renders a map, so a silent
        // failure here would look like a working feature.
        console.error('[ServiceAreasMap] Google Maps failed to load', error)
        setStatus('error')
      })

    return () => {
      cancelled = true
      listeners.forEach((listener) => listener.remove())
      pins.forEach((pin) => pin.setMap(null))
      halos.forEach((halo) => halo.setMap(null))
      if (mapRef.current) {
        // Google attaches listeners to the map instance itself; without this
        // they survive the node being removed.
        const api = (window as Window & { google?: { maps?: GoogleMapsApi } }).google?.maps
        api?.event.clearInstanceListeners(mapRef.current)
      }
      mapRef.current = null
      fitAllRef.current = null
      host.remove()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [inView, markerKey])

  const nudgeZoom = useCallback((delta: number) => {
    const map = mapRef.current
    if (!map) return
    const next = Math.min(MAX_ZOOM, Math.max(MIN_ZOOM, (map.getZoom() ?? FALLBACK_ZOOM) + delta))
    map.setZoom(next)
  }, [])

  const usesFallback = !GOOGLE_MAPS_API_KEY || status === 'error'

  if (usesFallback) {
    return (
      <div className="relative h-full w-full overflow-hidden bg-paper-2">
        <iframe
          // Keyless embed: no API key, so no custom styling and no pins. The
          // query is a coordinate rather than a place name on purpose —
          // searching "Santa Clara County" makes Google shade the whole county,
          // which is the opposite of what this section is saying.
          src="https://www.google.com/maps?q=37.41,-121.98&z=9&output=embed"
          title="Map of the Silicon Valley areas Prime Design & Build serves"
          loading="lazy"
          referrerPolicy="no-referrer-when-downgrade"
          className="absolute inset-0 h-full w-full border-0"
        />
        <MapCountChip count={markers.length} />
      </div>
    )
  }

  return (
    <div className="relative h-full w-full overflow-hidden bg-paper-2">
      <style>{MAP_CSS}</style>

      {/* Defined once and shared by every pin's `fill="url(#…)"`. The pins live
          in Google's overlay pane, but that is the same document, so the
          reference resolves. */}
      <svg aria-hidden className="pointer-events-none absolute h-0 w-0">
        <defs>
          <linearGradient id={PIN_GRADIENT_ID} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#D2B07A" />
            <stop offset="55%" stopColor="#C19A5B" />
            <stop offset="100%" stopColor="#8F6C3E" />
          </linearGradient>
        </defs>
      </svg>

      <div
        ref={containerRef}
        className="absolute inset-0"
        role="application"
        aria-label={`Map of the ${markers.length} Silicon Valley cities Prime Design & Build serves`}
      />

      {/* Hairline inset, so the map sits in the page rather than floating as a
          rectangle pasted on top of it. */}
      <div aria-hidden className="pointer-events-none absolute inset-0 ring-1 ring-inset ring-line" />

      {status !== 'ready' ? (
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
          disabled={status !== 'ready' || zoom >= MAX_ZOOM}
        >
          <Plus className="h-4 w-4" aria-hidden />
        </MapControl>
        <MapControl
          label="Zoom out"
          onClick={() => nudgeZoom(-1)}
          disabled={status !== 'ready' || zoom <= MIN_ZOOM}
          className="border-t border-line"
        >
          <Minus className="h-4 w-4" aria-hidden />
        </MapControl>
        <MapControl
          label="Show every service area"
          onClick={() => fitAllRef.current?.()}
          disabled={status !== 'ready'}
          className="border-t border-line"
        >
          <Crosshair className="h-4 w-4" aria-hidden />
        </MapControl>
      </div>

      <MapCountChip count={markers.length} />
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
    <p className="pointer-events-none absolute bottom-4 left-4 border border-line bg-paper/95 px-3 py-2 text-[11px] font-semibold uppercase tracking-[0.14em] text-brass-deep">
      {count} cities served
    </p>
  )
}

/* ------------------------------------------------------------------ *
 * Pin styling
 * ------------------------------------------------------------------ */

/**
 * The pins live in Google's own overlay pane, outside React's tree and outside
 * Tailwind's scan, so their styling is a stylesheet rather than class names.
 * Values are the literal site tokens — brass #C19A5B, ink #14213D,
 * line #E4DED2 — because a token read through var() would resolve against the
 * pane, which sits outside the section that declares them.
 */
const MAP_CSS = `
/* A zero-size anchor sitting exactly on the city's coordinate. Every child
   positions itself against this one point, so nothing may resize it. */
.pdb-marker {
  position: absolute;
  width: 0;
  height: 0;
  font-family: inherit;
  line-height: 1;
}
.pdb-marker.is-open { z-index: 40; }
.pdb-marker:hover { z-index: 30; }

/* Ground shadow: the pin is standing on the map, not floating over it. */
.pdb-marker__shadow {
  position: absolute;
  left: 0;
  top: 0;
  width: 15px;
  height: 5px;
  margin: -2.5px 0 0 -7.5px;
  border-radius: 9999px;
  background: rgba(20, 33, 61, 0.28);
  filter: blur(1.5px);
  transition: transform 220ms cubic-bezier(0.22, 1, 0.36, 1), opacity 220ms ease;
}

.pdb-marker__pin {
  position: absolute;
  left: -13px;
  bottom: 0;
  width: 26px;
  height: 36px;
  padding: 0;
  border: 0;
  background: none;
  cursor: pointer;
  transform-origin: 50% 100%;
  transition: transform 220ms cubic-bezier(0.22, 1, 0.36, 1);
  animation: pdb-drop 520ms cubic-bezier(0.22, 1, 0.36, 1) both;
  animation-delay: var(--pdb-delay, 0ms);
}
.pdb-marker__svg {
  display: block;
  filter: drop-shadow(0 2px 3px rgba(20, 33, 61, 0.22));
}
.pdb-marker__body {
  transition: filter 200ms ease;
}

/* The lift. The shadow shrinks and softens at the same time, which is what
   sells the pin as being picked up rather than just scaled. */
.pdb-marker__pin:hover,
.pdb-marker__pin:focus-visible,
.pdb-marker.is-open .pdb-marker__pin {
  transform: translateY(-5px) scale(1.12);
}
.pdb-marker:hover .pdb-marker__shadow,
.pdb-marker.is-open .pdb-marker__shadow {
  transform: scale(0.72);
  opacity: 0.55;
}
.pdb-marker__pin:hover .pdb-marker__body,
.pdb-marker.is-open .pdb-marker__body {
  filter: brightness(1.06) saturate(1.08);
}
.pdb-marker__pin:focus-visible {
  outline: 2px solid #14213d;
  outline-offset: 3px;
  border-radius: 2px;
}

@keyframes pdb-drop {
  0%   { opacity: 0; transform: translateY(-16px) scale(0.85); }
  60%  { opacity: 1; transform: translateY(2px) scale(1.02); }
  100% { opacity: 1; transform: translateY(0) scale(1); }
}

@media (prefers-reduced-motion: reduce) {
  .pdb-marker__pin { animation: none; transition: none; }
  .pdb-marker__shadow { transition: none; }
}

/* City name. On hover at any zoom; permanently once zoomed past LABEL_ZOOM,
   where thirty of them no longer collide. */
.pdb-marker__name {
  position: absolute;
  left: 0;
  top: 7px;
  transform: translateX(-50%);
  white-space: nowrap;
  padding: 3px 7px;
  border: 1px solid #e4ded2;
  background: rgba(250, 247, 242, 0.95);
  color: #14213d;
  font-size: 11px;
  font-weight: 600;
  letter-spacing: 0.03em;
  opacity: 0;
  pointer-events: none;
  transition: opacity 160ms ease;
}
.pdb-marker.is-labelled .pdb-marker__name,
.pdb-marker:hover .pdb-marker__name,
.pdb-marker__pin:focus-visible ~ .pdb-marker__name {
  opacity: 1;
}
.pdb-marker.is-open .pdb-marker__name { opacity: 0; }

/* Card: square corners, hairline border, brass rule on top — the same
   language as the bordered panels elsewhere on the site. */
.pdb-marker__card {
  position: absolute;
  left: 0;
  bottom: 44px;
  transform: translateX(-50%) translateY(4px);
  min-width: 158px;
  padding: 12px 14px 13px;
  border: 1px solid #e4ded2;
  border-top: 2px solid #c19a5b;
  background: #ffffff;
  box-shadow: 0 10px 30px rgba(20, 33, 61, 0.14);
  opacity: 0;
  visibility: hidden;
  transition: opacity 180ms ease, transform 180ms ease;
}
.pdb-marker.is-open .pdb-marker__card {
  opacity: 1;
  visibility: visible;
  transform: translateX(-50%) translateY(0);
}
.pdb-marker__title {
  margin: 0 0 7px;
  font-size: 14px;
  font-weight: 600;
  color: #14213d;
}
.pdb-marker__link {
  font-size: 10px;
  font-weight: 700;
  letter-spacing: 0.14em;
  text-transform: uppercase;
  color: #8f6c3e;
  text-decoration: none;
  border-bottom: 1px solid rgba(143, 108, 62, 0.35);
  padding-bottom: 2px;
}
.pdb-marker__link:hover { border-bottom-color: #8f6c3e; }
`
