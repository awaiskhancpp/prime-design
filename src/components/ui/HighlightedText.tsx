import { Fragment } from 'react'

/**
 * Renders `text` with the phrases listed in `highlight` (separated by `|`)
 * wrapped in the site's accent color — the WordPress "heading--gradient"
 * pattern. Case-insensitive; matched phrases keep their original casing.
 *
 * Returns the plain text unchanged when there is nothing to highlight.
 */
export function HighlightedText({
  text,
  highlight,
  className = 'text-brass',
}: {
  text: string
  highlight?: string | null
  /** Accent class for the matched phrases — overridden on dark bands, where
   *  brass-on-ink loses the contrast the accent is there to provide. */
  className?: string
}) {
  const phrases = (highlight || '')
    .split('|')
    .map((phrase) => phrase.trim())
    .filter(Boolean)

  if (!phrases.length || !text) return <>{text}</>

  const pattern = phrases.map((phrase) => phrase.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')).join('|')
  const parts = text.split(new RegExp(`(${pattern})`, 'gi'))

  const isHighlight = (part: string) =>
    phrases.some((phrase) => part.toLowerCase() === phrase.toLowerCase())

  return (
    <>
      {parts.map((part, index) =>
        isHighlight(part) ? (
          <span key={`${part}-${index}`} className={className}>
            {part}
          </span>
        ) : (
          <Fragment key={`${part}-${index}`}>{part}</Fragment>
        ),
      )}
    </>
  )
}
