import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   ALTER TABLE "comments" ALTER COLUMN "status" SET DEFAULT 'published';
   UPDATE "comments" SET "status" = 'published' WHERE "status" = 'pending';`)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   ALTER TABLE "comments" ALTER COLUMN "status" SET DEFAULT 'pending';`)
}
