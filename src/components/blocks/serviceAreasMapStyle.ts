/**
 * The map's paint, expressed in the site's own palette.
 *
 * Google's `styles` array is the in-repo way to restyle a map: it needs no
 * Map ID and no console configuration, so the look is reviewable in a diff.
 * (Cloud-based styling via a Map ID would move these decisions into the Google
 * console *and* make this array be ignored entirely.)
 *
 * ── Design intent ─────────────────────────────────────────────────────────
 *
 * A printed topographic survey, in brass and paper. Silicon Valley is a flat
 * basin walled in by the Santa Cruz Mountains and the Diablo Range, and that
 * shape is the whole reason the service area looks the way it does — so the
 * relief is the star and everything else is deliberately quiet: flats in
 * `--color-paper`, hills rising into brass, water the only cool tone, and no
 * POI, transit or street labels at all. The brass markers are then the sole
 * saturated element on the page, which is what keeps thirty of them legible.
 *
 * ── Why the hills are tinted, not coloured ────────────────────────────────
 *
 * Google's `TERRAIN` map type cannot be restyled — it is raster imagery and
 * the `styles` array has no effect on it. What *is* styleable is the
 * `landscape.natural.terrain` feature of the ordinary roadmap, which carries
 * the same shaded relief as vector geometry.
 *
 * That geometry's shading lives in its own luminance, so a flat `color` styler
 * would paint every hillside one value and flatten the range to a silhouette.
 * `hue` + `saturation` + `lightness` + `gamma` re-tint it while leaving the
 * light-to-dark relationship intact, so the hills keep their modelling and
 * simply warm toward brass. Use `color` for flat fills (water, the land base)
 * and the tint stylers for anything that carries shading.
 *
 * ── Ordering ──────────────────────────────────────────────────────────────
 *
 * Google applies these in array order and a later rule wins, so every entry
 * runs general-to-specific: `landscape.natural` before
 * `landscape.natural.terrain`, or the base fill would repaint the relief.
 */
export const SERVICE_AREAS_MAP_STYLE: Array<Record<string, unknown>> = [
  /* ── Base ── */
  { elementType: 'geometry', stylers: [{ color: '#f6f2ea' }] },
  { elementType: 'labels.icon', stylers: [{ visibility: 'off' }] },
  { elementType: 'labels.text.fill', stylers: [{ color: '#6d7a93' }] },
  { elementType: 'labels.text.stroke', stylers: [{ color: '#faf7f2' }, { weight: 3 }] },

  /* ── Land, general to specific ── */
  { featureType: 'landscape', elementType: 'geometry', stylers: [{ color: '#f4efe6' }] },
  // Built-up areas sit a shade lighter than open land, so the valley floor
  // reads as the populated part of the picture.
  { featureType: 'landscape.man_made', elementType: 'geometry', stylers: [{ color: '#f8f5ee' }] },
  { featureType: 'landscape.natural', elementType: 'geometry', stylers: [{ color: '#efe9de' }] },
  {
    featureType: 'landscape.natural.landcover',
    elementType: 'geometry',
    stylers: [{ hue: '#9aa87d' }, { saturation: -30 }, { lightness: 18 }, { gamma: 1.1 }],
  },

  /* ── Relief: the hills, warmed toward brass. See the note above. ── */
  {
    featureType: 'landscape.natural.terrain',
    elementType: 'geometry',
    stylers: [{ visibility: 'on' }],
  },
  {
    featureType: 'landscape.natural.terrain',
    elementType: 'geometry.fill',
    stylers: [
      { visibility: 'on' },
      { hue: '#c19a5b' },
      { saturation: -12 },
      { lightness: 10 },
      { gamma: 1.12 },
    ],
  },
  // The stroke is what draws the ridge lines; darker and less washed out than
  // the fill so the ranges have an edge rather than a gradient.
  {
    featureType: 'landscape.natural.terrain',
    elementType: 'geometry.stroke',
    stylers: [{ visibility: 'on' }, { hue: '#8f6c3e' }, { saturation: -28 }, { lightness: -6 }],
  },

  /* ── Parks: the only green, and only just. ── */
  { featureType: 'poi', stylers: [{ visibility: 'off' }] },
  {
    featureType: 'poi.park',
    elementType: 'geometry',
    stylers: [{ visibility: 'on' }, { color: '#e7ecdd' }],
  },

  /* ── Roads: white ribbons, brass casing on the freeways ── */
  { featureType: 'road', elementType: 'labels', stylers: [{ visibility: 'off' }] },
  { featureType: 'road.local', elementType: 'geometry', stylers: [{ color: '#fbf8f3' }] },
  { featureType: 'road.arterial', elementType: 'geometry.fill', stylers: [{ color: '#ffffff' }] },
  { featureType: 'road.arterial', elementType: 'geometry.stroke', stylers: [{ color: '#ece5d8' }] },
  { featureType: 'road.highway', elementType: 'geometry.fill', stylers: [{ color: '#ffffff' }] },
  { featureType: 'road.highway', elementType: 'geometry.stroke', stylers: [{ color: '#e0cca6' }] },
  {
    featureType: 'road.highway.controlled_access',
    elementType: 'geometry.stroke',
    stylers: [{ color: '#d3bb8f' }],
  },

  { featureType: 'transit', stylers: [{ visibility: 'off' }] },

  /* ── Water: the bay and the ocean, the only cool tone on the page ── */
  { featureType: 'water', elementType: 'geometry', stylers: [{ color: '#d8e1ea' }] },
  { featureType: 'water', elementType: 'labels.text.fill', stylers: [{ color: '#9aa8bf' }] },

  /* ── Boundaries and place names ── */
  { featureType: 'administrative', elementType: 'geometry.stroke', stylers: [{ color: '#ded6c7' }] },
  { featureType: 'administrative.land_parcel', stylers: [{ visibility: 'off' }] },
  { featureType: 'administrative.neighborhood', stylers: [{ visibility: 'off' }] },
  // City names stay on and quiet: they name the places the pins sit on without
  // competing with the pins' own labels.
  {
    featureType: 'administrative.locality',
    elementType: 'labels.text.fill',
    stylers: [{ color: '#8b93a6' }],
  },
  {
    featureType: 'administrative.province',
    elementType: 'labels.text.fill',
    stylers: [{ color: '#a9895c' }],
  },
]
