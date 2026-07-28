# PROJECT INSTRUCTIONS — TECHNOLOGY BLOG FRAMEWORK

## 1. Project Overview

This project builds a reusable, production-ready technology blog framework using:

- Next.js with App Router
- Payload CMS
- TypeScript
- PostgreSQL
- Payload Lexical Rich Text Editor
- S3-compatible object storage
- Docker
- pnpm
- Tailwind CSS
- A modular monolith architecture

The framework must support both:

1. A public-facing technology blog.
2. A CMS/admin application for managing content, users, moderation, analytics, and configuration.

The system must be designed so it can initially run as one deployable application but can later scale into multiple processes or services without rewriting the core business logic.

The primary objectives are:

- Fast initial development.
- Clear module boundaries.
- High maintainability.
- Strong type safety.
- Extensibility through reusable modules and plugins.
- Production readiness.
- Scalability without premature microservices.
- Compatibility with AI coding agents.
- Ability to reuse the framework for multiple future blogs.

---

# 2. Primary Product Requirements

The framework must support the following capabilities.

## 2.1 Content Management

The CMS must support:

- Posts
- Categories
- Tags
- Authors
- Series
- Media
- Navigation
- Site settings
- SEO metadata
- Drafts
- Review workflow
- Scheduled publishing
- Preview
- Version history
- Archive
- Redirects
- Featured posts
- Related posts
- Search indexing
- RSS
- Sitemap
- Social metadata

Post lifecycle:

```text
draft
→ in_review
→ approved
→ scheduled
→ published
→ archived
```

Authorization rules must control who can perform each state transition.

## 2.2 Public Blog

The public site must provide:

- Homepage
- Post detail page
- Category pages
- Tag pages
- Author pages
- Series pages
- Search
- Featured posts
- Latest posts
- Popular posts
- Trending posts
- Related posts
- Responsive design
- Dark mode support if enabled
- RSS
- Sitemap
- Structured data
- Social sharing
- Reading time
- Table of contents
- Syntax-highlighted code blocks

## 2.3 User and Community Features

The system must support:

- User registration
- Login and logout
- Email verification
- Password reset
- User profile
- Commenting
- Comment replies
- Comment moderation
- Like or reaction
- Bookmark
- Content reporting
- Notifications
- Rate limiting
- Spam protection

Optional future community features:

- Following authors
- Following tags
- Following series
- User reputation
- Badges
- Saved collections
- Web push notifications
- Mentions
- Community feed

## 2.4 Analytics

The system must support:

- Page views
- Unique views
- Article views
- Reading completion
- Average reading percentage
- Referrer source
- UTM tracking
- Device type
- Search events
- Share events
- Like events
- Comment events
- Bookmark events
- Trending calculation
- Popular posts
- Analytics dashboard for editors

Do not implement view tracking by directly incrementing a single `viewCount` field on every page request.

Use:

```text
raw event
→ validation and deduplication
→ aggregation
→ statistics read model
```

## 2.5 Extensibility

The framework must be designed to support future additions such as:

- Newsletter
- Membership
- Paid content
- AI summaries
- AI-assisted authoring
- AI content review
- Semantic search
- Recommendation engine
- Multi-language content
- Multi-site deployment
- Multi-tenancy
- Theme marketplace
- Plugin marketplace
- External content integrations

---

# 3. Architecture Principles

## 3.1 Modular Monolith First

Build the system as a modular monolith.

Do not introduce microservices unless there is a demonstrated operational or scaling requirement.

Initial deployment should preferably contain:

```text
Next.js public site
Payload Admin
Payload API
Application modules
PostgreSQL
Object storage
```

Background processing may later run as a separate worker process.

## 3.2 Module Boundaries

Organize the system into explicit modules:

```text
content
identity
community
analytics
search
notification
moderation
seo
media
platform
shared
```

Each module must own:

- Business rules
- Application services
- Repository interfaces where needed
- Types and contracts
- Validation
- Tests
- Events
- Module-specific documentation

A module must not arbitrarily access another module’s database collections.

Cross-module interactions should occur through:

- Application services
- Explicit interfaces
- Domain events
- Shared contracts

Example:

```text
Community module
must not directly update posts.likeCount.

Community module
must call an engagement aggregation service
or publish a ReactionCreated event.
```

## 3.3 Payload Is Infrastructure, Not the Entire Architecture

Payload provides:

- CMS admin
- Collection definitions
- Authentication
- Access control
- Persistence integration
- Upload handling
- Local API
- REST API
- GraphQL API
- Hooks
- Jobs
- Rich-text editing

Business logic must not be placed indiscriminately inside Payload collection definitions or hooks.

Payload collection files should remain declarative where possible.

Complex business logic must be delegated to application services.

Bad:

```ts
hooks: {
  afterChange: [
    async ({ doc }) => {
      // hundreds of lines of analytics,
      // notifications, search indexing,
      // email and recommendation logic
    },
  ],
}
```

Preferred:

```ts
hooks: {
  afterChange: [
    async ({ doc, previousDoc, req }) => {
      await postLifecycleService.handleChange({
        doc,
        previousDoc,
        requestContext: req,
      })
    },
  ],
}
```

## 3.4 Dependency Direction

Preferred dependency direction:

```text
UI
→ application services
→ domain logic
→ repository and provider interfaces
→ Payload/PostgreSQL/external providers
```

Domain and application logic must not depend directly on React components or HTTP request objects.

## 3.5 Explicit Read and Write Operations

Separate read and write use cases logically.

Write examples:

```text
createPost
submitPostForReview
approvePost
publishPost
schedulePost
archivePost
addComment
moderateComment
addReaction
bookmarkPost
```

Read examples:

```text
getPublishedPostBySlug
getPostFeed
getPostsByCategory
getPostsByTag
getTrendingPosts
getRelatedPosts
getCommentThread
getPostStatistics
```

Do not let frontend components construct arbitrary Payload queries throughout the codebase.

Create centralized query functions and application services.

---

# 4. Repository Structure

Use a monorepo structure.

Recommended structure:

```text
technology-blog/
├── apps/
│   └── web/
│       ├── src/
│       │   ├── app/
│       │   │   ├── (public)/
│       │   │   ├── (member)/
│       │   │   ├── (payload)/
│       │   │   └── api/
│       │   ├── payload/
│       │   │   ├── collections/
│       │   │   ├── globals/
│       │   │   ├── fields/
│       │   │   ├── blocks/
│       │   │   ├── hooks/
│       │   │   ├── access/
│       │   │   ├── migrations/
│       │   │   └── payload.config.ts
│       │   ├── modules/
│       │   │   ├── content/
│       │   │   ├── identity/
│       │   │   ├── community/
│       │   │   ├── analytics/
│       │   │   ├── search/
│       │   │   ├── notification/
│       │   │   ├── moderation/
│       │   │   ├── seo/
│       │   │   └── platform/
│       │   ├── components/
│       │   ├── design-system/
│       │   ├── providers/
│       │   ├── config/
│       │   └── shared/
│       └── tests/
├── packages/
│   ├── contracts/
│   ├── config/
│   ├── eslint-config/
│   ├── tsconfig/
│   ├── test-utils/
│   └── ui/
├── infrastructure/
│   ├── docker/
│   ├── nginx/
│   ├── monitoring/
│   └── terraform/
├── docs/
│   ├── architecture/
│   ├── adr/
│   ├── domain/
│   ├── operations/
│   └── development/
├── AGENTS.md
├── docker-compose.yml
├── pnpm-workspace.yaml
└── package.json
```

Do not create generic folders such as:

```text
utils
helpers
common
misc
services
```

unless their purpose and ownership are clearly defined.

Prefer module-specific utilities over a global utility dumping ground.

---

# 5. Domain Model

## 5.1 Posts

The `posts` collection should support:

```text
id
title
slug
excerpt
content
coverImage
status
publishedAt
scheduledAt
author
coAuthors
category
tags
series
seriesOrder
readingTime
featured
visibility
seo
createdAt
updatedAt
```

Suggested values:

```text
status:
- draft
- in_review
- approved
- scheduled
- published
- archived
```

```text
visibility:
- public
- members_only
- unlisted
- private
```

Important rules:

- Slug must be unique within its applicable scope.
- Published posts must have `publishedAt`.
- Scheduled posts must have `scheduledAt`.
- Archived posts must not appear in normal feeds.
- Changing a published slug must create a redirect.
- Authors must not publish unless explicitly authorized.
- Public queries must only return content that is actually visible.
- Preview must not expose draft content publicly.

## 5.2 Categories

Suggested fields:

```text
name
slug
description
parent
icon
displayOrder
isActive
seo
```

Support hierarchical categories, but avoid deep category trees.

## 5.3 Tags

Suggested fields:

```text
name
slug
description
usageCount
isFeatured
```

Tag usage counts should be maintained through controlled aggregation.

## 5.4 Series

Suggested fields:

```text
title
slug
description
coverImage
author
status
seo
```

Posts in a series must have deterministic ordering.

## 5.5 Users

Suggested fields:

```text
email
username
displayName
avatar
bio
role
status
emailVerified
lastLoginAt
preferences
socialLinks
expertise
```

Roles:

```text
super_admin
editor
author
moderator
member
```

Role checks alone are not enough.

Authorization must also evaluate:

- Resource ownership
- Document status
- Requested transition
- Field-level permissions
- Tenant or site scope if introduced later

## 5.6 Comments

Suggested fields:

```text
post
author
parentComment
content
status
depth
replyCount
likeCount
editedAt
moderatedBy
moderationReason
createdAt
updatedAt
```

Statuses:

```text
pending
published
hidden
spam
deleted
```

Rules:

- Limit reply depth.
- Sanitize content.
- Do not allow arbitrary HTML.
- Use soft delete for published comments.
- Preserve thread integrity after deletion.
- Rate-limit creation and editing.
- Record moderation actions.

## 5.7 Reactions

Suggested fields:

```text
targetType
targetId
user
reactionType
createdAt
```

Initial reaction type:

```text
like
```

Future reaction types may include:

```text
useful
insightful
love
```

Enforce uniqueness equivalent to:

```text
user + targetType + targetId + reactionType
```

Reaction operations must be idempotent.

## 5.8 Bookmarks

Suggested fields:

```text
user
post
collection
createdAt
```

Enforce one bookmark per user and post.

## 5.9 Analytics Events

Suggested fields:

```text
eventType
postId
anonymousIdHash
userId
sessionId
referrerDomain
utmSource
utmMedium
utmCampaign
deviceType
countryCode
metadata
occurredAt
```

Do not store raw IP addresses unless explicitly required and legally reviewed.

## 5.10 Post Statistics

Suggested fields:

```text
postId
totalViews
uniqueViews
views24h
views7d
views30d
likes
comments
bookmarks
shares
averageReadPercent
trendingScore
updatedAt
```

Statistics are read models derived from source events and transactional entities.

---

# 6. Content Workflow

Required workflow:

```text
Draft
→ In Review
→ Approved
→ Scheduled or Published
→ Archived
```

Rules:

- Authors can edit their own drafts.
- Authors cannot publish unless explicitly permitted.
- Editors can review, approve, schedule, publish, and archive.
- Moderators manage community content, not editorial content by default.
- Every significant state transition should be auditable.
- Scheduled publishing must be idempotent.
- Publishing must trigger cache invalidation.
- Publishing must trigger search indexing.
- Publishing may trigger notifications asynchronously.
- Publishing must validate required SEO and content fields.

When a post is published:

```text
1. Validate workflow transition.
2. Validate required fields.
3. Calculate reading time.
4. Normalize the slug.
5. Persist the state change.
6. Update search index.
7. Invalidate affected caches.
8. Update sitemap-related data.
9. Queue notifications.
10. Emit a PostPublished event.
```

Do not perform slow network operations synchronously inside the publish transaction.

---

# 7. Rich-Text Content

Use Payload Lexical Editor.

Support structured content blocks such as:

```text
paragraph
heading
quote
image
gallery
code
callout
table
video
GitHub Gist
Mermaid diagram
tabs
accordion
related post
newsletter CTA
```

Each custom block must have:

- Payload field definition
- TypeScript type
- Validation
- Public renderer
- Admin preview where appropriate
- Tests
- Migration strategy

For code blocks support:

- Programming language
- Filename
- Caption
- Copy button
- Highlighted lines
- Diff mode
- Line wrapping
- Syntax highlighting

Do not store entire post content as uncontrolled HTML.

Do not render untrusted HTML without sanitization.

---

# 8. API and Application Services

Use application services for business operations.

Example interfaces:

```ts
interface PostCommandService {
  createPost(input: CreatePostInput): Promise<Post>
  submitForReview(postId: string, actor: Actor): Promise<Post>
  approvePost(postId: string, actor: Actor): Promise<Post>
  publishPost(postId: string, actor: Actor): Promise<Post>
  schedulePost(
    postId: string,
    scheduledAt: Date,
    actor: Actor
  ): Promise<Post>
  archivePost(postId: string, actor: Actor): Promise<Post>
}
```

```ts
interface PostQueryService {
  getPublishedPostBySlug(slug: string): Promise<PublishedPost | null>
  getLatestPosts(query: LatestPostsQuery): Promise<PaginatedPosts>
  getPostsByCategory(query: CategoryPostsQuery): Promise<PaginatedPosts>
  getPostsByTag(query: TagPostsQuery): Promise<PaginatedPosts>
  getTrendingPosts(query: TrendingPostsQuery): Promise<PostSummary[]>
}
```

Provider abstractions may include:

```ts
interface SearchProvider {}
interface StorageProvider {}
interface EmailProvider {}
interface AnalyticsProvider {}
interface NotificationChannel {}
interface CacheProvider {}
interface SpamDetectionProvider {}
```

Avoid unnecessary interfaces around stable internal code.

Create interfaces primarily at boundaries where:

- External vendors may change.
- Separate modules interact.
- Infrastructure must be substituted in tests.
- A future service extraction is likely.

---

# 9. Frontend Rules

Use Next.js App Router.

Prefer:

- Server Components for data-heavy and content-rendering pages.
- Client Components only for interactive behavior.
- Server Actions or Route Handlers for controlled mutations.
- Centralized query services.
- Explicit cache policies.
- Accessible semantic HTML.
- Responsive mobile-first design.

Do not turn an entire page into a Client Component simply because one button is interactive.

Interactive features such as:

- Like
- Bookmark
- Comment form
- Share action
- Theme switcher

should be isolated into small Client Components.

## 9.1 Rendering and Caching

Recommended behavior:

```text
Homepage:
cached with on-demand revalidation

Post detail:
cached and invalidated on publish/update

Category/tag pages:
cached

Search:
dynamic or short-lived cache

Member account:
dynamic and private

Admin:
dynamic

Comments:
dynamic and paginated
```

On content publish or update, revalidate:

```text
post page
homepage
affected category pages
affected tag pages
series page
author page
related content caches
```

Do not cache personalized data using shared public cache keys.

## 9.2 Design System

Use reusable design tokens and components.

Create consistent components for:

- Typography
- Buttons
- Form controls
- Cards
- Alerts
- Dialogs
- Dropdowns
- Pagination
- Skeleton loading
- Empty states
- Error states
- Code blocks
- Content layout
- Comment threads

Avoid copying large Tailwind class strings across many components.

---

# 10. SEO Requirements

Support:

- Meta title
- Meta description
- Canonical URL
- Open Graph
- Twitter/X cards
- Article structured data
- Breadcrumb structured data
- Author structured data
- Sitemap
- RSS
- robots.txt
- Redirects
- Noindex controls
- Image alt text
- Stable URL conventions

Recommended routes:

```text
/posts/{slug}
/categories/{slug}
/tags/{slug}
/authors/{username}
/series/{slug}
```

Do not include publication dates in URLs unless explicitly required.

On changing a published slug:

```text
old URL
→ permanent redirect
→ new canonical URL
```

SEO validations should generally warn editors rather than block publishing for every stylistic issue.

Hard failures should be reserved for invalid or missing critical fields.

---

# 11. Search

Start with Payload Search or PostgreSQL full-text search.

Use a search abstraction:

```ts
interface SearchProvider {
  indexPost(post: SearchDocument): Promise<void>
  removePost(postId: string): Promise<void>
  search(query: SearchQuery): Promise<SearchResult>
}
```

Search document should include:

```text
postId
title
slug
excerpt
plainTextContent
author
category
tags
publishedAt
popularityScore
```

Do not expose draft or private content in public search.

Only move to Meilisearch or OpenSearch when justified by:

- Large document volume
- Advanced typo tolerance
- Complex facets
- Search analytics
- Hybrid search
- Semantic search
- PostgreSQL latency limits

---

# 12. Analytics and View Tracking

Do not increment post views directly during server rendering.

Use an event endpoint.

Possible event types:

```text
page_view
article_view
article_read
article_complete
share
like
comment
bookmark
search
```

An article view may be counted only after criteria such as:

- Page successfully loaded.
- Visitor stayed for a minimum duration.
- Visitor scrolled or interacted.
- Request is not from a known bot.
- Session and post combination is not duplicated within a defined window.

Use privacy-conscious identifiers.

Raw events should be aggregated periodically.

Trending must use recent engagement and time decay, not lifetime views only.

Example starting model:

```text
engagement score =
views24h
+ weighted unique views
+ weighted likes
+ weighted comments
+ weighted bookmarks
+ weighted shares
```

Then apply time decay based on post age.

Weights must be configurable and adjusted using real data.

---

# 13. Comment and Moderation Rules

Initial capabilities:

- Create comment
- Reply to comment
- Edit own comment
- Soft-delete own comment
- Moderator hide
- Moderator mark as spam
- Like comment
- Report comment
- Pagination
- Rate limiting

Do not implement initially:

- Unlimited nesting
- File attachments
- Rich HTML comments
- Real-time updates
- Complex reputation
- Gamification

Security requirements:

- Validate input length.
- Sanitize rendered output.
- Restrict links.
- Apply spam heuristics.
- Apply per-user and per-IP rate limits where appropriate.
- Preserve audit history.
- Avoid leaking moderation metadata publicly.

---

# 14. Authentication and Authorization

Authentication must be server-enforced.

Authorization must exist at:

- Payload access-control level
- Application-service level
- API mutation level
- Field level where necessary

Never rely exclusively on:

- Hidden frontend buttons
- Client-side role checks
- Route visibility
- User-provided identifiers

Sensitive operations must verify:

```text
actor identity
actor role
resource ownership
resource status
requested transition
field-level permissions
```

Use secure cookies and appropriate session handling.

Protect against:

- CSRF
- XSS
- Brute-force login
- Credential stuffing
- Privilege escalation
- IDOR
- Mass assignment
- Open redirects

---

# 15. Background Jobs

Background jobs may include:

```text
scheduled publishing
analytics aggregation
search indexing
email notification
newsletter delivery
trending refresh
orphan media cleanup
expired token cleanup
AI summary generation
spam classification
search index rebuild
```

Each job must support:

- Idempotency
- Retry
- Maximum attempts
- Failure logging
- Dead-letter handling where applicable
- Execution history
- Trace or request correlation
- Safe reprocessing

Do not expose unprotected public endpoints for cron execution.

Do not assume an in-memory scheduler is reliable in a multi-instance environment.

---

# 16. Events

Use explicit internal events for important cross-module operations.

Examples:

```text
PostCreated
PostSubmittedForReview
PostApproved
PostPublished
PostArchived
PostSlugChanged
CommentCreated
CommentModerated
ReactionCreated
ReactionRemoved
BookmarkCreated
UserRegistered
```

Events should:

- Use stable schemas.
- Include event version.
- Include event ID.
- Include occurred timestamp.
- Include actor and correlation information where appropriate.
- Avoid embedding excessive private data.
- Be safe for retries.

Initially, events may be handled in-process.

The design should allow moving handlers to an external queue later.

Do not add Kafka or another broker during the MVP unless a concrete requirement exists.

---

# 17. Database Rules

Use PostgreSQL.

Add indexes only for clear query patterns.

Expected indexes include:

```text
posts(slug)
posts(status, publishedAt)
posts(category, status, publishedAt)
comments(post, status, createdAt)
comments(parentComment, createdAt)
reactions(user, targetType, targetId, reactionType)
bookmarks(user, post)
analyticsEvents(postId, occurredAt)
notifications(userId, readAt, createdAt)
```

Enforce unique constraints for:

```text
post slug
username
reaction uniqueness
bookmark uniqueness
redirect source path
```

Use database transactions when changing:

- Reaction plus aggregate count
- Comment plus reply count
- Publish state plus related metadata
- Other logically atomic data

Do not create indexes for every field.

Use query plans and measured performance before adding speculative indexes.

---

# 18. Media Storage

Development may use local filesystem storage.

Production must use persistent object storage such as:

- Amazon S3
- Cloudflare R2
- Another S3-compatible provider

Store:

- Original image
- Responsive sizes
- Metadata
- Alt text
- Caption
- Credit
- Copyright
- MIME type
- Width and height

Do not store durable uploads only inside application containers.

Prevent deletion of media that is still referenced, or provide a safe replacement workflow.

---

# 19. Configuration and Feature Flags

Use typed configuration.

Validate required environment variables on application startup.

Do not read environment variables directly throughout the codebase.

Centralize configuration:

```ts
const config = {
  app: {},
  database: {},
  storage: {},
  auth: {},
  email: {},
  analytics: {},
  features: {},
}
```

Feature flags may include:

```text
comments
reactions
bookmarks
newsletter
webPush
aiSummary
semanticSearch
multiLanguage
multiTenant
```

Do not scatter feature checks throughout unrelated code.

Feature behavior should be encapsulated inside its owning module.

---

# 20. Plugin Strategy

Use official Payload plugins where they provide stable, generic capabilities.

Examples:

- SEO
- Search
- Redirects
- Nested documents
- Cloud storage
- Error monitoring

Custom project capabilities should first be implemented as internal modules.

Only extract them into reusable Payload plugins after they have been proven in the real application.

Possible future reusable plugins:

```text
blogCorePlugin
communityPlugin
analyticsPlugin
moderationPlugin
newsletterPlugin
aiContentPlugin
```

Do not prematurely generalize a feature before there are at least one or two real use cases demonstrating the reusable boundary.

---

# 21. Testing Strategy

## 21.1 Unit Tests

Test:

- Slug generation
- Reading time
- State transitions
- Permission rules
- Trending score
- Reaction idempotency
- Comment validation
- SEO validation
- Event creation
- Analytics deduplication

## 21.2 Integration Tests

Use a real PostgreSQL test database or container.

Test:

- Create and publish post
- Draft access
- Editorial workflow
- Comment moderation
- Reaction transaction
- Bookmark uniqueness
- Scheduled publishing
- Search synchronization
- Analytics aggregation
- Redirect creation

## 21.3 End-to-End Tests

Test critical user journeys:

```text
editor creates and publishes post
author submits post for review
reader opens article
member registers and comments
moderator approves comment
member likes and bookmarks article
published slug changes and redirects
admin uploads media
```

## 21.4 Test Rules

Every bug fix should include a regression test where practical.

Do not overuse snapshots for business behavior.

Prefer assertions on observable outcomes and business rules.

---

# 22. Observability

Use structured logging.

Each important request or job should have:

- Request ID
- Correlation ID
- Actor ID when safe
- Operation name
- Duration
- Result
- Error classification

Do not log:

- Passwords
- Access tokens
- Session cookies
- Private keys
- Full personal data
- Raw sensitive content unless explicitly required

Track metrics such as:

```text
request count
error rate
p50 latency
p95 latency
p99 latency
database query latency
job success rate
job failure rate
search latency
publish latency
analytics ingestion lag
cache hit ratio
```

Provide:

```text
/health/live
/health/ready
```

Readiness may check:

- Database connectivity
- Required configuration
- Critical dependency availability

---

# 23. Security Baseline

The project must include:

- Input validation
- Output sanitization
- Secure cookie settings
- CSRF protection
- Content Security Policy
- Rate limiting
- Authentication lockout or throttling
- Email verification
- Password reset token expiry
- Audit logging
- Dependency scanning
- Secret management
- Database backup
- Restore testing
- Least-privilege access control
- Security headers
- File upload validation

Rate-limit at least:

```text
login
registration
password reset
comment creation
reaction mutation
search
analytics ingestion
contact forms
```

File uploads must validate:

- MIME type
- Extension
- File size
- Image dimensions where relevant

---

# 24. Deployment

The application should be containerized.

Recommended production topology:

```text
Cloudflare CDN/WAF
        ↓
Next.js + Payload application
        ↓
Managed PostgreSQL
        ↓
S3-compatible media storage
        ↓
Email provider
        ↓
Monitoring and error tracking
```

Application instances must be stateless.

Do not depend on:

- Local durable sessions
- Local durable uploads
- A single in-memory scheduler
- In-memory rate limits in multi-instance deployment

When scale requires it, introduce:

```text
load balancer
multiple application instances
connection pooling
Redis
external worker
queue
read replicas
dedicated search engine
```

Only add these components based on measured need.

---

# 25. Database Migration Policy

Database migrations must be explicit and reviewable.

Do not allow uncontrolled production schema synchronization.

Use backward-compatible deployment steps:

```text
1. Add compatible schema.
2. Deploy compatible application.
3. Backfill data.
4. Switch application behavior.
5. Remove obsolete schema in a later release.
```

Each migration must consider:

- Existing data
- Rollback strategy
- Lock duration
- Large-table impact
- Index creation behavior
- Compatibility with the previous application version

---

# 26. CI/CD

The pipeline should perform:

```text
install
lint
format check
type check
unit tests
integration tests
build
security scan
migration validation
container build
staging deployment
smoke tests
production deployment
```

Production deployment should not occur when critical checks fail.

Do not merge generated code changes that have not been reviewed.

---

# 27. Documentation

Maintain:

```text
docs/
├── architecture/
│   ├── system-context.md
│   ├── container-view.md
│   ├── module-boundaries.md
│   ├── data-flow.md
│   └── deployment-view.md
├── adr/
├── domain/
├── operations/
└── development/
```

Required documentation:

- System context
- Architecture overview
- Module ownership
- Domain model
- Key workflows
- Access-control matrix
- Local setup
- Deployment
- Migration process
- Backup and restore
- Incident handling
- Adding a new module
- Adding a new content block
- Adding a new provider
- Testing conventions

Use Architecture Decision Records for significant decisions.

Examples:

```text
Use Payload CMS
Use modular monolith
Use PostgreSQL
Use event-based analytics
Use S3-compatible media storage
Use application services around Payload
```

---

# 28. AI Coding Agent Rules

Before implementing any task, the agent must:

1. Read the root `AGENTS.md`.
2. Read all applicable module-level instruction files.
3. Inspect existing architecture documentation.
4. Inspect relevant code before proposing changes.
5. Identify the owning module.
6. Identify existing patterns that should be followed.
7. Check whether similar functionality already exists.
8. Determine whether database migration is required.
9. Determine whether authorization changes are required.
10. Determine whether tests and documentation must be updated.

The agent must not:

- Invent APIs that do not exist.
- Invent Payload capabilities without verifying the installed version.
- Duplicate existing functionality.
- Bypass application services.
- Put business logic in UI components.
- Put large business logic directly in Payload hooks.
- Add dependencies without justification.
- Add infrastructure without demonstrated need.
- Change unrelated code.
- Remove existing behavior silently.
- Ignore migration or backward compatibility.
- weaken authorization to make a feature easier.
- expose draft or private content through public APIs.
- mark incomplete work as production-ready.

When uncertain:

- Inspect code.
- Inspect official documentation.
- State assumptions.
- Choose the least invasive implementation.
- Record unresolved questions or risks.

---

# 29. Implementation Workflow for Every Feature

For each feature, follow this sequence.

## Step 1 — Understand

Document:

- User goal
- Functional requirements
- Non-functional requirements
- Acceptance criteria
- Edge cases
- Security implications

## Step 2 — Locate Ownership

Identify:

- Owning module
- Collections affected
- Application services affected
- API surface
- UI surface
- Jobs or events involved

## Step 3 — Design

Produce:

- Data model changes
- Service changes
- Event changes
- Authorization rules
- Cache implications
- Migration plan
- Test plan

## Step 4 — Implement

Implementation order:

```text
types and contracts
domain rules
application services
persistence changes
Payload configuration
API or server action
frontend
tests
documentation
```

## Step 5 — Validate

Run:

```text
lint
type check
unit tests
integration tests
build
relevant end-to-end tests
```

## Step 6 — Report

Summarize:

- What changed
- Why it changed
- Files changed
- Migration impact
- Security impact
- Tests run
- Known limitations
- Follow-up work

---

# 30. Coding Standards

Use strict TypeScript.

Avoid:

```text
any
unchecked type assertions
silent error swallowing
large functions
hidden side effects
magic strings
duplicated constants
unbounded queries
N+1 queries
```

Prefer:

- Explicit types
- Schema validation
- Small functions
- Named business operations
- Immutable values where practical
- Dependency injection at external boundaries
- Structured errors
- Explicit return types for public APIs
- Pagination for list endpoints
- Deterministic ordering
- Consistent naming

Naming conventions:

```text
PascalCase:
components, classes, types, interfaces

camelCase:
variables, functions, fields

kebab-case:
route segments and file names where appropriate

SCREAMING_SNAKE_CASE:
true constants only
```

Do not prefix interfaces with `I`.

Use domain-specific names instead of vague names such as:

```text
processData
handleThing
manageItem
doAction
```

---

# 31. Error Handling

Use structured application errors.

Suggested categories:

```text
ValidationError
AuthenticationError
AuthorizationError
NotFoundError
ConflictError
RateLimitError
ExternalProviderError
InfrastructureError
```

Do not expose internal stack traces to users.

User-facing errors must be actionable and safe.

Log internal technical details with correlation information.

External provider calls must define:

- Timeout
- Retry behavior
- Failure classification
- Fallback behavior where appropriate

---

# 32. Performance Rules

Always paginate list queries.

Avoid returning full rich-text documents in feed queries.

Use projections or depth limits where appropriate.

Avoid N+1 relationship loading.

Do not perform large aggregation queries during page rendering.

Use precomputed read models for:

- Trending posts
- Popular posts
- Post statistics
- Tag usage
- Category counts where needed

Measure before optimizing.

Do not add Redis only because caching may theoretically help.

---

# 33. Accessibility

Public UI must target WCAG-compatible practices.

Requirements:

- Semantic HTML
- Keyboard navigation
- Visible focus indicators
- Appropriate labels
- Alt text
- Sufficient contrast
- Accessible dialogs and menus
- Reduced-motion support where applicable
- Screen-reader-friendly validation
- Heading hierarchy
- Accessible code-copy controls

Accessibility must be considered during implementation, not added only after completion.

---

# 34. Scope Control

Prioritize the MVP.

## MVP

```text
CMS admin
posts
categories
tags
authors
series
media
draft and publish workflow
scheduled publishing
SEO
search
comments
moderation
likes
views
responsive public site
RSS
sitemap
authentication
monitoring
backup
```

## Later

```text
newsletter automation
paid membership
multi-language
multi-tenancy
AI summary
semantic search
advanced recommendation
gamification
real-time comments
web push
marketplace
```

Do not implement future features merely because the data model can support them.

Design extension points, but implement only approved scope.

---

# 35. Delivery Quality

A feature is complete only when:

- Acceptance criteria are satisfied.
- Authorization is enforced.
- Validation is implemented.
- Error states are handled.
- Loading and empty states are handled.
- Tests are added or updated.
- Database migration is included when needed.
- Documentation is updated.
- Observability is considered.
- Build and type checks pass.
- No unrelated behavior is broken.

Do not describe a feature as production-ready when any critical element remains incomplete.

---

# 36. Default Technical Decisions

Unless explicitly changed by an Architecture Decision Record, use:

```text
Package manager:
pnpm

Language:
TypeScript

Frontend:
Next.js App Router

CMS:
Payload CMS

Database:
PostgreSQL

Rich-text:
Payload Lexical Editor

Styling:
Tailwind CSS

Architecture:
Modular monolith

Media:
S3-compatible storage in production

Deployment:
Docker-based stateless application

Testing:
Unit + integration + critical E2E tests

API validation:
Typed schema validation

Public rendering:
Server Components by default

Caching:
Next.js caching with explicit invalidation

Analytics:
Event ingestion plus aggregated read models

Search:
Payload/PostgreSQL first, external engine later

Queue:
No external broker until justified
```

---

# 37. Response Rules for ChatGPT

When responding inside this project:

- Use the existing project context.
- Do not repeatedly ask for information already documented.
- Prefer concrete designs over generic suggestions.
- Clearly separate MVP requirements from future enhancements.
- Identify trade-offs and risks.
- Avoid premature microservices.
- Avoid premature abstractions.
- Provide implementation-ready outputs.
- Use TypeScript examples when code is required.
- Preserve existing architecture unless there is a strong reason to change it.
- Explicitly call out breaking changes.
- Include migration considerations for schema changes.
- Include security and authorization considerations.
- Include testing expectations.
- Include file-placement suggestions for new code.
- Prefer maintainable production patterns over demo shortcuts.
- Never claim that code was executed, tested, or verified unless it actually was.
- Never invent repository content that has not been inspected.

For implementation plans, use this structure:

```text
Goal
Current assumptions
Affected modules
Architecture changes
Data model changes
API changes
UI changes
Authorization
Caching
Events and jobs
Migration
Testing
Implementation steps
Risks
Acceptance criteria
```

For code review, prioritize:

```text
correctness
security
authorization
data integrity
backward compatibility
performance
maintainability
test coverage
style
```

---

# 38. Project Success Criteria

The project is successful when:

- Editors can manage and publish content efficiently.
- Readers receive a fast and accessible experience.
- Users can safely comment, like, bookmark, and interact.
- Analytics are accurate enough for editorial decisions.
- Modules remain independently understandable.
- Business logic is not trapped inside Payload configuration.
- The application can scale horizontally.
- Media and persistent data are not tied to a single container.
- New features can be added without rewriting core modules.
- Coding agents can understand and modify the project safely.
- The framework can be reused to bootstrap future technology blogs.
