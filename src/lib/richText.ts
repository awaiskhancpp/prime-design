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

type LexicalNode = {
  type?: string
  text?: string
  children?: LexicalNode[]
}

/**
 * Extracts the plain text of a serialized Lexical rich text value (or a
 * plain string, passed through unchanged). Used where a rich text field
 * must render inside a hand-built section whose design uses a plain
 * paragraph — the text keeps the section's markup while the content stays
 * editable as rich text in the admin.
 *
 * Paragraphs and list items are separated by single spaces, matching how
 * inline copy reads; block boundaries (paragraph ends, list items) get a
 * space so concatenated nodes never run together.
 */
export function richTextToPlainText(value: unknown): string {
  if (value == null) return ''
  if (typeof value === 'string') return value

  const walk = (nodes: LexicalNode[] | null | undefined): string => {
    if (!Array.isArray(nodes)) return ''
    return nodes
      .map((node) => {
        if (!node || typeof node !== 'object') return ''
        if (node.type === 'text') return typeof node.text === 'string' ? node.text : ''
        if (node.type === 'linebreak') return ' '
        const inner = walk(node.children)
        return inner
      })
      .join(' ')
      .replace(/\s+/g, ' ')
      .trim()
  }

  return walk((value as RichTextValue)?.root?.children as LexicalNode[] | undefined)
}
