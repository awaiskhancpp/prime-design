import { postgresAdapter } from '@payloadcms/db-postgres'
import { lexicalEditor } from '@payloadcms/richtext-lexical'
import { vercelBlobStorage } from '@payloadcms/storage-vercel-blob'
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
import { GalleryCategories } from './collections/GalleryCategories'
import { ContactSubmissions } from './collections/ContactSubmissions'

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
    GalleryCategories,
    ContactSubmissions,
  ],
  // The homepage, About and Gallery pages are ordinary records in the Pages
  // collection (slugs home / about / gallery), built from the same section
  // blocks as every other page. Site Settings is the only global left.
  //
  // Legacy tables still kept in Postgres as a backup: the old homepage, about
  // and gallery globals, plus the short-lived home_page / about_page /
  // gallery_page collections. A future "payload migrate:create" will propose
  // dropping them (or worse, renaming them into new tables) — review it before
  // applying, and keep those drops out until the Pages records have been live
  // for a while.
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
    push: false,
  }),
  sharp,
  plugins: [
    // Media files upload to Vercel Blob. Without a token the plugin falls
    // back to local storage, so uploads keep working in local development.
    vercelBlobStorage({
      collections: {
        media: true,
      },
      token: process.env.BLOB_READ_WRITE_TOKEN,
    }),
  ],
})
