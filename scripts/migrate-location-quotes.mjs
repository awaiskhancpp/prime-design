/**
 * Populates the Quote group (Location Page Sections tab) for Bathroom
 * Remodeling and Home Remodeling with the same WordPress pull-quote copy
 * the Kitchen page carries ("Crafting Your Dream Home, Our Promise" —
 * Noah, Co-founder of Prime Design & Build), so every location page's
 * quote section is Payload-driven. Idempotent.
 */
import { readFileSync } from 'node:fs'
import { createRequire } from 'node:module'

const require = createRequire(import.meta.url)
const { Client } = require('../node_modules/.pnpm/pg@8.20.0/node_modules/pg')

const env = readFileSync(new URL('../.env', import.meta.url), 'utf8')
const u = env.match(/^DATABASE_URL=(.+)$/m)[1].trim()
const c = new Client({ connectionString: u })
await c.connect()

const QUOTE = {
  heading: 'Crafting Your Dream Home, Our Promise',
  quote:
    'We\u2019re here to turn your house into a home, one project at a time. At Prime Design & Build, we believe in making your remodeling journey personal and extraordinary. Together, let\u2019s build a home where cherished moments are made.',
  attribution: 'Noah, Co-founder of Prime Design & Build',
}

for (const [serviceId, image] of [
  [3, '/before-after/bathroom_remodeling_after.jpeg'],
  [2, '/services/home-remodeling.jpeg'],
]) {
  await c.query(
    `update services set
       quote_heading = coalesce(quote_heading, $2),
       quote_quote = coalesce(quote_quote, $3),
       quote_attribution = coalesce(quote_attribution, $4)
     where id = $1`,
    [serviceId, QUOTE.heading, QUOTE.quote, QUOTE.attribution],
  )
  console.log(`quote populated: service ${serviceId}`)
}
await c.end()
process.exit(0)
