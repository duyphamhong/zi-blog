# Phase 1 architecture overview

Zi-Blog is one deployable Next.js application containing the public frontend,
Payload Admin, Payload REST and GraphQL endpoints, and server-side Local API
queries. PostgreSQL is the system of record and local uploads are stored on a
persistent development volume.

The official Payload 3.86.0 blank template supplies the version-sensitive Admin
and API route group. Project-owned collections, globals, access policy, hooks,
migrations, and seed data live under `apps/web/src/payload`.

Phase 1 uses Payload's built-in `_status` (`draft` or `published`) instead of a
duplicate workflow field. Public components receive explicit projection types
from the content query module; they never receive raw Users documents or build
Payload queries themselves.

The frontend route group is dynamic so a production build does not require a
database connection. Public data uses Next.js data-cache entries with explicit
five-minute revalidation and content cache tags. Payload post hooks invalidate
both affected paths and cache tags after changes.

Local uploads are deliberately not a production storage strategy. The media
collection and Docker volume form a clean replacement point for an
S3-compatible adapter in a later phase.
