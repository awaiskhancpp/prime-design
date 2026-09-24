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
const BRASS = '#C19A5B'
const BRASS_DEEP = '#8F6C3E'
/** Freeway casing. The one road value that carries real brass. */
const BRASS_PALE = '#D3BB8F'
const WATER = '#D8E1EA'
/**
 * Place names are grey-blue, not ink.
 *
 * They name the ground the pins sit on and must not compete with them: the
 * pins are the only saturated thing on this map, which is what keeps thirty of
 * them legible. Ink labels put a second column of near-black type across the
 * valley and the pins stopped being the first thing the eye found. Carried
 * over from the Google build, which set `administrative.locality` to this
 * exact value for this exact reason.
 */
const LABEL = '#8B93A6'

/** Layer id → paint properties to overwrite. Ids come from the positron style. */
const PAINT: Record<string, Record<string, unknown>> = {
  background: { 'background-color': PAPER },

  // Water is the only cool tone on the map, which is what makes the bay
  // legible at a glance at this zoom.
  water: { 'fill-color': WATER },
  waterway: { 'line-color': '#C3CEDE' },

  building: { 'fill-color': '#EDE7D9', 'fill-outline-color': LINE },

  // Roads: white inner, brass casing. The casing does the drawing — at valley
  // zoom the freeway network is what gives the map its shape.
  highway_motorway_inner: { 'line-color': '#FFFFFF' },
  highway_motorway_bridge_inner: { 'line-color': '#FFFFFF' },
  tunnel_motorway_inner: { 'line-color': '#FFFFFF' },
  highway_major_inner: { 'line-color': '#FFFFFF' },
  // Local streets sit a shade off white so the arterials and freeways above
  // them stay the drawing, exactly as `road.local` did on the Google build.
  highway_minor: { 'line-color': '#FBF8F3', 'line-opacity': 1 },
  highway_path: { 'line-color': PAPER_2, 'line-opacity': 0.9 },
  road_pier: { 'line-color': PAPER_2 },
  road_area_pier: { 'fill-color': PAPER_2 },
  // Freeway casings carry the brass; arterial casings are a quieter sand, so
  // the controlled-access network reads first at valley zoom.
  highway_motorway_casing: { 'line-color': BRASS_PALE },
  highway_motorway_bridge_casing: { 'line-color': BRASS_PALE },
  tunnel_motorway_casing: { 'line-color': BRASS_PALE },
  highway_major_casing: { 'line-color': '#ECE5D8' },
  highway_motorway_subtle: { 'line-color': '#E0CCA6' },
  highway_major_subtle: { 'line-color': '#E8DBC6' },

  // County and state lines are kept — they orient the reader — but they must
  // stay hairlines. Nothing on this map may shade an administrative area:
  // the company serves cities, and the pins are what say so.
  boundary_2: { 'line-color': '#DED6C7' },
  boundary_3: { 'line-color': '#E6E0D3' },
  boundary_disputed: { 'line-color': '#DED6C7' },

  // Place names: quiet grey-blue on a paper halo. See `LABEL`.
  label_city: { 'text-color': LABEL, 'text-halo-color': PAPER },
  label_city_capital: { 'text-color': LABEL, 'text-halo-color': PAPER },
  label_town: { 'text-color': LABEL, 'text-halo-color': PAPER },
  label_village: { 'text-color': '#9AA1B1', 'text-halo-color': PAPER },
  // The state name is the one label allowed to be warm — it is the only one
  // that never sits next to a pin.
  label_state: { 'text-color': '#A9895C', 'text-halo-color': PAPER },
  label_country_1: { 'text-color': LABEL, 'text-halo-color': PAPER },
  label_country_2: { 'text-color': LABEL, 'text-halo-color': PAPER },
  label_country_3: { 'text-color': LABEL, 'text-halo-color': PAPER },
  'highway-name-major': { 'text-color': '#9AA1B1', 'text-halo-color': PAPER },
  'highway-name-minor': { 'text-color': '#A7ADBA', 'text-halo-color': PAPER },
  water_name_point_label: { 'text-color': '#9AA8BF', 'text-halo-color': PAPER },
  water_name_line_label: { 'text-color': '#9AA8BF', 'text-halo-color': PAPER },
  waterway_line_label: { 'text-color': '#A3AEC2', 'text-halo-color': PAPER },
}

/**
 * Layers held back to a zoom, rather than switched off.
 *
 * The Google build turned road labels off outright, but it only ever painted
 * the coverage map. This paint is now shared with the project and office maps,
 * which sit at zoom 15 over a single street — and a street map with no street
 * names is a worse map, not a cleaner one. So the names are held back to the
 * zooms where someone is looking at one neighbourhood: above 13 they inform,
 * below it thirty of them would cross the valley behind the pins.
 */
const ZOOM_FROM: Record<string, number> = {
  'highway-name-major': 13,
  'highway-name-minor': 14,
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
  // Neighbourhood, suburb and district names. `administrative.neighborhood`
  // was off on the Google build for the same reason: at valley zoom they are
  // noise behind the pins, and at street zoom they shout over the one address
  // the map exists to show ("SAINT JAMES SQUARE HISTORIC DISTRICT" across a
  // project's own block).
  'label_other',
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
  addRelief(map)

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

  for (const [layerId, minZoom] of Object.entries(ZOOM_FROM)) {
    if (!map.getLayer(layerId)) continue
    try {
      map.setLayerZoomRange(layerId, minZoom, 24)
    } catch {
      // Same again: a missing or renamed layer must not fail the repaint.
    }
  }
}

const DEM_SOURCE = 'pdb-terrain'
const RELIEF_LAYER = 'pdb-relief'

/**
 * The hills.
 *
 * Silicon Valley is a flat basin walled in by the Santa Cruz Mountains and the
 * Diablo Range, and that shape is the whole reason the service area looks the
 * way it does — so on the Google build the relief was the star of the map and
 * everything else was deliberately quiet. Google carried shaded relief in its
 * own `landscape.natural.terrain` feature, which that build tinted toward
 * brass; OpenFreeMap carries none above zoom 6 (its `ne2_shaded` raster fades
 * out at 6 and is world-scale anyway), so the valley came through the port as
 * a flat cream rectangle. This puts the hills back.
 *
 * The elevation comes from the AWS Open Data terrain tiles — public, keyless
 * and CORS-enabled, the same footing as the OpenFreeMap tiles themselves, so
 * it adds no account and no billing to the map. If the DEM ever fails to load,
 * MapLibre simply draws no hillshade and the map is the flat one again.
 *
 * Tinting rather than colouring, for the reason the Google style documented at
 * length: shading lives in luminance, so a flat fill would flatten the ranges
 * into a silhouette. Shadows go to brass-deep, the lit faces to paper, and the
 * accent to brass — the hills warm toward brass while keeping their modelling.
 */
function addRelief(map: MapLibreMap) {
  try {
    if (!map.getSource(DEM_SOURCE)) {
      map.addSource(DEM_SOURCE, {
        type: 'raster-dem',
        tiles: ['https://s3.amazonaws.com/elevation-tiles-prod/terrarium/{z}/{x}/{y}.png'],
        encoding: 'terrarium',
        tileSize: 256,
        // The dataset is built past this, but the maps here stop at 15 and
        // overzooming a DEM costs nothing visually while cutting requests.
        maxzoom: 13,
        attribution:
          '<a href="https://registry.opendata.aws/terrain-tiles/" target="_blank" rel="noreferrer">Terrain Tiles</a>',
      })
    }

    if (map.getLayer(RELIEF_LAYER)) return

    // Under everything but the ground itself: water, roads and labels all have
    // to sit on top of the relief, or the bay ends up shaded like a hillside.
    const firstAboveBackground = map
      .getStyle()
      .layers?.find((layer) => layer.type !== 'background')?.id

    map.addLayer(
      {
        id: RELIEF_LAYER,
        type: 'hillshade',
        source: DEM_SOURCE,
        paint: {
          'hillshade-shadow-color': BRASS_DEEP,
          'hillshade-highlight-color': PAPER,
          'hillshade-accent-color': BRASS,
          // Enough to model the ranges, not so much that the flat valley floor
          // — where every pin sits — picks up texture it should not have.
          'hillshade-exaggeration': 0.35,
        },
      },
      firstAboveBackground,
    )
  } catch {
    // A DEM that cannot be added is a flatter map, not a broken one.
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
