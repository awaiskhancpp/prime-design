/**
 * Static per-slug layout configuration for service detail pages.
 *
 * Every service page is assembled from a fixed catalog of section
 * components (hero, video, process, gallery, FAQ, contact, ...). Which of
 * those sections a given service actually shows — and in which flavor — is
 * decided by the flag records in `SERVICE_PAGE_LAYOUTS` below.
 *
 * Precedence when resolving a slug (see `getServicePageSections`):
 *   1. the exact slug (e.g. `kitchen-remodeling`)
 *   2. the slug with a `-silicon-valley` suffix stripped (location variants
 *      such as `european-kitchen-silicon-valley` reuse the base layout)
 *   3. the base slug suffixed with `-silicon-valley`
 *   4. `DEFAULT_SERVICE_PAGE_SECTIONS` (everything off)
 *
 * NOTE: the actual *order* of sections is not defined here. It comes from
 * `service.sectionOrder` when the CMS supplies it, or the fallback order in
 * `ServiceDetailPage.tsx`.
 */

/**
 * Which sections a service page renders, plus the small amount of per-page
 * tuning those sections need. Every flag defaults to `false` — a service
 * page only gets a section when its layout explicitly turns it on.
 */
export type ServicePageSections = {
  /** Full-width embedded video section (from `getServiceVideo` or CMS video blocks). */
  video: boolean
  /** Render the video section immediately after the hero, before the intro. */
  videoFirst: boolean
  /** Numbered "our process" section. */
  process: boolean
  /** Process steps rendered inline inside the overview (right column). */
  inlineProcess: boolean
  /** Cards linking to sub-services / related offerings. */
  offerings: boolean
  /** Photo gallery grid. */
  gallery: boolean
  /** Pull-quote / "our promise" section. */
  quote: boolean
  /** "Craftsmanship That Transforms" split-image section. */
  craftsmanship: boolean
  /** "Real Homes, Real Stories" testimonials section. */
  realHomes: boolean
  /** "Silicon Valley Loves" testimonial marquee. */
  siliconValleyLoves: boolean
  /** "Why Choose Us" features grid. */
  whyChooseUs: boolean
  /** Home-repair category cards (only used by home-repair-installation-services). */
  homeRepairCategories: boolean
  /** The home-repair flavored "why choose us" variant. */
  homeRepairWhyChooseUs: boolean
  /** FAQ accordion (loads per-service FAQs via `ServiceFaqLoader`). */
  faq: boolean
  /** "Get a free estimate" CTA banner. */
  estimate: boolean
  /** Reviews section. */
  reviews: boolean
  /** Contact form section at the bottom. */
  contact: boolean
  /** Process rendered with images (visual steps) instead of the numbered list. */
  visualProcess: boolean
  /** Use the bespoke Home Remodeling multi-step process design. */
  homeProcess: boolean
  /** Which contact form design to use for the closing contact section. */
  contactVariant: 'home' | 'gallery'
  /** Wording variant label passed to the process section. */
  processLabel: string
}

/** All sections off, shared defaults for tuning fields. */
export const DEFAULT_SERVICE_PAGE_SECTIONS: ServicePageSections = {
  video: false,
  videoFirst: false,
  process: false,
  inlineProcess: false,
  offerings: false,
  gallery: false,
  quote: false,
  craftsmanship: false,
  realHomes: false,
  siliconValleyLoves: false,
  whyChooseUs: false,
  homeRepairCategories: false,
  homeRepairWhyChooseUs: false,
  faq: false,
  estimate: false,
  reviews: false,
  contact: false,
  visualProcess: false,
  homeProcess: false,
  contactVariant: 'home',
  processLabel: 'remodeling',
}

/**
 * Per-slug layout overrides, spread over the defaults so each entry only
 * lists the sections it actually shows.
 */
const SERVICE_PAGE_LAYOUTS: Record<string, ServicePageSections> = {
  // ADU — inline process, trust-building sections, contact.
  adu: {
    ...DEFAULT_SERVICE_PAGE_SECTIONS,
    inlineProcess: true,
    craftsmanship: true,
    whyChooseUs: true,
    estimate: true,
    reviews: true,
    contact: true,
  },

  // Home additions — video lead-in, testimonials, contact.
  additions: {
    ...DEFAULT_SERVICE_PAGE_SECTIONS,
    video: true,
    inlineProcess: true,
    realHomes: true,
    siliconValleyLoves: true,
    whyChooseUs: true,
    estimate: true,
    reviews: true,
    contact: true,
    processLabel: 'home addition',
  },

  // Complete renovation — bespoke home-remodeling process design.
  'complete-renovation': {
    ...DEFAULT_SERVICE_PAGE_SECTIONS,
    process: true,
    inlineProcess: true,
    craftsmanship: true,
    estimate: true,
    reviews: true,
    contact: true,
    homeProcess: true,
  },

  // Kitchen remodeling — the fullest page: video, process, offerings,
  // gallery, quote and FAQ.
  'kitchen-remodeling': {
    ...DEFAULT_SERVICE_PAGE_SECTIONS,
    video: true,
    process: true,
    inlineProcess: false,
    offerings: true,
    gallery: true,
    quote: true,
    faq: true,
    estimate: true,
    siliconValleyLoves: true,
    reviews: true,
    contact: true,
  },

  // Bathroom remodeling.
  'bathroom-remodeling': {
    ...DEFAULT_SERVICE_PAGE_SECTIONS,
    process: true,
    offerings: true,
    gallery: true,
    craftsmanship: true,
    siliconValleyLoves: true,
    whyChooseUs: true,
    faq: true,
    estimate: true,
    reviews: true,
    contact: true,
  },

  // Home remodeling — flagship layout with the bespoke process design.
  'home-remodeling': {
    ...DEFAULT_SERVICE_PAGE_SECTIONS,
    video: true,
    process: true,
    gallery: true,
    craftsmanship: true,
    realHomes: true,
    siliconValleyLoves: true,
    whyChooseUs: true,
    faq: true,
    estimate: true,
    reviews: true,
    contact: true,
    homeProcess: true,
  },

  // Home repair & installation — minimal page: just the category cards and
  // the home-repair "why choose us" variant.
  'home-repair-installation-services': {
    ...DEFAULT_SERVICE_PAGE_SECTIONS,
    homeRepairCategories: true,
    homeRepairWhyChooseUs: true,
  },

  // Financing — informational page, no gallery/video.
  financing: {
    ...DEFAULT_SERVICE_PAGE_SECTIONS,
    process: true,
    whyChooseUs: true,
    faq: true,
    estimate: true,
  },

  // Kitchen style pages (European / Shaker / Custom) all share one layout:
  // video-first hero, visual process, gallery-variant contact form. Their
  // `-silicon-valley` location twins resolve to these entries.
  'european-kitchen': {
    ...DEFAULT_SERVICE_PAGE_SECTIONS,
    video: true,
    videoFirst: true,
    whyChooseUs: true,
    estimate: true,
    reviews: true,
    contact: true,
    visualProcess: true,
    contactVariant: 'gallery',
  },
  'shaker-kitchen': {
    ...DEFAULT_SERVICE_PAGE_SECTIONS,
    video: true,
    videoFirst: true,
    whyChooseUs: true,
    estimate: true,
    reviews: true,
    contact: true,
    visualProcess: true,
    contactVariant: 'gallery',
  },
  'custom-kitchen': {
    ...DEFAULT_SERVICE_PAGE_SECTIONS,
    video: true,
    videoFirst: true,
    whyChooseUs: true,
    estimate: true,
    reviews: true,
    contact: true,
    visualProcess: true,
    contactVariant: 'gallery',
  },
}

/**
 * Resolve the layout flags for a service slug, trying the exact slug, then
 * the `-silicon-valley`-stripped base, then a `-silicon-valley` variant,
 * before falling back to the all-off default.
 */
export function getServicePageSections(slug: string): ServicePageSections {
  const base = slug.replace(/-silicon-valley$/, '')
  return (
    SERVICE_PAGE_LAYOUTS[slug] ??
    SERVICE_PAGE_LAYOUTS[base] ??
    SERVICE_PAGE_LAYOUTS[`${base}-silicon-valley`] ??
    DEFAULT_SERVICE_PAGE_SECTIONS
  )
}
