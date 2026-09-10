/**
 * Populates services.shortDescription with the WordPress services-index
 * card copy (slug `services` page bricks). Payload-driven listing cards.
 * Comprehensive Home Repair has no card on the WordPress index page — left
 * empty so the existing fallback text is used. Idempotent (coalesce).
 */
import { readFileSync } from 'node:fs'
import { createRequire } from 'node:module'

const require = createRequire(import.meta.url)
const { Client } = require('../node_modules/.pnpm/pg@8.20.0/node_modules/pg')

const env = readFileSync(new URL('../.env', import.meta.url), 'utf8')
const u = env.match(/^DATABASE_URL=(.+)$/m)[1].trim()
const c = new Client({ connectionString: u })
await c.connect()

const CARDS = {
  1: 'Experience the transformation of your home with our kitchen remodeling service. From concept to completion, we bring your vision to life, creating a stunning and functional space that exceeds your expectations. Let us redefine your living environment.',
  2: 'Experience the complete transformation of your home with our Home Remodeling service. From top to bottom, we reimagine your living spaces to create a harmonious blend of style, comfort, and functionality. Whether you want to update your interior design, enhance your home\u2019s layout, or add new features, our expert team is here to make your vision a reality.',
  3: 'Breathe new life into your bathroom with our Bathroom Remodeling service. Refresh outdated elements, update fixtures, and enhance the overall ambiance of your personal oasis. Enjoy a rejuvenated space that brings relaxation and tranquility to your daily routine.',
  7: 'Our team specializes in creating versatile and functional Accessory Dwelling Units that provide homeowners with additional living space or rental opportunities. Whether you\u2019re looking to accommodate a growing family, generate extra income, or enhance your property\u2019s value, our expert designers and builders are here to bring your ADU vision to life.',
  8: 'Our home addition services are tailored to help you expand and enhance your living space without the hassle of moving. Whether you\u2019re looking to add a bedroom, a family room, or extend your kitchen, our experienced team is here to transform your vision into reality.',
  9: 'We specialize in bringing your dream home to life. Our experienced team of architects, designers, and builders is dedicated to creating custom-built homes that reflect your unique style, cater to your lifestyle, and exceed your expectations. Whether you have a specific vision in mind or need guidance throughout the design process, we are here to make your dream home a reality.',
  10: 'Indulge in the allure of European kitchens with our European Kitchen Remodeling service. Experience the sophistication, precision, and innovation that define European design. Let us create a culinary masterpiece inspired by the rich heritage of European craftsmanship.',
  11: 'Unleash your creativity with our Custom Kitchen Remodeling service. Tailor your kitchen to your unique preferences and needs, incorporating personalized elements and innovative features. Create a space that reflects your individuality and elevates your cooking experience.',
  12: 'Discover the timeless beauty of Shaker kitchens with our Shaker Kitchen Remodeling service. Embrace the simplicity, elegance, and functionality of this classic design style. Let us bring the essence of craftsmanship and tradition into your kitchen.',
  13: 'Realize your remodeling dreams with our Financing service. We offer flexible financing options to help you bring your project to life within your budget. Explore the possibilities and turn your dream home into a reality.',
}

for (const [id, text] of Object.entries(CARDS)) {
  await c.query(`update services set short_description = $2 where id = $1`, [Number(id), text])
}
console.log(`shortDescription populated for ${Object.keys(CARDS).length} services (WP index copy)`)
await c.end()
console.log('Done.')
process.exit(0)
