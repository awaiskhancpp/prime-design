// Restore the WordPress bathroom/home landing-template copy (templates 1584
// and 1639) on the service-location rows — the earlier migration had seeded
// every city with the kitchen template's wording.
import { readFileSync } from 'node:fs'
import pg from '../node_modules/.pnpm/pg@8.20.0/node_modules/pg/esm/index.mjs'

const rawEnv = readFileSync('.env', 'utf8')
const conn = (rawEnv.match(/DATABASE_URL=([^\r\n]+)/) || [])[1].replace(/^"(.*)"$/, '$1')

const BATHROOM = {
  location_video_eyebrow: '#1 {ServiceTitle} Company in {City}',
  location_video_title: 'Transform Your Bathroom into a Dream Space in {City} - A World of Possibilities!',
  location_video_description:
    "Experience the luxury of a bathroom that embodies your personal style and fulfills your desires. With Prime Design & Build, it's within reach.",
  dont_settle_heading: "Don't Settle for a Mediocre",
  dont_settle_heading_accent: 'Bathroom in {City}',
  dont_settle_body:
    'As a homeowner in {City}, you understand the importance of creating a bathroom that stands out and exudes style. At Prime Design & Build, we specialize in Bathroom Remodeling in {City}, bringing your vision to life with our exceptional craftsmanship and attention to detail. Whether you desire a contemporary, spa-like retreat or a traditional, elegant sanctuary, our team of experts will transform your bathroom into a space that reflects your unique taste and enhances your home. With our custom bathroom remodeling services, we ensure that every aspect is tailored to your needs, providing you with a bathroom that exceeds your expectations.',
}

const HOME = {
  location_video_eyebrow: '#1 Home Remodeling Company in {City}',
  location_video_title: 'Create Your Dream Home in {City}',
  location_video_description:
    "Unleash Your Imagination with Prime Design & Build' Remodeling Solutions With Prime Design & Build, it's within reach.",
  dont_settle_heading: 'Say Goodbye to Mediocre Homes in {City} -',
  dont_settle_heading_accent: "Transform Yours with Prime Design & Build's Craftsmanship",
  dont_settle_body:
    'At Prime Design & Build, we specialize in Home Remodeling in {City}, bringing your vision to life with our high-quality craftsmanship. From initial consultation to project completion, our dedicated team ensures a seamless remodeling experience. With clear communication, transparent processes, and a focus on your satisfaction, we make your home remodeling journey stress-free and enjoyable. Experience the difference in Prime Design & Build\'s craftsmanship. Our skilled artisans bring years of experience and meticulous attention to detail to every project. Whether you desire a modern, sleek design or a timeless, classic style, we work closely with you to create a home that reflects your unique taste and enhances the beauty of your space.',
}

const client = new pg.Client({ connectionString: conn })
await client.connect()
try {
  for (const [serviceId, content] of [[3, BATHROOM], [2, HOME]]) {
    const setSql = Object.entries(content)
      .map(([col]) => `${col} = $2`)
      .join(', ')
    // Use per-row values for the placeholder-bearing columns; the rest are
    // constant. Simpler: parametrized update per column.
    for (const [col, value] of Object.entries(content)) {
      const r = await client.query(
        `UPDATE service_locations SET ${col} = $1 WHERE service_id = $2`,
        [value, serviceId],
      )
      console.log(`${col}: updated ${r.rowCount} rows for service ${serviceId}`)
    }
  }
} finally {
  await client.end()
}
