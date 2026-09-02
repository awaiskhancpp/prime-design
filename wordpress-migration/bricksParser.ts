import { BricksDocument, BricksElement, BricksSettings, BricksTreeNode } from './types'

class PhpSerializedParser {
  private index = 0
  private readonly input: Buffer

  constructor(serialized: string) {
    this.input = Buffer.from(serialized, 'utf8')
  }

  parse(): unknown {
    const value = this.value()
    if (this.index !== this.input.length) throw new Error(`Trailing serialized data at byte offset ${this.index}`)
    return value
  }

  private value(): unknown {
    const type = String.fromCharCode(this.input[this.index++])
    if (type === 'N') return this.expect(';')
    if (type === 'b') return this.scalar(Boolean)
    if (type === 'i') return this.scalar(Number)
    if (type === 'd') return this.scalar(Number)
    if (type === 's') return this.string()
    if (type === 'a') return this.array()
    throw new Error(`Unsupported PHP serialized type "${type}" at offset ${this.index - 1}`)
  }

  private scalar(convert: (value: string) => unknown) {
    this.expect(':')
    const end = this.input.indexOf(59, this.index)
    if (end < 0) throw new Error(`Missing scalar terminator at byte offset ${this.index}`)
    const result = convert(this.input.slice(this.index, end).toString('utf8'))
    this.index = end + 1
    return result
  }

  private string() {
    this.expect(':')
    const colonEnd = this.input.indexOf(58, this.index)
    const length = Number(this.input.slice(this.index, colonEnd).toString('ascii'))
    this.index = colonEnd + 2
    const declaredEnd = this.index + length
    let end = declaredEnd
    if (this.input.slice(declaredEnd, declaredEnd + 2).toString('ascii') !== '";') {
      // Some exports contain serialized HTML whose byte count was altered by
      // XML escaping/line-ending normalization. Recover only at the exact
      // PHP string terminator so the tree can still be inspected and report
      // the source mismatch rather than silently dropping the page.
      const recoveredEnd = this.input.indexOf(Buffer.from('";'), this.index)
      if (recoveredEnd < 0) throw new Error(`Missing string terminator at byte offset ${this.index}`)
      end = recoveredEnd
    }
    const result = this.input.slice(this.index, end).toString('utf8')
    this.index = end + 2
    return result
  }

  private array() {
    this.expect(':')
    const end = this.input.indexOf(58, this.index)
    const count = Number(this.input.slice(this.index, end).toString('ascii'))
    this.index = end + 2
    const result: Record<string, unknown> = {}
    for (let index = 0; index < count; index += 1) {
      const key = this.value()
      result[String(key)] = this.value()
    }
    this.expect('}')
    return result
  }

  private expect(expected: string) {
    if (this.input.slice(this.index, this.index + expected.length).toString('ascii') !== expected) {
      throw new Error(`Expected "${expected}" at byte offset ${this.index}`)
    }
    this.index += expected.length
    return null
  }
}

const object = (value: unknown): Record<string, unknown> =>
  typeof value === 'object' && value !== null ? (value as Record<string, unknown>) : {}

const stringArray = (value: unknown) =>
  Object.values(object(value)).filter((item): item is string => typeof item === 'string')

export function parseBricksSerialized(serialized: string): BricksDocument {
  const parserWarnings: string[] = []
  let parsed: unknown
  try {
    parsed = new PhpSerializedParser(serialized).parse()
  } catch (error) {
    return { elements: [], roots: [], sourceElementCount: 0, parserWarnings: [String(error)] }
  }

  const elements = Object.values(object(parsed)).flatMap((value): BricksElement[] => {
    const raw = object(value)
    if (typeof raw.id !== 'string' || typeof raw.name !== 'string') return []
    return [{
      id: raw.id,
      name: raw.name,
      parent: typeof raw.parent === 'string' || typeof raw.parent === 'number' ? raw.parent : 0,
      children: stringArray(raw.children),
      settings: object(raw.settings) as BricksSettings,
      raw,
    }]
  })

  const byId = new Map(elements.map((element) => [element.id, element]))
  const childrenOf = new Map<string, BricksTreeNode[]>()
  for (const element of elements) {
    const children = element.children.flatMap((id) => {
      const child = byId.get(id)
      if (!child) parserWarnings.push(`Element ${element.id} references missing child ${id}.`)
      return child ? [toTreeNode(child, byId, childrenOf, parserWarnings)] : []
    })
    childrenOf.set(element.id, children)
  }
  const roots = elements.filter((element) => element.parent === 0 || element.parent === '0').map((element) =>
    toTreeNode(element, byId, childrenOf, parserWarnings),
  )
  return { elements, roots, sourceElementCount: elements.length, parserWarnings }
}

function toTreeNode(
  element: BricksElement,
  byId: Map<string, BricksElement>,
  cache: Map<string, BricksTreeNode[]>,
  warnings: string[],
): BricksTreeNode {
  const children = cache.get(element.id) || element.children.flatMap((id) => {
    const child = byId.get(id)
    if (!child) warnings.push(`Element ${element.id} references missing child ${id}.`)
    return child ? [toTreeNode(child, byId, cache, warnings)] : []
  })
  return {
    id: element.id,
    name: element.name,
    parent: element.parent,
    settings: element.settings,
    raw: element.raw,
    children,
  }
}
