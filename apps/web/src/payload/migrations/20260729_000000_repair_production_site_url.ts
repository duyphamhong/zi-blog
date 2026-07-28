import { sql } from '@payloadcms/db-postgres'
import type { MigrateDownArgs, MigrateUpArgs } from '@payloadcms/db-postgres'

import { env } from '@/config/env'

export async function up({ db }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
    UPDATE "site_settings"
    SET "site_url" = ${env.SERVER_URL}
    WHERE "site_url" IS NULL
      OR btrim("site_url") = ''
      OR lower(btrim("site_url")) = 'undefined';
  `)
}

export async function down(_: MigrateDownArgs): Promise<void> {}
