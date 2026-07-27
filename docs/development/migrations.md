# Database migrations

PostgreSQL schema changes are migration-first before review.

## Development workflow

1. Change Payload collection or global configuration.
2. Start local PostgreSQL.
3. Run `pnpm db:migrate:create descriptive_name`.
4. Inspect both `up` and `down` statements.
5. Regenerate Payload types and the Admin import map.
6. Recreate an empty database and run `pnpm db:migrate`.
7. Run the seed twice to prove idempotency.

Development uses Payload schema push to shorten schema iteration. Production
sets `push: false` and loads only committed migrations from
`src/payload/migrations/index.ts`.

Useful commands:

```bash
pnpm db:migrate
pnpm db:migrate:status
pnpm db:migrate:down
pnpm db:migrate:create change_name
```

Never edit an already deployed migration. Add a new backward-compatible
migration and consider existing data, lock duration, rollback, and compatibility
with the previously deployed application.

## Phase 2 localization migration

`20260727_221426_phase_2_bilingual_localization` converts scalar text columns to
Payload's PostgreSQL locale tables. It refuses to run unless
`LEGACY_CONTENT_LOCALE` is explicitly set to `vi` or `en`. The value must come
from a pre-migration audit; it is deliberately not defaulted.

The migration preserves the Phase 1 document IDs, relationships, publication
state, timestamps, versions, and slugs in the declared source locale. It does
not copy source text into the other locale. The old application is not
schema-compatible with the localized tables, so treat deployment as a
coordinated migration and restore the database backup when rolling back the
application.

See `docs/operations/phase-2-localization-migration.md` before running this
migration outside a disposable development database.
