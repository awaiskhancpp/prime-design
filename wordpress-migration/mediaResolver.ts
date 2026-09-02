import fs from 'node:fs/promises'
import path from 'node:path'
import crypto from 'node:crypto'
import { MediaDiagnostic, NormalizedImage, WordPressAttachment } from './types'

type LocalFile = { path: string; hash: string }

async function filesIn(folder: string): Promise<LocalFile[]> {
  if (!folder) return []
  const result: LocalFile[] = []
  async function visit(directory: string) {
    let entries: import('node:fs').Dirent[]
    try { entries = await fs.readdir(directory, { withFileTypes: true }) as import('node:fs').Dirent[] } catch { return }
    for (const entry of entries) {
      const fullPath = path.join(directory, entry.name)
      if (entry.isDirectory()) await visit(fullPath)
      else result.push({ path: fullPath, hash: crypto.createHash('sha256').update(await fs.readFile(fullPath)).digest('hex') })
    }
  }
  await visit(folder)
  return result
}

const basename = (value?: string) => value ? decodeURIComponent(value.split('/').pop() || '').toLowerCase() : ''

export async function resolveMedia(
  images: NormalizedImage[],
  attachments: WordPressAttachment[],
  uploadsFolder?: string,
): Promise<MediaDiagnostic[]> {
  const local = await filesIn(uploadsFolder || '')
  const byId = new Map(attachments.map((attachment) => [attachment.id, attachment]))
  const byHash = new Map<string, string[]>()
  for (const file of local) byHash.set(file.hash, [...(byHash.get(file.hash) || []), file.path])
  const diagnostics: MediaDiagnostic[] = []
  const seen = new Map<string, string>()
  for (const image of images) {
    const reference = image.sourceId ?? image.url ?? image.filename ?? 'unknown'
    const attachment = typeof image.sourceId === 'number' ? byId.get(image.sourceId) : attachments.find((item) => basename(item.filename) === basename(image.filename) || basename(item.url) === basename(image.url))
    if (!attachment) {
      diagnostics.push({ reference, status: 'unresolved-reference', warning: `No WordPress attachment matched media reference ${String(reference)}.` })
      continue
    }
    const candidates = local.filter((file) => basename(file.path) === basename(attachment.filename) || basename(file.path) === basename(attachment.url))
    if (!candidates.length) {
      diagnostics.push({ reference, attachment, status: 'missing-file', warning: `Attachment ${attachment.id} exists in XML but no local file was found.` })
      continue
    }
    const file = candidates[0]
    const hash = local.find((candidate) => candidate.path === file.path)?.hash || ''
    if (hash && seen.has(hash)) {
      diagnostics.push({ reference, attachment, localPath: file.path, status: 'duplicate', warning: `File duplicates ${seen.get(hash)}.` })
    } else {
      if (hash) seen.set(hash, file.path)
      diagnostics.push({ reference, attachment, localPath: file.path, status: 'resolved' })
    }
    const sameHashFiles = hash ? byHash.get(hash) || [] : []
    if (sameHashFiles.length > 1 && diagnostics[diagnostics.length - 1].status === 'resolved') diagnostics[diagnostics.length - 1] = { ...diagnostics[diagnostics.length - 1], status: 'duplicate', warning: `Multiple local files have the same content hash: ${sameHashFiles.join(', ')}` }
  }
  return diagnostics
}
