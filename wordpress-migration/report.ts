import { PageMigrationResult } from './types'

export function migrationReport(results: PageMigrationResult[]) {
  const sections = results.flatMap((result) => result.sections)
  const media = results.flatMap((result) => result.media)
  const supported = sections.filter((section) => section.classification === 'supported').length
  const partial = sections.filter((section) => section.classification === 'partial').length
  const unsupported = sections.filter((section) => ['missing-schema', 'missing-renderer', 'parser-error'].includes(section.classification)).length
  return {
    pagesProcessed: results.length,
    sectionsFound: sections.length,
    supportedSections: supported,
    partialSections: partial,
    unsupportedSections: unsupported,
    mediaReferences: media.length,
    mediaResolved: media.filter((item) => item.status === 'resolved').length,
    mediaMissing: media.filter((item) => item.status === 'missing-file').length,
    mediaUnresolved: media.filter((item) => item.status === 'unresolved-reference').length,
    mediaDuplicates: media.filter((item) => item.status === 'duplicate').length,
    warnings: results.flatMap((result) => result.warnings),
    errors: results.flatMap((result) => result.errors),
    status: results.some((result) =>
      result.errors.length ||
      result.media.some((item) => ['missing-file', 'unresolved-reference'].includes(item.status)) ||
      result.sections.some((section) => ['missing-schema', 'missing-renderer', 'parser-error'].includes(section.classification)),
    ) ? 'NOT_READY' : 'READY',
    pages: results.map((result) => ({
      slug: result.page.slug,
      title: result.page.title,
      sourceElementCount: result.bricks?.sourceElementCount || 0,
      sections: result.sections.length,
      supported: result.sections.filter((section) => section.classification === 'supported').length,
      partial: result.sections.filter((section) => section.classification === 'partial').length,
      unsupported: result.sections.filter((section) => ['missing-schema', 'missing-renderer', 'parser-error'].includes(section.classification)).length,
      sectionDiagnostics: result.sections.map((section) => ({ order: section.order, sourceId: section.sourceId, type: section.type, classification: section.classification, reason: section.reason, required: section.required, unsupportedElements: section.unsupportedElements })),
      media: result.media.map((item) => ({ reference: item.reference, attachmentId: item.attachment?.id, filename: item.attachment?.filename, url: item.attachment?.url, localPath: item.localPath, status: item.status, warning: item.warning })),
      warnings: result.warnings,
      errors: result.errors,
    })),
  }
}

export function reportMarkdown(report: ReturnType<typeof migrationReport>): string {
  const lines = [
    '# WordPress Migration Dry Run',
    '',
    `- Migration status: **${report.status}**`,
    `- Pages processed: ${report.pagesProcessed}`,
    `- Sections found: ${report.sectionsFound}`,
    `- Supported sections: ${report.supportedSections}`,
    `- Partial sections: ${report.partialSections}`,
    `- Unsupported sections: ${report.unsupportedSections}`,
    `- Media references: ${report.mediaReferences}`,
    `- Media resolved: ${report.mediaResolved}`,
    `- Missing media files: ${report.mediaMissing}`,
    `- Unresolved media references: ${report.mediaUnresolved}`,
    `- Duplicate media: ${report.mediaDuplicates}`,
    '',
  ]
  for (const page of report.pages) {
    lines.push(`## ${page.title}`, '', `- Slug: \`${page.slug}\``, `- Bricks elements: ${page.sourceElementCount}`, `- Sections: ${page.sections}`, `- Supported: ${page.supported}`, `- Partial: ${page.partial}`, `- Unsupported: ${page.unsupported}`, '')
    for (const section of page.sectionDiagnostics) {
      if (section.classification !== 'supported') lines.push(`- Section ${section.order} (${section.sourceId}): **${section.classification}** — ${section.reason || 'No reason recorded.'}${section.required ? ` Required: ${section.required}.` : ''}`)
      for (const element of section.unsupportedElements) lines.push(`  - Element ${element.actualElement} (${element.sourceElement}): ${element.reason} Required: ${element.required || 'not specified'}.`)
    }
    for (const media of page.media.filter((item) => item.status !== 'resolved')) lines.push(`- Media ${String(media.reference)}: **${media.status}**${media.warning ? ` — ${media.warning}` : ''}`)
    for (const warning of page.warnings) lines.push(`- Warning: ${warning}`)
    for (const error of page.errors) lines.push(`- Error: ${error}`)
    lines.push('')
  }
  return lines.join('\n')
}
