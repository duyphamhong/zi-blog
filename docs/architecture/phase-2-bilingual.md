# Phase 2 bilingual architecture

Zi-Blog supports Vietnamese (`vi`) and English (`en`) as two presentations of
one logical Payload document. Vietnamese is the default locale. The public site
never uses Payload fallback localization.

## Request flow

1. `/` selects a locale from the `zi-blog-locale` cookie, then
   `Accept-Language`, then Vietnamese, and redirects to `/{locale}`.
2. Locale-prefixed pages validate the route segment and call public module
   queries with that locale and `fallbackLocale: false`.
3. Projections return only public fields; React components do not construct
   Payload queries.
4. Metadata, JSON-LD, RSS, sitemap entries, dates, numbers, navigation, and
   internal links use the same locale.
5. The language switcher resolves translated slugs by stable document ID. It is
   disabled when the target translation is unavailable.

Legacy unprefixed content URLs permanently redirect to the translation that
owns the old slug. Index pages redirect to Vietnamese.

## Content and workflow

Localized presentation fields live in Payload locale tables. Shared fields
include author and taxonomy relationships, visibility, featured state,
publication state, timestamps, and reading time.

Draft saves validate the selected locale. A transition to `published` inspects
both locales and fails with `TRANSLATION_INCOMPLETE` when required title, slug,
excerpt, or content is missing. Existing content migrated into one audited
source locale remains compatible until its next explicit publication
transition.

Admin previews use `/{locale}/preview/posts/{id}`. Every preview request
authenticates the Payload user, enforces editor/super-admin or owning-author
access, requests the exact locale without fallback, and emits noindex metadata.

## Search and cache

`search-documents` contains one derived record per published public post and
locale. Hooks rebuild both locale projections after a post write because shared
fields can affect both. Vietnamese text has accents removed only in the
normalized search column; displayed content remains unchanged.

Localized cache keys and tags contain the locale. A localized write revalidates
both languages defensively, including feeds, search results, taxonomy pages,
old/new post paths, and localized post tags.

## Module ownership

- `modules/content`: locale-explicit public queries, projections, alternate
  paths, translation readiness.
- `modules/platform/i18n`: supported locales, detection, dictionaries,
  formatting, and path helpers.
- `modules/search`: search projection synchronization and locale-scoped queries.
- `modules/seo`: localized metadata and RSS.
- `src/payload`: localized declarative schema, thin hooks, migration, and seed.
