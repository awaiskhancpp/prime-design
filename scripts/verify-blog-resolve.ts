import 'dotenv/config'
import { resolvePageBySlug } from '../src/lib/pages'
import { resolveBlogPosts } from '../src/lib/blog'

const page = await resolvePageBySlug('blog')
console.log('page hero:', JSON.stringify(page?.hero))
console.log('page layout:', JSON.stringify(page?.layout, null, 1))

const posts = await resolveBlogPosts()
console.log('posts:')
for (const p of posts) console.log(`  ${p.slug} -> ${p.heroImage}`)
process.exit(0)
