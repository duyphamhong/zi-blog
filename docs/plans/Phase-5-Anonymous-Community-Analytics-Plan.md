# Phase 5 Implementation Plan — Anonymous Community and Analytics Dashboard

## Goal

Implement the first anonymous community and engagement layer for Zi-Blog.

> Implementation update (2026-07-30): anonymous profile details are browser-local data.
> New anonymous-profile database records are not created. A submitted comment stores its
> display name and avatar as an immutable snapshot; reaction handling stores aggregate
> counters only; analytics stores a hashed browser session for view deduplication. Existing
> profile relationships remain readable only for historical data migration.

Phase 5 must deliver:

1. Anonymous display name and avatar stored in browser local storage.
2. Anonymous post reactions with `like` and `dislike`.
3. A complete but disabled anonymous comment capability, including backend, admin moderation, and frontend components.
4. Admin-managed feature flags that can enable or disable community capabilities without a deployment.
5. Recording and aggregation for:
   - Total likes
   - Total dislikes
   - Total article views
   - Unique article views
   - Total share actions
6. An analytics dashboard inside Payload Admin for reviewing these metrics and their recent trends.

The implementation must preserve the modular-monolith architecture and keep business logic in application services rather than Payload collection files, hooks, route handlers, or React components.

---

## Current Assumptions

- The project uses Next.js App Router, Payload CMS, TypeScript, PostgreSQL, Tailwind CSS, and pnpm.
- The application remains a single deployable modular monolith.
- The owning modules are:
  - `identity`: anonymous identity lifecycle
  - `community`: reactions and comments
  - `analytics`: event ingestion, aggregation, and dashboard read models
  - `moderation`: anonymous-name validation, comment moderation, and abuse controls
  - `platform`: feature configuration and shared infrastructure
- Anonymous display details are held in browser local storage, not a server profile record.
- IP data is used only for short-lived rate limiting and abuse detection. Do not store raw IP addresses in persistent domain collections.
- Commenting is implemented in this phase but disabled by default.
- Like and dislike apply to posts in Phase 5. The reaction model must remain extensible to comments and other targets later.
- Reactions are aggregate counters. They are not identity-based and do not retain a per-browser toggle state.
- Share metrics represent share-button actions or share intent. They do not guarantee that a social-network post was successfully published.
- View tracking follows the existing event-ingestion and aggregation design. Do not increment a `viewCount` field directly during page rendering.
- No Kafka, Redis, external analytics platform, or new microservice is introduced in this phase.
- Payload Jobs or an equivalent protected in-process job mechanism may be used for aggregation, provided the job is idempotent and safe in a multi-instance deployment.

---

## Out of Scope

Do not implement the following in Phase 5:

- Anonymous profile synchronization between devices
- Anonymous account recovery after cookie deletion
- Custom avatar uploads
- Public anonymous profile pages
- Following, messaging, reputation, badges, or gamification
- Real-time comments
- Comment attachments or rich HTML
- External analytics providers
- Social-network API verification of completed shares
- Cross-site or multi-tenant analytics
- Redis or an external queue without a measured requirement

---

## Affected Modules

### `identity`

Owns:

- Anonymous cookie issuance and rotation
- Anonymous profile creation and lookup
- Anonymous profile display name and avatar
- Anonymous-profile status
- Resolution of the current anonymous actor

Suggested placement:

```text
apps/web/src/modules/identity/
├── domain/
│   ├── anonymous-profile.ts
│   └── anonymous-profile-errors.ts
├── application/
│   ├── anonymous-profile-command-service.ts
│   ├── anonymous-profile-query-service.ts
│   └── anonymous-actor-resolver.ts
├── infrastructure/
│   ├── payload-anonymous-profile-repository.ts
│   ├── anonymous-cookie-service.ts
│   └── anonymous-token-hasher.ts
└── contracts/
    └── anonymous-profile-contracts.ts
```

### `community`

Owns:

- Post reactions
- Comment creation and retrieval
- Comment ownership
- Reaction idempotency
- Community API contracts

Suggested placement:

```text
apps/web/src/modules/community/
├── domain/
│   ├── reaction.ts
│   ├── comment.ts
│   └── community-errors.ts
├── application/
│   ├── reaction-command-service.ts
│   ├── reaction-query-service.ts
│   ├── comment-command-service.ts
│   └── comment-query-service.ts
├── infrastructure/
│   ├── payload-reaction-repository.ts
│   └── payload-comment-repository.ts
└── contracts/
    ├── reaction-contracts.ts
    └── comment-contracts.ts
```

### `analytics`

Owns:

- Analytics event ingestion
- View deduplication
- Share-event recording
- Site and post statistics
- Daily metric aggregation
- Dashboard query services

Suggested placement:

```text
apps/web/src/modules/analytics/
├── domain/
│   ├── analytics-event.ts
│   ├── site-statistics.ts
│   ├── post-statistics.ts
│   └── daily-metrics.ts
├── application/
│   ├── analytics-ingestion-service.ts
│   ├── analytics-aggregation-service.ts
│   ├── analytics-dashboard-query-service.ts
│   └── view-deduplication-service.ts
├── infrastructure/
│   ├── payload-analytics-event-repository.ts
│   ├── payload-statistics-repository.ts
│   └── payload-daily-metrics-repository.ts
└── jobs/
    ├── aggregate-analytics-job.ts
    └── rebuild-analytics-job.ts
```

### `moderation`

Owns:

- Anonymous display-name policy
- Comment content validation
- Comment status transitions
- Profile restriction and blocking
- Spam and abuse signals

### `platform`

Owns:

- Admin-managed feature settings
- Typed feature-flag resolution
- Configuration caching and invalidation

---

## Architecture Changes

### 1. Anonymous actor resolution

Introduce a reusable `AnonymousActorResolver`.

Every public community mutation must resolve the anonymous actor from the server-side cookie. The client must never submit:

- `anonymousProfileId`
- `anonymousIdHash`
- `ownerId`
- any trusted ownership field

Resolution flow:

```text
Request
→ read `zi_blog_guest` HttpOnly cookie
→ create a cryptographically random token if missing
→ hash token with a server-side secret or HMAC
→ find or create AnonymousProfile
→ return AnonymousActor context
```

Suggested actor contract:

```ts
type AnonymousActor = {
  profileId: string
  anonymousIdHash: string
  displayName: string | null
  avatarKey: string | null
  status: 'active' | 'restricted' | 'blocked'
}
```

A blocked anonymous actor must not be allowed to create reactions or comments.

### 2. Explicit application services

Route handlers, Payload endpoints, hooks, and UI components must delegate to application services.

Do not place reaction switching, comment ownership, analytics aggregation, or feature-flag logic directly inside Payload collection hooks.

### 3. Feature-flag enforcement at every layer

A feature is not disabled merely because its UI is hidden.

Feature flags must be enforced at:

```text
Admin configuration
→ server-side feature service
→ API/application service
→ frontend visibility
```

For disabled comments:

- The public comment UI is not rendered.
- Comment query and mutation routes return a structured `FeatureDisabledError`.
- Direct Payload collection creation remains inaccessible.
- Admin users can still inspect the collection and implementation.
- Existing comments remain preserved if the feature is disabled after being used.

### 4. Transactional reaction changes

Reaction operations must be atomic.

Examples:

```text
No reaction + LIKE
→ create LIKE

LIKE + LIKE
→ remove reaction

LIKE + DISLIKE
→ update LIKE to DISLIKE

DISLIKE + LIKE
→ update DISLIKE to LIKE

DISLIKE + DISLIKE
→ remove reaction
```

The reaction entity is the transactional source of truth. Aggregate counters are derived read models.

### 5. Event-based analytics

Use this data flow:

```text
raw analytics event
→ validation
→ bot and abuse filtering
→ deduplication
→ aggregation
→ site and post statistics
→ admin dashboard
```

Do not perform expensive aggregation in page-render requests.

---

## Feature Flags

Create a Payload Global named `community-settings`.

Suggested fields:

```ts
type CommunitySettings = {
  anonymousProfilesEnabled: boolean
  postReactionsEnabled: boolean
  commentsEnabled: boolean
  shareTrackingEnabled: boolean
  articleViewTrackingEnabled: boolean
}
```

Default values for Phase 5:

```text
anonymousProfilesEnabled = true
postReactionsEnabled = true
commentsEnabled = false
shareTrackingEnabled = true
articleViewTrackingEnabled = true
```

Optional operational settings:

```ts
type CommunitySettings = {
  anonymousProfilesEnabled: boolean
  postReactionsEnabled: boolean
  commentsEnabled: boolean
  shareTrackingEnabled: boolean
  articleViewTrackingEnabled: boolean

  anonymousDisplayNameMinLength: number
  anonymousDisplayNameMaxLength: number
  commentMaxLength: number
  commentReplyDepthLimit: number
}
```

Requirements:

- Only `super_admin` and explicitly authorized `editor` users may modify these settings.
- Public APIs must receive feature state from a typed `FeatureFlagService`.
- Changes must invalidate the relevant Next.js cache tags.
- Never read the Payload Global independently throughout the codebase.
- The frontend may consume a safe public projection that exposes booleans only.

Suggested public projection:

```ts
type PublicCommunityFeatures = {
  anonymousProfiles: boolean
  postReactions: boolean
  comments: boolean
  shareTracking: boolean
  articleViewTracking: boolean
}
```

---

## Data Model Changes

### 1. `anonymous-profiles`

Create a Payload collection.

Fields:

```text
id
anonymousIdHash
displayName
avatarKey
status
shortIdentityCode
lastActiveAt
createdAt
updatedAt
```

Suggested values:

```text
status:
- active
- restricted
- blocked
```

Rules:

- `anonymousIdHash` is required, unique, indexed, and hidden from normal admin lists.
- `displayName` is optional until the visitor chooses one.
- `displayName` must not be globally unique.
- `shortIdentityCode` is stable and safe to display, for example `A7F2`.
- `avatarKey` must reference an allow-listed preset.
- Public APIs never expose `anonymousIdHash`.
- Anonymous users cannot directly read or mutate this collection through the generated Payload API.
- Admin deletion should be restricted. Prefer blocking or anonymizing over hard deletion when reactions or comments reference the profile.

Suggested indexes:

```text
unique(anonymousIdHash)
index(status, lastActiveAt)
index(createdAt)
```

### 2. `reactions`

Create or extend the reaction collection.

Fields:

```text
id
targetType
targetId
actorType
user
anonymousProfile
reactionType
uniquenessKey
createdAt
updatedAt
```

Phase 5 values:

```text
targetType:
- post

actorType:
- member
- anonymous

reactionType:
- like
- dislike
```

Future-compatible `targetType` values may include `comment`, but do not expose unsupported targets in Phase 5.

Important uniqueness rule:

```text
one actor + one target = one active reaction
```

This differs from a uniqueness rule that includes `reactionType`. Including `reactionType` would allow the same actor to like and dislike the same target simultaneously.

Generate:

```ts
uniquenessKey = hash(
  `${actorType}:${actorId}:${targetType}:${targetId}`
)
```

Add a unique index on `uniquenessKey`.

Validation:

```text
actorType = member
→ user required
→ anonymousProfile empty

actorType = anonymous
→ anonymousProfile required
→ user empty
```

Suggested indexes:

```text
unique(uniquenessKey)
index(targetType, targetId, reactionType)
index(anonymousProfile, createdAt)
index(user, createdAt)
```

### 3. `comments`

Implement the collection but keep it disabled through `community-settings.commentsEnabled`.

Fields:

```text
id
post
authorType
author
anonymousProfile
parentComment
content
status
depth
replyCount
likeCount
authorDisplayNameSnapshot
authorAvatarSnapshot
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

Initial rules:

- Anonymous comment submission requires an anonymous profile with a valid display name.
- New comments default to `pending`.
- Only `published` comments are publicly readable.
- Maximum reply depth is configurable and initially set to `1`.
- Comments accept plain text only.
- Rendered text must be escaped and sanitized.
- Published comments use soft delete.
- Ownership is resolved from authenticated user identity or anonymous cookie.
- Direct public writes to the generated Payload collection endpoint are disabled.
- When `commentsEnabled = false`, all public comment read and write use cases are disabled.

Suggested indexes:

```text
index(post, status, createdAt)
index(parentComment, createdAt)
index(anonymousProfile, createdAt)
index(author, createdAt)
```

### 4. `analytics-events`

Create an append-oriented raw-event collection.

Fields:

```text
id
eventType
postId
anonymousIdHash
userId
sessionIdHash
deduplicationKey
referrerDomain
utmSource
utmMedium
utmCampaign
deviceType
metadata
occurredAt
receivedAt
processingStatus
```

Phase 5 event types:

```text
article_view
share
```

Community changes should emit internal domain events instead of duplicating all reactions into raw analytics events.

Possible future events may include:

```text
article_read
article_complete
comment
bookmark
search
```

Rules:

- Never store raw IP addresses.
- Restrict metadata to an allow-listed schema.
- Do not trust client timestamps for aggregation boundaries without validation.
- Limit payload size.
- Public read is disabled.
- Public update and delete are disabled.
- Event ingestion is rate-limited.
- Use a deduplication key for views.

Suggested indexes:

```text
index(processingStatus, receivedAt)
index(postId, occurredAt)
index(eventType, occurredAt)
unique(deduplicationKey) where applicable
```

### 5. `post-statistics`

Create a derived read-model collection.

Fields:

```text
postId
totalViews
uniqueViews
views24h
views7d
views30d
likes
dislikes
shares
comments
updatedAt
```

Rules:

- One statistics document per post.
- Not publicly writable.
- Updated only through analytics/community aggregation services.
- Public post pages may read the safe projection.

Suggested indexes:

```text
unique(postId)
index(views24h)
index(views7d)
index(likes)
index(shares)
```

### 6. `site-statistics`

Create a singleton Global or single-document collection for current totals.

Fields:

```text
totalAnonymousProfiles
totalViews
totalUniqueViews
totalLikes
totalDislikes
totalShares
totalComments
updatedAt
lastAggregationAt
```

This is the fast KPI source for the admin dashboard.

### 7. `analytics-daily-metrics`

Create a daily time-series read model.

Fields:

```text
date
newAnonymousProfiles
views
uniqueViews
likesCreated
likesRemoved
dislikesCreated
dislikesRemoved
shares
commentsSubmitted
commentsPublished
updatedAt
```

Use one row per calendar date in the configured application timezone.

Suggested indexes:

```text
unique(date)
index(date)
```

The current project timezone should be explicit in typed configuration. Do not rely on the host server timezone.

---

## Anonymous Profile UX

### First visit

Do not force a modal immediately when a visitor opens the site.

Create the anonymous cookie lazily or during the first community/analytics interaction.

Display-name setup should appear when the visitor:

- opens the reaction identity menu, if required by product design
- attempts to use a future comment form
- opens an optional anonymous-profile control

For reactions, the user may react without choosing a display name. A profile record can exist with `displayName = null`.

For comments, a display name is required.

### Profile control

Add a small anonymous-profile component, such as:

```text
Guest profile
Name: [Architecture Wanderer]
Avatar: [preset selector]
Save
```

Requirements:

- Allow 2–40 characters.
- Trim and normalize whitespace.
- Reject HTML, URLs, email addresses, phone-like identifiers, and reserved staff names.
- Allow changing the name later.
- Do not require global uniqueness.
- Show a stable short identity code only where useful.
- Use preset avatars only in Phase 5.

### Cookie

Suggested cookie:

```text
name: zi_blog_guest
HttpOnly: true
Secure: true in production
SameSite: Lax
Path: /
Max-Age: 31536000
```

Use at least 128 bits of cryptographically secure randomness.

Hash using HMAC or a server-side pepper before database lookup.

Do not expose the token to Client Components.

---

## Reaction API Changes

Recommended route handlers:

```text
GET  /api/community/posts/{postId}/reaction
PUT  /api/community/posts/{postId}/reaction
DELETE /api/community/posts/{postId}/reaction
```

Alternative toggle routes are acceptable only if their behavior remains explicit and idempotent.

### Get reaction state

Response:

```json
{
  "reaction": "like",
  "counts": {
    "likes": 128,
    "dislikes": 4
  }
}
```

`reaction` may be `like`, `dislike`, or `null`.

### Set reaction

Request:

```json
{
  "reactionType": "like"
}
```

Response:

```json
{
  "reaction": "like",
  "counts": {
    "likes": 129,
    "dislikes": 4
  }
}
```

### Remove reaction

Response:

```json
{
  "reaction": null,
  "counts": {
    "likes": 128,
    "dislikes": 4
  }
}
```

Requirements:

- Resolve actor server-side.
- Validate that the target post exists and is publicly visible.
- Enforce `postReactionsEnabled`.
- Use a database transaction.
- Emit `ReactionCreated`, `ReactionChanged`, or `ReactionRemoved`.
- Update derived counters safely and idempotently.
- Apply per-profile and per-IP-hash rate limits.
- Return structured errors.

Suggested errors:

```text
FeatureDisabledError
NotFoundError
ValidationError
RateLimitError
AnonymousProfileBlockedError
ConflictError
```

---

## Comment API Changes

Implement but keep disabled by default.

Recommended routes:

```text
GET  /api/community/posts/{postId}/comments
POST /api/community/posts/{postId}/comments
PATCH /api/community/comments/{commentId}
DELETE /api/community/comments/{commentId}
```

Requirements:

- Every public handler checks `commentsEnabled`.
- When disabled, return a safe `FeatureDisabledError`.
- Anonymous comment creation requires:
  - active anonymous profile
  - valid display name
  - valid content
  - rate-limit allowance
- New comments default to `pending`.
- Public reads return only `published` comments.
- Editing is allowed only for the owner and only within a configurable edit window.
- Deleting published comments performs soft delete.
- Admin moderation remains available even when public comments are disabled.

---

## Analytics API Changes

Recommended route:

```text
POST /api/analytics/events
```

Accepted public event schemas:

### Article view

```json
{
  "eventType": "article_view",
  "postId": "post-id",
  "sessionId": "client-generated-session-id",
  "occurredAt": "2026-07-30T02:30:00+07:00"
}
```

### Share action

```json
{
  "eventType": "share",
  "postId": "post-id",
  "sessionId": "client-generated-session-id",
  "metadata": {
    "channel": "facebook"
  },
  "occurredAt": "2026-07-30T02:30:00+07:00"
}
```

Allowed share channels:

```text
facebook
linkedin
x
copy_link
native
other
```

Requirements:

- Validate the post is public.
- Resolve anonymous identity server-side.
- Hash the session identifier before persistence.
- Reject unknown metadata fields.
- Limit request body size.
- Apply event-specific rate limits.
- Ignore or classify known bots.
- Enforce the corresponding feature flag.
- Do not expose generated Payload collection APIs publicly.

### View-counting policy

Count a valid article view only after the frontend view tracker confirms criteria such as:

```text
page loaded successfully
AND visible for at least 5 seconds
AND visitor scrolled or interacted
AND not a known bot
```

Initial deduplication window:

```text
one unique article view
per anonymous profile or session
per post
per 24-hour window
```

Keep this value configurable.

The raw `article_view` event may be recorded once per accepted client signal, while `uniqueViews` is derived after deduplication.

### Share-counting policy

Record a share only when a user activates a supported share action.

The dashboard and UI should label this metric as either:

```text
Share actions
```

or:

```text
Share clicks
```

Avoid implying guaranteed successful publication to a social network.

---

## Frontend Changes

### 1. Anonymous profile components

Suggested components:

```text
components/community/
├── anonymous-profile-button.tsx
├── anonymous-profile-dialog.tsx
├── anonymous-avatar-picker.tsx
└── anonymous-display-name-form.tsx
```

Only the dialog and interactive controls should be Client Components.

### 2. Post reaction component

Suggested component:

```text
components/community/post-reactions.tsx
```

Requirements:

- Show Like and Dislike controls.
- Show current aggregate counts.
- Highlight the visitor’s active reaction.
- Use optimistic UI with rollback on failure.
- Prevent duplicate submissions while a mutation is in flight.
- Handle feature disabled, blocked actor, rate limit, and generic error states.
- Keep personalized reaction state out of shared public caches.
- Provide accessible labels and keyboard interaction.

Example:

```text
👍 128    👎 4
```

### 3. Share tracking

Wrap existing share controls with a single analytics action service.

Suggested component:

```text
components/community/share-actions.tsx
```

Requirements:

- Record the share action before or immediately after opening the platform action.
- Do not block the actual share action if analytics recording fails.
- Prevent rapid duplicate events from double-clicks.
- Track `copy_link`, Web Share API, and supported social channels.
- Display the aggregated share-action count when product design requires it.

### 4. Article view tracker

Suggested component:

```text
components/analytics/article-view-tracker.tsx
```

Requirements:

- Small isolated Client Component.
- Start only on published post pages.
- Wait for the minimum visibility period.
- Check page visibility.
- Require scroll or interaction.
- Send at most one accepted event per page lifecycle.
- Use `navigator.sendBeacon` where appropriate, with a fetch fallback.
- Do not make the whole post page a Client Component.

### 5. Comment frontend prepared but hidden

Suggested components:

```text
components/community/comments/
├── comment-section.tsx
├── comment-list.tsx
├── comment-item.tsx
├── comment-form.tsx
└── comment-empty-state.tsx
```

Requirements:

- Components are implemented and tested.
- The post page renders them only when `commentsEnabled = true`.
- Do not use CSS-only hiding.
- Do not fetch comments when the feature is disabled.
- Include loading, pending moderation, validation, rate-limit, empty, and error states.
- Anonymous display-name setup is integrated into comment submission.

---

## Admin Dashboard

### Admin route

Add a custom Payload Admin view, for example:

```text
/admin/analytics
```

Suggested placement:

```text
apps/web/src/payload/admin/views/analytics-dashboard/
├── index.tsx
├── analytics-dashboard.tsx
├── analytics-kpi-cards.tsx
├── analytics-trend-chart.tsx
├── reaction-breakdown.tsx
├── top-posts-table.tsx
├── date-range-selector.tsx
└── analytics-dashboard.module.css
```

Follow the installed Payload version’s supported custom-view API. Codex must inspect the current Payload configuration and official documentation before implementing the admin view.

### Dashboard KPIs

Display:

```text
Total anonymous profiles
Total article views
Total unique article views
Total likes
Total dislikes
Total share actions
```

Optional if comments remain disabled:

```text
Total submitted comments
Total published comments
```

### Date ranges

Support:

```text
Last 7 days
Last 30 days
Last 90 days
Custom range
```

The all-time KPI cards come from `site-statistics`.

Trend charts come from `analytics-daily-metrics`.

### Charts

Implement:

1. Anonymous profiles created over time
2. Views and unique views over time
3. Likes and dislikes over time
4. Share actions over time

Do not combine unrelated metrics into an unreadable chart.

Use the project’s existing chart library if one exists. If none exists, add a small, justified dependency only after checking the repository and documenting the decision.

### Tables

Add a Top Posts table with:

```text
Post title
Published date
Views
Unique views
Likes
Dislikes
Shares
Engagement rate
```

Suggested starting engagement rate:

```text
(likes + dislikes + shares) / max(uniqueViews, 1)
```

Treat this as a display metric, not a universal business KPI. Keep the formula centralized and documented.

### Dashboard access

- `super_admin`: full access
- `editor`: read-only analytics access if explicitly allowed
- `author`: no site-wide dashboard access by default
- `moderator`: no analytics access by default
- Public users: no access

All dashboard APIs and Payload collections must enforce server-side authorization.

### Dashboard states

Implement:

- Loading
- Empty data
- Partial aggregation lag
- Query failure
- Date range with no results
- Last aggregation timestamp

Display a warning when aggregation is delayed beyond a configurable threshold.

---

## Admin Feature Management

Add a Community Settings screen through the Payload Global.

Admin controls:

```text
Enable anonymous profiles
Enable post reactions
Enable comments
Enable share tracking
Enable article view tracking
```

Requirements:

- Comments default to disabled.
- Changes are audited.
- Settings updates invalidate public feature caches.
- The UI explains that disabling a feature does not delete existing data.
- Disabling reactions hides controls and blocks mutation APIs.
- Disabling comments hides the entire public comment section and blocks all public comment APIs.
- Analytics collection and admin visibility are not deleted when tracking is disabled.

---

## Authorization

### Anonymous profile

Anonymous users may:

- Read their own safe profile projection.
- Update their own display name and avatar through a controlled application service.

Anonymous users may not:

- Submit a profile ID.
- Read another profile’s private fields.
- List anonymous profiles.
- Change status.
- Delete the database document directly.
- Access hashes or moderation metadata.

### Reactions

Anonymous users may:

- Read their own reaction state for a public post.
- Set or remove their own reaction while the feature is enabled.

Anonymous users may not:

- Mutate another actor’s reaction.
- React to drafts, private posts, archived posts not publicly visible, or unsupported targets.
- Write aggregate counters.

### Comments

When enabled, anonymous users may:

- Submit a comment.
- Read published comments.
- Edit or soft-delete their own comment within policy.

Only moderators and authorized admins may:

- Publish
- Hide
- Mark as spam
- Restore
- Record moderation reasons

### Analytics

Public users may:

- Submit allow-listed analytics events through the controlled ingestion endpoint.

Public users may not:

- Read raw analytics events.
- Query dashboard metrics.
- Write statistics read models.
- Select arbitrary event types or metadata.

---

## Rate Limiting and Abuse Protection

Apply limits to:

```text
anonymous profile updates
reaction mutations
comment creation
comment editing
analytics ingestion
share events
article-view events
```

Use both:

```text
anonymous profile identity
+ short-lived IP hash
```

Do not use IP as the anonymous identity.

Suggested starting limits:

```text
Profile update:
5 per hour per anonymous profile

Reaction mutation:
30 per minute per anonymous profile
100 per minute per IP hash

Comment submission:
5 per 10 minutes per anonymous profile
20 per 10 minutes per IP hash

Article view:
5 accepted signals per minute per anonymous profile
20 per minute per IP hash

Share:
10 per minute per anonymous profile
30 per minute per IP hash
```

These are starting values and must be configurable.

Introduce a CAPTCHA challenge only when abuse signals justify it. Do not block normal interaction with CAPTCHA by default.

---

## Caching

### Public feature flags

Cache the safe public feature projection with an explicit cache tag:

```text
community-settings
```

Invalidate it after admin updates.

### Post statistics

- Cache aggregate post statistics with a short TTL or explicit tag.
- Invalidate affected post-statistics tags after reaction aggregation.
- Do not cache the current visitor’s reaction state in a shared cache.
- Keep static post content separate from dynamic community widgets.

Suggested tags:

```text
post-statistics:{postId}
site-statistics
analytics-daily:{date}
```

### Dashboard

- Dashboard queries may use short-lived server caching.
- Date-range responses should not expose user-specific data.
- Show `lastAggregationAt` so users understand the freshness.

---

## Events and Jobs

### Domain events

Add stable internal events:

```text
AnonymousProfileCreated
AnonymousProfileUpdated
AnonymousProfileRestricted
AnonymousProfileBlocked

ReactionCreated
ReactionChanged
ReactionRemoved

CommentCreated
CommentEdited
CommentDeleted
CommentModerated

AnalyticsEventAccepted
AnalyticsEventRejected
```

Each event should include:

```text
eventId
eventVersion
occurredAt
actor information where safe
target information
correlationId
```

Do not embed cookie tokens, raw IP addresses, or unnecessary personal data.

### Aggregation jobs

Implement:

```text
aggregate-analytics
rebuild-analytics
```

#### `aggregate-analytics`

Responsibilities:

- Process unaggregated analytics events.
- Update `post-statistics`.
- Update `site-statistics`.
- Update `analytics-daily-metrics`.
- Mark events processed only after successful aggregation.
- Be safe for retries.
- Use batch processing.
- Avoid unbounded queries.

Suggested schedule:

```text
every 5 minutes
```

Use the project’s protected job mechanism. Do not expose an unprotected public cron endpoint.

#### Reaction aggregation

Because reactions are transactional and must reflect quickly, update the affected `post-statistics` reaction counts within the same application operation or through a reliable in-process event handler.

The operation must remain idempotent and must reconcile from source-of-truth reactions if an update fails.

The daily metrics may be updated asynchronously.

#### Anonymous profile totals

When a profile is created:

- Increment site total through a controlled service, or
- Recalculate through the aggregation pipeline.

Provide a reconciliation operation that counts source records and repairs drift.

### Rebuild job

The rebuild job must:

- Recalculate site totals from source collections.
- Recalculate per-post statistics.
- Rebuild daily metrics for a selected date range.
- Support dry-run mode.
- Log differences.
- Avoid deleting existing statistics until replacement data is valid.

---

## Migration

### Schema migration

Create explicit Payload/PostgreSQL migrations for:

```text
community-settings Global
anonymous-profiles
reactions
comments
analytics-events
post-statistics
site-statistics
analytics-daily-metrics
indexes and unique constraints
```

### Existing data

Before implementing migration logic, Codex must inspect whether the repository already contains:

- reaction collections
- comment collections
- counters on posts
- analytics events
- external analytics integration
- existing feature flags

Do not silently create duplicates.

If previous reaction data exists:

1. Map existing actors to the new actor model.
2. Detect actors with both like and dislike for the same target.
3. Define deterministic conflict resolution.
4. Populate `uniquenessKey`.
5. Rebuild counters.
6. Add the unique constraint only after cleanup.

If direct post counters exist:

- Preserve them temporarily.
- Backfill read models.
- Compare values.
- Switch reads to `post-statistics`.
- Remove obsolete counters in a later phase, not in the same deployment unless verified safe.

### Default settings

Seed:

```text
anonymousProfilesEnabled = true
postReactionsEnabled = true
commentsEnabled = false
shareTrackingEnabled = true
articleViewTrackingEnabled = true
```

### Rollback

Rollback must not delete anonymous profiles, reactions, comments, or analytics records.

A safe rollback should:

- Disable new UI and endpoints through feature flags.
- Keep collections and data intact.
- Revert dashboard registration if necessary.
- Preserve migrations for future forward deployment.

---

## Observability

Add structured logs for:

```text
anonymous profile resolution
anonymous profile creation
reaction mutation
comment submission
analytics event acceptance/rejection
aggregation job start/end
aggregation batch size
aggregation lag
dashboard query duration
reconciliation differences
```

Include:

```text
requestId
correlationId
operation
postId when relevant
anonymousProfileId when safe
result
duration
error classification
```

Do not log:

```text
cookie token
anonymousIdHash
raw IP
session cookie
full comment content
```

Metrics:

```text
anonymous_profiles_created_total
reaction_mutations_total
reaction_mutation_errors_total
analytics_events_accepted_total
analytics_events_rejected_total
analytics_aggregation_lag_seconds
analytics_job_failures_total
dashboard_query_duration_ms
```

Health/readiness should report critical aggregation dependency failures without exposing internal data.

---

## Testing

### Unit tests

Add tests for:

```text
anonymous token hashing
cookie issuance
anonymous actor resolution
display-name normalization
reserved-name rejection
avatar allow-list validation
reaction state transitions
reaction uniqueness-key generation
reaction idempotency
comment feature-flag enforcement
comment ownership
view deduplication
share metadata validation
daily bucket calculation
engagement-rate calculation
feature-flag projection
```

### Integration tests

Use a real PostgreSQL test database.

Test:

```text
first request creates an anonymous profile
same cookie resolves the same profile
different cookie creates a different profile
deleted cookie creates a new identity
blocked profile cannot react
anonymous user can like a published post
anonymous user can dislike a published post
like changes atomically to dislike
same reaction request is idempotent
anonymous user cannot react to a draft
reaction counters reconcile correctly
comments endpoint is disabled by default
enabling comments activates read and write paths
new anonymous comment is pending
public cannot read pending comments
anonymous owner can edit within policy
public analytics event is validated
duplicate unique view is deduplicated
share action increments aggregated metrics
aggregation retry does not double-count
dashboard queries enforce authorization
```

### End-to-end tests

Add critical flows:

```text
visitor opens a published article
article view is recorded after valid engagement
visitor likes the article
visitor refreshes and reaction state remains
visitor changes like to dislike
visitor uses Copy Link and share action is recorded
admin opens analytics dashboard and sees updated KPIs
admin changes the date range
admin disables reactions and public controls disappear
direct reaction API is blocked while disabled
comments remain hidden and API-disabled by default
admin enables comments and the comment section becomes available
anonymous visitor chooses a name and submits a pending comment
moderator publishes the comment
```

### Accessibility tests

Verify:

- Like and dislike buttons have accessible names and pressed states.
- Reaction controls work with keyboard navigation.
- Anonymous profile dialog has focus management.
- Charts have text summaries or accessible data tables.
- Dashboard filters have labels.
- Comment form validation is announced to screen readers.

### Validation commands

Codex must run and report actual results for:

```text
pnpm lint
pnpm typecheck
pnpm test
pnpm build
```

Also run the repository’s existing integration and E2E commands.

Do not claim success for commands that were not executed.

---

## Implementation Steps

### Step 1 — Inspect the repository

Codex must:

1. Read root `AGENTS.md`.
2. Read all applicable module-level instruction files.
3. Inspect Payload and Next.js versions.
4. Inspect existing collections, globals, hooks, jobs, admin customization, feature flags, and analytics code.
5. Search for existing reaction, comment, view, share, and statistics implementations.
6. Identify current testing and migration conventions.
7. Record conflicts between this plan and existing code before modifying files.

### Step 2 — Add typed community settings

1. Add `community-settings` Payload Global.
2. Add typed server-side `FeatureFlagService`.
3. Add safe public feature projection.
4. Add admin authorization.
5. Add cache invalidation.
6. Seed defaults with comments disabled.
7. Add tests.

### Step 3 — Implement anonymous identity

1. Add anonymous-profile domain model.
2. Add token generator and hasher.
3. Add secure cookie service.
4. Add repository.
5. Add actor resolver.
6. Add profile read/update application services.
7. Add display-name and avatar validation.
8. Add admin collection.
9. Add public profile route handlers.
10. Add tests.

### Step 4 — Implement post reactions

1. Add reaction domain model.
2. Add actor-target uniqueness model.
3. Add repository and database constraint.
4. Add reaction command/query services.
5. Add transactional state transitions.
6. Add domain events.
7. Add counters and reconciliation logic.
8. Add API routes.
9. Add `PostReactions` UI.
10. Add feature-flag enforcement.
11. Add tests.

### Step 5 — Implement share tracking

1. Define allow-listed share channels.
2. Add share action contract.
3. Add ingestion validation.
4. Instrument existing share buttons.
5. Ensure analytics failures do not block sharing.
6. Add aggregation.
7. Add tests.

### Step 6 — Implement article-view tracking

1. Add isolated article view tracker.
2. Add visibility and engagement criteria.
3. Add event endpoint validation.
4. Add bot filtering and rate limiting.
5. Add deduplication.
6. Add post and site aggregation.
7. Add tests.

### Step 7 — Prepare comments behind the flag

1. Add comment domain model and collection.
2. Add ownership and moderation rules.
3. Add command/query services.
4. Add public API routes.
5. Enforce `commentsEnabled` on every read and mutation.
6. Add comment frontend components.
7. Render nothing and fetch nothing while disabled.
8. Add admin moderation configuration.
9. Add tests for disabled and enabled behavior.

### Step 8 — Add statistics read models

1. Add `post-statistics`.
2. Add `site-statistics`.
3. Add `analytics-daily-metrics`.
4. Add analytics event processing state.
5. Add aggregation and reconciliation services.
6. Add indexes.
7. Add tests.

### Step 9 — Add jobs

1. Register protected aggregation job.
2. Process events in bounded batches.
3. Add idempotency.
4. Add retry and failure logging.
5. Add rebuild/reconciliation operation.
6. Add aggregation-lag metrics.
7. Add tests.

### Step 10 — Build the Payload Admin dashboard

1. Add authorized dashboard query service.
2. Add KPI endpoint or server data loader.
3. Add date-range trend queries.
4. Add top-post query.
5. Register the custom Payload Admin view.
6. Add KPI cards.
7. Add separate trend charts.
8. Add reaction breakdown.
9. Add Top Posts table.
10. Add loading, empty, stale, and failure states.
11. Add accessibility support.
12. Add tests.

### Step 11 — Integrate with public post pages

1. Load public feature flags.
2. Render reaction widget when enabled.
3. Render share controls and count.
4. Add article view tracker.
5. Render comments only when enabled.
6. Read aggregate statistics from `post-statistics`.
7. Preserve Server Component rendering for article content.
8. Add cache tags and invalidation.

### Step 12 — Migrate and backfill

1. Generate explicit migrations.
2. Seed default settings.
3. Backfill existing data if applicable.
4. Run reconciliation.
5. Compare old and new counters if legacy fields exist.
6. Document rollback and deployment order.

### Step 13 — Validate and document

1. Run lint, type check, unit tests, integration tests, build, and E2E tests.
2. Update architecture and domain documentation.
3. Add an ADR for anonymous cookie identity.
4. Add an ADR for event-based analytics and derived read models.
5. Update access-control matrix.
6. Document feature-flag behavior.
7. Document analytics definitions, especially views, unique views, and share actions.
8. Report files changed, migrations, tests, limitations, and follow-up work.

---

## Documentation Updates

Create or update:

```text
docs/architecture/module-boundaries.md
docs/architecture/data-flow.md
docs/domain/anonymous-profile.md
docs/domain/community-reactions.md
docs/domain/comments.md
docs/domain/analytics.md
docs/operations/analytics-aggregation.md
docs/development/feature-flags.md
docs/adr/ADR-xxx-anonymous-cookie-identity.md
docs/adr/ADR-xxx-event-based-engagement-analytics.md
```

Document the exact definitions:

```text
Anonymous profile:
A server-resolved guest identity tied to a secure browser cookie.

Article view:
An accepted article engagement signal meeting visibility and interaction criteria.

Unique view:
One deduplicated anonymous profile or session view per post per configured window.

Like/dislike:
The single active reaction state of one actor for one target.

Share action:
A supported share-button activation, not guaranteed social publication.
```

---

## Risks

### Cookie loss

Deleting cookies or changing browsers creates a new anonymous identity.

Mitigation:

- Accept this as an anonymous-mode limitation.
- Explain it in the anonymous-profile UI.
- Do not implement recovery in Phase 5.

### Reaction counter drift

Transactional entities and derived counters can diverge after partial failures.

Mitigation:

- Use transactions where possible.
- Emit idempotent events.
- Add reconciliation and rebuild operations.
- Monitor differences.

### Analytics inflation

Bots, refreshes, repeated events, and prefetching may inflate views.

Mitigation:

- Require visibility and engagement.
- Deduplicate.
- Filter known bots.
- Apply rate limits.
- Keep raw events for controlled reprocessing.

### Feature flag bypass

Hiding UI alone would leave APIs accessible.

Mitigation:

- Enforce flags in application services and APIs.
- Add direct API tests while disabled.

### Admin dashboard performance

Unbounded event queries can make the dashboard slow.

Mitigation:

- Query only derived read models.
- Paginate Top Posts.
- Index date and post dimensions.
- Avoid raw-event aggregation during dashboard requests.

### Privacy

Anonymous identity and analytics can unintentionally become fingerprinting.

Mitigation:

- Use random cookie identity.
- Do not persist raw IP.
- Minimize metadata.
- Avoid browser fingerprinting.
- Define retention policies for raw events.

### Comment implementation scope

Building a complete disabled comment system can expand Phase 5 significantly.

Mitigation:

- Limit to plain-text anonymous comments, one reply level, pending moderation, edit, soft delete, and admin moderation.
- Do not add attachments, real-time updates, or reputation.

---

## Acceptance Criteria

Phase 5 is complete only when all criteria below are met.

### Anonymous profiles

- A first-time visitor receives a secure anonymous identity.
- The same browser cookie resolves the same profile.
- The visitor can choose and update a display name and preset avatar.
- The client never receives or submits trusted ownership identifiers.
- Blocked profiles cannot perform community mutations.
- Admin can view profile counts and manage profile status.

### Reactions

- Anonymous visitors can like or dislike published posts without logging in.
- One actor can have only one active reaction per post.
- Switching between like and dislike is atomic.
- Repeating the same operation does not create duplicates.
- Reaction state survives page refresh while the cookie remains.
- Like and dislike counts are accurate and reconcilable.
- Disabling reactions hides controls and blocks APIs.

### Comments

- Backend collections, services, routes, moderation, and frontend components exist.
- Comments are disabled by default.
- Disabled comments are not rendered, fetched, or publicly mutable.
- Admin can enable comments without a deployment.
- When enabled, an anonymous visitor with a display name can submit a pending comment.
- Only published comments are publicly visible.
- Ownership and moderation rules are server-enforced.

### Views and shares

- Valid article views are recorded through an event endpoint.
- Refreshing or duplicate signals do not improperly increase unique views.
- Share-button actions are recorded by channel.
- Analytics failures do not prevent the user from sharing.
- Raw analytics events are not publicly readable.

### Statistics

- The system records and exposes:
  - total anonymous profiles
  - total views
  - total unique views
  - total likes
  - total dislikes
  - total share actions
- Per-post statistics are available without counting raw events during page rendering.
- Daily metrics support at least 7-, 30-, and 90-day trend queries.
- Aggregation jobs are idempotent and retry-safe.
- A rebuild operation can reconcile totals from source data.

### Admin dashboard

- Authorized admins can open the analytics dashboard.
- The dashboard shows all-time KPI cards.
- The dashboard supports 7-, 30-, 90-day, and custom ranges.
- The dashboard shows separate trend visualizations.
- The dashboard includes a Top Posts table.
- The dashboard shows the last aggregation timestamp.
- Unauthorized roles cannot access dashboard data.
- Loading, empty, stale, and failure states are handled.

### Engineering quality

- Explicit database migrations are included.
- Authorization is enforced at collection, application-service, and API levels.
- Relevant unit, integration, and E2E tests pass.
- Lint, type check, and build pass.
- Documentation and ADRs are updated.
- No unrelated code is changed.
- No new external infrastructure is introduced without justification.
- Codex reports actual commands run and does not claim unverified results.

---

## Codex Final Report Format

After implementation, Codex must report:

```text
Summary
Architecture decisions
Files changed
Collections and globals added
API routes added
Admin views added
Feature-flag behavior
Migration and backfill impact
Authorization and security impact
Caching impact
Jobs and schedules
Tests added
Commands executed and actual results
Known limitations
Recommended Phase 6 follow-up
```
