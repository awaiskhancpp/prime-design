import 'dotenv/config'
import { resolvePageBySlug } from '../src/lib/pages'
const page = await resolvePageBySlug('home')
const diff = page?.layout.find((s) => s.type === 'difference')
console.log('difference section from the resolver:')
console.log(JSON.stringify({ eyebrow: diff?.content.eyebrow, videos: diff?.content.videos?.length, checklist: diff?.content.checklist?.length }, null, 1))
console.log('section types:', page?.layout.map((s) => s.type).join(' → '))
process.exit(0)
