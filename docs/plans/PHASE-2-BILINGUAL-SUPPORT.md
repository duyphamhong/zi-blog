# PHASE 2 — BILINGUAL ENGLISH–VIETNAMESE SUPPORT FOR ZI-BLOG

## Execution directive for Codex

Implement complete English–Vietnamese localization in the existing Zi-Blog repository.

This phase must support both:

1. Switching the application interface between English and Vietnamese.
2. Managing and rendering separate English and Vietnamese content for the same logical post, category, tag, series, navigation item, and SEO document.

Before changing code:

1. Read the root `AGENTS.md` and every applicable module-level instruction file.
2. Read the current architecture, ADR, domain, migration, deployment, and development documentation.
3. Inspect the real repository structure, installed Payload version, Next.js version, PostgreSQL adapter, collections, globals, drafts/version configuration, workflow implementation, search implementation, cache strategy, route structure, tests, and package manager configuration.
4. Verify all Payload and Next.js APIs against the installed versions and official documentation.
5. Identify the current language of existing content before writing any migration. Do not assume existing content is English or Vietnamese.
6. Reuse existing application services and module boundaries. Do not put multilingual business logic directly into React components or large Payload hooks.
7. Do not rename collection slugs, API field names, role values, workflow status values, or unrelated routes.
8. Do not silently copy existing content into both locales. Existing content must be migrated only into its verified source locale.
9. Run all applicable lint, type-check, unit, integration, migration, build, and E2E checks before reporting completion.
10. Report any installed-version limitation or generated-schema difference instead of inventing Payload behavior.

---

# 1. Goal

Make Zi-Blog a production-ready bilingual technology blog supporting English and Vietnamese.

Phase 2 must deliver:

- English and Vietnamese Payload Admin interface.
- English and Vietnamese project-owned labels, descriptions, validation messages, and workflow wording.
- A public language switcher.
- Locale-aware routes for all public content.
- Separate English and Vietnamese values for localized content fields.
- Correct content selection based on the active locale.
- No accidental cross-language content fallback on public pages.
- Localized slugs, SEO metadata, Open Graph metadata, structured data, RSS, sitemap entries, navigation, dates, reading-time text, and search.
- Safe migration of existing non-localized content.
- Locale-aware caching, search indexing, preview, redirects, analytics, and tests.

Required user behavior:

```text
Active locale: vi
→ UI is Vietnamese
→ post title, excerpt, body, slug, SEO, navigation, and related labels are Vietnamese

Active locale: en
→ UI is English
→ post title, excerpt, body, slug, SEO, navigation, and related labels are English
```

A translated post remains one logical post with one stable document ID, shared authorship, engagement, analytics identity, and workflow state, but localized presentation fields.

---

# 2. Feasibility and architectural decision

This implementation is feasible with native Payload capabilities.

Payload provides two separate mechanisms:

```text
i18n
→ translates the Payload Admin interface and project-owned UI labels

localization
→ stores field values for multiple content locales
```

Phase 2 must enable both.

Use Payload field localization rather than creating duplicate collections such as:

```text
posts_en
posts_vi
```

Do not create one independent post document per language unless repository constraints prove native localization unusable. Separate documents would complicate relationships, reactions, comments, analytics, redirects, workflow, and translation pairing.

Record the decision in an ADR if the repository uses ADRs.

Suggested ADR:

```text
docs/adr/00xx-native-payload-localization-for-english-vietnamese.md
```

---

# 3. Current assumptions

Codex must verify these assumptions before implementation:

- Zi-Blog uses Next.js App Router.
- Zi-Blog uses Payload CMS and PostgreSQL.
- Payload Admin and the public site are part of the same application or monorepo.
- Existing fields such as `title`, `excerpt`, `content`, `slug`, and SEO fields are currently non-localized.
- Existing public URLs do not consistently use locale prefixes.
- Phase 1 has a shared post lifecycle such as:

```text
draft
→ in_review
→ approved
→ scheduled
→ published
→ archived
```

- Post engagement is attached to the post ID, not to a slug.
- Search currently indexes one content representation per post.

If any assumption is false, document the difference and adapt this plan without weakening the acceptance criteria.

---

# 4. Scope boundary

## 4.1 In scope

- Supported content locales: `vi` and `en`.
- Default public locale: `vi` unless current production compatibility requires another default and an ADR records that decision.
- Payload Admin UI language switch between English and Vietnamese.
- Payload content locale selector for editors.
- Localized content fields.
- Localized route prefixes.
- Localized slugs.
- Public language switcher.
- Locale persistence in a cookie.
- Browser-language detection for the root route only.
- Strict public locale reads with fallback disabled.
- Translation completeness validation.
- Localized search documents.
- Localized SEO, RSS, sitemap, and structured data.
- Migration of existing content into one explicitly selected source locale.
- Tests, documentation, and operational rollback instructions.

## 4.2 Explicitly out of scope

- Automatic machine translation.
- AI translation review.
- Translation memory.
- More than English and Vietnamese.
- Domain-per-locale routing.
- Independent publication status per locale using Payload experimental localized status.
- Separate comments per language.
- Separate likes, bookmarks, or view totals per language.
- Locale-specific author accounts.
- Geo-based forced locale selection.

These may be introduced in later phases after the two-locale model is stable.

---

# 5. Locale model

Use short locale codes inside Payload because they are stable API identifiers:

```ts
export const CONTENT_LOCALES = ['vi', 'en'] as const
export type ContentLocale = (typeof CONTENT_LOCALES)[number]

export const DEFAULT_CONTENT_LOCALE: ContentLocale = 'vi'
export const DEFAULT_TIME_ZONE = 'Asia/Ho_Chi_Minh' as const

export const LOCALE_METADATA = {
  vi: {
    code: 'vi',
    htmlLang: 'vi',
    intlLocale: 'vi-VN',
    openGraphLocale: 'vi_VN',
    label: 'Tiếng Việt',
  },
  en: {
    code: 'en',
    htmlLang: 'en',
    intlLocale: 'en-US',
    openGraphLocale: 'en_US',
    label: 'English',
  },
} as const
```

Rules:

- Never accept an arbitrary locale string from route params or APIs.
- Validate all locale inputs against `CONTENT_LOCALES`.
- Do not scatter `'vi'`, `'en'`, `'vi-VN'`, or `'en-US'` throughout the codebase.
- The URL locale and Payload content locale must have an explicit mapping even when they currently use the same short code.
- The locale in the URL is the source of truth for public pages.

---

# 6. Payload configuration

## 6.1 Payload Admin i18n

Install `@payloadcms/translations` only if it is not already installed. Keep its version aligned with installed Payload packages.

Configure both languages:

```ts
import { en } from '@payloadcms/translations/languages/en'
import { vi } from '@payloadcms/translations/languages/vi'

export default buildConfig({
  i18n: {
    supportedLanguages: {
      en,
      vi,
    },
    fallbackLanguage: 'en',
  },
})
```

Payload Admin users must be able to choose their preferred interface language from their account preferences.

Admin interface language and content editing locale are separate choices:

```text
Admin interface language
→ language of buttons, menus, validation, and system labels

Content locale
→ language version of title, body, slug, SEO, and other localized data being edited
```

An editor may use an English Admin UI while editing Vietnamese content, or a Vietnamese Admin UI while editing English content.

## 6.2 Payload content localization

Enable project-wide localization:

```ts
export default buildConfig({
  localization: {
    locales: [
      {
        code: 'vi',
        label: {
          en: 'Vietnamese',
          vi: 'Tiếng Việt',
        },
      },
      {
        code: 'en',
        label: {
          en: 'English',
          vi: 'Tiếng Anh',
        },
      },
    ],
    defaultLocale: 'vi',
    fallback: false,
  },
})
```

Use `fallback: false` to make missing translations explicit.

Public query services must also pass:

```ts
locale,
fallbackLocale: false,
```

Do not rely solely on global configuration. Explicit public queries make the contract visible and prevent accidental behavior changes.

## 6.3 Do not enable experimental localized publication status

Do not enable Payload experimental `localizeStatus` in this phase.

Keep the existing editorial lifecycle shared across the logical document.

Reasons:

- The feature is experimental/beta in current Payload documentation.
- Zi-Blog already defines a richer application-owned workflow than Payload `_status` alone.
- Shared publication simplifies comments, reactions, analytics, redirects, and review authorization.
- Independent locale publishing can be designed later if editorial operations require it.

Phase 2 publication policy is defined in Section 11.

## 6.4 Timezone

Persist timestamps in UTC.

Use:

```text
Asia/Ho_Chi_Minh
```

as the default editorial display timezone unless existing user-specific timezone behavior already exists.

Localized date rendering must use:

```text
vi → vi-VN
 en → en-US
```

---

# 7. Affected modules

## Platform / configuration

Owns:

- Locale constants and validation.
- Locale detection.
- Locale cookie.
- Route mapping.
- Payload i18n and localization configuration.
- Dictionaries and formatters.

## Content

Owns:

- Localized fields.
- Locale-aware post queries.
- Localized slug generation and uniqueness.
- Translation completeness rules.
- Localized previews and alternate URLs.

## SEO

Owns:

- Canonical and alternate URLs.
- `hreflang`.
- Open Graph locale.
- Structured-data language.
- Localized RSS and sitemap output.

## Search

Owns:

- One index document per post and locale.
- Locale-aware query and ranking.
- Vietnamese accent-insensitive normalization.
- Search rebuild migration.

## Community

Owns:

- Localized UI strings.
- Shared comment thread across translations.
- Locale metadata on newly created comments or events only if useful for analytics.

## Analytics

Owns:

- Locale dimension on page-view, search, share, and reading events.
- Shared post identity across locales.
- Optional locale breakdown in read models.

## Identity

Owns:

- Localized auth UI, emails, errors, and account settings.

## Shared UI / design system

Owns:

- Language switcher.
- Localized controls, pagination, dialogs, errors, loading states, and accessibility labels.

---

# 8. Data model changes

Payload localization is field-based. Localize only fields whose displayed value differs by language.

## 8.1 Posts

Localize:

```text
title
slug
excerpt
content
seo.title
seo.description
seo.imageAlt, if present
socialTitle, if present
socialDescription, if present
```

Recommended shape:

```ts
{
  name: 'title',
  type: 'text',
  required: true,
  localized: true,
}

{
  name: 'slug',
  type: 'text',
  required: true,
  localized: true,
  index: true,
}

{
  name: 'excerpt',
  type: 'textarea',
  localized: true,
}

{
  name: 'content',
  type: 'richText',
  localized: true,
}
```

Keep shared:

```text
id
status
publishedAt
scheduledAt
author
coAuthors
coverImage relationship
category relationships
tag relationships
series relationship
seriesOrder
featured
visibility
createdAt
updatedAt
```

Rationale:

- One post ID identifies the article concept.
- Engagement and analytics aggregate to the same post.
- Editorial relationships remain stable.
- Language-specific text and URLs vary by locale.

## 8.2 Categories

Localize:

```text
name
slug
description
seo.title
seo.description
```

Keep shared:

```text
parent
icon
displayOrder
isActive
```

## 8.3 Tags

Localize:

```text
name
slug
description
```

Keep shared:

```text
usageCount
isFeatured
```

## 8.4 Series

Localize:

```text
title
slug
description
seo.title
seo.description
```

Keep shared:

```text
coverImage
author
status
```

## 8.5 Authors and user profiles

Keep identity fields shared:

```text
email
username
role
status
avatar
```

Localize editorial presentation fields only when they are publicly displayed and expected to differ:

```text
bio
expertise description
profile SEO description
```

Do not localize `displayName` by default unless product requirements explicitly need different names per locale.

## 8.6 Media

Keep the uploaded file and technical metadata shared.

Localize:

```text
alt
caption
credit description, when language-dependent
```

Keep shared:

```text
filename
mimeType
width
height
filesize
copyright owner
source URL
```

## 8.7 Navigation and site settings

Localize:

```text
navigation label
site tagline
default site description
announcement text
footer text
CTA labels
```

For internal links, prefer relationships to localized documents rather than storing duplicated hard-coded URLs.

When a custom URL is required, decide whether it is:

```text
shared external URL
or
localized internal URL
```

and model it explicitly.

## 8.8 Rich-text blocks

Localize the parent `content` rich-text field rather than marking every nested Lexical block field localized again.

For standalone reusable blocks or globals outside the post content field, localize user-facing text fields as needed.

Do not create redundant nested localization where a localized parent already contains the complete structure.

## 8.9 Do not localize

Do not localize:

```text
comments
reactions
bookmarks
analytics raw identifiers
roles
workflow enum values
moderation status values
technical configuration
external provider IDs
```

User-generated comments remain shared across language versions of the same post.

---

# 9. Localized slug design

Each language must have its own slug.

Example:

```text
vi: kien-truc-modular-monolith
 en: modular-monolith-architecture
```

Public routes:

```text
/vi/posts/kien-truc-modular-monolith
/en/posts/modular-monolith-architecture
```

## 9.1 Generation

Use one locale-aware slug service:

```ts
interface LocalizedSlugService {
  generate(input: { title: string; locale: ContentLocale }): string
  assertAvailable(input: {
    collection: LocalizedSlugCollection
    locale: ContentLocale
    slug: string
    excludeDocumentId?: string
  }): Promise<void>
}
```

Vietnamese behavior must normalize diacritics and `đ`:

```text
Đánh giá Payload CMS
→ danh-gia-payload-cms
```

English behavior must normalize standard Latin punctuation consistently.

Do not regenerate a manually edited slug on every title update.

## 9.2 Uniqueness

Slug uniqueness is scoped by:

```text
collection + locale + slug
```

The same slug may exist in different locales because the locale prefix disambiguates routes.

Do not assume `unique: true` on a localized Payload field creates the exact required PostgreSQL constraint. Codex must inspect the generated schema and migration.

Required enforcement:

1. Application-service uniqueness check using `locale` and `fallbackLocale: false`.
2. Database-level locale-scoped unique constraint or index where supported by the actual generated schema.
3. Integration test proving duplicate slugs are rejected within one locale.
4. Integration test proving the same slug may be used in `vi` and `en` if the database design permits the intended scope.

## 9.3 Redirects

Changing a published localized slug must create a redirect for that locale only.

Example:

```text
/vi/posts/duong-dan-cu
→ /vi/posts/duong-dan-moi
```

Do not redirect the English URL unless its English slug changed.

Redirect records should include or derive:

```text
locale
sourcePath
destinationPath
statusCode
documentId
```

---

# 10. Public routing and locale resolution

Use explicit locale-prefixed routes for both languages.

Recommended App Router structure:

```text
app/
├── [locale]/
│   ├── layout.tsx
│   ├── page.tsx
│   ├── posts/[slug]/page.tsx
│   ├── categories/[slug]/page.tsx
│   ├── tags/[slug]/page.tsx
│   ├── authors/[username]/page.tsx
│   ├── series/[slug]/page.tsx
│   ├── search/page.tsx
│   ├── login/page.tsx
│   └── ...
├── api/
└── ...payload routes
```

Adapt this to the actual repository and preserve Payload Admin/API routes.

## 10.1 Root route behavior

The root route `/` should select a locale using this priority:

```text
1. Valid locale cookie.
2. Supported browser Accept-Language preference.
3. DEFAULT_CONTENT_LOCALE.
```

Then redirect to:

```text
/vi
or
/en
```

Do not redirect a URL that already contains a valid locale prefix.

Do not apply locale middleware to Payload Admin, Payload API, health checks, static assets, image optimization, or internal Next.js paths.

## 10.2 Locale cookie

Use a cookie such as:

```text
ZI_BLOG_LOCALE=vi
ZI_BLOG_LOCALE=en
```

Recommended attributes:

```text
Path=/
SameSite=Lax
Secure in production
HttpOnly=false because the language switcher may need client access
Long but finite Max-Age
```

The URL remains the authoritative locale. The cookie only helps future navigation and root-route selection.

## 10.3 Invalid locale

Invalid locale prefixes must return 404 or redirect according to one centralized policy.

Do not silently treat arbitrary strings as English or Vietnamese.

## 10.4 HTML language

Render:

```tsx
<html lang={LOCALE_METADATA[locale].htmlLang}>
```

The page must not keep a fixed `lang="en"` or `lang="vi"` after this phase.

---

# 11. Editorial workflow and translation completeness

Keep the existing document lifecycle shared across locales.

Do not translate stored status values.

Example labels:

```text
draft
  en: Draft
  vi: Bản nháp

in_review
  en: In review
  vi: Chờ duyệt

published
  en: Published
  vi: Đã xuất bản
```

## 11.1 Draft behavior

Editors may save incomplete English or Vietnamese translations while the post is in a non-public workflow state.

Required localized draft fields may be incomplete during draft save if the existing draft validation policy allows it.

## 11.2 Publish readiness

Before a new post can transition to `published` or `scheduled`, validate both locales with `fallbackLocale: false`.

Minimum required in each locale:

```text
title
slug
content
critical SEO fields required by current project policy
```

Recommended service:

```ts
interface TranslationReadinessService {
  inspectPost(postId: string): Promise<{
    vi: LocaleReadiness
    en: LocaleReadiness
    readyForPublication: boolean
  }>
}
```

Example result:

```ts
{
  vi: {
    complete: true,
    missingFields: [],
  },
  en: {
    complete: false,
    missingFields: ['content', 'seo.description'],
  },
  readyForPublication: false,
}
```

The publish command must return a structured validation error identifying the missing locale and fields.

Do not implement this as hundreds of lines inside a collection hook. Delegate from a thin hook or command handler to the content application service.

## 11.3 Existing migrated published content

Existing published content may have only one known source locale after migration.

Do not unpublish it automatically.

Use a migration compatibility policy:

- Preserve its current shared publication status.
- Expose it only in the migrated source locale.
- Return a translation-unavailable state in the missing locale.
- Require both locales before the next explicit publish or schedule transition unless an authorized migration exception is documented.

The compatibility exception must be explicit and removable after translation backlog completion.

## 11.4 Missing translation on public site

Public queries always disable fallback.

If a document exists but the requested locale is incomplete:

- Do not display the other language body.
- Return a localized “translation not available” page or 404 according to the route policy.
- Offer a link to an available locale when known.
- Do not index the unavailable locale URL.

Recommended message:

```text
vi: Bài viết này chưa có bản tiếng Việt.
en: This article is not available in English yet.
```

---

# 12. Public query services

Frontend components must not construct arbitrary Payload locale queries.

Extend centralized query services:

```ts
interface LocalizedPostQueryService {
  getPublishedPostBySlug(input: {
    locale: ContentLocale
    slug: string
  }): Promise<PublishedPost | null>

  getLatestPosts(input: {
    locale: ContentLocale
    page: number
    limit: number
  }): Promise<PaginatedPosts>

  getAlternateUrls(input: {
    postId: string
  }): Promise<Partial<Record<ContentLocale, string>>>
}
```

Every public content query must pass:

```ts
locale,
fallbackLocale: false,
```

Also enforce:

```text
status is publicly visible
visibility permits the current actor
required localized fields are present
scheduled time has passed when applicable
```

Do not let fallback configuration accidentally expose a Vietnamese post body in English mode.

---

# 13. Public UI dictionaries

Use typed dictionaries for application-owned UI strings.

Suggested structure:

```text
platform/i18n/
├── config.ts
├── locale.ts
├── get-dictionary.ts
├── format-date.ts
├── format-number.ts
├── alternate-url.ts
└── dictionaries/
    ├── en.ts
    └── vi.ts
```

Example contract:

```ts
export const enDictionary = {
  navigation: {
    home: 'Home',
    posts: 'Posts',
    categories: 'Categories',
    search: 'Search',
  },
  post: {
    latest: 'Latest posts',
    readingTime: '{{minutes}} min read',
    translationUnavailable: 'This article is not available in English yet.',
  },
} as const

export type AppDictionary = typeof enDictionary

export const viDictionary: AppDictionary = {
  navigation: {
    home: 'Trang chủ',
    posts: 'Bài viết',
    categories: 'Chuyên mục',
    search: 'Tìm kiếm',
  },
  post: {
    latest: 'Bài viết mới nhất',
    readingTime: '{{minutes}} phút đọc',
    translationUnavailable: 'Bài viết này chưa có bản tiếng Việt.',
  },
}
```

Rules:

- The English dictionary defines the TypeScript shape, or use another strict shared contract.
- CI must fail when a key exists in one dictionary but not the other.
- Server Components load dictionaries directly.
- Client Components receive scoped strings or use an existing lightweight provider.
- Do not turn full pages into Client Components only for translation.
- Localize accessibility labels, form errors, empty states, toasts, dialogs, and email templates.

---

# 14. Language switcher

Add an accessible English–Vietnamese language switcher to the public header and mobile navigation.

Required behavior:

1. Determine the current logical document and locale.
2. Resolve the alternate locale URL using the alternate localized slug.
3. Update `ZI_BLOG_LOCALE`.
4. Navigate to the alternate URL.
5. Preserve safe query parameters where appropriate.
6. Do not preserve locale-specific search terms or unsafe redirect parameters blindly.

Example:

```text
Current:
/vi/posts/kien-truc-modular-monolith

Switch to English:
/en/posts/modular-monolith-architecture
```

Do not implement post switching by only replacing `/vi/` with `/en/`, because localized slugs may differ.

If the alternate translation is unavailable:

- Disable the alternate option with a clear label, or
- Navigate to the localized translation-unavailable page.

Accessibility requirements:

- Keyboard operable.
- Correct `aria-label`.
- Current language announced.
- Language names displayed in their native form: `Tiếng Việt`, `English`.
- Focus state visible.

Payload Admin already has its own interface language preference and content locale selector; do not replace those with the public switcher.

---

# 15. Locale-aware formatting

Use shared formatters.

## 15.1 Date

```ts
export function formatDate(value: Date | string, locale: ContentLocale): string {
  return new Intl.DateTimeFormat(LOCALE_METADATA[locale].intlLocale, {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
    timeZone: DEFAULT_TIME_ZONE,
  }).format(new Date(value))
}
```

Expected style:

```text
vi: 28 tháng 7, 2026
 en: July 28, 2026
```

Avoid server/client timezone mismatches.

## 15.2 Numbers

Use locale-specific `Intl.NumberFormat` for views, likes, comments, analytics, and pagination totals.

## 15.3 Relative time

Use locale-specific `Intl.RelativeTimeFormat` only where the current product already uses relative time.

## 15.4 Reading time

Keep calculation shared; localize presentation:

```text
vi: 8 phút đọc
 en: 8 min read
```

---

# 16. SEO and localized URLs

Each available locale page must have its own canonical URL.

Example:

```text
Vietnamese canonical:
https://example.com/vi/posts/kien-truc-modular-monolith

English canonical:
https://example.com/en/posts/modular-monolith-architecture
```

## 16.1 Alternate links

When both translations are available, output:

```html
<link rel="alternate" hreflang="vi" href=".../vi/..." />
<link rel="alternate" hreflang="en" href=".../en/..." />
<link rel="alternate" hreflang="x-default" href=".../vi/..." />
```

Do not emit an alternate URL for an unavailable translation.

## 16.2 Metadata

Use localized:

```text
title
description
canonical URL
Open Graph title
Open Graph description
Open Graph locale
social image alt text
```

Open Graph:

```text
vi → vi_VN
 en → en_US
```

Include `alternateLocale` only for available translations.

## 16.3 Structured data

Set:

```json
{
  "inLanguage": "vi"
}
```

or:

```json
{
  "inLanguage": "en"
}
```

Use localized headline, description, URL, and image alt text.

## 16.4 RSS

Provide locale-specific feeds:

```text
/vi/rss.xml
/en/rss.xml
```

Each feed must query only its locale with fallback disabled.

## 16.5 Sitemap

Include only available locale URLs.

Preferred behavior:

- One sitemap containing both languages with alternates, or
- A sitemap index with separate locale sitemaps.

Follow the existing sitemap architecture and avoid duplicating generators.

## 16.6 Robots and noindex

Translation-unavailable pages must not be indexed.

Preview and draft routes must remain noindex and access-controlled.

---

# 17. Search

Search must be locale-specific.

A query in Vietnamese mode searches Vietnamese indexed content. A query in English mode searches English indexed content.

Do not mix results across locales by default.

## 17.1 Search read model

Preferred conceptual shape:

```text
postId
locale
title
slug
excerpt
plainTextContent
normalizedSearchText
author
category
tags
publishedAt
popularityScore
updatedAt
```

Enforce one search document per:

```text
postId + locale
```

## 17.2 Vietnamese normalization

Vietnamese search should match accented and unaccented queries:

```text
kien truc
→ Kiến trúc

lap trinh
→ Lập trình
```

Preserve technology tokens where practical:

```text
C#
C++
.NET
Node.js
Next.js
Payload CMS
```

## 17.3 English normalization

Use standard case-insensitive normalization without applying Vietnamese-specific transformations unnecessarily.

## 17.4 Index synchronization

When a localized post changes:

- Update only the affected locale search document when the event contains locale context.
- If locale context is unavailable, safely rebuild both locale documents for that post.
- Remove a locale document when its translation becomes unavailable.
- Preserve the other locale document.

## 17.5 Search API

Require locale:

```ts
search({
  locale,
  query,
  page,
  limit,
})
```

Validate locale server-side.

---

# 18. Comments, reactions, bookmarks, and analytics

## 18.1 Comments

Comments remain attached to the shared post ID.

The same thread is visible in both language versions unless product requirements later introduce per-locale discussions.

Optionally store the UI locale at comment creation for moderation context:

```text
createdFromLocale
```

Do not use it to hide comments in the other locale during this phase.

## 18.2 Reactions and bookmarks

Remain shared across translations:

```text
one like per user + post
one bookmark per user + post
```

Do not create duplicate engagement when users switch languages.

## 18.3 Analytics

Add locale to relevant raw events:

```text
page_view
article_view
article_read
article_complete
search
share
```

Aggregate both:

```text
shared post total
and optional per-locale breakdown
```

Trending may remain shared unless editorial requirements explicitly ask for locale-specific rankings.

Public queries must still render localized post summaries for the active locale.

---

# 19. API changes

Application query contracts must add validated locale input.

Example:

```ts
interface PostQueryService {
  getPublishedPostBySlug(input: {
    locale: ContentLocale
    slug: string
  }): Promise<PublishedPost | null>
}
```

Payload APIs support locale-aware reads and writes. Use the installed-version syntax.

REST examples conceptually use:

```text
?locale=vi&fallback-locale=none
?locale=en&fallback-locale=none
```

Local API operations conceptually use:

```ts
{
  locale: 'vi',
  fallbackLocale: false,
}
```

Custom endpoints must explicitly parse and validate locale because locale may not be automatically attached to custom requests.

Do not break existing machine-readable error codes.

Localized error shape:

```ts
{
  code: 'TRANSLATION_INCOMPLETE',
  message: 'Bản dịch tiếng Anh chưa hoàn chỉnh.',
  details: {
    locale: 'en',
    missingFields: ['content'],
  },
  correlationId: '...',
}
```

Clients must branch on `code`, not translated `message`.

---

# 20. Authorization

No new role is required.

Existing content permissions apply to both locales.

Verify:

- Authors can edit allowed localized fields on their own drafts.
- Editors can review both locales.
- Only authorized actors can publish or schedule.
- Translation completeness checks cannot be bypassed through REST, GraphQL, Local API, or custom endpoints.
- Public access returns only published and visible content in the requested locale.
- Draft preview is authenticated and locale-aware.
- Field-level restrictions remain effective after fields become localized.

Do not weaken access control to simplify migration or translation entry.

---

# 21. Preview

Preview must include locale.

Examples:

```text
/vi/preview/posts/{id}
/en/preview/posts/{id}
```

or the repository's equivalent secure preview mechanism.

Requirements:

- Preview token validation remains unchanged or stronger.
- Query uses the requested locale and `fallbackLocale: false`.
- Preview shows the exact localized draft selected in Admin.
- Language switcher in preview must not expose unauthorized drafts.
- Preview metadata must be noindex.

---

# 22. Caching and invalidation

All public cache keys and tags for localized content must include locale.

Examples:

```text
post:{postId}:vi
post:{postId}:en
post-slug:{locale}:{slug}
post-feed:{locale}
category:{categoryId}:{locale}
search:{locale}:{queryHash}
```

When localized content changes:

- Invalidate that locale's post page.
- Invalidate that locale's homepage/feed.
- Invalidate affected localized category, tag, series, and author pages.
- Invalidate localized search results.
- Revalidate both old and new localized slug paths when a slug changes.

When shared fields change, such as author, visibility, featured status, or cover image:

- Invalidate both locales.

Do not cache localized content under a shared key without locale.

---

# 23. Events and jobs

Extend relevant events with optional or required locale context.

Examples:

```ts
PostTranslationUpdated {
  eventId
  eventVersion
  postId
  locale
  changedFields
  occurredAt
  actorId
  correlationId
}

PostSlugChanged {
  postId
  locale
  previousSlug
  nextSlug
}
```

Jobs:

```text
MigrateLegacyLocalizedContent
RebuildLocalizedSearchIndex
RebuildLocalizedSitemap
```

Each job must be:

- Idempotent.
- Batched.
- Retry-safe.
- Observable.
- Safe to rerun.
- Unable to overwrite a non-empty translation accidentally.

Do not perform a full content or search migration synchronously inside an HTTP request or collection hook.

---

# 24. Database migration

This phase requires an explicit PostgreSQL migration because non-localized fields become localized fields.

Payload with PostgreSQL stores localized field data differently from plain scalar fields. Codex must generate and inspect the actual migration from the installed Payload version.

## 24.1 Pre-migration audit

Before generating migration SQL:

1. Inventory every field that will become localized.
2. Count existing records per collection/global.
3. Determine whether each field contains English, Vietnamese, mixed, or unknown content.
4. Identify published documents and active redirects.
5. Back up the database and verify restore instructions.
6. Record the source locale for each migrated data set.

Do not infer source locale solely from browser settings or site defaults.

## 24.2 Explicit legacy locale selection

Migration execution must require an explicit value:

```text
LEGACY_CONTENT_LOCALE=en
```

or:

```text
LEGACY_CONTENT_LOCALE=vi
```

Do not silently default this in production migration code.

If different collections contain different source languages, use an explicit migration mapping rather than one global value.

## 24.3 Migration sequence

Recommended deployment sequence:

```text
1. Create a verified database backup.
2. Enter a controlled deployment or maintenance window if required.
3. Add localization configuration and localized schema.
4. Copy each legacy scalar value into its verified source locale.
5. Leave the other locale empty.
6. Preserve IDs, relationships, timestamps, statuses, and existing slugs.
7. Validate row counts and localized value counts.
8. Deploy locale-aware application code.
9. Generate localized route redirects for existing public URLs.
10. Rebuild localized search documents.
11. Regenerate types.
12. Run smoke and E2E tests.
```

Do not copy the same content into both `en` and `vi` merely to satisfy required fields. That would produce incorrect-language pages and misleading SEO.

## 24.4 Existing URL migration

For each existing public unprefixed URL, create a permanent redirect to the migrated source locale URL.

Example:

```text
/posts/modular-monolith
→ /en/posts/modular-monolith
```

or:

```text
/posts/kien-truc-modular-monolith
→ /vi/posts/kien-truc-modular-monolith
```

Do not redirect to a locale with no translation.

## 24.5 Rollback

Document:

- Database restore procedure.
- Application rollback compatibility.
- Whether the old application can read the localized schema.
- Search-index rollback.
- Redirect rollback.

Assume the old application may not be schema-compatible after localized-field migration. Do not claim zero-downtime deployment unless verified against the actual generated schema and application versions.

---

# 25. Seed data

Fresh installations should seed both locales.

Example:

```text
Vietnamese title:
Kiến trúc Modular Monolith cho ứng dụng blog

English title:
Modular Monolith Architecture for a Blog Application
```

Seed requirements:

- Idempotent.
- Both localized slugs present.
- Both localized SEO values present.
- Shared relationships created once.
- No duplicate post document per locale.

---

# 26. Testing

## 26.1 Unit tests

Add tests for:

- Locale validation.
- Locale metadata mapping.
- Dictionary parity.
- Vietnamese and English date formatting.
- Vietnamese slug generation.
- English slug generation.
- Locale-aware alternate URL generation.
- Translation completeness validation.
- Search normalization per locale.
- Locale-specific cache tag generation.

## 26.2 Payload integration tests

Use a real PostgreSQL test database or container.

Test:

1. Create one post document.
2. Save Vietnamese localized title, slug, excerpt, and content.
3. Save English localized title, slug, excerpt, and content.
4. Retrieve with `locale: 'vi'` and `fallbackLocale: false`.
5. Retrieve with `locale: 'en'` and `fallbackLocale: false`.
6. Confirm each response contains only the requested localized values.
7. Confirm missing translation does not fall back.
8. Confirm locale-scoped slug uniqueness.
9. Confirm localized SEO values persist.
10. Confirm relationships and document ID are shared.
11. Confirm authorization remains enforced.
12. Confirm existing lifecycle transitions still work.

## 26.3 Migration tests

Test migration against a database fixture representing the Phase 1 schema.

Verify:

- Legacy values are copied to the selected source locale.
- Other locale remains empty.
- IDs and relationships remain unchanged.
- Status and publication timestamps remain unchanged.
- Existing slugs are preserved in source locale.
- Migration is safe to rerun or detects prior completion.
- No non-empty localized value is overwritten.
- Rollback documentation is accurate.

## 26.4 E2E tests

Required journeys:

```text
Editor opens Payload Admin in English.
Editor switches Payload Admin interface to Vietnamese.
Editor selects Vietnamese content locale and enters Vietnamese post data.
Editor selects English content locale and enters English post data.
Editor publishes after both translations are complete.
Reader opens Vietnamese post URL and sees Vietnamese content.
Reader switches to English and reaches the English localized slug.
Reader switches back to Vietnamese.
Missing translation does not display fallback content.
Search in Vietnamese returns Vietnamese results only.
Search in English returns English results only.
Localized canonical and hreflang tags are correct.
Existing unprefixed URL redirects to the correct source locale.
Comments and likes remain attached to the same post across both routes.
```

## 26.5 Accessibility tests

Test:

- Language switcher keyboard navigation.
- Correct `html lang`.
- Screen-reader label of current language.
- Focus behavior after language change.
- Vietnamese diacritics and font rendering.
- Responsive wrapping for longer translated labels.

---

# 27. Implementation steps

## Step 1 — Repository audit

- Read instructions and architecture docs.
- Inspect Payload/Next.js versions and current code.
- Inventory translatable UI strings and localizable content fields.
- Determine current content language and route compatibility requirements.

## Step 2 — ADR and locale contract

- Record native Payload localization decision.
- Add typed locale constants and validation.
- Define default locale and route strategy.

## Step 3 — Payload Admin i18n

- Add English and Vietnamese Admin translations.
- Convert project-owned Payload labels to bilingual label objects.
- Verify Admin account language preference.

## Step 4 — Payload content localization

- Enable `localization` with `vi` and `en`.
- Mark approved fields `localized: true`.
- Regenerate Payload types.
- Inspect generated PostgreSQL schema changes.

## Step 5 — Migration

- Create backup and fixture.
- Generate explicit migration.
- Backfill legacy content into verified source locale.
- Validate counts and data integrity.

## Step 6 — Application services

- Add locale to all public query contracts.
- Enforce `fallbackLocale: false`.
- Implement translation readiness.
- Implement localized slug uniqueness and redirects.

## Step 7 — Public routing

- Introduce `[locale]` route segment.
- Add root locale detection and redirect.
- Exclude Payload and internal routes from locale middleware.
- Add cookie persistence.

## Step 8 — Public UI

- Add typed English and Vietnamese dictionaries.
- Localize all public/member UI.
- Add accessible language switcher using alternate localized URLs.
- Add locale-aware formatters.

## Step 9 — SEO and feeds

- Add localized metadata, canonical, alternates, `hreflang`, and structured data.
- Add locale-specific RSS.
- Update sitemap generation.
- Add old URL redirects.

## Step 10 — Search and analytics

- Build one search document per post and locale.
- Rebuild search index in batches.
- Add locale to analytics events and optional aggregates.

## Step 11 — Caching and jobs

- Add locale dimension to cache keys/tags.
- Update invalidation paths.
- Add idempotent migration/rebuild jobs where required.

## Step 12 — Validation

Run repository-equivalent commands for:

```text
lint
format check
type check
unit tests
integration tests
migration tests
build
critical E2E tests
```

## Step 13 — Documentation and report

Update:

```text
architecture overview
ADR
content model
editor guide
migration guide
locale routing guide
search architecture
SEO behavior
operations and rollback
```

Report:

- Files changed.
- Schema changes.
- Migration result.
- Source locale selected.
- Tests run.
- Known limitations.
- Follow-up work.

---

# 28. Risks and mitigations

## Risk: Existing content is migrated into the wrong language

Mitigation:

- Require explicit source-locale mapping.
- Validate sampled and counted data before deployment.
- Never duplicate legacy content into both locales automatically.

## Risk: Public English mode displays Vietnamese fallback

Mitigation:

- Configure fallback off.
- Pass `fallbackLocale: false` in every public query service.
- Add integration and E2E tests for missing translations.

## Risk: Route switcher uses the wrong slug

Mitigation:

- Resolve alternate URLs by document ID and localized slug.
- Never replace only the locale prefix for document routes.

## Risk: Cache serves one locale under another locale URL

Mitigation:

- Include locale in all localized cache keys and tags.
- Test cache invalidation for both locales.

## Risk: Localized slug uniqueness differs from assumptions

Mitigation:

- Inspect generated PostgreSQL schema.
- Add explicit locale-scoped uniqueness enforcement.
- Test actual database behavior.

## Risk: Existing published content lacks the second translation

Mitigation:

- Preserve source-locale availability.
- Provide translation-unavailable behavior.
- Use an explicit migration compatibility exception.
- Require both locales for future normal publish transitions.

## Risk: Search returns mixed languages

Mitigation:

- Store locale on search documents.
- Require locale in search queries.
- Rebuild both indexes and test result isolation.

## Risk: Translation increases layout width

Mitigation:

- Test responsive layouts in both languages.
- Avoid fixed widths for buttons and navigation labels.
- Verify Vietnamese glyph support.

## Risk: Old app cannot read migrated schema

Mitigation:

- Treat migration as a coordinated deployment.
- Document restore-based rollback.
- Do not claim zero downtime without verification.

---

# 29. Acceptance criteria

Phase 2 is complete only when all criteria pass.

## Admin

- Payload Admin supports both English and Vietnamese interface languages.
- Editors can independently select Admin interface language and content locale.
- Project-owned collection, global, field, and workflow labels are bilingual.
- Editors can enter separate Vietnamese and English values on the same document.

## Content

- One post ID stores both language versions.
- Vietnamese mode returns Vietnamese title, slug, excerpt, content, and SEO.
- English mode returns English title, slug, excerpt, content, and SEO.
- Missing translation never silently falls back to the other language publicly.
- Both translations are validated before a normal publish or schedule transition.

## Routing

- All public content routes include `/vi` or `/en`.
- Root locale detection works in the documented priority order.
- Language preference persists.
- Language switcher resolves locale-specific slugs correctly.
- Existing URLs redirect to the verified source locale.

## SEO

- Each locale has a self-canonical URL.
- Available translations expose correct `hreflang` alternates.
- `html lang`, Open Graph locale, structured data, RSS, and sitemap are locale-aware.
- Missing translations are not indexed.

## Search

- Vietnamese search returns Vietnamese content only.
- English search returns English content only.
- Accent-insensitive Vietnamese queries work.
- Search documents are unique by post and locale.

## Data integrity

- Migration preserves IDs, relationships, workflow status, publication dates, and source slugs.
- Legacy content is migrated only to its verified source locale.
- No existing non-empty translation is overwritten.
- Locale-scoped slug uniqueness is enforced.

## Community and analytics

- Comments, reactions, and bookmarks remain shared across language versions.
- Analytics events record active locale without splitting the logical post identity.

## Quality

- Authorization is unchanged or stronger.
- Locale is included in cache keys and invalidation.
- Unit, integration, migration, build, and critical E2E tests pass.
- Documentation and rollback instructions are updated.
- No incomplete work is described as production-ready.

---

# 30. Follow-up phase candidates

Do not implement these automatically in Phase 2:

```text
Independent publication status per locale
Translation assignment and reviewer workflow
Translation progress dashboard
Machine translation assistance
Localized newsletters
Locale-specific comment threads
Additional locales
Domain-based locale routing
Locale-specific trending models
```

Evaluate them only after the English–Vietnamese implementation is stable and editorial usage data is available.
