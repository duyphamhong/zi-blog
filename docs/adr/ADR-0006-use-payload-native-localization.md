# ADR-0006: Use Payload native localization

- Status: Accepted
- Date: 2026-07-28

## Context

Vietnamese and English presentations must remain one logical content record.
Authorship, relationships, publication state, engagement identity, redirects,
and future analytics must not split into independent posts.

Payload 3.86.0 supports localized fields and locale-aware Local API queries. Its
independent localized-drafts feature is experimental, so using it would add
workflow and migration risk.

## Decision

Use Payload native field localization with exactly `vi` and `en`, defaulting the
Admin locale to `vi`. Public queries always supply a locale and
`fallbackLocale: false`.

Localize presentation fields such as titles, slugs, excerpts, rich text,
taxonomy labels, media descriptions, navigation labels, biographies, and SEO
copy. Keep identity, relationships, visibility, publication state, timestamps,
and counters shared.

Publication state remains shared. A draft can be incomplete, but a transition
to published requires the required fields in both locales. Each localized slug
is unique within its locale.

## Consequences

- Both language routes resolve to the same Payload document ID.
- Missing translations are unavailable rather than silently rendered in the
  other language.
- Search projections, cache keys, feeds, metadata, and redirects carry locale.
- Existing scalar content requires an explicit data migration and audited
  source locale.
- Independent per-locale publication can be reconsidered only after the
  installed Payload feature is stable and a separate ADR covers the workflow.
