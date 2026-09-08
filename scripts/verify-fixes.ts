import 'dotenv/config'
import { getPayload } from 'payload'
import configPromise from '../src/payload.config'

async function main() {
  const payload = await getPayload({ config: configPromise })

  console.log('\n======================================================')
  console.log('1. VERIFYING TESTIMONIAL QUOTES EXTRACTION')
  console.log('======================================================')
  for (const slug of ['home-remodeling', 'additions']) {
    const result = await payload.find({
      collection: 'services',
      where: { slug: { equals: slug } },
      limit: 1,
    })
    const service = result.docs[0]
    if (!service) {
      console.log(`❌ ${slug}: not found`)
      continue
    }
    const sections = (service as any).sections || []
    const testimonialSection = sections.find(
      (s: any) => s.blockType === 'landing-testimonials',
    )
    if (!testimonialSection) {
      console.log(`❌ ${slug}: no landing-testimonials section found`)
      continue
    }
    const providers = testimonialSection.providers || []
    const totalReviews = providers.reduce(
      (sum: number, p: any) => sum + (p.reviews?.length || 0),
      0,
    )
    console.log(
      `${totalReviews > 0 ? '✅' : '❌'} ${slug}: ${providers.length} provider(s), ${totalReviews} review(s)`,
    )
    for (const p of providers) {
      console.log(`   Provider: "${p.name}" — ${p.reviews?.length || 0} reviews`)
      for (const r of (p.reviews || []).slice(0, 3)) {
        console.log(`     - ${r.reviewer}: "${(r.body || '').slice(0, 60)}..."`)
      }
    }
  }

  console.log('\n======================================================')
  console.log('2. VERIFYING KEY FEATURES BULLET LISTS')
  console.log('======================================================')
  for (const slug of ['adu', 'additions', 'complete-renovation']) {
    const result = await payload.find({
      collection: 'services',
      where: { slug: { equals: slug } },
      limit: 1,
    })
    const service = result.docs[0]
    if (!service) {
      console.log(`❌ ${slug}: not found`)
      continue
    }
    const sections = (service as any).sections || []
    const imageTextSection = sections.find(
      (s: any) => s.blockType === 'image-text',
    )
    if (!imageTextSection) {
      console.log(`⚠️  ${slug}: no image-text section`)
      continue
    }
    const desc = imageTextSection.description || ''
    const hasBullets = desc.includes('•')
    const bulletCount = (desc.match(/•/g) || []).length
    console.log(
      `${hasBullets ? '✅' : '❌'} ${slug} image-text: ${hasBullets ? `${bulletCount} bullet items` : 'NO bullets — still a wall of text'}`,
    )
    if (hasBullets) {
      const lines = desc.split('\n').slice(0, 4)
      for (const line of lines) {
        console.log(`   ${line.slice(0, 80)}${line.length > 80 ? '...' : ''}`)
      }
      if (desc.split('\n').length > 4) console.log(`   ... (${desc.split('\n').length} lines total)`)
    }
  }

  process.exit(0)
}

main().catch((err) => {
  console.error(err)
  process.exit(1)
})
