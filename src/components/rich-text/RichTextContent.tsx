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
 *
 * Usage: `<RichTextContent data={record.someRichTextField} />`. Render
 * nothing (null) when the field is empty — pair with
 * `richTextHasContent()` when a fallback is needed.
 */

/**
 * Site-styled JSX converters. Everything not overridden here (bold,
 * italic, links, tables, uploads, ...) uses Payload's default converters.
 */
const siteConverters: JSXConvertersFunction = ({ defaultConverters }) => ({
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

  // Loose paragraphs outside lists — body copy styling.
  paragraph: ({ node, nodesToJSX }) => (
    <p className="mt-3 text-base leading-7 text-ink-2/70">
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
}: {
  /** Serialized Lexical editor state from a Payload richText field. */
  data: RichTextValue
  /** Optional class for the wrapping element (rarely needed). */
  className?: string
}) {
  // Cast through the component's own prop type — the precise Lexical types
  // are not importable here (see lib/richText.ts).
  const editorState = data as Parameters<typeof RichText>[0]['data']
  return (
    <RichText data={editorState} converters={siteConverters} disableContainer className={className} />
  )
}
