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
