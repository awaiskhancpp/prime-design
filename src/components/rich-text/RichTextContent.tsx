import Image from '@/components/ui/Image'

import { RichText, type JSXConvertersFunction } from '@payloadcms/richtext-lexical/react'
import type { RichTextValue } from '@/lib/richText'

/**
 * Renders a Payload Lexical rich text value with this site's editorial
 * styles, so CMS-authored content matches the hand-built sections:
 *
 *   - bullet list items get the brass square marker used across the
 *     service pages (`<span class="bg-brass">`), no native disc
 *   - numbered list items get the brass "1." marker instead of native
 *     numbers
 *   - paragraphs, headings and quotes use the site's type scale
 *   - uploaded images render as figures, sized to the article column
 *
 * Usage: `<RichTextContent data={record.someRichTextField} />`. Render
 * nothing (null) when the field is empty — pair with
 * `richTextHasContent()` when a fallback is needed.
 */

/** The populated media document behind an `upload` node. */
type UploadDoc = {
  url?: string | null
  filename?: string | null
  mimeType?: string | null
  alt?: string | null
  caption?: string | null
  width?: number | null
  height?: number | null
}

/**
 * Whether an upload should render as a picture.
 *
 * Payload's own converter tests `mimeType.startsWith('image')` and nothing
 * else. A large batch of migrated WordPress media was imported without a
 * mime type and stored as `application/octet-stream`, so that test failed
 * and every one of those images rendered as a bare link showing its
 * filename — which is what blog posts were displaying instead of photos.
 * The extension is checked as well so the rendering no longer depends on
 * that field being right.
 */
const isImageUpload = (doc: UploadDoc) =>
  doc.mimeType?.startsWith('image/') ||
  /\.(jpe?g|png|gif|webp|avif|svg)$/i.test(doc.filename || '')

/**
 * Site-styled JSX converters. Everything not overridden here (bold,
 * italic, links, tables, ...) uses Payload's default converters.
 * `tone` selects the paragraph styling: `lead` is the larger intro copy
 * used right under blog titles, `body` the regular article copy.
 */
const siteConverters =
  (tone: 'body' | 'lead' | 'light'): JSXConvertersFunction =>
  ({ defaultConverters }) => ({
    ...defaultConverters,

    // Lists — styled like the static Key Features / Benefits lists.
    list: ({ node, nodesToJSX }) => {
      const children = nodesToJSX({ nodes: node.children })
      const isOrdered = node.listType === 'number'
      return isOrdered ? (
        <ol className="mt-5 grid gap-4 text-base leading-7 text-ink-2/70 [list-style:none]">
          {children}
        </ol>
      ) : (
        <ul className="mt-4 grid gap-3 text-base leading-7 text-ink-2/70 [list-style:none]">
          {children}
        </ul>
      )
    },

    // List items — brass square marker (bullets) or brass number (ordered).
    listitem: ({ node, nodesToJSX, parent, childIndex }) => {
      const children = nodesToJSX({ nodes: node.children })
      const isOrdered = 'listType' in parent && parent?.listType === 'number'
      return (
        <li className="flex gap-3">
          {isOrdered ? (
            <span className="font-semibold text-brass">{node.value ?? childIndex + 1}.</span>
          ) : (
            <span className="mt-2 h-1.5 w-1.5 shrink-0 bg-brass" aria-hidden />
          )}
          <span>{children}</span>
        </li>
      )
    },

    // Loose paragraphs outside lists — body copy or lead-intro styling.
    paragraph: ({ node, nodesToJSX }) => (
      <p
        className={
          tone === 'light'
            ? 'mt-3 text-base leading-7 text-white/85'
            : tone === 'lead'
              ? 'mt-4 text-lg leading-8 text-ink-2/80 first:mt-0 md:text-xl md:leading-9'
              : 'mt-3 text-base leading-7 text-ink-2/70'
        }
      >
        {nodesToJSX({ nodes: node.children })}
      </p>
    ),

    // Headings — the site's display font, scaled by level.
    heading: ({ node, nodesToJSX }) => {
      const children = nodesToJSX({ nodes: node.children })
      switch (node.tag) {
        case 'h1':
          return <h1 className="font-display text-4xl font-medium text-ink-2">{children}</h1>
        case 'h2':
          return <h2 className="font-display text-3xl font-semibold text-ink">{children}</h2>
        case 'h4':
          return <h4 className="font-display text-lg font-medium text-ink-2">{children}</h4>
        case 'h5':
          return <h5 className="font-display text-base font-medium text-ink-2">{children}</h5>
        case 'h6':
          return <h6 className="font-display text-base font-medium text-ink-2">{children}</h6>
        default:
          return <h3 className="font-display text-xl font-medium text-ink-2">{children}</h3>
      }
    },

    // Uploaded images — full article width, with the WordPress caption
    // underneath when the media document carries one.
    upload: ({ node }) => {
      const doc = (node as { value?: unknown }).value
      if (!doc || typeof doc !== 'object') return null
      const media = doc as UploadDoc
      const url = media.url
      if (!url) return null

      if (!isImageUpload(media))
        return (
          <a href={url} rel="noopener noreferrer" className="text-brass-deep underline">
            {media.filename}
          </a>
        )

      const caption = media.caption?.trim()
      return (
        <figure className="mt-8 md:mt-10">
          <div className="relative overflow-hidden bg-paper-2">
            <Image
              src={url}
              alt={media.alt || caption || ''}
              // Migrated rows are missing their dimensions, so a 3:2 frame
              // stands in to reserve space; `h-auto` keeps the real photo
              // undistorted whichever way it turns out.
              width={media.width || 1600}
              height={media.height || 1067}
              className="h-auto w-full object-cover"
              sizes="(min-width: 1024px) 960px, 100vw"
            />
          </div>
          {caption ? (
            <figcaption className="mt-3 text-sm leading-6 text-ink-2/60">{caption}</figcaption>
          ) : null}
        </figure>
      )
    },

    // Quotes — same look as the site's editorial pull-quotes.
    quote: ({ node, nodesToJSX }) => (
      <blockquote className="mt-3 border-l-2 border-brass pl-4 text-base italic leading-7 text-ink-2/70">
        {nodesToJSX({ nodes: node.children })}
      </blockquote>
    ),
  })

export function RichTextContent({
  data,
  className,
  tone = 'body',
}: {
  /** Serialized Lexical editor state from a Payload richText field. */
  data: RichTextValue
  /** Optional class for the wrapping element (rarely needed). */
  className?: string
  /** Paragraph styling: `lead` for larger intro copy, `body` for article text, `light` for dark backgrounds (white/85). */
  tone?: 'body' | 'lead' | 'light'
}) {
  // Cast through the component's own prop type — the precise Lexical types
  // are not importable here (see lib/richText.ts).
  const editorState = data as Parameters<typeof RichText>[0]['data']
  return (
    <RichText
      data={editorState}
      converters={siteConverters(tone)}
      disableContainer
      className={className}
    />
  )
}
