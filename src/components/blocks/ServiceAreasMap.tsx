/**
 * ServiceAreasMap — client component
 *
 * Vanilla Leaflet initialized inside useEffect so it never touches the
 * server. Dynamic import of `leaflet` itself is deferred to the effect
 * too, so the SSR bundle stays clean.
 *
 * Tiles: CartoDB Positron Light — minimal near-white base.
 * Markers: brass SVG circles with a subtle pulse ring on hover.
 * Popup: city name + "View projects" link, styled to match site tokens.
 */
'use client'

import { useEffect, useRef } from 'react'

export type MapMarker = {
  name: string
  lat: number
  lng: number
  href: string
}

// SVG marker — brass circle, white dot centre.
// We return a data URI so Leaflet can use it without a file loader.
function makeBrassIcon(L: typeof import('leaflet')) {
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 28 28">
    <circle cx="14" cy="14" r="13" fill="#C19A5B" stroke="#FAF7F2" stroke-width="2.5"/>
    <circle cx="14" cy="14" r="4" fill="#FAF7F2"/>
  </svg>`

  return L.icon({
    iconUrl: `data:image/svg+xml;base64,${btoa(svg)}`,
    iconSize: [28, 28],
    iconAnchor: [14, 14],
    popupAnchor: [0, -16],
  })
}

// Popup HTML — matches site typography (Outfit via font-sans inheritance)
function popupHtml(name: string, href: string) {
  return `
    <div style="
      font-family: inherit;
      padding: 4px 2px;
      min-width: 140px;
    ">
      <p style="
        font-size: 13px;
        font-weight: 600;
        color: #14213D;
        margin: 0 0 6px;
      ">${name}</p>
      <a href="${href}" style="
        font-size: 11px;
        font-weight: 600;
        letter-spacing: 0.1em;
        text-transform: uppercase;
        color: #8F6C3E;
        text-decoration: none;
      ">View service area →</a>
    </div>
  `
}

export function ServiceAreasMap({ markers }: { markers: MapMarker[] }) {
  const containerRef = useRef<HTMLDivElement>(null)
  const mapRef = useRef<import('leaflet').Map | null>(null)
  const markerKey = markers.map((marker) => `${marker.lat},${marker.lng}`).join('|')

  useEffect(() => {
    const container = containerRef.current
    if (!container || mapRef.current) return

    /**
     * The import is async, and the cleanup below is not. Under StrictMode
     * React mounts, unmounts and remounts: the first run starts the import,
     * the cleanup fires while `mapRef` is still null so it has nothing to
     * remove, the second run starts a second import, and both promises then
     * call `L.map()` on the same node — which is the "Map container is
     * already initialized" error.
     *
     * This flag is what the cleanup can set synchronously, so a resolution
     * that belongs to a torn-down run bails instead of building a map.
     */
    let cancelled = false

    // Dynamic import keeps Leaflet out of the SSR bundle entirely.
    import('leaflet').then((L) => {
      // Belongs to a run that has already been cleaned up, or another run
      // won the race and initialised the node first.
      if (cancelled || mapRef.current || !containerRef.current) return
      // Fix Leaflet's default icon path issue in bundlers.
      // We're using custom icons so this is a no-op guard.
      const icon = makeBrassIcon(L)

      // Compute centre from marker bounds, or fall back to Silicon Valley.
      const fallbackCenter: [number, number] = [37.41, -121.98]
      const fallbackZoom = 10

      const map = L.map(containerRef.current!, {
        center: markers.length ? [markers[0].lat, markers[0].lng] : fallbackCenter,
        zoom: fallbackZoom,
        zoomControl: true,
        scrollWheelZoom: false, // don't trap page scroll
        attributionControl: true,
      })

      mapRef.current = map

      // CartoDB Positron — clean, minimal, no API key.
      L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution:
          '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
        subdomains: 'abcd',
        maxZoom: 19,
      }).addTo(map)

      // Add brass markers.
      const group = L.featureGroup()
      markers.forEach(({ name, lat, lng, href }) => {
        const marker = L.marker([lat, lng], { icon }).bindPopup(popupHtml(name, href), {
          closeButton: false,
          className: 'prime-map-popup',
        })
        marker.addTo(map)
        group.addLayer(marker)
      })

      // Fit map to show all markers with generous padding.
      if (markers.length > 1) {
        map.fitBounds(group.getBounds(), { padding: [40, 40] })
      }
    })

    return () => {
      // Clean up on unmount (hot reload / StrictMode). `cancelled` covers the
      // window where the import is still in flight and there is no map yet.
      cancelled = true
      mapRef.current?.remove()
      mapRef.current = null
    }
    // Keyed on the markers' coordinates rather than the array identity: a
    // parent re-render that rebuilds the array would otherwise tear the map
    // down and reinitialise it on every render.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [markerKey])

  return (
    <>
      {/* Leaflet's own stylesheet — loaded once via a style tag to avoid
          importing it at module level (which breaks SSR). */}
      <style>{`
        @import url("https://unpkg.com/leaflet@1.9.4/dist/leaflet.css");

        .prime-map-popup .leaflet-popup-content-wrapper {
          border-radius: 0;
          border: 1px solid #E4DED2;
          box-shadow: 0 4px 24px rgba(20,33,61,0.08);
          padding: 0;
        }
        .prime-map-popup .leaflet-popup-content {
          margin: 14px 16px;
        }
        .prime-map-popup .leaflet-popup-tip-container {
          display: none;
        }
        .leaflet-control-attribution {
          font-size: 10px;
          background: rgba(250,247,242,0.85) !important;
        }
        .leaflet-control-zoom a {
          border-radius: 0 !important;
          border-color: #E4DED2 !important;
          color: #1F3358 !important;
        }
        .leaflet-control-zoom a:hover {
          background: #FAF7F2 !important;
        }
      `}</style>

      {/* Map container — fills its parent fully */}
      <div
        ref={containerRef}
        className="h-full w-full"
        aria-label="Interactive service area map"
        role="application"
      />
    </>
  )
}
