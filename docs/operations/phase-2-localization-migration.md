# Phase 2 localization migration runbook

This migration changes the physical storage of localized fields. The Phase 1
application cannot safely run against the Phase 2 schema.

## Before deployment

1. Put content editing into a maintenance window.
2. Audit Phase 1 posts, taxonomy, media, users, and globals to determine their
   actual language.
3. If the collections do not share one source language, stop and replace the
   global migration setting with a reviewed per-collection mapping.
4. Create and verify a PostgreSQL custom-format backup:

   ```bash
   docker compose exec -T postgres sh -lc \
     'pg_dump -U "$POSTGRES_USER" -d "$POSTGRES_DB" -Fc -f /tmp/zi-blog-before-phase-2.dump'
   docker compose exec -T postgres sh -lc \
     'test -s /tmp/zi-blog-before-phase-2.dump'
   ```

5. Set `LEGACY_CONTENT_LOCALE=vi` or `LEGACY_CONTENT_LOCALE=en` explicitly in
   the migration environment.

## Deploy

Run the committed migration before starting the new application:

```bash
pnpm db:migrate:status
LEGACY_CONTENT_LOCALE=en pnpm db:migrate
pnpm db:migrate:status
```

Use `vi` instead of `en` only when the audit proves Vietnamese is the source.
The migration refuses missing or unsupported values. It preserves source text
in only the declared locale; translators populate the other locale later.

## Verify

- Document counts and IDs match the pre-migration audit.
- Published/draft status, relationships, timestamps, and versions are intact.
- Source-locale slugs resolve at locale-prefixed URLs.
- The other locale does not silently show source-locale content.
- Localized slug uniqueness is enforced per `(slug, locale)`.
- Admin can save both translations and preview the selected draft locale.
- Search, RSS, sitemap alternates, canonical URLs, and the language switcher
  stay inside the requested locale.
- Run `pnpm seed` twice only for environments that intentionally use sample
  content.

## Rollback

The preferred rollback is database restore plus the previous application:

1. Stop the Phase 2 web process.
2. Restore the verified pre-migration backup into an empty/recreated target
   database using the environment's approved PostgreSQL restore procedure.
3. Start the previous application and verify its health and representative
   Phase 1 URLs.

For a disposable development database, the migration's `down` function can be
exercised with the same explicit source locale:

```bash
LEGACY_CONTENT_LOCALE=en pnpm db:migrate:down
```

The down migration must not be treated as the production rollback strategy:
localized records created after deployment cannot always be represented
losslessly in the Phase 1 scalar schema, search projections are removed, and
new locale-specific redirects cease to exist.
