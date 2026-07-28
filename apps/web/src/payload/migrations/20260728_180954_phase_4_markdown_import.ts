import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   ALTER TABLE "posts_locales" ADD COLUMN "markdown_source" varchar;
  ALTER TABLE "posts_locales" ADD COLUMN "import_markdown_into_content" boolean DEFAULT false;
  ALTER TABLE "posts_locales" ADD COLUMN "last_imported_markdown_hash" varchar;
  ALTER TABLE "_posts_v_locales" ADD COLUMN "version_markdown_source" varchar;
  ALTER TABLE "_posts_v_locales" ADD COLUMN "version_import_markdown_into_content" boolean DEFAULT false;
  ALTER TABLE "_posts_v_locales" ADD COLUMN "version_last_imported_markdown_hash" varchar;`)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   ALTER TABLE "posts_locales" DROP COLUMN "markdown_source";
  ALTER TABLE "posts_locales" DROP COLUMN "import_markdown_into_content";
  ALTER TABLE "posts_locales" DROP COLUMN "last_imported_markdown_hash";
  ALTER TABLE "_posts_v_locales" DROP COLUMN "version_markdown_source";
  ALTER TABLE "_posts_v_locales" DROP COLUMN "version_import_markdown_into_content";
  ALTER TABLE "_posts_v_locales" DROP COLUMN "version_last_imported_markdown_hash";`)
}
