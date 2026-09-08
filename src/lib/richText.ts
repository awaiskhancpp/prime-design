/**
 * Minimal structural type for a serialized Lexical editor state as stored
 * in Payload `richText` fields (JSON).
 *
 * Kept loose on purpose: the exact Lexical node types are not directly
 * importable under pnpm's strict node_modules layout, and every consumer
 * only needs to know whether content exists before rendering it.
 */
export type RichTextValue = { root?: { children?: unknown[] } | null } | null | undefined

/**
 * True when a rich text value contains at least one node with real
 * content. An untouched Lexical editor saves a single empty paragraph —
 * that counts as "no content" so callers can fall back to defaults.
 */
export function richTextHasContent(value: RichTextValue): boolean {
  const children = value?.root?.children
  if (!Array.isArray(children) || children.length === 0) return false

  return children.some((child) => {
    const node = child as { type?: string; children?: unknown[] } | null
    if (!node || typeof node !== 'object') return false

    // Paragraphs: empty unless they contain actual text.
    if (node.type === 'paragraph') {
      const inline = Array.isArray(node.children) ? node.children : []
      return inline.some((inlineNode) => {
        const text = inlineNode as { text?: string; type?: string }
        if (typeof text.text === 'string') return text.text.trim().length > 0
        return text.type !== 'linebreak'
      })
    }

    // Lists, headings, quotes, uploads, ... are content by definition.
    return true
  })
}
