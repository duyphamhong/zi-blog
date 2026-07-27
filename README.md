# Zi-Blog

Zi-Blog is a Phase 1 technology-blog scaffold built as one Next.js and Payload CMS
application. It provides a Payload Admin workspace, a PostgreSQL-backed content
model, and a public blog that only reads published content through centralized
server-side queries.

## Selected versions

- Node.js 22.17.1
- pnpm 10.14.0
- Payload CMS 3.86.0
- Next.js 16.2.6
- React 19.2.6
- PostgreSQL 16
- TypeScript 5.7.3

All official Payload packages are pinned to the same `3.86.0` release. The
Payload `(payload)` route group comes from the official blank template for that
release.

## Prerequisites

- Node.js 22 (use the committed `.nvmrc`)
- Corepack
- Docker Desktop or another Docker Compose-compatible runtime

On Windows, if `corepack enable` cannot create global shims, prefix pnpm commands
with `corepack`, for example `corepack pnpm install`.

## Environment setup

Copy `.env.example` to `.env` at the repository root and replace
`PAYLOAD_SECRET` and the seed administrator password before using the project
outside an isolated local environment.

```bash
cp .env.example .env
```

The application validates required environment values at startup. It also reads
the root `.env` when pnpm executes the `apps/web` package from its workspace
directory.

## Fast local development

```bash
docker compose up -d postgres
pnpm install
pnpm db:migrate
pnpm seed
pnpm dev
```

- Public site: <http://localhost:3000>
- Payload Admin: <http://localhost:3000/admin>
- Liveness: <http://localhost:3000/api/health/live>
- Readiness: <http://localhost:3000/api/health/ready>

The seed is idempotent. It creates an administrator, an author, taxonomy data,
one series, site/navigation globals, two published posts, and one draft post.

## Full container workflow

```bash
docker compose up -d --build
pnpm seed
docker compose logs -f web
```

The web container runs committed migrations before starting the standalone
Next.js server. The seed remains an explicit host-side command and connects to
the published PostgreSQL port; it is never part of production startup.

Uploaded media is stored in a named Docker volume. Local filesystem media is a
Phase 1 constraint; use persistent S3-compatible object storage before a
multi-instance production deployment.

## Database migrations

```bash
pnpm db:migrate:create migration_name
pnpm db:migrate
pnpm db:migrate:status
pnpm db:migrate:down
```

Production uses committed migrations and disables schema push. See
`docs/development/migrations.md` for the full workflow.

## Validation

```bash
pnpm format:check
pnpm lint
pnpm typecheck
pnpm payload:types
pnpm payload:importmap
pnpm test:unit
pnpm test:integration
pnpm test:e2e
pnpm build
```

Run the entire local quality gate with:

```bash
pnpm validate
```

Integration and end-to-end tests require PostgreSQL. Integration fixtures use
unique lookup keys and clean up their records; CI supplies a dedicated
PostgreSQL service database.

## Troubleshooting

- `PAYLOAD_SECRET is required`: create the root `.env` from `.env.example`.
- Database connection refused: run `docker compose up -d postgres` and wait for
  its health check.
- Stale generated types or import map: run `pnpm payload:types` and
  `pnpm payload:importmap`, then review the generated diff.
- Media disappears after container recreation: confirm the `web_media` volume
  exists; do not use container-local storage for durable production uploads.

## Phase 1 limitations

This is a runnable foundation, not a complete production blog. Public
registration, comments, reactions, analytics, scheduled publishing, external
search, background workers, Redis, object storage, multi-language, and
multi-tenancy are explicitly deferred.
