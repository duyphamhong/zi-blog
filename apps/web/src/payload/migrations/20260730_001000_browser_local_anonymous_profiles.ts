import { type MigrateDownArgs, type MigrateUpArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
    ALTER TABLE "comments" ALTER COLUMN "anonymous_profile_id" DROP NOT NULL;
    ALTER TABLE "analytics_events" ALTER COLUMN "anonymous_profile_id" DROP NOT NULL;

    UPDATE "comments" AS "comment"
    SET "author_avatar_snapshot" = "profile"."avatar_key"::text
    FROM "anonymous_profiles" AS "profile"
    WHERE "comment"."author_avatar_snapshot" IS NULL
      AND "comment"."anonymous_profile_id" = "profile"."id";

    INSERT INTO "post_statistics" (
      "post_id", "total_views", "unique_views", "likes", "dislikes", "shares", "updated_at", "created_at"
    )
    SELECT
      "target_id",
      0,
      0,
      COUNT(*) FILTER (WHERE "reaction_type" = 'like'),
      COUNT(*) FILTER (WHERE "reaction_type" = 'dislike'),
      0,
      NOW(),
      NOW()
    FROM "reactions"
    WHERE "target_type" = 'post'
    GROUP BY "target_id"
    ON CONFLICT ("post_id") DO UPDATE
    SET
      "likes" = GREATEST("post_statistics"."likes", EXCLUDED."likes"),
      "dislikes" = GREATEST("post_statistics"."dislikes", EXCLUDED."dislikes"),
      "updated_at" = NOW();
  `)
}

export async function down({ db }: MigrateDownArgs): Promise<void> {
  // New comments and events intentionally have no profile relationship, so this is not reversible.
  await db.execute(sql`SELECT 1;`)
}
