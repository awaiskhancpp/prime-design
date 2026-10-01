/**
 * The type scale for a page hero's `h1`, chosen by how long the heading
 * actually is.
 *
 * Every hero on the site had its own scale and none of them knew how much
 * copy they were being handed: `PageHero` was `text-4xl sm:text-5xl
 * md:text-7xl`, `ServiceHero` `text-5xl md:text-7xl` (starting 12px larger
 * on a phone, with no `sm` step at all), `ProjectDetailPage` `text-4xl
 * md:text-7xl` and `BlogPostHero` `text-4xl md:text-6xl`.
 *
 * Measured on a 390px phone, that put four-line headings on
 * `/services/kitchen-remodeling` (39 characters), `/services/home-remodeling`
 * (47), `/services/comprehensive-home-repair-installation-services-in-
 * silicon-valley` (47) and `/faq` (61) — a heading taking four lines of a
 * hero crowds out the copy and the buttons underneath it. Desktop was never
 * the problem: the longest heading on the site reaches three lines at 1440px
 * and looks fine doing it.
 *
 * So the scale steps down with length, and steps down hardest where the
 * space is tightest. A short heading is unchanged from what `PageHero`
 * already did; a long one gives back the room its own words take up.
 *
 * The thresholds are character counts rather than a CSS `clamp()` because
 * the problem is the length of the text, not the width of the screen — a
 * 12-character heading and a 61-character one should not be set at the same
 * size on the same phone, and no viewport query can tell them apart.
 */
export function heroTitleSize(chars: number): string {
  if (chars > 50) return 'text-[1.75rem] sm:text-4xl md:text-5xl'
  if (chars > 30) return 'text-[2rem] sm:text-5xl md:text-6xl'
  return 'text-4xl sm:text-5xl md:text-7xl'
}

/**
 * Pulls a character count out of whatever a hero was given for its title.
 * `PageHero` takes a `ReactNode` (so the homepage can pass
 * `HighlightedText`), so the count cannot always be read off a string.
 */
export function titleLength(value: unknown): number {
  if (typeof value === 'string') return value.length
  if (typeof value === 'number') return String(value).length
  return 0
}
