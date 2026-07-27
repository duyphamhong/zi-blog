# Phase 1 data flow

```text
Payload Admin
    -> collection/global access policy
    -> small validation and derivation hooks
    -> PostgreSQL
    -> path and cache-tag invalidation

Public route
    -> owning module query
    -> Payload Local API with explicit publication filters
    -> sanitized projection
    -> server component
    -> HTML, metadata, sitemap, or RSS
```

Draft protection is applied twice:

1. Payload public post access only permits published, public records.
2. Public module queries use explicit `_status`, visibility, and indexability
   filters while running with server-only access override.

Direct post lookup is the only public query allowed to return an unlisted post.
Unlisted posts remain absent from lists, search, RSS, and sitemap output.

Authenticated Admin operations use `req.user`, role helpers, ownership filters,
and a pre-change publication guard. Authors can edit only their own drafts and
cannot transition `_status` to `published`.
