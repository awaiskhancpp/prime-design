import type { Map as MapLibreMap } from 'maplibre-gl'

/**
 * The site's basemap paint, applied over OpenFreeMap's `positron` style.
 *
 * OpenFreeMap serves OpenMapTiles-schema vector tiles with no key and no
 * account, which is why the maps moved here from Google. `positron` is the
 * plainest of its styles — no POI layers at all, a light neutral ground — so
 * it is the least work to turn into the survey-drawing look the rest of the
 * site uses: the valley floor in paper, roads drawn white with brass casings,
 * water the only cool tone, transit and air infrastructure gone.
 *
 * The paint lives here as data rather than as a hosted style so it shows up in
 * a diff — the same reason the Google build kept its `styles` array in the
 * repo instead of behind a cloud Map ID. It is applied after the style loads
 * rather than baked into a full style document, so upstream keeps ownership of
 * the geometry, the zoom ranges and the label placement, and we only restate
 * the colours.
 *
 * Literal hex values, not `var(--color-…)`: MapLibre paints into a canvas and
 * resolves nothing through CSS.
 */

export const SITE_MAP_STYLE_URL = 'https://tiles.openfreemap.org/styles/positron'

const PAPER = '#FAF7F2'
const PAPER_2 = '#F1ECE3'
const LINE = '#E4DED2'
const INK = '#14213D'
const BRASS_PALE = '#E3D3B8'
const WATER = '#D9E0EA'

/** Layer id → paint properties to overwrite. Ids come from the positron style. */
const PAINT: Record<string, Record<string, unknown>> = {
  background: { 'background-color': PAPER },

  // Water is the only cool tone on the map, which is what makes the bay
  // legible at a glance at this zoom.
  water: { 'fill-color': WATER },
  waterway: { 'line-color': '#C7D1E0' },

  building: { 'fill-color': '#EDE7D9', 'fill-outline-color': LINE },

  // Roads: white inner, brass casing. The casing does the drawing — at valley
  // zoom the freeway network is what gives the map its shape.
  highway_motorway_inner: { 'line-color': '#FFFFFF' },
  highway_motorway_bridge_inner: { 'line-color': '#FFFFFF' },
  tunnel_motorway_inner: { 'line-color': '#FFFFFF' },
  highway_major_inner: { 'line-color': '#FFFFFF' },
  highway_minor: { 'line-color': '#FFFFFF', 'line-opacity': 1 },
  highway_path: { 'line-color': PAPER_2, 'line-opacity': 0.9 },
  road_pier: { 'line-color': PAPER_2 },
  road_area_pier: { 'fill-color': PAPER_2 },
  highway_motorway_casing: { 'line-color': BRASS_PALE },
  highway_motorway_bridge_casing: { 'line-color': BRASS_PALE },
  tunnel_motorway_casing: { 'line-color': BRASS_PALE },
  highway_major_casing: { 'line-color': BRASS_PALE },
  highway_motorway_subtle: { 'line-color': '#E8DBC6' },
  highway_major_subtle: { 'line-color': '#E8DBC6' },

  // County and state lines are kept — they orient the reader — but they must
  // stay hairlines. Nothing on this map may shade an administrative area:
  // the company serves cities, and the pins are what say so.
  boundary_2: { 'line-color': '#D6CDBB' },
  boundary_3: { 'line-color': '#DFD8C9' },
  boundary_disputed: { 'line-color': '#D6CDBB' },

  // Labels in the site's ink on a paper halo, so type on the map matches type
  // on the page around it.
  label_city: { 'text-color': INK, 'text-halo-color': PAPER },
  label_city_capital: { 'text-color': INK, 'text-halo-color': PAPER },
  label_town: { 'text-color': INK, 'text-halo-color': PAPER },
  label_village: { 'text-color': 'rgba(20,33,61,0.7)', 'text-halo-color': PAPER },
  label_state: { 'text-color': 'rgba(20,33,61,0.45)', 'text-halo-color': PAPER },
  label_other: { 'text-color': 'rgba(20,33,61,0.6)', 'text-halo-color': PAPER },
  label_country_1: { 'text-color': INK, 'text-halo-color': PAPER },
  label_country_2: { 'text-color': INK, 'text-halo-color': PAPER },
  label_country_3: { 'text-color': INK, 'text-halo-color': PAPER },
  'highway-name-major': { 'text-color': 'rgba(20,33,61,0.5)', 'text-halo-color': PAPER },
  'highway-name-minor': { 'text-color': 'rgba(20,33,61,0.4)', 'text-halo-color': PAPER },
  water_name_point_label: { 'text-color': '#7E8CA8', 'text-halo-color': PAPER },
  water_name_line_label: { 'text-color': '#7E8CA8', 'text-halo-color': PAPER },
  waterway_line_label: { 'text-color': '#8D99B2', 'text-halo-color': PAPER },
}

/**
 * Layers switched off outright. Rail, runways and route shields are the map's
 * own subject matter intruding on ours — the Google build suppressed exactly
 * these for the same reason. Footpath names go too: they only appear at the
 * zooms where someone is already looking at a single street.
 *
 * The ground-cover fills (`park`, woodland, residential, glacier) are the same
 * category of noise. At the zoom these maps live at, OpenMapTiles generalises
 * those polygons hard, so they render as blocky tan patches that read as a
 * pixelated texture over the paper floor — exactly what this paint is meant to
 * prevent. The valley floor should be paper, nothing more.
 */
const HIDDEN = [
  'park',
  'landcover_wood',
  'landcover_glacier',
  'landcover_ice_shelf',
  'landuse_residential',
  'railway',
  'railway_dashline',
  'railway_service',
  'railway_service_dashline',
  'railway_transit',
  'railway_transit_dashline',
  'aeroway-area',
  'aeroway-runway',
  'aeroway-runway-casing',
  'aeroway-taxiway',
  'airport',
  'highway-name-path',
  'highway-shield-non-us',
  'highway-shield-us-interstate',
  'road_shield_us',
]

/**
 * Repaints a loaded map. Safe to call more than once, and safe against a
 * future OpenFreeMap style that renames or drops a layer: anything not on the
 * map is skipped rather than throwing, so a style change degrades to upstream
 * colours instead of a blank canvas.
 */
export function paintSiteBasemap(map: MapLibreMap) {
  for (const [layerId, paint] of Object.entries(PAINT)) {
    if (!map.getLayer(layerId)) continue
    for (const [property, value] of Object.entries(paint)) {
      try {
        // The table above is data, so a property key is only ever a `string`
        // here; every value in it is a real paint property of the layer it is
        // filed under, and a wrong pairing is caught by the try below.
        map.setPaintProperty(
          layerId,
          property as Parameters<MapLibreMap['setPaintProperty']>[1],
          value as never,
        )
      } catch {
        // A property this layer type does not accept — upstream's colour stays.
      }
    }
  }

  for (const layerId of HIDDEN) {
    if (!map.getLayer(layerId)) continue
    try {
      map.setLayoutProperty(layerId, 'visibility', 'none')
    } catch {
      // Same: leave the layer alone rather than fail the whole repaint.
    }
  }
}

/**
 * A circle on the ground, as a GeoJSON polygon.
 *
 * MapLibre's `circle` layer sizes in screen pixels, so a coverage halo drawn
 * with one would grow and shrink against the land as you zoom. These are real
 * polygons in metres, so a city's halo covers the same ground at every zoom —
 * which is the whole claim the halo is making.
 */
export function circlePolygon(
  latitude: number,
  longitude: number,
  radiusMetres: number,
  steps = 64,
): [number, number][] {
  const earthRadius = 6_378_137
  const latitudeRadians = (latitude * Math.PI) / 180
  const deltaLat = ((radiusMetres / earthRadius) * 180) / Math.PI
  const deltaLng = deltaLat / Math.cos(latitudeRadians)

  const ring: [number, number][] = []
  for (let step = 0; step <= steps; step += 1) {
    const angle = (step / steps) * 2 * Math.PI
    ring.push([longitude + deltaLng * Math.cos(angle), latitude + deltaLat * Math.sin(angle)])
  }
  return ring
}
