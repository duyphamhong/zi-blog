# Phase 6 — Bilingual Markdown Import from the Existing Create Post Page

## Codex Implementation Prompt

Implement Phase 6 for the existing Next.js + Payload CMS technology blog.

Add an **Import VI + EN Markdown** button directly to the existing Payload Admin **Create Post** page. Do not add a new admin page or route for the user interface.

When an authorized admin clicks the button, open a modal that allows uploading exactly two Markdown files:

- Vietnamese blog content (`vi`)
- English blog content (`en`)

Reuse the existing Markdown-to-Payload-Lexical conversion capability. Validate both files before any database write. On confirmation, create one Payload Post document with localized fields populated for both `vi` and `en`, save it as a draft, and redirect the admin to the normal Post edit page. The admin will review shared metadata and both locales, then use the existing Save Draft, Review, Schedule, or Publish workflow.

Importing must never publish automatically. A failure in either locale must not create a partially imported Post.

Before implementation, inspect the repository, root `AGENTS.md`, applicable module instructions, current Posts collection, Payload version, localization configuration, existing Markdown converter, draft/version behavior, admin component customization patterns, authorization services, tests, and documentation. Follow existing project patterns and do not invent unsupported Payload APIs.

---

## Goal

Allow an editor to create a bilingual blog draft from two Markdown files without manually copying content into the Vietnamese and English locale editors.

The feature must:

1. Be launched from the existing Payload Admin Create Post page.
2. Upload one Vietnamese Markdown file and one English Markdown file.
3. Convert both files through the existing Markdown-to-Lexical pipeline.
4. Create one localized Post document.
5. Save the imported Post as a draft.
6. Redirect to the existing Post edit page.
7. Require an explicit user action through the existing editorial workflow before publication.

---

## Current Assumptions

Codex must verify these assumptions against the repository before changing code:

- Payload localization is already enabled with locale codes `vi` and `en`.
- The Posts collection already supports drafts and versions.
- The project already has a Markdown-to-Payload-Lexical converter.
- Post content is stored in Payload Lexical rich-text format.
- Vietnamese and English content belong to the same Post document.
- The existing workflow controls draft, review, approval, scheduling, publication, and archive.
- Shared Post fields such as author, category, tags, cover image, series, visibility, and featured state are not locale-specific.
- Localized fields include at least title, slug, excerpt, content, and localized SEO text.
- The existing public application already resolves content by locale.
- Import is an administrative authoring operation, not a public upload feature.

If any assumption is false, adapt the implementation to the existing architecture and document the difference. Do not replace established behavior merely to fit this plan.

---

## User Experience

### Entry Point

Add a secondary action button to the existing Payload Admin **Create Post** view:

```text
Import VI + EN Markdown
```

Recommended placement:

- In the Create Post header action area; or
- Near the main content editor, following the existing Payload Admin customization pattern.

Do not add:

- A separate import page.
- A new navigation menu item.
- A standalone admin route for the import interface.

The button should appear only when creating a new Post. It should not appear on the normal edit page in Phase 6.

### Import Modal

Clicking the button opens a modal containing:

```text
Import bilingual Markdown

Vietnamese Markdown
[ Select vi.md ]

English Markdown
[ Select en.md ]

[ Cancel ] [ Validate and Preview ]
```

After successful validation, show a compact preview for each locale:

```text
Vietnamese
- Title
- Slug
- Excerpt
- Word count
- Reading time
- Heading count
- Code block count

English
- Title
- Slug
- Excerpt
- Word count
- Reading time
- Heading count
- Code block count
```

Show validation warnings separately from blocking errors.

Confirmation actions:

```text
[ Back ] [ Import as Draft ]
```

### Successful Import

After import:

1. Create one draft Post.
2. Populate localized fields for `vi`.
3. Populate localized fields for `en`.
4. Return the created Post ID.
5. Close the modal.
6. Redirect to the existing Payload Post edit page for that Post.
7. Display a success notification.

Suggested message:

```text
Vietnamese and English content was imported successfully. Review the draft before publishing.
```

### Unsaved Create Form State

Because the user is still on the Create Post page, the current form may contain unsaved values.

Required behavior:

- Detect whether the create form has unsaved changes when possible through supported Payload Admin APIs.
- Before opening or confirming import, warn that the import operation creates a new draft and navigates away from the current create form.
- Do not silently discard entered form data.
- Prefer disabling the import action after the current create form has meaningful unsaved changes if Payload does not expose a reliable dirty-state confirmation mechanism.
- Do not implement fragile DOM inspection to infer form state.

---

## Markdown Input Contract

Support file extensions:

```text
.md
.markdown
```

Each file should support YAML frontmatter.

Vietnamese example:

```md
---
title: "Kiến trúc Modular Monolith"
slug: "kien-truc-modular-monolith"
excerpt: "Cách xây dựng một modular monolith có khả năng mở rộng."
seoTitle: "Modular Monolith là gì?"
seoDescription: "Hướng dẫn thiết kế Modular Monolith trong ứng dụng thực tế."
---

# Kiến trúc Modular Monolith

Nội dung bài viết...
```

English example:

```md
---
title: "Modular Monolith Architecture"
slug: "modular-monolith-architecture"
excerpt: "How to build an extensible modular monolith."
seoTitle: "What Is a Modular Monolith?"
seoDescription: "A practical guide to modular monolith architecture."
---

# Modular Monolith Architecture

Article content...
```

### Required Localized Values

At minimum:

```text
title
content
```

Slug behavior:

- Use frontmatter slug when supplied.
- Otherwise derive a slug from the localized title.
- Validate uniqueness in the relevant locale.
- Do not silently append arbitrary suffixes such as `-2`.
- Return a clear conflict error when a slug already exists.

Optional values:

```text
excerpt
seoTitle
seoDescription
```

If the current converter or Post model supports additional localized metadata, preserve it through explicit typed mappings rather than arbitrary frontmatter passthrough.

Unknown frontmatter fields should either:

- Be ignored with a warning; or
- Be rejected according to the existing converter contract.

Do not mass-assign frontmatter directly into Payload data.

---

## Affected Modules

Primary owner:

```text
content
```

Likely affected areas:

```text
Payload Posts collection
Payload Admin custom components
Markdown parsing and conversion
Post application services
Post authorization
Draft/version persistence
Localized slug validation
Tests
Content authoring documentation
```

Potential supporting modules:

```text
identity — actor and authorization resolution
seo — localized SEO mapping and validation
platform — typed limits or feature configuration
```

Do not move import logic into unrelated shared utility folders.

---

## Architecture Changes

### Admin Component

Create a focused custom admin component for the Create Post view.

Suggested placement, adjusted to repository conventions:

```text
apps/web/src/payload/components/posts/bilingual-markdown-import/
├── bilingual-markdown-import-button.tsx
├── bilingual-markdown-import-modal.tsx
├── localized-markdown-file-input.tsx
├── bilingual-import-preview.tsx
├── bilingual-import-errors.tsx
└── index.ts
```

Responsibilities:

- Render the button.
- Manage modal state.
- Select two files.
- Submit validation requests.
- Display preview and errors.
- Confirm draft import.
- Navigate to the created Post edit page.
- Show loading, error, and success states.

The component must not contain:

- Markdown parsing business logic.
- Markdown-to-Lexical conversion logic.
- Authorization decisions.
- Direct database operations.
- Locale persistence rules.

### Application Service

Create or extend an application service in the content module.

Suggested placement:

```text
apps/web/src/modules/content/application/import-bilingual-post.service.ts
```

Suggested contract:

```ts
export type SupportedPostLocale = 'vi' | 'en'

export interface MarkdownImportFile {
  locale: SupportedPostLocale
  fileName: string
  source: string
}

export interface ValidateBilingualPostImportInput {
  vietnamese: MarkdownImportFile
  english: MarkdownImportFile
  actor: Actor
}

export interface CreateBilingualPostDraftInput
  extends ValidateBilingualPostImportInput {
  requestContext: RequestContext
}

export interface LocalizedPostImportPreview {
  locale: SupportedPostLocale
  title: string
  slug: string
  excerpt?: string
  seoTitle?: string
  seoDescription?: string
  lexicalContent: unknown
  wordCount: number
  readingTimeMinutes: number
  headingCount: number
  codeBlockCount: number
  warnings: string[]
}

export interface BilingualPostImportPreview {
  vi: LocalizedPostImportPreview
  en: LocalizedPostImportPreview
  warnings: string[]
}

export interface CreateBilingualPostDraftResult {
  postId: string
  status: 'draft'
  preview: BilingualPostImportPreview
}

export interface BilingualPostImportService {
  validate(
    input: ValidateBilingualPostImportInput,
  ): Promise<BilingualPostImportPreview>

  createDraft(
    input: CreateBilingualPostDraftInput,
  ): Promise<CreateBilingualPostDraftResult>
}
```

Use actual project types instead of duplicating `Actor`, `RequestContext`, Post types, or localized field types when they already exist.

### Conversion Pipeline

Reuse the current converter.

If needed, refactor it into explicit reusable operations such as:

```text
parseMarkdownFrontmatter
validateMarkdownMetadata
convertMarkdownToLexical
extractMarkdownMetrics
mapMarkdownToLocalizedPostFields
```

Both locales must use the same pipeline. Do not create separate Vietnamese and English converters.

### Payload Integration

The Posts collection should register the custom component through the supported customization mechanism for the installed Payload version.

Codex must inspect:

- Payload package version.
- Existing `admin.components` usage.
- Collection edit/create view APIs.
- Client/server component requirements.
- Import map or component path requirements.
- Existing modal and notification patterns.

Do not assume a Payload API from another major version.

---

## Data Model Changes

Prefer no new collection and no new database table.

Confirm that these Post fields are localized:

```text
title
slug
excerpt
content
seo.metaTitle
seo.metaDescription
```

Shared fields should remain non-localized:

```text
author
coAuthors
category
tags
series
seriesOrder
coverImage
featured
visibility
status
publishedAt
scheduledAt
```

If localization is not yet configured correctly:

- Update the Posts collection field configuration.
- Add an explicit Payload/PostgreSQL migration.
- Preserve existing Vietnamese content.
- Define fallback behavior.
- Document any schema impact.

Do not introduce independent Post records for each language.

---

## API Changes

Create a protected admin-only endpoint or server action following the current project architecture.

Suggested route:

```text
POST /api/admin/posts/import-bilingual
```

This route is not a user-facing page. It is only the backend handler used by the modal embedded in Create Post.

Use `multipart/form-data`.

Suggested fields:

```text
viFile
enFile
operation = validate | import
```

### Validate Operation

The validate operation must:

1. Authenticate the actor.
2. Authorize Post creation and bilingual import.
3. Validate file count and locale assignment.
4. Validate file extension and content.
5. Parse both files.
6. Convert both Markdown bodies to Lexical.
7. Validate required localized fields.
8. Check localized slug conflicts.
9. Return previews and warnings.
10. Perform no database write.

### Import Operation

The import operation must:

1. Repeat server-side validation; do not trust a previous preview response.
2. Parse and convert both files again, or use a secure short-lived server-side validation token if the project already has that pattern.
3. Create one Post draft.
4. Persist both locales atomically where supported.
5. Return the Post ID and edit URL.
6. Never publish.
7. Never update search, sitemap, or public cache as if the draft were published.

Example success response:

```json
{
  "success": true,
  "postId": "post-id",
  "status": "draft",
  "editUrl": "/admin/collections/posts/post-id",
  "locales": {
    "vi": {
      "title": "Kiến trúc Modular Monolith",
      "slug": "kien-truc-modular-monolith",
      "readingTimeMinutes": 8
    },
    "en": {
      "title": "Modular Monolith Architecture",
      "slug": "modular-monolith-architecture",
      "readingTimeMinutes": 7
    }
  },
  "warnings": []
}
```

Use the repository's structured application error format.

Potential codes:

```text
INVALID_FILE_COUNT
INVALID_FILE_TYPE
FILE_TOO_LARGE
INVALID_FILE_ENCODING
INVALID_FRONTMATTER
MISSING_REQUIRED_METADATA
MARKDOWN_CONVERSION_FAILED
DUPLICATE_LOCALIZED_SLUG
UNAUTHORIZED_IMPORT
DRAFT_CREATION_FAILED
PARTIAL_IMPORT_ROLLED_BACK
```

---

## Persistence and Transaction Behavior

The import represents one business operation:

```text
Create one bilingual Post draft
```

Required invariant:

```text
Both locales are persisted, or neither locale is persisted.
```

Codex must inspect how the installed Payload version and PostgreSQL adapter support transactions and request-scoped transaction propagation.

Preferred behavior:

```text
Begin transaction
→ create draft using default locale
→ write Vietnamese localized fields
→ write English localized fields
→ verify both locales
→ commit
```

On any failure:

```text
rollback
→ return structured error
→ do not leave an incomplete Post
```

If Payload cannot make both localized writes atomic through supported APIs:

1. Use the nearest supported transaction mechanism.
2. If a temporary record is unavoidable, delete it safely on failure.
3. Log cleanup failures with correlation data.
4. Add an integration test for partial failure.
5. Document the limitation honestly.

Do not manually modify Payload tables outside supported repository patterns merely to simulate localization.

---

## Draft and Editorial Workflow

Import must always result in:

```text
status = draft
```

It must not set:

```text
publishedAt
scheduledAt
approvedAt
```

After redirect, the admin uses the existing workflow:

```text
draft
→ in_review
→ approved
→ scheduled or published
→ archived
```

The feature must not add a new publication path or bypass workflow authorization.

### Publish Validation

When multi-language publication is required, the existing publish command should ensure both locales contain required fields:

```text
vi.title
vi.slug
vi.content
en.title
en.slug
en.content
```

Rules:

- Saving a draft may allow incomplete shared metadata.
- Import itself requires valid content in both uploaded files.
- Publication must still run the normal comprehensive Post validation.
- An imported draft must not be treated as approved.
- Authors must not gain publish permission through the import endpoint.

Independent publication by locale is out of scope for Phase 6.

---

## Authorization

Server-side authorization is mandatory.

At minimum, verify:

```text
actor identity
actor status
Post create permission
localized import permission
field permissions
workflow permissions
site or tenant scope if applicable
```

Expected roles:

```text
super_admin — allowed
editor — allowed
author — allowed only if the current application permits authors to create drafts
moderator — denied unless explicitly granted editorial permissions
member — denied
anonymous — denied
```

Do not rely on hiding the button.

The endpoint must independently enforce authorization.

---

## Security

Apply the existing upload security baseline.

Recommended limits, preferably typed configuration:

```text
Allowed extensions:
.md
.markdown

Maximum files:
2

Required locale files:
1 Vietnamese
1 English

Maximum size:
1–2 MB per file

Encoding:
UTF-8

Maximum frontmatter size:
32 KB or the current configured limit
```

Required controls:

- Validate extension and actual text content.
- Reject binary input.
- Do not trust browser MIME type alone.
- Do not use uploaded file names as storage paths.
- Do not persist the Markdown source unless explicitly required.
- Do not log full blog content.
- Constrain YAML aliases, recursion, and unsafe types.
- Reject prototype-pollution keys.
- Sanitize or reject raw HTML according to the existing Markdown policy.
- Validate external embeds through existing allowlists.
- Apply admin endpoint rate limits where available.
- Add request size limits.
- Return safe user-facing errors without stack traces.
- Preserve correlation IDs in server logs.

---

## Caching

Importing a draft must not:

```text
revalidate public pages
invalidate published Post cache
update public locale routes
update homepage/category/tag caches
```

Normal publication should continue to revalidate:

```text
Vietnamese Post URL
English Post URL
homepage
category pages
tag pages
series page
author page
related content
```

Use the existing publish lifecycle and cache invalidation service.

---

## Search and SEO

On import:

```text
Do not index the draft.
Do not add it to the sitemap.
Do not expose it through RSS.
Do not create public canonical URLs.
```

On normal publication:

- Index localized search documents for both `vi` and `en`.
- Generate or update localized sitemap entries.
- Preserve locale-specific slugs and canonical URLs.
- Apply localized SEO metadata.
- Run the existing publication event handlers.

Do not add search or sitemap behavior directly to the import service.

---

## Events and Audit

Optionally emit an internal audit event after the transaction succeeds:

```text
PostBilingualMarkdownImported
```

Suggested schema:

```ts
export interface PostBilingualMarkdownImported {
  eventId: string
  eventVersion: 1
  postId: string
  locales: ['vi', 'en']
  actorId: string
  occurredAt: string
  correlationId?: string
}
```

The event must not trigger public publication behavior.

Do not add Kafka or an external broker for this feature.

---

## UI States

The modal must handle:

```text
initial
files_selected
validating
validation_failed
preview_ready
importing
import_failed
import_succeeded
```

Required UX:

- Clear locale labels.
- Accessible file inputs.
- Keyboard-accessible modal.
- Visible focus management.
- Screen-reader-friendly error summary.
- Disabled confirmation during requests.
- No duplicate submissions.
- Per-file errors and shared errors.
- Loading state.
- Safe modal close behavior.
- File replacement before confirmation.
- Preserve selected files when validation returns recoverable errors where practical.

---

## Migration

### No Migration Case

No migration is needed if:

- Payload localization already supports `vi` and `en`.
- Required Post fields are already localized.
- Draft/version support is already enabled.
- No persistent import metadata is added.

### Migration Required Case

Create an explicit migration if Phase 6 changes:

- Localized field storage.
- Post field definitions.
- Locale configuration.
- Unique constraints.
- Draft/version configuration.

Migration requirements:

- Preserve existing content as the correct default locale.
- Avoid making existing published Posts unavailable.
- Define English fallback behavior for legacy Posts.
- Use backward-compatible deployment steps.
- Add data verification after migration.
- Document rollback constraints.

Do not enable uncontrolled production schema synchronization.

---

## Testing

### Unit Tests

Add tests for:

```text
valid Vietnamese frontmatter
valid English frontmatter
missing title
empty body
invalid YAML
unsafe YAML structures
invalid UTF-8
binary input
unsupported extension
oversized file
slug derivation
locale-aware slug conflict
Markdown-to-Lexical conversion
headings
code blocks
links
images
reading time
word count
warning aggregation
frontmatter allowlist mapping
```

### Integration Tests

Add tests for:

```text
authorized editor validates two files
unauthorized actor is rejected
validation performs no database write
one bilingual Post draft is created
Vietnamese fields are stored in vi
English fields are stored in en
both locales share the same Post ID
draft status is preserved
publishedAt remains unset
failure in vi creates no Post
failure in en creates no Post
failure during second locale write rolls back the first write
localized duplicate slug returns ConflictError
draft is not included in public queries
draft is not indexed
draft does not trigger public cache invalidation
```

### End-to-End Tests

Cover the main admin journey:

```text
admin opens Create Post
Import VI + EN Markdown button is visible
admin opens the modal
admin uploads vi.md and en.md
admin validates the files
preview shows both locales
admin confirms Import as Draft
system creates one draft
system redirects to the normal edit page
admin switches to vi and sees Vietnamese content
admin switches to en and sees English content
admin completes shared metadata
admin uses the normal publish workflow
both localized public routes become available after publication
```

Also cover:

```text
button does not appear on the normal edit page
invalid English Markdown blocks the entire import
double click does not create duplicate Posts
unauthorized API request is rejected even when the button is hidden
unsaved create-form changes are not silently discarded
```

---

## Implementation Steps

1. Read root and module-level agent instructions.
2. Inspect architecture and content module documentation.
3. Inspect the installed Payload version and localization configuration.
4. Inspect the Posts collection, drafts, versions, and workflow fields.
5. Inspect existing Create Post admin customization points.
6. Inspect the existing Markdown-to-Lexical converter and its tests.
7. Inspect authorization, structured errors, logging, and route patterns.
8. Confirm which Post fields are localized and shared.
9. Define typed import contracts and validation schemas.
10. Refactor the converter only as needed for reuse; preserve existing behavior.
11. Implement the bilingual import application service.
12. Implement locale-aware slug validation.
13. Implement transactional draft creation.
14. Implement the protected validation/import backend handler.
15. Add the Create Post button using supported Payload Admin components.
16. Implement the accessible modal, upload controls, preview, and state handling.
17. Redirect to the existing Post edit page after successful import.
18. Ensure the import path cannot publish or bypass workflow rules.
19. Add unit tests.
20. Add integration tests with PostgreSQL/Payload.
21. Add critical admin E2E tests.
22. Add or update migrations only when required.
23. Update content-authoring and admin documentation.
24. Run lint, formatting check, type check, tests, and build.
25. Report changed files, migration impact, security impact, test results, limitations, and follow-up work.

---

## Risks and Mitigations

### Payload Admin API Differences

Risk:

- Create-view customization APIs differ between Payload versions.

Mitigation:

- Verify the installed version and follow existing repository patterns and official version-matched APIs.

### Partial Localized Persistence

Risk:

- The first locale is saved but the second locale fails.

Mitigation:

- Use a supported transaction and test rollback behavior.

### Duplicate Draft Creation

Risk:

- Repeated submission creates multiple Posts.

Mitigation:

- Disable the action while importing and add an idempotency mechanism if the application already supports request idempotency.

### Unsaved Create Form Data Loss

Risk:

- The admin enters fields before opening import and loses them after redirect.

Mitigation:

- Detect dirty state through supported APIs, warn clearly, or disable import after meaningful manual editing.

### Converter Regression

Risk:

- Refactoring the existing converter breaks the old single-file flow.

Mitigation:

- Preserve the current public contract and add regression tests.

### Locale Fallback Hides Missing Content

Risk:

- Payload fallback returns Vietnamese content while validating English content.

Mitigation:

- Disable fallback for completeness checks and explicitly query each locale.

### Slug Collision

Risk:

- Generated or imported localized slugs collide with existing Posts.

Mitigation:

- Check conflicts before write and again inside the transaction where practical.

### Import Bypasses Workflow

Risk:

- The import path accidentally creates published or approved content.

Mitigation:

- Hard-code draft creation at the application-service boundary and test lifecycle fields.

---

## Out of Scope

Do not implement in Phase 6:

```text
A separate import administration page
Importing more than two locales
Automatic machine translation
Automatic publication
Independent publication status per locale
Replacing content of existing Posts
Bulk ZIP import
Import history dashboard
Scheduled import
Remote URL import
Background queue or external broker
AI content review
AI summary generation
```

The design may leave clear extension points, but these capabilities must not be added without a separate approved phase.

---

## Acceptance Criteria

Phase 6 is complete only when:

1. The existing Create Post page contains an **Import VI + EN Markdown** button.
2. No separate import page or admin navigation item is introduced.
3. The button appears only for authorized users creating a new Post.
4. Clicking the button opens an accessible modal.
5. The modal requires exactly one Vietnamese and one English Markdown file.
6. Both files are validated before database persistence.
7. The existing Markdown-to-Lexical converter is reused.
8. A successful import creates exactly one Post document.
9. Vietnamese localized fields are populated under `vi`.
10. English localized fields are populated under `en`.
11. Both locales use the same Post ID.
12. The Post is saved only as a draft.
13. Import never sets published, approved, or scheduled lifecycle fields.
14. A failure in either locale leaves no partial Post.
15. The system redirects to the existing Post edit page after success.
16. The admin can switch between `vi` and `en` and review imported content.
17. The normal editorial workflow remains the only path to publication.
18. Draft import does not update public cache, search, RSS, or sitemap.
19. Authorization is enforced on the server.
20. Unsaved Create Post form data is not silently discarded.
21. Unit, integration, and critical E2E tests cover the feature.
22. Any required migration is explicit, reviewable, and backward-compatible.
23. Existing single-file Markdown conversion behavior has regression coverage.
24. Lint, type check, tests, and build pass before the work is reported complete.

---

## Required Codex Delivery Report

At completion, report:

```text
Summary
Architecture decisions
Files changed
Payload customization used
Localized persistence approach
Transaction behavior
Authorization changes
Migration impact
Security controls
Tests added
Commands executed
Test and build results
Known limitations
Follow-up recommendations
```

Do not state that the feature is production-ready unless all acceptance criteria and critical validations pass.
