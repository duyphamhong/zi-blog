# Phase 1 Implementation Plan — Payload CMS Blog Scaffold

**Project:** Zi-Blog / Technology Blog Framework
**Audience:** Codex and other coding agents
**Status:** Approved implementation plan for Phase 1
**Primary source of truth:** `ChatGPT-Instruction.md` and the repository root `AGENTS.md`
**Phase goal:** Produce a runnable, maintainable blog application that uses Payload CMS capabilities as directly as possible before introducing custom community, analytics, or workflow features.

---

## 1. Goal

Build the first executable scaffold of the technology blog framework using:

- Next.js App Router
- Payload CMS
- TypeScript with strict mode
- PostgreSQL
- Payload Lexical Rich Text Editor
- Tailwind CSS
- pnpm workspace
- Docker and Docker Compose
- A modular-monolith-compatible source structure

At the end of Phase 1, a developer must be able to:

1. Start PostgreSQL and the application locally.
2. Sign in to Payload Admin.
3. Manage users, media, categories, tags, series, posts, navigation, and site settings.
4. Create a draft post and publish it through Payload's built-in draft/version capability.
5. View published content on the public Next.js site.
6. Confirm that unpublished content is not exposed publicly.
7. Recreate the database from committed migrations.
8. Seed the system with a working administrator and sample content.
9. Run linting, type checking, tests, and a production build successfully.

This phase is a foundation, not the final production blog.

---

## 2. Implementation Directive for Codex

Before changing files, Codex must:

1. Read `ChatGPT-Instruction.md`.
2. Read the root `AGENTS.md` if it exists.
3. Inspect the repository and preserve existing files and conventions.
4. Verify the current installed Payload CMS version and use official APIs for that exact version.
5. Keep all official Payload packages on the same exact version.
6. Prefer the official Payload blank or website template structure when it reduces integration risk.
7. Record deviations from this plan in `docs/adr/` when the deviation is architectural.
8. Never claim a command passed unless it was actually executed.

Codex must implement the plan in the order defined in this document.

Codex must not add features from the out-of-scope section.

---

## 3. Phase 1 Scope

### 3.1 Included

#### Platform scaffold

- pnpm workspace
- One deployable Next.js + Payload application
- PostgreSQL database adapter
- Dockerfile
- Docker Compose
- Environment validation
- Payload-generated TypeScript types
- Payload import map generation
- Database migrations
- Local upload storage with a persistent development volume
- Health endpoint
- Seed command
- Basic automated tests
- Local development documentation

#### Payload Admin

- Authenticated admin access
- Users
- Media
- Categories
- Tags
- Series
- Posts
- Site Settings global
- Navigation global
- Drafts
- Versions
- Autosave where supported and stable
- Lexical rich text editing
- Basic SEO fields
- Role-based admin access
- Preview URL wiring or a documented extension point if the current Payload template does not provide it safely

#### Public blog

- Homepage
- Post detail page
- Category page
- Tag page
- Author page
- Series page
- Basic search page
- Responsive header and footer
- Latest posts
- Featured posts
- Rich-text rendering
- Cover images
- Author and taxonomy metadata
- Reading time
- Basic metadata generation
- `robots.txt`
- `sitemap.xml`
- RSS feed
- Empty, loading, not-found, and error states where applicable

### 3.2 Explicitly Deferred

The following are not part of Phase 1:

- Public user registration
- Member accounts
- Comments and replies
- Comment moderation
- Likes or reactions
- Bookmarks
- Notifications
- Content reporting
- Analytics event ingestion
- View aggregation
- Popular or trending algorithms
- Editorial review states such as `in_review` and `approved`
- Background workers
- Scheduled publishing
- External queues
- Redis
- S3 or R2 integration
- External search engines
- Newsletter
- Paid content
- AI features
- Semantic search
- Recommendation engine
- Multi-language
- Multi-site
- Multi-tenancy
- Plugin marketplace
- Theme marketplace
- Terraform
- Kubernetes
- Complex observability infrastructure

Create clean extension points for future phases, but do not create unused abstractions or placeholder services with no Phase 1 consumer.

---

## 4. Key Architecture Decisions

### 4.1 One application in Phase 1

Use one Next.js application containing:

- Public frontend
- Payload Admin
- Payload REST and GraphQL endpoints
- Payload Local API usage
- Application modules
- PostgreSQL integration

Do not split the CMS and public site into separate deployments yet.

### 4.2 Modular monolith, minimal implementation

Create clear module ownership without building a large abstraction framework.

Initial modules:

```text
content
identity
media
seo
platform
shared
```

Reserved for later phases, but not implemented yet:

```text
community
analytics
search
notification
moderation
```

The basic search page belongs to the `content` module in Phase 1. Introduce a dedicated `search` module only when search behavior becomes substantial.

### 4.3 Payload as infrastructure and CMS

Use Payload for:

- Admin UI
- Authentication
- Collections and globals
- Access control
- PostgreSQL persistence
- Drafts and versions
- Uploads
- REST API
- GraphQL API
- Local API
- Lexical rich text
- Hooks required for cache invalidation and derived values

Keep Payload collection files declarative.

Move reusable operations into module-level functions when they contain business behavior. Do not create a service layer that merely wraps every Payload API call without adding policy or reuse.

### 4.4 Built-in draft/publish state

For Phase 1, Payload's built-in `_status` field is the source of truth:

```text
draft
published
```

Do not create a duplicate `status` field.

The full workflow below is deferred:

```text
draft
→ in_review
→ approved
→ scheduled
→ published
→ archived
```

The future workflow must be added through an ADR and migration without breaking the Phase 1 public query contract.

### 4.5 Authors use the Users collection

Do not create a separate `authors` collection in Phase 1.

A user with role `author`, `editor`, or `super_admin` can be referenced as a post author. Author profile fields live in `users`.

### 4.6 Migration-first PostgreSQL setup

PostgreSQL schema changes must be committed as migrations.

- Local schema push may only be temporarily enabled during initial schema development.
- Before Phase 1 is complete, committed migrations must recreate the schema from an empty database.
- Production configuration must not rely on automatic schema push.

### 4.7 Local media only in Phase 1

Use Payload local uploads for development.

Persist uploads with a Docker volume. Document clearly that production object storage is required in a later phase.

---

## 5. Target Repository Structure

Use the following structure unless the existing repository has a compatible structure that should be preserved:

```text
technology-blog/
├── apps/
│   └── web/
│       ├── public/
│       ├── src/
│       │   ├── app/
│       │   │   ├── (frontend)/
│       │   │   │   ├── layout.tsx
│       │   │   │   ├── page.tsx
│       │   │   │   ├── posts/
│       │   │   │   │   └── [slug]/
│       │   │   │   ├── categories/
│       │   │   │   │   └── [slug]/
│       │   │   │   ├── tags/
│       │   │   │   │   └── [slug]/
│       │   │   │   ├── authors/
│       │   │   │   │   └── [username]/
│       │   │   │   ├── series/
│       │   │   │   │   └── [slug]/
│       │   │   │   └── search/
│       │   │   ├── (payload)/
│       │   │   ├── api/
│       │   │   ├── rss.xml/
│       │   │   ├── sitemap.ts
│       │   │   └── robots.ts
│       │   ├── modules/
│       │   │   ├── content/
│       │   │   │   ├── queries/
│       │   │   │   ├── presentation/
│       │   │   │   ├── validation/
│       │   │   │   └── index.ts
│       │   │   ├── identity/
│       │   │   │   ├── access/
│       │   │   │   └── index.ts
│       │   │   ├── media/
│       │   │   ├── seo/
│       │   │   └── platform/
│       │   ├── payload/
│       │   │   ├── collections/
│       │   │   │   ├── Users.ts
│       │   │   │   ├── Media.ts
│       │   │   │   ├── Categories.ts
│       │   │   │   ├── Tags.ts
│       │   │   │   ├── Series.ts
│       │   │   │   └── Posts.ts
│       │   │   ├── globals/
│       │   │   │   ├── SiteSettings.ts
│       │   │   │   └── Navigation.ts
│       │   │   ├── fields/
│       │   │   │   ├── slugField.ts
│       │   │   │   └── seoFields.ts
│       │   │   ├── access/
│       │   │   ├── hooks/
│       │   │   ├── migrations/
│       │   │   └── seed/
│       │   ├── components/
│       │   │   ├── layout/
│       │   │   ├── content/
│       │   │   └── feedback/
│       │   ├── design-system/
│       │   ├── config/
│       │   ├── shared/
│       │   │   ├── errors/
│       │   │   ├── formatting/
│       │   │   └── payload/
│       │   ├── payload.config.ts
│       │   └── payload-types.ts
│       ├── tests/
│       │   ├── unit/
│       │   ├── integration/
│       │   └── e2e/
│       ├── Dockerfile
│       ├── next.config.mjs
│       ├── package.json
│       └── tsconfig.json
├── docs/
│   ├── adr/
│   ├── architecture/
│   ├── development/
│   └── plans/
├── infrastructure/
│   └── docker/
├── .env.example
├── .gitignore
├── AGENTS.md
├── ChatGPT-Instruction.md
├── docker-compose.yml
├── package.json
├── pnpm-lock.yaml
├── pnpm-workspace.yaml
└── README.md
```

### Structure rules

- Keep `src/payload.config.ts` at the conventional location used by Payload tooling.
- Keep collection definitions under `src/payload/collections`.
- Keep public query functions under the owning module.
- Do not create global `utils`, `helpers`, `common`, or `services` dumping grounds.
- Do not create unused workspace packages in Phase 1.
- Add a package under `packages/` only when at least two applications or packages consume it.

---

## 6. Bootstrap Strategy

### 6.1 Preferred approach

Start from the current official Payload blank or website template that integrates directly with Next.js.

Then adapt it into the target workspace structure.

Do not manually reconstruct Payload's `(payload)` route group if the official template already provides a working and version-compatible implementation.

### 6.2 Version policy

Codex must:

1. Determine the latest stable compatible versions at implementation time.
2. Pin exact versions in `package.json`.
3. Keep these packages aligned to the same Payload release:
   - `payload`
   - `@payloadcms/next`
   - `@payloadcms/db-postgres`
   - `@payloadcms/richtext-lexical`
   - Any official Payload plugin added in Phase 1
4. Commit `pnpm-lock.yaml`.
5. Record the chosen runtime and package versions in `README.md`.

Do not use floating versions in the committed project.

### 6.3 Runtime baseline

Use the Node.js version required by the selected Payload and Next.js versions.

Commit one of:

```text
.nvmrc
```

or:

```text
.node-version
```

Also set `engines.node` in the relevant `package.json`.

---

## 7. Workspace Configuration

Create a minimal pnpm workspace.

### Root `pnpm-workspace.yaml`

```yaml
packages:
  - apps/*
  - packages/*
```

The `packages/*` pattern can remain empty during Phase 1.

### Root scripts

The root `package.json` should expose:

```text
dev
build
start
lint
format
format:check
typecheck
test
test:unit
test:integration
test:e2e
payload
payload:types
payload:importmap
db:migrate
db:migrate:create
db:migrate:status
seed
docker:up
docker:down
docker:logs
validate
```

Use pnpm filters to delegate to `apps/web`.

Example intent:

```json
{
  "scripts": {
    "dev": "pnpm --filter web dev",
    "build": "pnpm --filter web build",
    "validate": "pnpm lint && pnpm typecheck && pnpm test && pnpm build"
  }
}
```

Adjust exact commands to the selected Payload version.

---

## 8. Environment Configuration

Create `.env.example` with no real secrets.

Minimum variables:

```dotenv
NODE_ENV=development

DATABASE_URI=postgresql://blog:blog@localhost:5432/blog
PAYLOAD_SECRET=replace-with-a-long-random-secret
NEXT_PUBLIC_SERVER_URL=http://localhost:3000

POSTGRES_DB=blog
POSTGRES_USER=blog
POSTGRES_PASSWORD=blog

SEED_ADMIN_EMAIL=admin@example.com
SEED_ADMIN_PASSWORD=change-me-locally
SEED_ADMIN_NAME=Administrator
```

Optional local variables:

```dotenv
PORT=3000
LOG_LEVEL=info
ENABLE_SEED_SAMPLE_CONTENT=true
```

### Configuration rules

- Validate required variables at startup.
- Fail fast with a readable error when a required variable is missing.
- Centralize environment access in `src/config/env.ts`.
- Do not call `process.env` throughout modules and components.
- Never expose `PAYLOAD_SECRET`, database credentials, or seed password to the browser.
- Do not commit `.env`.

---

## 9. Docker Setup

### 9.1 Services

`docker-compose.yml` must contain:

```text
postgres
web
```

### 9.2 PostgreSQL

Configure:

- Named data volume
- Health check
- Database, user, and password from environment variables
- Port mapping for local development
- UTF-8 defaults where applicable

### 9.3 Web application

Configure:

- Multi-stage Dockerfile
- pnpm via Corepack
- Dependency caching
- Production build
- Non-root runtime user where compatible
- Port `3000`
- Dependency on PostgreSQL health
- Persistent local upload volume
- Startup command that runs migrations before starting, or a clearly separated migration command documented for deployment

Do not silently run seed data in production startup.

### 9.4 Supported local workflows

#### Workflow A — fastest development

```bash
docker compose up -d postgres
pnpm install
pnpm db:migrate
pnpm seed
pnpm dev
```

#### Workflow B — full container run

```bash
docker compose up --build
```

Document any extra migration or seed command required by Workflow B.

---

## 10. Payload Configuration

Configure Payload in `apps/web/src/payload.config.ts`.

Required configuration:

- PostgreSQL adapter
- Lexical editor
- Users as the admin auth collection
- Collections listed in this plan
- Globals listed in this plan
- Type generation output
- Admin import map
- CORS and CSRF origins derived from validated configuration
- Local upload directory for Media
- Reasonable default depth limits
- GraphQL enabled unless the selected template disables it for a documented reason
- TypeScript strict compatibility

Do not put large business logic in `payload.config.ts`.

It should act as a composition root.

---

## 11. Payload Collections

## 11.1 Users

Collection slug:

```text
users
```

Capabilities:

- `auth: true`
- Used for Payload Admin authentication
- Used as the author source

Fields:

```text
email                 built-in auth field
username              required, unique, indexed
displayName           required
avatar                relationship to media, optional
bio                   textarea or limited rich text, optional
role                  select
status                select
socialLinks           group, optional
expertise             text array, optional
```

Role values:

```text
super_admin
editor
author
```

Status values:

```text
active
disabled
```

Access rules:

- No public create.
- No public list.
- Authenticated admin users can read limited records required by the Admin UI.
- Public author pages must use a sanitized author projection from a server-side query, not expose the raw Users API document.
- `super_admin` can manage all users.
- `editor` cannot create or promote a `super_admin`.
- `author` can update only approved profile fields on their own record.
- Password, authentication internals, role changes, and status changes are never writable through public UI.

Do not implement member registration in Phase 1.

## 11.2 Media

Collection slug:

```text
media
```

Enable Payload upload support.

Fields:

```text
alt                    required
caption                optional
credit                 optional
copyright              optional
```

Image configuration should produce a small, medium, and large responsive size where supported.

Access rules:

- Public read for media referenced by published content.
- Authenticated author/editor/super-admin create.
- Author can update or delete only their own uploads when ownership data is available.
- Editor and super-admin can manage all media.
- Prevent or document the risk of deleting referenced media.

Phase 1 local storage directory:

```text
media/
```

or the conventional path used by the selected Payload template.

Ensure it is ignored by Git and persisted by Docker volume.

## 11.3 Categories

Collection slug:

```text
categories
```

Fields:

```text
name                   required
slug                   required, unique, indexed
description            optional
parent                 self relationship, optional
displayOrder           number, default 0
isActive               checkbox, default true
seo                    reusable SEO group
```

Rules:

- Normalize slug.
- Avoid unlimited hierarchy; Phase 1 UI supports at most one parent level.
- Public queries only expose active categories.

## 11.4 Tags

Collection slug:

```text
tags
```

Fields:

```text
name                   required
slug                   required, unique, indexed
description            optional
isFeatured             checkbox, default false
```

Do not add `usageCount` in Phase 1. It is an aggregate and should be introduced with a controlled aggregation mechanism later.

## 11.5 Series

Collection slug:

```text
series
```

Fields:

```text
title                  required
slug                   required, unique, indexed
description            optional
coverImage             relationship to media, optional
author                 relationship to users, required
isActive               checkbox, default true
seo                    reusable SEO group
```

Series ordering belongs to each post through `seriesOrder`.

## 11.6 Posts

Collection slug:

```text
posts
```

Enable:

- Drafts
- Versions
- Autosave if stable in the selected Payload version
- Timestamps

Fields:

```text
title                  required
slug                   required, unique, indexed
excerpt                required, length constrained
content                required Lexical rich text
coverImage             relationship to media, optional
author                 relationship to users, required
coAuthors              relationship to users, hasMany, optional
category               relationship to categories, required
tags                   relationship to tags, hasMany, optional
series                 relationship to series, optional
seriesOrder            number, optional
featured               checkbox, default false
visibility             select, default public
publishedAt            date, optional
readingTimeMinutes     number, read-only or hook-managed
seo                    reusable SEO group
```

Visibility values implemented in Phase 1:

```text
public
unlisted
```

Reserve, but do not expose or implement:

```text
members_only
private
```

Post rules:

- Payload `_status` is the publication state.
- A published post must have `publishedAt`.
- When `_status` changes to `published` and `publishedAt` is empty, set it once.
- Do not reset `publishedAt` on every edit.
- Public feed queries include only `_status = published`.
- Public feed queries include only `visibility = public`.
- Direct post lookup can include `visibility = unlisted` only when the slug is known.
- Drafts must never appear in public list queries, sitemap, RSS, category pages, tag pages, author pages, or search.
- `slug` is immutable after publication in Phase 1 unless the change is performed by an editor or super-admin.
- Since redirects are deferred, show a warning in Admin when changing the slug of a published post.
- `seriesOrder` is required when `series` is set.
- `readingTimeMinutes` is calculated from normalized plain text.
- Feed queries must not fetch full rich-text content.

### Post access rules

- Public read: only published content satisfying visibility rules.
- Authenticated Admin read:
  - super-admin and editor: all posts
  - author: own posts
- Create:
  - author, editor, super-admin
- Update:
  - author: own drafts only
  - editor and super-admin: all
- Delete:
  - editor and super-admin
- Publish:
  - editor and super-admin
  - authors cannot publish in Phase 1

Enforce these rules server-side through Payload access control and field-level restrictions.

---

## 12. Payload Globals

## 12.1 Site Settings

Global slug:

```text
site-settings
```

Fields:

```text
siteName
siteDescription
siteUrl
logo
favicon
defaultAuthor
defaultSeoTitle
defaultSeoDescription
defaultSocialImage
postsPerPage
enableDarkMode
```

Access:

- Public read through a sanitized server-side query
- Editor and super-admin update
- Author cannot update

## 12.2 Navigation

Global slug:

```text
navigation
```

Fields:

```text
headerLinks[]
  label
  type: internal | external
  reference
  url
  openInNewTab

footerLinks[]
  label
  type: internal | external
  reference
  url
  openInNewTab

footerText
socialLinks[]
```

Validate that an internal link has a reference and an external link has a URL.

Access:

- Public read through a sanitized server-side query
- Editor and super-admin update

---

## 13. Reusable Field Definitions

## 13.1 Slug field

Create a reusable slug field with:

- Lowercase normalization
- Whitespace-to-hyphen conversion
- Repeated-hyphen collapse
- Unsafe character removal
- Manual override support
- Unique database constraint where applicable
- Unit tests

Do not silently regenerate a manually edited slug every time the title changes.

## 13.2 SEO field group

Fields:

```text
metaTitle
metaDescription
canonicalUrl
socialImage
noIndex
```

Rules:

- Fields are optional in Phase 1.
- Public metadata falls back to post or site values.
- `canonicalUrl` must be absolute when supplied.
- SEO warnings should not block saving a draft.
- `noIndex` must be respected by page metadata and sitemap generation.

---

## 14. Rich Text

Use Payload Lexical.

Phase 1 features:

- Paragraph
- Headings
- Bold
- Italic
- Underline if supported by the selected default editor configuration
- Ordered and unordered lists
- Blockquote
- Links
- Upload/image nodes
- Code blocks
- Horizontal rule
- Relationship link to another post if supported without custom complexity

Phase 1 renderer requirements:

- Server-side rendering where possible
- Semantic HTML
- Safe rendering
- Responsive images
- Syntax highlighting for code blocks
- Copy button isolated as a small Client Component
- Graceful handling of unknown nodes
- Tests for at least paragraph, heading, link, upload, and code rendering

Do not convert and persist duplicate HTML for every post. Render Lexical JSON on demand.

Defer custom Mermaid, tabs, accordion, gallery, Gist, video, newsletter CTA, and complex callout blocks.

---

## 15. Application Query Layer

Public React components must not build arbitrary Payload queries.

Create centralized query functions under:

```text
src/modules/content/queries/
```

Required functions:

```ts
getHomePageContent()
getPublishedPostBySlug(slug)
getLatestPosts(input)
getFeaturedPosts(input)
getPostsByCategorySlug(input)
getPostsByTagSlug(input)
getPostsByAuthorUsername(input)
getSeriesBySlug(slug)
getPostsBySeriesSlug(input)
searchPublishedPosts(input)
getPublishedPostsForSitemap()
getPublishedPostsForRss()
```

Also create sanitized platform queries:

```ts
getPublicSiteSettings()
getPublicNavigation()
getPublicAuthorProfile(username)
```

Query rules:

- Use the Payload Local API on the server.
- Always set explicit pagination.
- Use deterministic sorting.
- Use explicit `depth`.
- Avoid N+1 relationship loading.
- Feed queries must select only summary fields.
- Full content is fetched only for post detail.
- Public queries must centrally apply publication and visibility filters.
- Search only title, excerpt, and other fields supported efficiently by the current Payload/PostgreSQL setup.
- Escape and validate user search input.
- Cap page size.

Define public projection types instead of returning unrestricted generated Payload documents to UI components.

---

## 16. Derived Values and Hooks

Hooks must be small and delegate to named functions.

Implement:

### Before validation or before change

- Normalize slug.
- Validate series and series order.
- Set `publishedAt` on first publish.
- Calculate reading time.
- Prevent unauthorized field transitions when access control alone is insufficient.

### After change

- Revalidate affected public routes for a published post.
- Revalidate the old slug path if a published slug changes.
- Revalidate homepage, category, tag, author, and series paths where relevant.

### After delete

- Revalidate affected lists and old detail route.

Do not add:

- Email calls
- Search provider calls
- Analytics calls
- Notifications
- Queue publication
- Long-running network operations

---

## 17. Public Routes

## 17.1 Homepage — `/`

Show:

- Site header
- Featured posts section
- Latest posts section
- Category links
- Responsive post cards
- Footer

Behavior:

- Empty state when no content exists
- Paginated or limited latest-post query
- No draft leakage
- No full rich-text documents in list query

## 17.2 Post detail — `/posts/[slug]`

Show:

- Title
- Excerpt
- Cover image
- Author
- Publication date
- Reading time
- Category
- Tags
- Series information
- Lexical content
- Previous/next series links when applicable
- Basic share links without event tracking

Behavior:

- Return `notFound()` for missing or non-public content.
- `unlisted` posts are accessible by direct URL but excluded from feeds and indexes.
- Generate article metadata and basic JSON-LD.
- Respect `noIndex`.

## 17.3 Category — `/categories/[slug]`

Show active category information and paginated published posts.

## 17.4 Tag — `/tags/[slug]`

Show tag information and paginated published posts.

## 17.5 Author — `/authors/[username]`

Show only approved public profile fields and published posts.

Never expose auth fields or the raw Users record.

## 17.6 Series — `/series/[slug]`

Show series metadata and published posts sorted deterministically by:

```text
seriesOrder ascending
publishedAt ascending
```

## 17.7 Search — `/search?q=...`

Implement basic server-side search.

Requirements:

- Minimum query length
- Maximum query length
- Pagination
- Published and public posts only
- Clear empty state
- No external search provider
- No search analytics

---

## 18. Layout and Design System

Use a minimal, professional technology-blog design.

Create reusable components:

```text
SiteHeader
SiteFooter
Container
PostCard
PostList
FeaturedPostCard
AuthorSummary
TaxonomyLinks
Pagination
RichTextRenderer
CodeBlock
EmptyState
ErrorState
LoadingSkeleton
```

Rules:

- Mobile-first
- Semantic HTML
- Keyboard accessible
- Visible focus indicators
- Correct heading hierarchy
- Sufficient color contrast
- Image alt text
- Reduced motion support
- No large duplicated Tailwind class strings
- No UI library unless justified
- Dark mode may be supported through a simple CSS strategy if enabled in Site Settings, but it must not delay core acceptance criteria

---

## 19. Metadata, Sitemap, RSS, and Robots

### Metadata

Implement:

- Site defaults from Site Settings
- Per-post title and description fallback
- Canonical URL
- Open Graph image fallback
- Article metadata
- Basic `BlogPosting` JSON-LD
- `noIndex`

### Sitemap

Include:

- Homepage
- Published public posts
- Active category pages
- Tag pages that contain published posts
- Author pages that contain published posts
- Active series pages

Exclude:

- Drafts
- Unlisted posts
- Noindex content
- Admin routes
- Payload API routes

### RSS

Include recent published public posts.

Each item should contain:

- Title
- URL
- Excerpt
- Publication date
- Author
- Category where available

Do not expose draft content or private author fields.

### Robots

Allow the public site and disallow Admin/API paths where appropriate. Do not rely on `robots.txt` as a security boundary.

---

## 20. Caching and Revalidation

Phase 1 caching must be explicit and understandable.

Recommended behavior:

```text
Homepage                  cached with revalidation
Post detail               cached with on-demand invalidation
Category/tag/author        cached with revalidation
Series                    cached with revalidation
Search                    dynamic
Admin                     dynamic
Payload API               framework defaults
```

Implementation requirements:

- Centralize cache tags or path constants.
- Invalidate affected content after publish, update, or delete.
- Do not cache authenticated or private Payload data in shared public caches.
- Development behavior must remain predictable.
- If the selected Payload template includes a stable revalidation pattern, reuse it.

Do not add Redis.

---

## 21. Access-Control Matrix

| Resource | Public | Author | Editor | Super Admin |
|---|---:|---:|---:|---:|
| Published public post read | Yes | Yes | Yes | Yes |
| Draft post read | No | Own | All | All |
| Create post | No | Yes | Yes | Yes |
| Edit draft | No | Own | All | All |
| Publish post | No | No | Yes | Yes |
| Delete post | No | No | Yes | Yes |
| Read public media | Yes | Yes | Yes | Yes |
| Upload media | No | Yes | Yes | Yes |
| Manage own profile | No | Limited | Limited | Yes |
| Manage users | No | No | Limited | Yes |
| Manage categories/tags/series | Read via site | No | Yes | Yes |
| Manage navigation/settings | Read via site | No | Yes | Yes |

Codex must implement and test the server-side rules represented by this matrix.

---

## 22. Seed Data

Create an idempotent seed command using the Payload Local API.

Seed:

- One `super_admin` from environment variables
- One sample author
- At least three categories
- At least five tags
- One series
- At least three posts:
  - one featured published post
  - one regular published post
  - one draft post
- Site Settings
- Header and footer Navigation

Seed requirements:

- Safe to run multiple times.
- Use stable lookup keys such as email and slug.
- Update existing seed records rather than create duplicates.
- Never log the seed password.
- Do not run automatically in production.
- Sample content must exercise Lexical rendering.

---

## 23. Database Migrations

Deliver:

- Initial committed migration
- Migration index or equivalent generated by Payload
- Scripts for create, run, status, and rollback when supported
- Documentation for local and production migration flow

Validation procedure:

1. Remove the local test database.
2. Start an empty PostgreSQL instance.
3. Run committed migrations.
4. Run seed.
5. Start the application.
6. Verify Admin and public pages.

The project is not complete if it only works against a database created through uncommitted schema push.

---

## 24. Health and Error Handling

Add:

```text
GET /api/health/live
GET /api/health/ready
```

### Liveness

Returns success when the Next.js process can respond.

### Readiness

Checks:

- Required configuration loaded
- PostgreSQL connectivity through a lightweight query or Payload initialization

Do not expose credentials, stack traces, or internal configuration.

Public pages must provide:

- `not-found.tsx`
- route-level error handling where useful
- safe user-facing messages
- server-side structured logs for unexpected failures

---

## 25. Testing Strategy

Use the testing tools already present in the selected official template where suitable. Otherwise prefer:

- Vitest for unit and integration tests
- Playwright for critical E2E smoke tests

### 25.1 Unit tests

Minimum:

- Slug normalization
- Reading-time calculation
- Post public-visibility predicate
- Role helper functions
- SEO fallback generation

### 25.2 Integration tests

Use a real PostgreSQL test database or test container.

Minimum:

- Create a draft post
- Draft is not returned by public query
- Publish a post
- Published post is returned by slug
- Author cannot publish
- Editor can publish
- Sitemap excludes draft and unlisted posts
- Seed is idempotent

### 25.3 E2E smoke tests

Minimum:

1. Homepage loads.
2. Published seeded post is visible.
3. Post detail renders.
4. Draft URL returns not found.
5. Admin login page loads.
6. Health endpoints return expected status.

Do not add broad snapshot tests for business behavior.

---

## 26. Documentation Deliverables

Create or update:

### `README.md`

Include:

- Project overview
- Stack
- Prerequisites
- Environment setup
- Local start
- Docker start
- Migration commands
- Seed command
- Test commands
- Production build
- Admin URL
- Public URL
- Troubleshooting
- Phase 1 limitations

### `AGENTS.md`

Include:

- Required files to read before implementation
- Module ownership
- No business logic in UI
- No large hooks
- No draft leakage
- Migration requirements
- Test and validation commands
- Rules for adding dependencies

Do not duplicate the entire long project instruction. Link to `ChatGPT-Instruction.md` and summarize the most execution-critical rules.

### Architecture docs

Create:

```text
docs/architecture/phase-1-overview.md
docs/architecture/module-boundaries.md
docs/architecture/data-flow.md
docs/development/local-setup.md
docs/development/migrations.md
```

### ADRs

Create at least:

```text
ADR-0001-use-payload-cms.md
ADR-0002-modular-monolith.md
ADR-0003-use-postgresql.md
ADR-0004-use-payload-built-in-drafts-for-phase-1.md
ADR-0005-local-media-storage-in-phase-1.md
```

Keep ADRs concise and state consequences.

---

## 27. CI Baseline

Create a CI workflow that runs on pull requests and main-branch pushes.

Required steps:

```text
checkout
setup Node
enable Corepack
pnpm install --frozen-lockfile
format check
lint
type check
unit tests
integration tests
Payload type generation verification
production build
```

Recommended:

- Start PostgreSQL as a service container for integration tests.
- Verify generated types are committed and up to date.
- Cache pnpm store.
- Do not deploy in Phase 1 CI unless deployment infrastructure already exists.

---

## 28. Implementation Sequence

Codex must follow this sequence to reduce rework.

### Step 0 — Inspect and record assumptions

- Read project instructions.
- Inspect the repository.
- Identify existing files to preserve.
- Record selected Node, Next.js, Payload, PostgreSQL adapter, and pnpm versions.
- Confirm the official template used.
- Add unresolved issues to the final implementation report rather than inventing behavior.

### Step 1 — Bootstrap workspace

- Create root pnpm workspace.
- Scaffold `apps/web` from the official Payload template.
- Preserve working Payload route files.
- Add root scripts.
- Configure TypeScript strict mode.
- Add formatting and linting.
- Commit lockfile.

**Exit criteria:** Payload application starts against a temporary database configuration.

### Step 2 — PostgreSQL and environment

- Add PostgreSQL adapter.
- Add typed environment validation.
- Add Docker Compose PostgreSQL service.
- Configure Payload secret, URL, CORS, and CSRF.
- Add health endpoints.

**Exit criteria:** Application initializes against PostgreSQL and readiness succeeds.

### Step 3 — Collections and globals

Implement in this order:

1. Users
2. Media
3. Categories
4. Tags
5. Series
6. Posts
7. Site Settings
8. Navigation

Then:

- Generate Payload types.
- Generate Admin import map.
- Create initial migration.

**Exit criteria:** Admin can manage every Phase 1 collection and global.

### Step 4 — Access control

- Implement role helpers.
- Implement ownership checks.
- Implement post draft/public filters.
- Implement publish restrictions.
- Implement field-level restrictions.
- Add unit and integration tests.

**Exit criteria:** Drafts cannot leak and authors cannot publish.

### Step 5 — Content module and rendering

- Implement centralized public query layer.
- Implement public projection types.
- Implement reading-time extraction.
- Implement Lexical renderer.
- Implement post card and taxonomy components.

**Exit criteria:** Server components can retrieve and render seeded published content.

### Step 6 — Public routes

Implement in order:

1. Shared frontend layout
2. Homepage
3. Post detail
4. Category
5. Tag
6. Author
7. Series
8. Search
9. Not-found and error states

**Exit criteria:** All public routes work with real Payload data.

### Step 7 — SEO and syndication

- Metadata
- Canonical URLs
- JSON-LD
- Robots
- Sitemap
- RSS
- Noindex behavior

**Exit criteria:** Drafts and unlisted posts are absent from public indexes and feeds.

### Step 8 — Revalidation

- Add cache policy.
- Add thin hooks.
- Revalidate affected routes.
- Test publish/update behavior.

**Exit criteria:** Published changes become visible without a full redeploy.

### Step 9 — Seed and Docker completion

- Add idempotent seed.
- Add production Dockerfile.
- Add upload volume.
- Verify host-development and full-container workflows.

**Exit criteria:** A new developer can start from an empty checkout and database.

### Step 10 — Testing and CI

- Complete required unit tests.
- Complete integration tests.
- Add Playwright smoke tests.
- Add CI workflow.
- Run full validation.

**Exit criteria:** CI-equivalent validation succeeds locally.

### Step 11 — Documentation and implementation report

- Complete README and architecture docs.
- Complete ADRs.
- Summarize files changed.
- List commands run and actual results.
- List known limitations.
- List Phase 2 extension points.

---

## 29. Required Commands to Validate

Codex must expose and run commands equivalent to:

```bash
pnpm install
pnpm format:check
pnpm lint
pnpm typecheck
pnpm payload:types
pnpm payload:importmap
pnpm db:migrate
pnpm seed
pnpm test:unit
pnpm test:integration
pnpm test:e2e
pnpm build
```

Also validate:

```bash
docker compose config
docker compose up --build
```

When full Docker execution is not possible in the environment, Codex must state that clearly and still validate the Docker configuration statically.

---

## 30. Acceptance Criteria

Phase 1 is accepted only when all mandatory criteria are satisfied.

### 30.1 Setup

- [ ] Fresh clone installs with pnpm.
- [ ] `.env.example` documents every required variable.
- [ ] PostgreSQL starts through Docker Compose.
- [ ] Committed migrations create the database schema.
- [ ] Seed runs successfully and is idempotent.
- [ ] Application starts locally.
- [ ] Application builds for production.

### 30.2 Payload Admin

- [ ] `/admin` loads.
- [ ] Seeded super-admin can sign in.
- [ ] Admin can manage Users, Media, Categories, Tags, Series, Posts, Site Settings, and Navigation.
- [ ] Lexical editor works for post content.
- [ ] Draft and version behavior works.
- [ ] Author cannot publish.
- [ ] Editor and super-admin can publish.

### 30.3 Public site

- [ ] Homepage displays seeded published posts.
- [ ] Featured section works.
- [ ] Post detail renders Lexical content.
- [ ] Category, tag, author, and series routes work.
- [ ] Basic search returns published public posts.
- [ ] Draft post is inaccessible publicly.
- [ ] Unlisted post is excluded from homepage, search, sitemap, and RSS.
- [ ] Responsive layout works at mobile and desktop widths.
- [ ] Empty and not-found states are present.

### 30.4 SEO and feeds

- [ ] Page metadata uses site and post data.
- [ ] Canonical URL is generated.
- [ ] Post JSON-LD is present.
- [ ] Sitemap excludes drafts, unlisted posts, and noindex content.
- [ ] RSS contains published public posts only.
- [ ] Robots configuration is present.

### 30.5 Quality

- [ ] Strict TypeScript passes.
- [ ] No unjustified `any`.
- [ ] Lint passes.
- [ ] Formatting check passes.
- [ ] Required unit tests pass.
- [ ] Required integration tests pass.
- [ ] E2E smoke tests pass.
- [ ] No secrets are committed.
- [ ] Generated Payload types are current.
- [ ] README setup instructions are reproducible.

---

## 31. Definition of Done

Phase 1 is done when:

1. All acceptance criteria pass.
2. The app runs from an empty database using committed migrations.
3. The seed produces a usable demo.
4. Payload Admin and the public site use the same application and database.
5. Public data access is centralized.
6. Draft content is protected server-side.
7. The code is organized by clear module ownership.
8. Docker and local development instructions are documented.
9. Tests cover the critical publication boundary.
10. No Phase 2 feature has been prematurely implemented.
11. Codex provides an honest implementation report with:
    - Files changed
    - Architecture decisions
    - Migration impact
    - Security impact
    - Commands executed
    - Actual test results
    - Known limitations
    - Recommended next phase

---

## 32. Known Risks and Mitigations

### Risk: Payload template structure changes

**Mitigation:** Start from the current official template and preserve its generated route integration. Adapt around it rather than reconstructing version-sensitive files from memory.

### Risk: Payload packages use mismatched versions

**Mitigation:** Pin all official Payload packages to the same exact release and commit the lockfile.

### Risk: Draft content leaks through custom queries

**Mitigation:** Centralize public visibility filters, test them against a real database, and prohibit arbitrary Payload queries in public components.

### Risk: Author privilege escalation

**Mitigation:** Enforce role and ownership rules in Payload access functions and field-level access. Add integration tests for publish denial and role changes.

### Risk: Local uploads disappear in containers

**Mitigation:** Use a named Docker volume and document that S3-compatible storage is required before production.

### Risk: Schema works only through development push

**Mitigation:** Recreate a clean database using committed migrations before declaring Phase 1 complete.

### Risk: Over-engineering slows the scaffold

**Mitigation:** Create modules and named operations only where they own real Phase 1 behavior. Do not create queues, providers, repositories, or event buses with no consumer.

### Risk: Build requires a live database

**Mitigation:** Follow the current official Payload guidance for Next.js build behavior. Avoid database-dependent static generation during build, or use the supported build mode for the selected versions.

---

## 33. Phase 2 Handoff Boundaries

Phase 1 must leave clear points for the next implementation phase.

Expected Phase 2 candidates:

```text
editorial workflow
scheduled publishing
redirects
preview hardening
comments and moderation
reactions and bookmarks
analytics event ingestion
post statistics
search abstraction
S3-compatible media storage
rate limiting
audit log
background jobs
```

Before Phase 2:

- Review actual Phase 1 code and schema.
- Do not assume extension points exist unless they were implemented and documented.
- Add migrations for all schema changes.
- Preserve the public query contracts where practical.
- Introduce internal events only when there is a real cross-module consumer.

---

## 34. Final Codex Reporting Template

After implementation, Codex must return:

```text
Summary

Versions selected

Architecture implemented

Files created or changed

Collections and globals

Public routes

Access-control behavior

Database migration impact

Docker and environment setup

Tests added

Commands executed and results

Known limitations

Deviations from the plan

Recommended Phase 2 work
```

Do not use phrases such as “production-ready” unless every production requirement in the main project instruction has been implemented and verified. Phase 1 should be described as a runnable foundation or scaffold.
