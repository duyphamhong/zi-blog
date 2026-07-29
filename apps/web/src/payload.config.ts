import { postgresAdapter } from '@payloadcms/db-postgres'
import { lexicalEditor } from '@payloadcms/richtext-lexical'
import { en } from '@payloadcms/translations/languages/en'
import { vi } from '@payloadcms/translations/languages/vi'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { buildConfig } from 'payload'
import sharp from 'sharp'

import { env } from './config/env'
import { DEFAULT_CONTENT_LOCALE } from './modules/platform/i18n'
import { Categories } from './payload/collections/Categories'
import { Media } from './payload/collections/Media'
import { Posts } from './payload/collections/Posts'
import { Series } from './payload/collections/Series'
import { SearchDocuments } from './payload/collections/SearchDocuments'
import { Tags } from './payload/collections/Tags'
import { Users } from './payload/collections/Users'
import { AnonymousProfiles } from './payload/collections/AnonymousProfiles'
import { AnalyticsEvents } from './payload/collections/AnalyticsEvents'
import { Comments } from './payload/collections/Comments'
import { PostStatistics } from './payload/collections/PostStatistics'
import { Reactions } from './payload/collections/Reactions'
import { CommunitySettings } from './payload/globals/CommunitySettings'
import { Navigation } from './payload/globals/Navigation'
import { SiteSettings } from './payload/globals/SiteSettings'
import { migrations } from './payload/migrations'

const filename = fileURLToPath(import.meta.url)
const dirname = path.dirname(filename)

export default buildConfig({
  admin: {
    user: Users.slug,
    suppressHydrationWarning: true,
    importMap: {
      baseDir: path.resolve(dirname),
    },
  },
  collections: [Users, Media, Categories, Tags, Series, Posts, SearchDocuments, AnonymousProfiles, Reactions, Comments, AnalyticsEvents, PostStatistics],
  globals: [SiteSettings, Navigation, CommunitySettings],
  i18n: {
    fallbackLanguage: 'en',
    supportedLanguages: { en, vi },
  },
  localization: {
    defaultLocale: DEFAULT_CONTENT_LOCALE,
    fallback: false,
    locales: [
      { code: 'vi', label: { en: 'Vietnamese', vi: 'Tiếng Việt' } },
      { code: 'en', label: { en: 'English', vi: 'Tiếng Anh' } },
    ],
  },
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
