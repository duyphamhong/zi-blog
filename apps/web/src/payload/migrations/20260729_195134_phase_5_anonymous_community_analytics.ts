import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   CREATE TYPE "public"."enum_anonymous_profiles_avatar_key" AS ENUM('orbit', 'pixel', 'spark', 'wave');
  CREATE TYPE "public"."enum_anonymous_profiles_status" AS ENUM('active', 'restricted', 'blocked');
  CREATE TYPE "public"."enum_reactions_target_type" AS ENUM('post');
  CREATE TYPE "public"."enum_reactions_actor_type" AS ENUM('anonymous');
  CREATE TYPE "public"."enum_reactions_reaction_type" AS ENUM('like', 'dislike');
  CREATE TYPE "public"."enum_comments_status" AS ENUM('pending', 'published', 'hidden', 'spam', 'deleted');
  CREATE TYPE "public"."enum_analytics_events_event_type" AS ENUM('article_view', 'share');
  CREATE TYPE "public"."enum_analytics_events_metadata_channel" AS ENUM('facebook', 'linkedin', 'x', 'copy_link', 'native', 'other');
  CREATE TYPE "public"."enum_analytics_events_processing_status" AS ENUM('pending', 'processed');
  CREATE TABLE "anonymous_profiles" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"anonymous_id_hash" varchar NOT NULL,
  	"display_name" varchar,
  	"avatar_key" "enum_anonymous_profiles_avatar_key",
  	"status" "enum_anonymous_profiles_status" DEFAULT 'active' NOT NULL,
  	"short_identity_code" varchar NOT NULL,
  	"last_active_at" timestamp(3) with time zone,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE "reactions" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"target_type" "enum_reactions_target_type" NOT NULL,
  	"target_id" varchar NOT NULL,
  	"actor_type" "enum_reactions_actor_type" NOT NULL,
  	"anonymous_profile_id" integer NOT NULL,
  	"reaction_type" "enum_reactions_reaction_type" NOT NULL,
  	"uniqueness_key" varchar NOT NULL,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE "comments" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"post_id" integer NOT NULL,
  	"anonymous_profile_id" integer NOT NULL,
  	"parent_comment_id" integer,
  	"content" varchar NOT NULL,
  	"status" "enum_comments_status" DEFAULT 'pending' NOT NULL,
  	"depth" numeric DEFAULT 0 NOT NULL,
  	"reply_count" numeric DEFAULT 0 NOT NULL,
  	"author_display_name_snapshot" varchar NOT NULL,
  	"author_avatar_snapshot" varchar,
  	"edited_at" timestamp(3) with time zone,
  	"moderation_reason" varchar,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE "analytics_events" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"event_type" "enum_analytics_events_event_type" NOT NULL,
  	"post_id" varchar NOT NULL,
  	"anonymous_profile_id" integer NOT NULL,
  	"session_id_hash" varchar NOT NULL,
  	"deduplication_key" varchar,
  	"metadata_channel" "enum_analytics_events_metadata_channel",
  	"occurred_at" timestamp(3) with time zone NOT NULL,
  	"processing_status" "enum_analytics_events_processing_status" DEFAULT 'pending' NOT NULL,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE "post_statistics" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"post_id" varchar NOT NULL,
  	"total_views" numeric DEFAULT 0 NOT NULL,
  	"unique_views" numeric DEFAULT 0 NOT NULL,
  	"likes" numeric DEFAULT 0 NOT NULL,
  	"dislikes" numeric DEFAULT 0 NOT NULL,
  	"shares" numeric DEFAULT 0 NOT NULL,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE "community_settings" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"anonymous_profiles_enabled" boolean DEFAULT true,
  	"post_reactions_enabled" boolean DEFAULT true,
  	"comments_enabled" boolean DEFAULT false,
  	"share_tracking_enabled" boolean DEFAULT true,
  	"article_view_tracking_enabled" boolean DEFAULT true,
  	"anonymous_display_name_min_length" numeric DEFAULT 2,
  	"anonymous_display_name_max_length" numeric DEFAULT 40,
  	"comment_max_length" numeric DEFAULT 2000,
  	"comment_reply_depth_limit" numeric DEFAULT 1,
  	"updated_at" timestamp(3) with time zone,
  	"created_at" timestamp(3) with time zone
  );
  
  ALTER TABLE "payload_locked_documents_rels" ADD COLUMN "anonymous_profiles_id" integer;
  ALTER TABLE "payload_locked_documents_rels" ADD COLUMN "reactions_id" integer;
  ALTER TABLE "payload_locked_documents_rels" ADD COLUMN "comments_id" integer;
  ALTER TABLE "payload_locked_documents_rels" ADD COLUMN "analytics_events_id" integer;
  ALTER TABLE "payload_locked_documents_rels" ADD COLUMN "post_statistics_id" integer;
  ALTER TABLE "reactions" ADD CONSTRAINT "reactions_anonymous_profile_id_anonymous_profiles_id_fk" FOREIGN KEY ("anonymous_profile_id") REFERENCES "public"."anonymous_profiles"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "comments" ADD CONSTRAINT "comments_post_id_posts_id_fk" FOREIGN KEY ("post_id") REFERENCES "public"."posts"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "comments" ADD CONSTRAINT "comments_anonymous_profile_id_anonymous_profiles_id_fk" FOREIGN KEY ("anonymous_profile_id") REFERENCES "public"."anonymous_profiles"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "comments" ADD CONSTRAINT "comments_parent_comment_id_comments_id_fk" FOREIGN KEY ("parent_comment_id") REFERENCES "public"."comments"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "analytics_events" ADD CONSTRAINT "analytics_events_anonymous_profile_id_anonymous_profiles_id_fk" FOREIGN KEY ("anonymous_profile_id") REFERENCES "public"."anonymous_profiles"("id") ON DELETE set null ON UPDATE no action;
  CREATE UNIQUE INDEX "anonymous_profiles_anonymous_id_hash_idx" ON "anonymous_profiles" USING btree ("anonymous_id_hash");
  CREATE INDEX "anonymous_profiles_status_idx" ON "anonymous_profiles" USING btree ("status");
  CREATE INDEX "anonymous_profiles_last_active_at_idx" ON "anonymous_profiles" USING btree ("last_active_at");
  CREATE INDEX "anonymous_profiles_updated_at_idx" ON "anonymous_profiles" USING btree ("updated_at");
  CREATE INDEX "anonymous_profiles_created_at_idx" ON "anonymous_profiles" USING btree ("created_at");
  CREATE INDEX "reactions_target_id_idx" ON "reactions" USING btree ("target_id");
  CREATE INDEX "reactions_anonymous_profile_idx" ON "reactions" USING btree ("anonymous_profile_id");
  CREATE INDEX "reactions_reaction_type_idx" ON "reactions" USING btree ("reaction_type");
  CREATE UNIQUE INDEX "reactions_uniqueness_key_idx" ON "reactions" USING btree ("uniqueness_key");
  CREATE INDEX "reactions_updated_at_idx" ON "reactions" USING btree ("updated_at");
  CREATE INDEX "reactions_created_at_idx" ON "reactions" USING btree ("created_at");
  CREATE INDEX "comments_post_idx" ON "comments" USING btree ("post_id");
  CREATE INDEX "comments_anonymous_profile_idx" ON "comments" USING btree ("anonymous_profile_id");
  CREATE INDEX "comments_parent_comment_idx" ON "comments" USING btree ("parent_comment_id");
  CREATE INDEX "comments_status_idx" ON "comments" USING btree ("status");
  CREATE INDEX "comments_updated_at_idx" ON "comments" USING btree ("updated_at");
  CREATE INDEX "comments_created_at_idx" ON "comments" USING btree ("created_at");
  CREATE INDEX "analytics_events_event_type_idx" ON "analytics_events" USING btree ("event_type");
  CREATE INDEX "analytics_events_post_id_idx" ON "analytics_events" USING btree ("post_id");
  CREATE INDEX "analytics_events_anonymous_profile_idx" ON "analytics_events" USING btree ("anonymous_profile_id");
  CREATE UNIQUE INDEX "analytics_events_deduplication_key_idx" ON "analytics_events" USING btree ("deduplication_key");
  CREATE INDEX "analytics_events_occurred_at_idx" ON "analytics_events" USING btree ("occurred_at");
  CREATE INDEX "analytics_events_processing_status_idx" ON "analytics_events" USING btree ("processing_status");
  CREATE INDEX "analytics_events_updated_at_idx" ON "analytics_events" USING btree ("updated_at");
  CREATE INDEX "analytics_events_created_at_idx" ON "analytics_events" USING btree ("created_at");
  CREATE UNIQUE INDEX "post_statistics_post_id_idx" ON "post_statistics" USING btree ("post_id");
  CREATE INDEX "post_statistics_updated_at_idx" ON "post_statistics" USING btree ("updated_at");
  CREATE INDEX "post_statistics_created_at_idx" ON "post_statistics" USING btree ("created_at");
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_anonymous_profiles_fk" FOREIGN KEY ("anonymous_profiles_id") REFERENCES "public"."anonymous_profiles"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_reactions_fk" FOREIGN KEY ("reactions_id") REFERENCES "public"."reactions"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_comments_fk" FOREIGN KEY ("comments_id") REFERENCES "public"."comments"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_analytics_events_fk" FOREIGN KEY ("analytics_events_id") REFERENCES "public"."analytics_events"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_post_statistics_fk" FOREIGN KEY ("post_statistics_id") REFERENCES "public"."post_statistics"("id") ON DELETE cascade ON UPDATE no action;
  CREATE INDEX "payload_locked_documents_rels_anonymous_profiles_id_idx" ON "payload_locked_documents_rels" USING btree ("anonymous_profiles_id");
  CREATE INDEX "payload_locked_documents_rels_reactions_id_idx" ON "payload_locked_documents_rels" USING btree ("reactions_id");
  CREATE INDEX "payload_locked_documents_rels_comments_id_idx" ON "payload_locked_documents_rels" USING btree ("comments_id");
  CREATE INDEX "payload_locked_documents_rels_analytics_events_id_idx" ON "payload_locked_documents_rels" USING btree ("analytics_events_id");
  CREATE INDEX "payload_locked_documents_rels_post_statistics_id_idx" ON "payload_locked_documents_rels" USING btree ("post_statistics_id");`)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  // Phase 5 data is intentionally retained on rollback. Features can be disabled
  // through Community Settings while a forward migration restores the application.
  await db.execute(sql`
   SELECT 1;`)
  /*
   ALTER TABLE "anonymous_profiles" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "reactions" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "comments" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "analytics_events" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "post_statistics" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "community_settings" DISABLE ROW LEVEL SECURITY;
  DROP TABLE "anonymous_profiles" CASCADE;
  DROP TABLE "reactions" CASCADE;
  DROP TABLE "comments" CASCADE;
  DROP TABLE "analytics_events" CASCADE;
  DROP TABLE "post_statistics" CASCADE;
  DROP TABLE "community_settings" CASCADE;
  ALTER TABLE "payload_locked_documents_rels" DROP CONSTRAINT "payload_locked_documents_rels_anonymous_profiles_fk";
  
  ALTER TABLE "payload_locked_documents_rels" DROP CONSTRAINT "payload_locked_documents_rels_reactions_fk";
  
  ALTER TABLE "payload_locked_documents_rels" DROP CONSTRAINT "payload_locked_documents_rels_comments_fk";
  
  ALTER TABLE "payload_locked_documents_rels" DROP CONSTRAINT "payload_locked_documents_rels_analytics_events_fk";
  
  ALTER TABLE "payload_locked_documents_rels" DROP CONSTRAINT "payload_locked_documents_rels_post_statistics_fk";
  
  DROP INDEX "payload_locked_documents_rels_anonymous_profiles_id_idx";
  DROP INDEX "payload_locked_documents_rels_reactions_id_idx";
  DROP INDEX "payload_locked_documents_rels_comments_id_idx";
  DROP INDEX "payload_locked_documents_rels_analytics_events_id_idx";
  DROP INDEX "payload_locked_documents_rels_post_statistics_id_idx";
  ALTER TABLE "payload_locked_documents_rels" DROP COLUMN "anonymous_profiles_id";
  ALTER TABLE "payload_locked_documents_rels" DROP COLUMN "reactions_id";
  ALTER TABLE "payload_locked_documents_rels" DROP COLUMN "comments_id";
  ALTER TABLE "payload_locked_documents_rels" DROP COLUMN "analytics_events_id";
  ALTER TABLE "payload_locked_documents_rels" DROP COLUMN "post_statistics_id";
  DROP TYPE "public"."enum_anonymous_profiles_avatar_key";
  DROP TYPE "public"."enum_anonymous_profiles_status";
  DROP TYPE "public"."enum_reactions_target_type";
  DROP TYPE "public"."enum_reactions_actor_type";
  DROP TYPE "public"."enum_reactions_reaction_type";
  DROP TYPE "public"."enum_comments_status";
  DROP TYPE "public"."enum_analytics_events_event_type";
  DROP TYPE "public"."enum_analytics_events_metadata_channel";
  DROP TYPE "public"."enum_analytics_events_processing_status";`)
  */
}
