import 'dotenv/config'
import fs from 'node:fs/promises'
import { parseBricksSerialized } from '../wordpress-migration/bricksParser'
import { normalizeBricksPage } from '../wordpress-migration/normalizer'
import { parseWordPressXmlFile } from '../wordpress-migration/xmlParser'
import type { BricksTreeNode } from '../wordpress-migration/types'

const xmlPath =
  process.argv[2] || 'C:/Users/HP/Downloads/primedesignampbuild.WordPress.2026-08-28.xml'

const targetServices = [
  { wordpressPageId: 327, serviceSlug: 'kitchen-remodeling', title: 'Kitchen Remodeling' },
  { wordpressPageId: 337, serviceSlug: 'bathroom-remodeling', title: 'Bathroom Remodeling' },
  { wordpressPageId: 335, serviceSlug: 'home-remodeling', title: 'Home Remodeling' },
  { wordpressPageId: 1976, serviceSlug: 'adu', title: 'ADU' },
  { wordpressPageId: 1978, serviceSlug: 'additions', title: 'Additions' },
  { wordpressPageId: 1980, serviceSlug: 'complete-renovation', title: 'Complete Renovation' },
  {
    wordpressPageId: 329,
    serviceSlug: 'european-kitchen',
    title: 'European Kitchen',
    parentServiceSlug: 'kitchen-remodeling',
  },
  {
    wordpressPageId: 331,
    serviceSlug: 'custom-kitchen',
    title: 'Custom Kitchen',
    parentServiceSlug: 'kitchen-remodeling',
  },
  {
    wordpressPageId: 333,
    serviceSlug: 'shaker-kitchen',
    title: 'Shaker Kitchen',
    parentServiceSlug: 'kitchen-remodeling',
  },
]

let activePageTitle = ''

function clean(value: unknown): string {
  if (typeof value !== 'string') return ''
  let text = value
  if (activePageTitle) {
    text = text.replace(/\{post_title(?::\d+)?\}/gi, activePageTitle)
  }
  return text
    .replace(/<[^>]+>/g, ' ')
    .replace(/&nbsp;/gi, ' ')
    .replace(/\s+/g, ' ')
    .trim()
}

function descendants(node: BricksTreeNode): BricksTreeNode[] {
  return [node, ...(node.children || []).flatMap(descendants)]
}

async function run() {
  console.log('Loading XML from:', xmlPath)
  const source = await parseWordPressXmlFile(xmlPath)
  console.log('Total pages in XML:', source.pages.length)

  const output: string[] = []

  for (const target of targetServices) {
    activePageTitle = target.title
    const page = source.pages.find((p) => p.id === target.wordpressPageId)
    if (!page || !page.bricksSerialized) {
      output.push(`\n=== PAGE: ${target.title} (${target.serviceSlug}) - NO BRICKS CONTENT ===`)
      continue
    }

    const bricks = parseBricksSerialized(page.bricksSerialized)
    const normalized = normalizeBricksPage(page, bricks.roots)

    output.push(`\n================================================================================`)
    output.push(`PAGE: ${target.title} (slug: ${target.serviceSlug}, WP ID: ${page.id})`)
    output.push(`Roots count: ${bricks.roots.length} | Normalized count: ${normalized.length}`)
    output.push(`================================================================================`)

    bricks.roots.forEach((root, idx) => {
      const allNodes = descendants(root)
      const norm = normalized.find((n) => n.sourceId === root.id)
      const elementNames = [...new Set(allNodes.map((n) => n.name))]

      const headingNodes = allNodes.filter((n) =>
        ['heading', 'title', 'post-title'].includes(n.name),
      )
      const textNodes = allNodes.filter((n) =>
        ['text', 'text-basic', 'rich-text', 'post-content'].includes(n.name),
      )
      const buttonNodes = allNodes.filter((n) => n.name === 'button')
      const imageNodes = allNodes.filter((n) =>
        ['image', 'media', 'post-featured-image'].includes(n.name),
      )
      const iconNodes = allNodes.filter((n) => n.name === 'icon-box' || n.name === 'list')
      const specialNodes = allNodes.filter((n) =>
        [
          'shortcode',
          'slider-nested',
          'carousel',
          'gallery',
          'xproaccordion',
          'tabs-nested',
          'xfluentform',
        ].includes(n.name),
      )

      const headings = headingNodes.map((n) => {
        const text = clean(n.settings.text || n.settings.title || n.settings.heading || '')
        const tag = n.settings.tag || 'h2'
        return { tag, text }
      })

      const texts = textNodes.map((n) => {
        return clean(n.settings.text || n.settings.content || '')
      }).filter(Boolean)

      const buttons = buttonNodes.map((n) => {
        const label = clean(n.settings.text || n.settings.label || '')
        const link = n.settings.link
        return { label, link }
      })

      output.push(`\n--- Root ${idx + 1} (Root ID: ${root.id}, Name: ${root.name}) ---`)
      if (!norm) {
        output.push(`  Normalized Status: ⏭️  SKIPPED (${root.name !== 'section' ? 'non-section root element' : 'filtered or unnormalized'})`)
      } else {
        const typeLabel =
          norm.type === 'image-text' || norm.type === 'content'
            ? `⚠️  ${norm.type} (generic fallback)`
            : norm.type === 'unsupported'
              ? `❌ ${norm.type}`
              : `✅ ${norm.type}`
        output.push(`  Normalized Type: ${typeLabel} | Classification: ${norm.classification}`)
      }
      output.push(`  Elements present: ${elementNames.join(', ')}`)
      output.push(`  Images count: ${imageNodes.length} | Icons/Lists count: ${iconNodes.length}`)

      if (headings.length) {
        output.push(`  HEADINGS (${headings.length}):`)
        headings.forEach((h, hIdx) => {
          output.push(`    [${hIdx + 1}] <${h.tag}> "${h.text}" (${h.text.length} chars)`)
        })
      } else {
        output.push(`  HEADINGS: [NONE - No explicit heading element]`)
      }

      if (texts.length) {
        output.push(`  BODY TEXTS (${texts.length}):`)
        texts.forEach((t, tIdx) => {
          output.push(`    [${tIdx + 1}] (${t.length} chars): "${t.slice(0, 120)}${t.length > 120 ? '...' : ''}"`)
        })
      }

      if (buttons.length) {
        output.push(`  BUTTONS (${buttons.length}):`)
        buttons.forEach((b) => output.push(`    "${b.label}" -> ${JSON.stringify(b.link)}`))
      }

      if (specialNodes.length) {
        output.push(`  SPECIAL WIDGETS: ${specialNodes.map((n) => n.name).join(', ')}`)
      }
    })
  }

  const resultText = output.join('\n')
  await fs.writeFile('wordpress-migration/service-pages-audit.txt', resultText, 'utf-8')
  console.log('Saved audit to wordpress-migration/service-pages-audit.txt')
}

run().catch((err) => {
  console.error('Audit failed:', err)
  process.exit(1)
})
