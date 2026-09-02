import { parseWordPressXmlFile, parseBricksSerialized, normalizeBricksPage, resolveMedia, migrationReport, reportMarkdown } from './index'

const args = process.argv.slice(2)
const xmlPath = args[0]
const allPages = args.includes('--all')
const positional = args.slice(1).filter((arg) => arg !== '--all')
const uploadsFolder = positional[0]
const targetPageSlugs = [
  'kitchen-remodeling-information',
  'bathroom-remodeling-information',
  'additions-remodeling-information',
  'home-remodeling-information',
  'outdoor-hardscape-outdoor-kitchen-information',
  'siding-installation-replacement-information',
  'comprehensive-home-repair-installation-services-in-silicon-valley',
  'remodeling-information',
]
if (!xmlPath) throw new Error('Usage: pnpm tsx wordpress-migration/run-dry-run.ts <wordpress-export.xml> [uploads-folder] [--all]')

const source = await parseWordPressXmlFile(xmlPath)
const pages = allPages ? source.pages : source.pages.filter((page) => targetPageSlugs.includes(page.slug))
const missingTargets = targetPageSlugs.filter((slug) => !source.pages.some((page) => page.slug === slug))
const results = []
for (const page of pages) {
  if (!page.bricksSerialized) {
    results.push({ page, sections: [], media: [], warnings: ['No _bricks_page_content_2 value was found.'], errors: ['Page content is not available in the Bricks source field.'] })
    continue
  }
  const bricks = parseBricksSerialized(page.bricksSerialized)
  const sections = normalizeBricksPage(page, bricks.roots)
  const mediaRefs = sections.flatMap((section) => section.images)
  const media = await resolveMedia(mediaRefs, source.attachments, uploadsFolder)
  results.push({ page, bricks, sections, media, warnings: bricks.parserWarnings, errors: [] })
}

const report = migrationReport(results)
const scopedReport = {
  ...report,
  scope: allPages ? 'all WordPress pages' : 'requested Google Ads landing pages',
  targetPageSlugs,
  skippedPages: source.pages.length - pages.length,
  missingTargetPages: missingTargets,
}
console.log(reportMarkdown(scopedReport))
console.log(JSON.stringify({ ...scopedReport, sourceItems: source.allItems }, null, 2))
