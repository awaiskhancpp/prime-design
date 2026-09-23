/**
 * The site's map pin, as one component.
 *
 * The brass teardrop carrying a house glyph is the identity every map on this
 * site marks a place with — the service-area coverage map, a project's own
 * location, the offices on a landing page. It lives here so those three draw
 * the same shape rather than three near-identical inline SVGs drifting apart
 * one retouch at a time.
 *
 * Two pieces, because a gradient is a document-level reference: `MapPinGlyph`
 * is the teardrop itself, and `MapPinGradientDefs` has to be mounted once
 * anywhere in the same document for the glyph's `fill="url(#…)"` to resolve.
 * MapLibre marker elements are portalled, but into that same document.
 *
 * The tip is the bottom edge of the box, so a marker anchored `bottom` marks
 * ground with the point rather than the middle.
 */

/** SVG gradient id, defined once and referenced by every pin on the page. */
export const MAP_PIN_GRADIENT_ID = 'pdb-pin-gradient'

/** Mount once per map. Renders nothing visible. */
export function MapPinGradientDefs() {
  return (
    <svg aria-hidden className="pointer-events-none absolute h-0 w-0">
      <defs>
        <linearGradient id={MAP_PIN_GRADIENT_ID} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#D2B07A" />
          <stop offset="55%" stopColor="#C19A5B" />
          <stop offset="100%" stopColor="#8F6C3E" />
        </linearGradient>
      </defs>
    </svg>
  )
}

/** The teardrop itself. 26 × 36, tip at the bottom centre. */
export function MapPinGlyph({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 26 36"
      width="26"
      height="36"
      aria-hidden
      focusable="false"
      className={className}
    >
      <path
        d="M13 0C5.82 0 0 5.82 0 13c0 9.75 13 23 13 23s13-13.25 13-23C26 5.82 20.18 0 13 0z"
        fill={`url(#${MAP_PIN_GRADIENT_ID})`}
      />
      <path
        d="M8.2 13.4 13 9.1l4.8 4.3"
        fill="none"
        stroke="#FAF7F2"
        strokeWidth="1.7"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M9.7 12.6v5.5h6.6v-5.5"
        fill="none"
        stroke="#FAF7F2"
        strokeWidth="1.7"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  )
}
