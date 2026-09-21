/**
 * Google Maps JavaScript API — direct loader.
 *
 * Deliberately no map library: no `@googlemaps/js-api-loader`, no
 * `@vis.gl/react-google-maps`, no Leaflet. The API is loaded by appending the
 * one `<script>` Google publishes, and the surface this project uses is typed
 * structurally below rather than pulled in as `@types/google.maps`, so the map
 * ships with zero added dependencies.
 *
 * The loader is a module-level singleton: the script element is inserted at
 * most once per page no matter how many map components mount, and every caller
 * after the first awaits the same promise. Google itself throws if its script
 * is evaluated twice.
 */

/* ------------------------------------------------------------------ *
 * Types — only the members this project actually calls.
 * ------------------------------------------------------------------ */

export type GLatLngLiteral = { lat: number; lng: number }

export type GPoint = { x: number; y: number }

export type GPadding = { top: number; right: number; bottom: number; left: number }

export interface GLatLngBounds {
  extend(latLng: GLatLngLiteral): GLatLngBounds
  isEmpty(): boolean
}

/**
 * `overlayMouseTarget` is the pane that receives pointer events, which is the
 * one a clickable marker has to live in — `floatPane` sits above it but is
 * meant for info windows.
 */
export interface GMapPanes {
  overlayMouseTarget: HTMLElement
  floatPane: HTMLElement
}

export interface GProjection {
  /** Null while the map is still laying out — callers must guard. */
  fromLatLngToDivPixel(latLng: GLatLngLiteral): GPoint | null
}

export interface GMapsEventListener {
  remove(): void
}

export interface GMap {
  setZoom(zoom: number): void
  getZoom(): number | undefined
  setCenter(center: GLatLngLiteral): void
  panTo(center: GLatLngLiteral): void
  fitBounds(bounds: GLatLngBounds, padding?: number | GPadding): void
  addListener(eventName: string, handler: () => void): GMapsEventListener
}

export interface GOverlayView {
  setMap(map: GMap | null): void
  getPanes(): GMapPanes | null
  getProjection(): GProjection | null
  onAdd(): void
  draw(): void
  onRemove(): void
}

/** A soft coverage halo under a served city. */
export interface GCircle {
  setMap(map: GMap | null): void
}

export interface GoogleMapsApi {
  Map: new (element: HTMLElement, options?: Record<string, unknown>) => GMap
  LatLngBounds: new () => GLatLngBounds
  Circle: new (options: Record<string, unknown>) => GCircle
  OverlayView: new () => GOverlayView
  event: { clearInstanceListeners(instance: object): void }
}

type MapsWindow = Window & {
  google?: { maps?: GoogleMapsApi }
  [callback: string]: unknown
}

/* ------------------------------------------------------------------ *
 * Loader
 * ------------------------------------------------------------------ */

/** The public browser key. Absent in local dev on this project. */
export const GOOGLE_MAPS_API_KEY = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY ?? ''

const CALLBACK_NAME = '__primeGoogleMapsReady'

let pending: Promise<GoogleMapsApi> | null = null

export function loadGoogleMaps(apiKey: string = GOOGLE_MAPS_API_KEY): Promise<GoogleMapsApi> {
  if (typeof window === 'undefined') {
    return Promise.reject(new Error('Google Maps can only be loaded in the browser'))
  }
  if (!apiKey) {
    return Promise.reject(new Error('NEXT_PUBLIC_GOOGLE_MAPS_API_KEY is not set'))
  }

  // Cast through `unknown`: the dynamic callback property cannot be expressed
  // as an index signature on `Window` without clashing with its own members.
  const win = window as unknown as MapsWindow
  if (win.google?.maps) return Promise.resolve(win.google.maps)
  if (pending) return pending

  pending = new Promise<GoogleMapsApi>((resolve, reject) => {
    // `loading=async` is Google's current recommendation and requires the
    // callback form — the script resolves through this global rather than
    // through `onload`.
    win[CALLBACK_NAME] = () => {
      const maps = win.google?.maps
      if (maps) resolve(maps)
      else reject(new Error('Google Maps loaded without a maps namespace'))
      delete win[CALLBACK_NAME]
    }

    const script = document.createElement('script')
    script.src =
      'https://maps.googleapis.com/maps/api/js' +
      `?key=${encodeURIComponent(apiKey)}&v=weekly&loading=async&callback=${CALLBACK_NAME}`
    script.async = true
    script.onerror = () => {
      // Let a later mount retry — a failed load is usually a blocked request
      // or a key restriction, not a permanent condition.
      pending = null
      script.remove()
      reject(new Error('Failed to load the Google Maps script'))
    }
    document.head.appendChild(script)
  })

  return pending
}
