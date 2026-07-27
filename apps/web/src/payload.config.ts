import { postgresAdapter } from '@payloadcms/db-postgres'
import { lexicalEditor } from '@payloadcms/richtext-lexical'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { buildConfig } from 'payload'
import sharp from 'sharp'

import { env } from './config/env'
import { Categories } from './payload/collections/Categories'
import { Media } from './payload/collections/Media'
import { Posts } from './payload/collections/Posts'
import { Series } from './payload/collections/Series'
import { Tags } from './payload/collections/Tags'
import { Users } from './payload/collections/Users'
import { Navigation } from './payload/globals/Navigation'
import { SiteSettings } from './payload/globals/SiteSettings'
import { migrations } from './payload/migrations'

const filename = fileURLToPath(import.meta.url)
const dirname = path.dirname(filename)

export default buildConfig({
  admin: {
    user: Users.slug,
    importMap: {
      baseDir: path.resolve(dirname),
    },
  },
  collections: [Users, Media, Categories, Tags, Series, Posts],
  globals: [SiteSettings, Navigation],
  cors: [env.SERVER_URL],
  csrf: [env.SERVER_URL],
  defaultDepth: 1,
  maxDepth: 4,
  editor: lexicalEditor(),
  secret: env.PAYLOAD_SECRET,
  serverURL: env.SERVER_URL,
  typescript: {
    outputFile: path.resolve(dirname, 'payload-types.ts'),
  },
  db: postgresAdapter({
    migrationDir: path.resolve(dirname, 'payload/migrations'),
    pool: {
      connectionString: env.DATABASE_URI,
    },
    prodMigrations: migrations,
    push: env.NODE_ENV === 'development',
  }),
  sharp,
  plugins: [],
})
