import { postgresAdapter } from '@payloadcms/db-postgres'
import { lexicalEditor } from '@payloadcms/richtext-lexical'
import path from 'path'
import { buildConfig } from 'payload'
import { fileURLToPath } from 'url'
import sharp from 'sharp'

import { Users } from './collections/Users'
import { Media } from './collections/Media'
import { FAQs } from './collections/FAQs'
import { FAQCategories } from './collections/FAQCategories'
import { Services } from './collections/Services'
import { Locations } from './collections/Locations'
import { ServiceLocations } from './collections/ServiceLocations'
import { Pages } from './collections/Pages'
import { Projects } from './collections/Projects'
import { Redirects } from './collections/Redirects'
import { Team } from './collections/Team'
import { Testimonials } from './collections/Testimonials'
import { SiteSettings } from './globals/SiteSettings'
import { Blog } from './collections/Blog'
import { BlogCategories } from './collections/BlogCategories'
import { LandingPages } from './collections/LandingPages'

const filename = fileURLToPath(import.meta.url)
const dirname = path.dirname(filename)

export default buildConfig({
  admin: {
    user: Users.slug,
    importMap: {
      baseDir: path.resolve(dirname),
    },
  },
  collections: [
    Users,
    Media,
    FAQs,
    FAQCategories,
    Services,
    Locations,
    ServiceLocations,
    Pages,
    Projects,
    Redirects,
    Team,
    Testimonials,
    Blog,
    BlogCategories,
    LandingPages,
  ],
  globals: [SiteSettings],
  editor: lexicalEditor(),
  secret: process.env.PAYLOAD_SECRET || '',
  typescript: {
    outputFile: path.resolve(dirname, 'payload-types.ts'),
  },
  db: postgresAdapter({
    pool: {
      connectionString: process.env.DATABASE_URL || '',
    },
  }),
  sharp,
  plugins: [],
})
