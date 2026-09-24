'use client'

import { useRowLabel } from '@payloadcms/ui'

/**
 * The label on a collapsed section row in the page builder.
 *
 * Payload's default is the block's type and its position — "Sub Services 04",
 * "Cta 12". A landing page has fifteen of these, several pages repeat a block
 * type two or three times, and every row collapses to the same few words, so
 * finding the FAQ you came to edit meant opening rows one by one until the
 * right one appeared.
 *
 * This puts the section's own first line of copy next to its type, which is
 * what an editor actually recognises: "FAQ · Frequently Asked Questions",
 * "Project Grid · Our Recent Work". The type stays, because two sections can
 * legitimately carry the same heading and the type is what says which one
 * renders which way.
 *
 * Falls back to the plain type when a section has no copy of its own — a
 * booking block is a scheduler with no heading, and inventing a name for it
 * would be worse than showing none.
 */

type RowData = {
  blockType?: string
  heading?: string
  title?: string
  eyebrow?: string
  label?: string
  /** `sub-services`-style blocks name themselves with the service they list. */
  service?: { title?: string } | string | number | null
}

/** "sub-services" → "Sub Services" */
const prettyType = (blockType?: string) =>
  (blockType ?? '')
    .split(/[-_]/)
    .filter(Boolean)
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ')

const firstText = (...values: Array<string | undefined>) => {
  for (const value of values) {
    const text = typeof value === 'string' ? value.trim() : ''
    if (text) return text
  }
  return ''
}

export function BlockRowLabel() {
  const { data, rowNumber } = useRowLabel<RowData>()

  const type = prettyType(data?.blockType) || 'Section'
  const position = String((rowNumber ?? 0) + 1).padStart(2, '0')
  const name = firstText(data?.heading, data?.title, data?.label, data?.eyebrow)

  return (
    <span>
      <span style={{ opacity: 0.55 }}>{position}</span> {type}
      {name ? (
        <>
          {' · '}
          <span style={{ fontWeight: 500 }}>{name.length > 60 ? `${name.slice(0, 60)}…` : name}</span>
        </>
      ) : null}
    </span>
  )
}
