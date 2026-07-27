import { sql } from '@payloadcms/db-postgres'
import type { MigrateDownArgs, MigrateUpArgs } from '@payloadcms/db-postgres'

function legacyLocale(): 'en' | 'vi' {
  const locale = process.env.LEGACY_CONTENT_LOCALE
  if (locale !== 'en' && locale !== 'vi') {
    throw new Error(
      'LEGACY_CONTENT_LOCALE must be explicitly set to "en" or "vi" before running the Phase 2 localization migration.',
    )
  }
  return locale
}

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  const sourceLocale = legacyLocale()
  const sourceLocaleSql = sql.raw(`'${sourceLocale}'`)
  await db.execute(sql`
   CREATE TYPE "public"."_locales" AS ENUM('vi', 'en');
  CREATE TYPE "public"."enum__posts_v_published_locale" AS ENUM('vi', 'en');
  CREATE TYPE "public"."enum_search_documents_locale" AS ENUM('vi', 'en');
  CREATE TABLE "users_locales" (
    "bio" varchar,
    "id" serial PRIMARY KEY NOT NULL,
    "_locale" "_locales" NOT NULL,
    "_parent_id" integer NOT NULL
  );

  CREATE TABLE "media_locales" (
    "alt" varchar NOT NULL,
    "caption" varchar,
    "credit" varchar,
    "id" serial PRIMARY KEY NOT NULL,
    "_locale" "_locales" NOT NULL,
    "_parent_id" integer NOT NULL
  );

  CREATE TABLE "categories_locales" (
    "name" varchar NOT NULL,
    "slug" varchar NOT NULL,
    "description" varchar,
    "seo_meta_title" varchar,
    "seo_meta_description" varchar,
    "seo_canonical_url" varchar,
    "id" serial PRIMARY KEY NOT NULL,
    "_locale" "_locales" NOT NULL,
    "_parent_id" integer NOT NULL
  );

  CREATE TABLE "tags_locales" (
    "name" varchar NOT NULL,
    "slug" varchar NOT NULL,
    "description" varchar,
    "id" serial PRIMARY KEY NOT NULL,
    "_locale" "_locales" NOT NULL,
    "_parent_id" integer NOT NULL
  );

  CREATE TABLE "series_locales" (
    "title" varchar NOT NULL,
    "slug" varchar NOT NULL,
    "description" varchar,
    "seo_meta_title" varchar,
    "seo_meta_description" varchar,
    "seo_canonical_url" varchar,
    "id" serial PRIMARY KEY NOT NULL,
    "_locale" "_locales" NOT NULL,
    "_parent_id" integer NOT NULL
  );

  CREATE TABLE "posts_locales" (
    "title" varchar,
    "slug" varchar,
    "excerpt" varchar,
    "content" jsonb,
    "seo_meta_title" varchar,
    "seo_meta_description" varchar,
    "seo_canonical_url" varchar,
    "id" serial PRIMARY KEY NOT NULL,
    "_locale" "_locales" NOT NULL,
    "_parent_id" integer NOT NULL
  );

  CREATE TABLE "_posts_v_locales" (
    "version_title" varchar,
    "version_slug" varchar,
    "version_excerpt" varchar,
    "version_content" jsonb,
    "version_seo_meta_title" varchar,
    "version_seo_meta_description" varchar,
    "version_seo_canonical_url" varchar,
    "id" serial PRIMARY KEY NOT NULL,
    "_locale" "_locales" NOT NULL,
    "_parent_id" integer NOT NULL
  );

  CREATE TABLE "search_documents" (
    "id" serial PRIMARY KEY NOT NULL,
    "post_locale_key" varchar NOT NULL,
    "post_id" integer NOT NULL,
    "locale" "enum_search_documents_locale" NOT NULL,
    "title" varchar NOT NULL,
    "slug" varchar NOT NULL,
    "excerpt" varchar NOT NULL,
    "plain_text_content" varchar,
    "normalized_search_text" varchar NOT NULL,
    "published_at" timestamp(3) with time zone NOT NULL,
    "updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
    "created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );

  CREATE TABLE "site_settings_locales" (
    "site_description" varchar NOT NULL,
    "default_seo_title" varchar,
    "default_seo_description" varchar,
    "id" serial PRIMARY KEY NOT NULL,
    "_locale" "_locales" NOT NULL,
    "_parent_id" integer NOT NULL
  );

  CREATE TABLE "navigation_header_links_locales" (
    "label" varchar NOT NULL,
    "id" serial PRIMARY KEY NOT NULL,
    "_locale" "_locales" NOT NULL,
    "_parent_id" varchar NOT NULL
  );

  CREATE TABLE "navigation_footer_links_locales" (
    "label" varchar NOT NULL,
    "id" serial PRIMARY KEY NOT NULL,
    "_locale" "_locales" NOT NULL,
    "_parent_id" varchar NOT NULL
  );

  CREATE TABLE "navigation_locales" (
    "footer_text" varchar,
    "id" serial PRIMARY KEY NOT NULL,
    "_locale" "_locales" NOT NULL,
    "_parent_id" integer NOT NULL
  );

  DROP INDEX "categories_slug_idx";
  DROP INDEX "tags_slug_idx";
  DROP INDEX "series_slug_idx";
  DROP INDEX "posts_slug_idx";
  DROP INDEX "_posts_v_version_version_slug_idx";
  ALTER TABLE "users_expertise" ADD COLUMN "_locale" "_locales";
  ALTER TABLE "_posts_v" ADD COLUMN "snapshot" boolean;
  ALTER TABLE "_posts_v" ADD COLUMN "published_locale" "enum__posts_v_published_locale";
  ALTER TABLE "payload_locked_documents_rels" ADD COLUMN "search_documents_id" integer;
  ALTER TABLE "users_locales" ADD CONSTRAINT "users_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "media_locales" ADD CONSTRAINT "media_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."media"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "categories_locales" ADD CONSTRAINT "categories_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."categories"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "tags_locales" ADD CONSTRAINT "tags_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."tags"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "series_locales" ADD CONSTRAINT "series_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."series"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "posts_locales" ADD CONSTRAINT "posts_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."posts"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_posts_v_locales" ADD CONSTRAINT "_posts_v_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_posts_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "search_documents" ADD CONSTRAINT "search_documents_post_id_posts_id_fk" FOREIGN KEY ("post_id") REFERENCES "public"."posts"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "site_settings_locales" ADD CONSTRAINT "site_settings_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."site_settings"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "navigation_header_links_locales" ADD CONSTRAINT "navigation_header_links_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."navigation_header_links"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "navigation_footer_links_locales" ADD CONSTRAINT "navigation_footer_links_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."navigation_footer_links"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "navigation_locales" ADD CONSTRAINT "navigation_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."navigation"("id") ON DELETE cascade ON UPDATE no action;
  CREATE UNIQUE INDEX "users_locales_locale_parent_id_unique" ON "users_locales" USING btree ("_locale","_parent_id");
  CREATE UNIQUE INDEX "media_locales_locale_parent_id_unique" ON "media_locales" USING btree ("_locale","_parent_id");
  CREATE UNIQUE INDEX "categories_slug_idx" ON "categories_locales" USING btree ("slug","_locale");
  CREATE UNIQUE INDEX "categories_locales_locale_parent_id_unique" ON "categories_locales" USING btree ("_locale","_parent_id");
  CREATE UNIQUE INDEX "tags_slug_idx" ON "tags_locales" USING btree ("slug","_locale");
  CREATE UNIQUE INDEX "tags_locales_locale_parent_id_unique" ON "tags_locales" USING btree ("_locale","_parent_id");
  CREATE UNIQUE INDEX "series_slug_idx" ON "series_locales" USING btree ("slug","_locale");
  CREATE UNIQUE INDEX "series_locales_locale_parent_id_unique" ON "series_locales" USING btree ("_locale","_parent_id");
  CREATE UNIQUE INDEX "posts_slug_idx" ON "posts_locales" USING btree ("slug","_locale");
  CREATE UNIQUE INDEX "posts_locales_locale_parent_id_unique" ON "posts_locales" USING btree ("_locale","_parent_id");
  CREATE INDEX "_posts_v_version_version_slug_idx" ON "_posts_v_locales" USING btree ("version_slug","_locale");
  CREATE UNIQUE INDEX "_posts_v_locales_locale_parent_id_unique" ON "_posts_v_locales" USING btree ("_locale","_parent_id");
  CREATE UNIQUE INDEX "search_documents_post_locale_key_idx" ON "search_documents" USING btree ("post_locale_key");
  CREATE INDEX "search_documents_post_idx" ON "search_documents" USING btree ("post_id");
  CREATE INDEX "search_documents_locale_idx" ON "search_documents" USING btree ("locale");
  CREATE INDEX "search_documents_slug_idx" ON "search_documents" USING btree ("slug");
  CREATE INDEX "search_documents_normalized_search_text_idx" ON "search_documents" USING btree ("normalized_search_text");
  CREATE INDEX "search_documents_published_at_idx" ON "search_documents" USING btree ("published_at");
  CREATE INDEX "search_documents_updated_at_idx" ON "search_documents" USING btree ("updated_at");
  CREATE INDEX "search_documents_created_at_idx" ON "search_documents" USING btree ("created_at");
  CREATE UNIQUE INDEX "site_settings_locales_locale_parent_id_unique" ON "site_settings_locales" USING btree ("_locale","_parent_id");
  CREATE UNIQUE INDEX "navigation_header_links_locales_locale_parent_id_unique" ON "navigation_header_links_locales" USING btree ("_locale","_parent_id");
  CREATE UNIQUE INDEX "navigation_footer_links_locales_locale_parent_id_unique" ON "navigation_footer_links_locales" USING btree ("_locale","_parent_id");
  CREATE UNIQUE INDEX "navigation_locales_locale_parent_id_unique" ON "navigation_locales" USING btree ("_locale","_parent_id");
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_search_documents_fk" FOREIGN KEY ("search_documents_id") REFERENCES "public"."search_documents"("id") ON DELETE cascade ON UPDATE no action;
  CREATE INDEX "users_expertise_locale_idx" ON "users_expertise" USING btree ("_locale");
  CREATE INDEX "_posts_v_snapshot_idx" ON "_posts_v" USING btree ("snapshot");
  CREATE INDEX "_posts_v_published_locale_idx" ON "_posts_v" USING btree ("published_locale");
  CREATE INDEX "payload_locked_documents_rels_search_documents_id_idx" ON "payload_locked_documents_rels" USING btree ("search_documents_id");
  INSERT INTO "users_locales" ("bio", "_locale", "_parent_id")
    SELECT "bio", ${sourceLocaleSql}::"_locales", "id" FROM "users" WHERE "bio" IS NOT NULL;
  INSERT INTO "media_locales" ("alt", "caption", "credit", "_locale", "_parent_id")
    SELECT "alt", "caption", "credit", ${sourceLocaleSql}::"_locales", "id" FROM "media";
  INSERT INTO "categories_locales" ("name", "slug", "description", "seo_meta_title", "seo_meta_description", "seo_canonical_url", "_locale", "_parent_id")
    SELECT "name", "slug", "description", "seo_meta_title", "seo_meta_description", "seo_canonical_url", ${sourceLocaleSql}::"_locales", "id" FROM "categories";
  INSERT INTO "tags_locales" ("name", "slug", "description", "_locale", "_parent_id")
    SELECT "name", "slug", "description", ${sourceLocaleSql}::"_locales", "id" FROM "tags";
  INSERT INTO "series_locales" ("title", "slug", "description", "seo_meta_title", "seo_meta_description", "seo_canonical_url", "_locale", "_parent_id")
    SELECT "title", "slug", "description", "seo_meta_title", "seo_meta_description", "seo_canonical_url", ${sourceLocaleSql}::"_locales", "id" FROM "series";
  INSERT INTO "posts_locales" ("title", "slug", "excerpt", "content", "seo_meta_title", "seo_meta_description", "seo_canonical_url", "_locale", "_parent_id")
    SELECT "title", "slug", "excerpt", "content", "seo_meta_title", "seo_meta_description", "seo_canonical_url", ${sourceLocaleSql}::"_locales", "id" FROM "posts";
  INSERT INTO "_posts_v_locales" ("version_title", "version_slug", "version_excerpt", "version_content", "version_seo_meta_title", "version_seo_meta_description", "version_seo_canonical_url", "_locale", "_parent_id")
    SELECT "version_title", "version_slug", "version_excerpt", "version_content", "version_seo_meta_title", "version_seo_meta_description", "version_seo_canonical_url", ${sourceLocaleSql}::"_locales", "id" FROM "_posts_v";
  INSERT INTO "site_settings_locales" ("site_description", "default_seo_title", "default_seo_description", "_locale", "_parent_id")
    SELECT "site_description", "default_seo_title", "default_seo_description", ${sourceLocaleSql}::"_locales", "id" FROM "site_settings";
  INSERT INTO "navigation_header_links_locales" ("label", "_locale", "_parent_id")
    SELECT "label", ${sourceLocaleSql}::"_locales", "id" FROM "navigation_header_links";
  INSERT INTO "navigation_footer_links_locales" ("label", "_locale", "_parent_id")
    SELECT "label", ${sourceLocaleSql}::"_locales", "id" FROM "navigation_footer_links";
  INSERT INTO "navigation_locales" ("footer_text", "_locale", "_parent_id")
    SELECT "footer_text", ${sourceLocaleSql}::"_locales", "id" FROM "navigation" WHERE "footer_text" IS NOT NULL;
  UPDATE "users_expertise" SET "_locale" = ${sourceLocaleSql}::"_locales" WHERE "_locale" IS NULL;
  ALTER TABLE "users_expertise" ALTER COLUMN "_locale" SET NOT NULL;
  ALTER TABLE "users" DROP COLUMN "bio";
  ALTER TABLE "media" DROP COLUMN "alt";
  ALTER TABLE "media" DROP COLUMN "caption";
  ALTER TABLE "media" DROP COLUMN "credit";
  ALTER TABLE "categories" DROP COLUMN "name";
  ALTER TABLE "categories" DROP COLUMN "slug";
  ALTER TABLE "categories" DROP COLUMN "description";
  ALTER TABLE "categories" DROP COLUMN "seo_meta_title";
  ALTER TABLE "categories" DROP COLUMN "seo_meta_description";
  ALTER TABLE "categories" DROP COLUMN "seo_canonical_url";
  ALTER TABLE "tags" DROP COLUMN "name";
  ALTER TABLE "tags" DROP COLUMN "slug";
  ALTER TABLE "tags" DROP COLUMN "description";
  ALTER TABLE "series" DROP COLUMN "title";
  ALTER TABLE "series" DROP COLUMN "slug";
  ALTER TABLE "series" DROP COLUMN "description";
  ALTER TABLE "series" DROP COLUMN "seo_meta_title";
  ALTER TABLE "series" DROP COLUMN "seo_meta_description";
  ALTER TABLE "series" DROP COLUMN "seo_canonical_url";
  ALTER TABLE "posts" DROP COLUMN "title";
  ALTER TABLE "posts" DROP COLUMN "slug";
  ALTER TABLE "posts" DROP COLUMN "excerpt";
  ALTER TABLE "posts" DROP COLUMN "content";
  ALTER TABLE "posts" DROP COLUMN "seo_meta_title";
  ALTER TABLE "posts" DROP COLUMN "seo_meta_description";
  ALTER TABLE "posts" DROP COLUMN "seo_canonical_url";
  ALTER TABLE "_posts_v" DROP COLUMN "version_title";
  ALTER TABLE "_posts_v" DROP COLUMN "version_slug";
  ALTER TABLE "_posts_v" DROP COLUMN "version_excerpt";
  ALTER TABLE "_posts_v" DROP COLUMN "version_content";
  ALTER TABLE "_posts_v" DROP COLUMN "version_seo_meta_title";
  ALTER TABLE "_posts_v" DROP COLUMN "version_seo_meta_description";
  ALTER TABLE "_posts_v" DROP COLUMN "version_seo_canonical_url";
  ALTER TABLE "site_settings" DROP COLUMN "site_description";
  ALTER TABLE "site_settings" DROP COLUMN "default_seo_title";
  ALTER TABLE "site_settings" DROP COLUMN "default_seo_description";
  ALTER TABLE "navigation_header_links" DROP COLUMN "label";
  ALTER TABLE "navigation_footer_links" DROP COLUMN "label";
  ALTER TABLE "navigation" DROP COLUMN "footer_text";`)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  const sourceLocale = legacyLocale()
  const sourceLocaleSql = sql.raw(`'${sourceLocale}'`)
  await db.execute(sql`
  DROP INDEX IF EXISTS "users_expertise_locale_idx";
  DROP INDEX IF EXISTS "_posts_v_snapshot_idx";
  DROP INDEX IF EXISTS "_posts_v_published_locale_idx";
  DROP INDEX IF EXISTS "payload_locked_documents_rels_search_documents_id_idx";
  ALTER TABLE "users" ADD COLUMN "bio" varchar;
  ALTER TABLE "media" ADD COLUMN "alt" varchar;
  ALTER TABLE "media" ADD COLUMN "caption" varchar;
  ALTER TABLE "media" ADD COLUMN "credit" varchar;
  ALTER TABLE "categories" ADD COLUMN "name" varchar;
  ALTER TABLE "categories" ADD COLUMN "slug" varchar;
  ALTER TABLE "categories" ADD COLUMN "description" varchar;
  ALTER TABLE "categories" ADD COLUMN "seo_meta_title" varchar;
  ALTER TABLE "categories" ADD COLUMN "seo_meta_description" varchar;
  ALTER TABLE "categories" ADD COLUMN "seo_canonical_url" varchar;
  ALTER TABLE "tags" ADD COLUMN "name" varchar;
  ALTER TABLE "tags" ADD COLUMN "slug" varchar;
  ALTER TABLE "tags" ADD COLUMN "description" varchar;
  ALTER TABLE "series" ADD COLUMN "title" varchar;
  ALTER TABLE "series" ADD COLUMN "slug" varchar;
  ALTER TABLE "series" ADD COLUMN "description" varchar;
  ALTER TABLE "series" ADD COLUMN "seo_meta_title" varchar;
  ALTER TABLE "series" ADD COLUMN "seo_meta_description" varchar;
  ALTER TABLE "series" ADD COLUMN "seo_canonical_url" varchar;
  ALTER TABLE "posts" ADD COLUMN "title" varchar;
  ALTER TABLE "posts" ADD COLUMN "slug" varchar;
  ALTER TABLE "posts" ADD COLUMN "excerpt" varchar;
  ALTER TABLE "posts" ADD COLUMN "content" jsonb;
  ALTER TABLE "posts" ADD COLUMN "seo_meta_title" varchar;
  ALTER TABLE "posts" ADD COLUMN "seo_meta_description" varchar;
  ALTER TABLE "posts" ADD COLUMN "seo_canonical_url" varchar;
  ALTER TABLE "_posts_v" ADD COLUMN "version_title" varchar;
  ALTER TABLE "_posts_v" ADD COLUMN "version_slug" varchar;
  ALTER TABLE "_posts_v" ADD COLUMN "version_excerpt" varchar;
  ALTER TABLE "_posts_v" ADD COLUMN "version_content" jsonb;
  ALTER TABLE "_posts_v" ADD COLUMN "version_seo_meta_title" varchar;
  ALTER TABLE "_posts_v" ADD COLUMN "version_seo_meta_description" varchar;
  ALTER TABLE "_posts_v" ADD COLUMN "version_seo_canonical_url" varchar;
  ALTER TABLE "site_settings" ADD COLUMN "site_description" varchar;
  ALTER TABLE "site_settings" ADD COLUMN "default_seo_title" varchar;
  ALTER TABLE "site_settings" ADD COLUMN "default_seo_description" varchar;
  ALTER TABLE "navigation_header_links" ADD COLUMN "label" varchar;
  ALTER TABLE "navigation_footer_links" ADD COLUMN "label" varchar;
  ALTER TABLE "navigation" ADD COLUMN "footer_text" varchar;
  UPDATE "users" base SET "bio" = localized."bio"
    FROM "users_locales" localized
    WHERE localized."_parent_id" = base."id" AND localized."_locale" = ${sourceLocaleSql}::"_locales";
  UPDATE "media" base SET "alt" = localized."alt", "caption" = localized."caption", "credit" = localized."credit"
    FROM "media_locales" localized
    WHERE localized."_parent_id" = base."id" AND localized."_locale" = ${sourceLocaleSql}::"_locales";
  UPDATE "categories" base SET "name" = localized."name", "slug" = localized."slug", "description" = localized."description",
    "seo_meta_title" = localized."seo_meta_title", "seo_meta_description" = localized."seo_meta_description", "seo_canonical_url" = localized."seo_canonical_url"
    FROM "categories_locales" localized
    WHERE localized."_parent_id" = base."id" AND localized."_locale" = ${sourceLocaleSql}::"_locales";
  UPDATE "tags" base SET "name" = localized."name", "slug" = localized."slug", "description" = localized."description"
    FROM "tags_locales" localized
    WHERE localized."_parent_id" = base."id" AND localized."_locale" = ${sourceLocaleSql}::"_locales";
  UPDATE "series" base SET "title" = localized."title", "slug" = localized."slug", "description" = localized."description",
    "seo_meta_title" = localized."seo_meta_title", "seo_meta_description" = localized."seo_meta_description", "seo_canonical_url" = localized."seo_canonical_url"
    FROM "series_locales" localized
    WHERE localized."_parent_id" = base."id" AND localized."_locale" = ${sourceLocaleSql}::"_locales";
  UPDATE "posts" base SET "title" = localized."title", "slug" = localized."slug", "excerpt" = localized."excerpt",
    "content" = localized."content", "seo_meta_title" = localized."seo_meta_title", "seo_meta_description" = localized."seo_meta_description", "seo_canonical_url" = localized."seo_canonical_url"
    FROM "posts_locales" localized
    WHERE localized."_parent_id" = base."id" AND localized."_locale" = ${sourceLocaleSql}::"_locales";
  UPDATE "_posts_v" base SET "version_title" = localized."version_title", "version_slug" = localized."version_slug",
    "version_excerpt" = localized."version_excerpt", "version_content" = localized."version_content",
    "version_seo_meta_title" = localized."version_seo_meta_title", "version_seo_meta_description" = localized."version_seo_meta_description",
    "version_seo_canonical_url" = localized."version_seo_canonical_url"
    FROM "_posts_v_locales" localized
    WHERE localized."_parent_id" = base."id" AND localized."_locale" = ${sourceLocaleSql}::"_locales";
  UPDATE "site_settings" base SET "site_description" = localized."site_description",
    "default_seo_title" = localized."default_seo_title", "default_seo_description" = localized."default_seo_description"
    FROM "site_settings_locales" localized
    WHERE localized."_parent_id" = base."id" AND localized."_locale" = ${sourceLocaleSql}::"_locales";
  UPDATE "navigation_header_links" base SET "label" = localized."label"
    FROM "navigation_header_links_locales" localized
    WHERE localized."_parent_id" = base."id" AND localized."_locale" = ${sourceLocaleSql}::"_locales";
  UPDATE "navigation_footer_links" base SET "label" = localized."label"
    FROM "navigation_footer_links_locales" localized
    WHERE localized."_parent_id" = base."id" AND localized."_locale" = ${sourceLocaleSql}::"_locales";
  UPDATE "navigation" base SET "footer_text" = localized."footer_text"
    FROM "navigation_locales" localized
    WHERE localized."_parent_id" = base."id" AND localized."_locale" = ${sourceLocaleSql}::"_locales";
  UPDATE "media" base SET "alt" = (
    SELECT localized."alt" FROM "media_locales" localized
    WHERE localized."_parent_id" = base."id" ORDER BY localized."id" LIMIT 1
  ) WHERE base."alt" IS NULL;
  UPDATE "categories" base SET
    "name" = COALESCE(base."name", (
      SELECT localized."name" FROM "categories_locales" localized
      WHERE localized."_parent_id" = base."id" ORDER BY localized."id" LIMIT 1
    )),
    "slug" = COALESCE(base."slug", (
      SELECT localized."slug" FROM "categories_locales" localized
      WHERE localized."_parent_id" = base."id" ORDER BY localized."id" LIMIT 1
    ))
  WHERE base."name" IS NULL OR base."slug" IS NULL;
  UPDATE "tags" base SET
    "name" = COALESCE(base."name", (
      SELECT localized."name" FROM "tags_locales" localized
      WHERE localized."_parent_id" = base."id" ORDER BY localized."id" LIMIT 1
    )),
    "slug" = COALESCE(base."slug", (
      SELECT localized."slug" FROM "tags_locales" localized
      WHERE localized."_parent_id" = base."id" ORDER BY localized."id" LIMIT 1
    ))
  WHERE base."name" IS NULL OR base."slug" IS NULL;
  UPDATE "series" base SET
    "title" = COALESCE(base."title", (
      SELECT localized."title" FROM "series_locales" localized
      WHERE localized."_parent_id" = base."id" ORDER BY localized."id" LIMIT 1
    )),
    "slug" = COALESCE(base."slug", (
      SELECT localized."slug" FROM "series_locales" localized
      WHERE localized."_parent_id" = base."id" ORDER BY localized."id" LIMIT 1
    ))
  WHERE base."title" IS NULL OR base."slug" IS NULL;
  UPDATE "site_settings" base SET "site_description" = (
    SELECT localized."site_description" FROM "site_settings_locales" localized
    WHERE localized."_parent_id" = base."id" ORDER BY localized."id" LIMIT 1
  ) WHERE base."site_description" IS NULL;
  UPDATE "navigation_header_links" base SET "label" = (
    SELECT localized."label" FROM "navigation_header_links_locales" localized
    WHERE localized."_parent_id" = base."id" ORDER BY localized."id" LIMIT 1
  ) WHERE base."label" IS NULL;
  UPDATE "navigation_footer_links" base SET "label" = (
    SELECT localized."label" FROM "navigation_footer_links_locales" localized
    WHERE localized."_parent_id" = base."id" ORDER BY localized."id" LIMIT 1
  ) WHERE base."label" IS NULL;
  ALTER TABLE "media" ALTER COLUMN "alt" SET NOT NULL;
  ALTER TABLE "categories" ALTER COLUMN "name" SET NOT NULL;
  ALTER TABLE "categories" ALTER COLUMN "slug" SET NOT NULL;
  ALTER TABLE "tags" ALTER COLUMN "name" SET NOT NULL;
  ALTER TABLE "tags" ALTER COLUMN "slug" SET NOT NULL;
  ALTER TABLE "series" ALTER COLUMN "title" SET NOT NULL;
  ALTER TABLE "series" ALTER COLUMN "slug" SET NOT NULL;
  ALTER TABLE "site_settings" ALTER COLUMN "site_description" SET NOT NULL;
  ALTER TABLE "navigation_header_links" ALTER COLUMN "label" SET NOT NULL;
  ALTER TABLE "navigation_footer_links" ALTER COLUMN "label" SET NOT NULL;
  ALTER TABLE "payload_locked_documents_rels" DROP CONSTRAINT IF EXISTS "payload_locked_documents_rels_search_documents_fk";
  ALTER TABLE "payload_locked_documents_rels" DROP COLUMN "search_documents_id";
  ALTER TABLE "users_expertise" DROP COLUMN "_locale";
  ALTER TABLE "_posts_v" DROP COLUMN "snapshot";
  ALTER TABLE "_posts_v" DROP COLUMN "published_locale";
  DROP TABLE "users_locales" CASCADE;
  DROP TABLE "media_locales" CASCADE;
  DROP TABLE "categories_locales" CASCADE;
  DROP TABLE "tags_locales" CASCADE;
  DROP TABLE "series_locales" CASCADE;
  DROP TABLE "posts_locales" CASCADE;
  DROP TABLE "_posts_v_locales" CASCADE;
  DROP TABLE "search_documents" CASCADE;
  DROP TABLE "site_settings_locales" CASCADE;
  DROP TABLE "navigation_header_links_locales" CASCADE;
  DROP TABLE "navigation_footer_links_locales" CASCADE;
  DROP TABLE "navigation_locales" CASCADE;
  CREATE UNIQUE INDEX "categories_slug_idx" ON "categories" USING btree ("slug");
  CREATE UNIQUE INDEX "tags_slug_idx" ON "tags" USING btree ("slug");
  CREATE UNIQUE INDEX "series_slug_idx" ON "series" USING btree ("slug");
  CREATE UNIQUE INDEX "posts_slug_idx" ON "posts" USING btree ("slug");
  CREATE INDEX "_posts_v_version_version_slug_idx" ON "_posts_v" USING btree ("version_slug");
  DROP TYPE "public"."_locales";
  DROP TYPE "public"."enum__posts_v_published_locale";
  DROP TYPE "public"."enum_search_documents_locale";`)
}
