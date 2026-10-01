import 'dotenv/config'
import { createRequire } from 'node:module'

const { Client } = createRequire(import.meta.url)('../node_modules/.pnpm/pg@8.20.0/node_modules/pg')

type MediaRow = {
  id: number
  filename: string | null
  url: string | null
  mime_type: string | null
  width: number | null
  height: number | null
  filesize: number | null
  source_url: string | null
  wordpress_id: number | null
}

type ForeignKey = {
  table_name: string
  column_name: string
}

type Finding = {
  severity: 'confirmed' | 'suspicious' | 'unverified'
  kind: string
  evidence: string
}

const imageField = /(?:^|_)(?:image|images|photo|picture|thumbnail|poster|logo|icon|avatar|background_image|featured_image|og_image)(?:_|$)/i

const quoteIdentifier = (value: string) => `"${value.replaceAll('"', '""')}"`
function uploadIds(value: unknown, found = new Set<number>()): Set<number> {
  if (Array.isArray(value)) {
    for (const item of value) uploadIds(item, found)
    return found
  }
  if (!value || typeof value !== 'object') return found
  const record = value as Record<string, unknown>
  if (record.type === 'upload' && typeof record.value === 'number') found.add(record.value)
  for (const child of Object.values(record)) uploadIds(child, found)
  return found
}

async function checkUrl(url: string): Promise<{ status: number; contentType: string } | undefined> {
  const controller = new AbortController()
  const timeout = setTimeout(() => controller.abort(), 10_000)
  try {
    const response = await fetch(url, { method: 'HEAD', redirect: 'follow', signal: controller.signal })
    if (response.status !== 405 && response.status !== 501) {
      return { status: response.status, contentType: response.headers.get('content-type') || '' }
    }
    const fallback = await fetch(url, {
      headers: { Range: 'bytes=0-0' },
      redirect: 'follow',
      signal: controller.signal,
    })
    return { status: fallback.status, contentType: fallback.headers.get('content-type') || '' }
  } catch {
    return undefined
  } finally {
    clearTimeout(timeout)
  }
}

const client = new Client({ connectionString: process.env.DATABASE_URL })
await client.connect()

try {
  const mediaResult = (await client.query(`
    select id, filename, url, mime_type, width, height, filesize, source_url, wordpress_id
    from media
    order by id`)) as { rows: MediaRow[] }
  const media = mediaResult.rows
  const findings: Finding[] = []
  const imageReferences = new Map<number, string[]>()
  const mediaIds = new Set(media.map((item) => Number(item.id)))

  // Rich text upload nodes are JSON rather than ordinary foreign keys. Check
  // them too, because an orphaned upload node renders as a missing image even
  // though the relational media audit cannot see it.
  const jsonColumns = (await client.query(`
    select table_name, column_name
    from information_schema.columns
    where table_schema = 'public'
      and data_type in ('json', 'jsonb')`)) as {
    rows: Array<{ table_name: string; column_name: string }>
  }
  for (const jsonColumn of jsonColumns.rows) {
    const table = quoteIdentifier(jsonColumn.table_name)
    const column = quoteIdentifier(jsonColumn.column_name)
    const rows = (await client.query(
      `select id, ${column}::text as payload from ${table} where ${column}::text like '%upload%'`,
    )) as { rows: Array<{ id: string | number; payload: string | null }> }
    for (const row of rows.rows) {
      if (!row.payload) continue
      let parsed: unknown
      try {
        parsed = JSON.parse(row.payload)
      } catch {
        continue
      }
      for (const id of uploadIds(parsed)) {
        if (!mediaIds.has(id)) {
          findings.push({
            severity: 'confirmed',
            kind: 'orphaned rich-text image reference',
            evidence: `${jsonColumn.table_name}.${jsonColumn.column_name} row ${row.id} points to missing media ID ${id}`,
          })
        }
      }
    }
  }

  const foreignKeys = (await client.query(`
    select distinct kcu.table_name, kcu.column_name
    from information_schema.table_constraints tc
    join information_schema.key_column_usage kcu
      on kcu.constraint_name = tc.constraint_name
      and kcu.constraint_schema = tc.constraint_schema
    join information_schema.constraint_column_usage ccu
      on ccu.constraint_name = tc.constraint_name
      and ccu.constraint_schema = tc.constraint_schema
    where tc.constraint_type = 'FOREIGN KEY'
      and tc.constraint_schema = 'public'
      and ccu.table_schema = 'public'
      and ccu.table_name = 'media'
    order by kcu.table_name, kcu.column_name`)) as { rows: ForeignKey[] }

  const referenceCounts = new Map<number, number>()
  for (const foreignKey of foreignKeys.rows) {
    const table = quoteIdentifier(foreignKey.table_name)
    const column = quoteIdentifier(foreignKey.column_name)
    const rows = (await client.query(
      `select id, ${column} as media_id from ${table} where ${column} is not null`,
    )) as { rows: Array<{ id: string | number; media_id: string | number }> }
    for (const row of rows.rows) {
      const id = Number(row.media_id)
      referenceCounts.set(id, (referenceCounts.get(id) || 0) + 1)
      if (imageField.test(foreignKey.column_name)) {
        const locations = imageReferences.get(id) || []
        locations.push(`${foreignKey.table_name}.${foreignKey.column_name}`)
        imageReferences.set(id, locations)
      }
    }
  }

  for (const item of media) {
    const imageLocations = imageReferences.get(Number(item.id)) || []
    if (imageLocations.length && !item.mime_type?.startsWith('image/')) {
      findings.push({
        severity: 'confirmed',
        kind: 'non-image media referenced by an image field',
        evidence: `media ${item.id} (${item.filename || 'unnamed'}) has MIME type ${item.mime_type || '(missing)'}; referenced by ${imageLocations.join(', ')}`,
      })
    }
    if (
      imageLocations.length &&
      ((item.width !== null && item.width < 2) || (item.height !== null && item.height < 2))
    ) {
      findings.push({
        severity: 'confirmed',
        kind: 'invalid image dimensions',
        evidence: `media ${item.id} (${item.filename || 'unnamed'}) is ${item.width}×${item.height}; referenced by ${imageLocations.join(', ')}`,
      })
    }
  }

  const directReferences = foreignKeys.rows.length
  console.log(`Media records: ${media.length}`)
  console.log(`Media foreign-key fields: ${directReferences}`)
  console.log(`Directly referenced media records: ${referenceCounts.size}`)
  console.log(`Media records referenced by image fields: ${imageReferences.size}`)
  console.log('')
  console.log('Findings:')
  if (!findings.length) console.log('  None from database structure, media metadata, or source mappings.')
  for (const finding of findings) {
    console.log(`  [${finding.severity}] ${finding.kind}`)
    console.log(`    ${finding.evidence}`)
  }

  console.log('')
  console.log('Stored media URL checks (WordPress source URLs are not treated as image availability):')
  const remoteMedia = media.filter((item) => item.url?.startsWith('http'))
  const results = await Promise.all(
    remoteMedia.map(async (item) => ({ item, result: await checkUrl(item.url as string) })),
  )
  let unavailable = 0
  for (const { item, result } of results) {
    if (!result) {
      unavailable++
      console.log(`  [unverified] media ${item.id} ${item.filename || '(unnamed)'}: ${item.url}`)
    } else if (result.status >= 400 && result.status !== 403) {
      console.log(`  [confirmed] media ${item.id} ${item.filename || '(unnamed)'}: stored URL returned HTTP ${result.status}: ${item.url}`)
    } else if (result.status === 403) {
      unavailable++
    }
  }
  console.log(`  Checked ${remoteMedia.length}; unavailable or access-blocked: ${unavailable}`)
  console.log('  Local /api/media/file URLs were not checked because this audit does not start the website server.')
} finally {
  await client.end()
}
