# Phase 4 Implementation Plan — Zi-Blog Markdown Import to Payload Lexical

## 1. Goal

Implement a safe, production-ready Markdown import workflow for the existing Zi-Blog post collection.

Editors must be able to paste a complete Zi-Blog article into a dedicated Payload Admin field using this structure:

```text
TITLE: Article title
SLUG: article-slug
EXCERPT: Article summary
SEO_TITLE: SEO title
SEO_DESCRIPTION: SEO description
CONTENT:

## First section

Markdown content...
```

On an intentional Save or Publish action, the system must:

1. Parse the supported metadata.
2. Validate the Zi-Blog source format.
3. Convert only the Markdown after `CONTENT:` into Payload Lexical JSON.
4. Write the converted result into the existing rich-text content field.
5. Map only metadata values that are present in the Markdown source.
6. Avoid overwriting later manual edits made directly in the Lexical editor when the Markdown source has not changed.
7. Preserve all existing post workflow, access control, versioning, drafts, autosave behavior, hooks, SEO structure, and Lexical features.

This phase must extend the existing content module without introducing a new service, microservice, external queue, or unrelated infrastructure.

---

## 2. Current Assumptions

These are working assumptions only. Codex must verify them against the repository before changing code.

- The project uses Payload CMS `3.86.0`.
- The project uses `@payloadcms/richtext-lexical` `3.86.0`.
- The post collection already exists.
- The post content is already stored as Payload Lexical rich text.
- The repository may already contain shared Lexical features, blocks, hooks, SEO fields, tabs, access rules, drafts, versions, or autosave configuration.
- The public frontend already renders the existing rich-text field and must not be changed unless the imported Lexical nodes expose a confirmed rendering gap.
- The names `posts`, `content`, `seo`, `markdownSource`, and the sample file paths in this plan are not guaranteed to match the repository.

Codex must not implement from these assumptions without inspection.

---

## 3. Mandatory Repository Inspection

Before writing code, Codex must inspect and briefly report the findings for the following areas.

### 3.1 Project instructions

Read all applicable instruction and architecture files, including:

- Root `AGENTS.md`.
- Any module-level `AGENTS.md` files.
- `Agent.md` if present.
- `README.md`.
- Relevant documents under `docs/architecture`, `docs/domain`, `docs/development`, and ADRs.
- Existing coding, testing, migration, and Payload conventions.

### 3.2 Post collection

Locate the actual post collection and identify:

- Collection slug.
- Collection file path.
- Actual title field.
- Actual slug field.
- Actual excerpt field.
- Actual rich-text content field.
- Actual SEO title and SEO description paths.
- Existing tabs, groups, sidebar fields, and admin layout.
- Existing hooks and their execution order.
- Existing access control and field-level permissions.
- Draft, versioning, autosave, scheduled publishing, and preview configuration.
- Existing slug normalization or uniqueness logic.
- Existing generated Payload types.

### 3.3 Lexical configuration

Identify:

- How the content field creates its Lexical editor.
- Whether the project has a shared editor factory or shared feature factory.
- All enabled default and custom features.
- Custom blocks, uploads, links, headings, code blocks, toolbars, converters, and renderers.
- Whether code blocks preserve a language value.
- Whether the frontend renderer supports every node the Markdown converter can generate.

### 3.4 Installed API verification

Inspect the installed package source and TypeScript declarations in `node_modules` for version `3.86.0` and verify:

- The actual export and signature of `convertMarkdownToLexical`.
- The required editor configuration or `editorConfigFactory` type.
- Required conversion context or request arguments.
- Supported Markdown transformers/features.
- Validation/error types appropriate for a Payload hook.
- Whether conversion can run safely inside a collection hook.

Do not copy an API signature from another Payload version.

### 3.5 Testing setup

Identify:

- Unit-test framework and conventions.
- Integration-test conventions.
- Existing Payload test utilities or test database setup.
- Existing scripts for typecheck, lint, tests, and build.

### Inspection output

Before implementation, Codex should provide a concise implementation note containing:

- Confirmed collection and field names.
- Confirmed SEO mapping.
- Confirmed Lexical configuration source.
- Autosave/versioning status.
- Selected import trigger strategy.
- Expected schema and migration impact.
- Proposed files to add or modify.

After this note, continue directly with implementation.

---

## 4. Affected Modules

### Primary owner

The feature belongs to the existing `content` module because it is an editorial content-ingestion capability.

### Expected affected areas

- Content-domain/application code for parsing and conversion orchestration.
- Payload post collection configuration.
- Shared Lexical editor configuration, only if sharing is not already implemented.
- Payload schema/types generated from new fields.
- Database migration or schema update for stored import fields.
- Content-module tests.
- Editor documentation.

### Areas that should remain unaffected

- Public API contracts, unless raw internal import fields are currently exposed and must be hidden.
- Public article rendering, unless a verified converter-renderer compatibility issue requires a focused fix.
- Community, analytics, search, notification, identity, or moderation modules.
- Publishing workflow and authorization rules.

---

## 5. Architecture Changes

### 5.1 Keep Payload configuration declarative

Do not put parser, hashing, metadata mapping, conversion, and logging logic directly inside the collection definition.

Use a thin Payload hook that delegates to a content-module service.

Preferred conceptual flow:

```text
Payload beforeChange hook
        ↓
Markdown import application service
        ↓
Zi-Blog source parser
        ↓
Deterministic source hash
        ↓
Shared Lexical editor configuration
        ↓
Payload Markdown-to-Lexical converter
        ↓
Updated post write data
```

### 5.2 Suggested responsibilities

#### Zi-Blog parser

Responsible only for:

- Normalizing LF and CRLF handling.
- Finding the top-level `CONTENT:` delimiter.
- Parsing recognized metadata before the delimiter.
- Preserving the Markdown body after the delimiter.
- Returning a strongly typed result.
- Returning structured, actionable validation errors.

#### Markdown hash function

Responsible only for:

- Producing a deterministic SHA-256 or equivalent stable hash.
- Hashing the exact normalized source representation chosen by the implementation.
- Avoiding environment-dependent output.

#### Markdown import application service

Responsible for:

- Deciding whether import is required.
- Respecting the explicit trigger strategy when autosave requires it.
- Parsing and validating the source.
- Calling `convertMarkdownToLexical` with the same configuration as the content editor.
- Validating the returned Lexical root.
- Mapping imported metadata to the confirmed existing field paths.
- Updating the stored import hash only after successful conversion.
- Resetting a force/import checkbox after successful execution.
- Returning a new data object rather than unexpectedly mutating shared input.

#### Payload hook

Responsible only for:

- Supplying hook context to the application service.
- Preserving existing hook order and behavior.
- Converting service errors into safe Payload validation errors.
- Logging limited technical context without logging the full article.

### 5.3 File placement

Follow the repository’s existing structure. If no equivalent convention exists, prefer module-owned paths such as:

```text
src/modules/content/markdown-import/
├── parse-zi-blog-markdown.ts
├── hash-markdown-source.ts
├── import-markdown-into-post.ts
├── markdown-import.errors.ts
├── markdown-import.types.ts
└── index.ts

src/payload/hooks/posts/
└── import-post-markdown-before-change.ts
```

Do not create a global `utils`, `helpers`, or generic `services` dumping ground.

Paths above are examples only and must be adapted to the actual repository.

---

## 6. Data Model Changes

Add internal editorial fields to the existing post collection. Use actual repository naming conventions.

### 6.1 Markdown source field

Recommended logical field:

```text
markdownSource
```

Requirements:

- Payload type: `textarea` or the closest existing multiline text convention.
- Stores the complete Zi-Blog Markdown source, including metadata and `CONTENT:`.
- Admin-only/editorial field.
- Must not be rendered on the public frontend.
- Must not appear in public feed projections.
- Add an explicit description explaining import and overwrite behavior.
- Apply field-level access restrictions if the project exposes collection documents through public APIs.

Recommended description:

> Paste an article using the Zi-Blog Markdown format. On Save or Publish, changed Markdown is imported into Content. Unchanged Markdown will not overwrite content edited directly in the Lexical editor.

### 6.2 Last imported hash field

Recommended logical field:

```text
lastImportedMarkdownHash
```

Requirements:

- Internal string field.
- Hidden from normal Admin editing.
- Read-only from client/API mutations where practical.
- Updated only after successful parsing and Lexical conversion.
- Never updated when conversion fails.

### 6.3 Explicit import or force-import field

The final choice depends on autosave inspection.

#### Strategy A — no autosave or autosave cannot trigger this hook unexpectedly

Use hash-based automatic import:

- Import when `markdownSource` is non-empty and its current hash differs from `lastImportedMarkdownHash`.
- Optionally provide `forceReimportMarkdown` to re-import unchanged source.

#### Strategy B — autosave is enabled and would repeatedly run conversion while the user types

Use an explicit checkbox:

```text
importMarkdownIntoContent
```

Behavior:

- Convert only when the checkbox is `true`.
- Still use the hash to protect manual edits and detect unchanged source.
- A force mode may be represented by the same explicit checkbox if clicking it intentionally imports regardless of equal hash, or by a separate force checkbox if UX requires distinction.
- Reset the checkbox to `false` after successful conversion.
- Decide and document behavior after inspecting Payload autosave semantics and how field values are submitted.

### 6.4 Schema and generated types

- Regenerate Payload TypeScript types using the existing project command.
- Add a migration if the project requires explicit migrations for collection schema changes.
- New fields must be nullable/optional so existing posts remain valid.
- Do not backfill or rewrite existing rich-text data.
- Do not rename existing public fields.

---

## 7. Zi-Blog Markdown Parser Design

### 7.1 Supported metadata keys

Recognize exactly these top-level keys before `CONTENT:`:

```text
TITLE
SLUG
EXCERPT
SEO_TITLE
SEO_DESCRIPTION
```

Return a typed result equivalent to:

```typescript
export type ParsedZiBlogMarkdown = {
  title?: string
  slug?: string
  excerpt?: string
  seoTitle?: string
  seoDescription?: string
  content: string
}
```

Use naming consistent with the codebase, but keep the parser independent from Payload collection types.

### 7.2 Parsing rules

- Support both LF and CRLF input.
- Metadata is read only before the valid top-level `CONTENT:` delimiter.
- Split metadata lines only at the first colon.
- Values may contain additional colons.
- Trim metadata keys and outer value whitespace without modifying meaningful content.
- Preserve Markdown body line structure.
- Require a valid `CONTENT:` delimiter.
- Require non-whitespace content after the delimiter.
- Missing optional metadata must not fail parsing.
- Unknown metadata keys should be ignored or reported according to the repository’s validation convention; do not map them silently to fields.
- `CONTENT:` inside fenced code blocks must not be treated as the delimiter.
- Text containing `CONTENT:` after the real delimiter remains normal Markdown content.
- Do not interpret `[P]`, `[H2]`, or similar custom markers. The goal is standard Markdown input.

### 7.3 Delimiter detection

Implement a deterministic line scanner rather than a single fragile regular expression.

The scanner should track fenced code-block state for both common fence forms where supported by the chosen Markdown semantics:

```text
```
~~~
```

A valid delimiter should be a standalone metadata line matching `CONTENT:` outside a fence and before the Markdown body begins.

### 7.4 Parser errors

Create specific errors or error codes for at least:

- Missing `CONTENT:` delimiter.
- Empty Markdown content.
- Invalid source type if runtime input is not a string.

Messages shown in Payload Admin must be concise and actionable, for example:

```text
Markdown import failed: add a standalone CONTENT: line before the article body.
```

Do not expose stack traces or internal parser details to editors.

---

## 8. Markdown Hashing and Import Decision

### 8.1 Hash input

Choose and document one deterministic normalization rule before hashing.

Recommended rule:

- Convert CRLF to LF.
- Preserve all other content, including whitespace inside the Markdown body.
- Do not trim the full source unless the same normalization is used consistently for every import.

### 8.2 Import decision matrix

The service must satisfy this behavior:

| Scenario | Expected result |
|---|---|
| New non-empty Markdown source | Parse and import |
| Markdown source changed | Parse and re-import |
| Markdown source unchanged | Do not touch rich-text content |
| Rich-text content manually edited, Markdown unchanged | Preserve manual edit |
| Markdown source cleared | Preserve existing rich-text content |
| Optional metadata absent | Preserve existing field value |
| Metadata present | Overwrite only the mapped field |
| Import explicitly forced | Re-import current non-empty source |
| Conversion fails | Preserve prior content and hash |

### 8.3 Partial updates

Payload update operations may submit only changed fields. The implementation must use the appropriate combination of:

- Incoming `data`.
- `originalDoc` or equivalent existing document data.
- Operation type (`create` or `update`).

Do not assume `markdownSource` is always present in `data`.

Do not import when an unrelated update omits the Markdown fields unless the explicit trigger semantics require looking up the stored source.

---

## 9. Shared Lexical Configuration

### 9.1 Single source of truth

The Admin content editor and Markdown converter must use the same Lexical configuration.

If a shared editor configuration already exists, reuse it without duplication.

If configuration is currently declared inline in the post collection, refactor only the minimum required portion into a shared factory.

### 9.2 Preserve existing features

The refactor must preserve:

- Existing `defaultFeatures` behavior.
- Existing heading support.
- Existing link behavior.
- Existing upload/media behavior.
- Existing blocks.
- Existing code features.
- Existing toolbars.
- Existing custom features and converters.

Do not replace the current editor with a reduced Markdown-specific editor.

### 9.3 H1 restriction

Zi-Blog article content should not introduce an H1 because the post title is the page-level H1.

Implementation options, selected only after verifying converter capabilities:

1. Configure supported Markdown headings to H2–H4 where possible.
2. Validate and reject H1 in imported content with a friendly message.
3. Normalize H1 to H2 only if this behavior is explicitly documented and covered by tests.

Prefer validation over silent semantic rewriting unless the existing product convention already defines normalization.

### 9.4 Code block language

Verify whether the installed converter and current code feature retain fenced-code language metadata.

- If supported, test at least one fenced TypeScript block and assert the language property.
- If unsupported, do not fabricate incompatible Lexical JSON.
- Either add a compatible transformer/feature using the current editor configuration or document the limitation.
- Ensure the public renderer behaves safely when language is absent.

---

## 10. Payload Hook Behavior

### 10.1 Hook selection

Prefer a collection `beforeChange` hook if it is compatible with the existing architecture and Payload version.

The hook must:

- Run for create and update.
- Preserve existing hooks and their order.
- Avoid unexpected mutation of shared input.
- Avoid slow external calls.
- Avoid logging the full Markdown body.
- Work correctly for drafts and publish operations.
- Not change post status.
- Not publish automatically.

### 10.2 Hook ordering

Inspect dependencies between current hooks.

Potential ordering concerns include:

- Slug formatting or uniqueness validation.
- SEO normalization.
- Reading-time calculation.
- Content validation.
- Workflow validation.
- Search-index triggers in later hooks.

The Markdown import must occur early enough that downstream content-dependent hooks see the converted content, but it must not bypass existing validation or authorization.

Document the chosen ordering.

### 10.3 Error handling

- Convert parser/conversion failures into Payload-compatible validation errors.
- Include safe context in structured logs: collection, operation, document ID when available, actor ID when safe, and error category.
- Never log full Markdown source, full Lexical output, tokens, or private request data.
- Preserve the original error as an internal cause where the project’s error framework supports it.

---

## 11. Metadata Mapping

Map parsed values to confirmed existing fields only when each value is present in the source.

Logical mapping:

| Source key | Target |
|---|---|
| `TITLE` | Existing post title field |
| `SLUG` | Existing post slug field |
| `EXCERPT` | Existing post excerpt field |
| `SEO_TITLE` | Existing SEO title path |
| `SEO_DESCRIPTION` | Existing SEO description path |
| Markdown after `CONTENT:` | Existing Lexical content field |

Rules:

- Do not overwrite a target when the corresponding metadata key is absent.
- Decide explicitly how an empty metadata value behaves. Recommended: treat a present but empty value as invalid for required fields and as an explicit empty value only where the existing field allows it. Cover the choice with tests.
- Reuse existing slug normalization and uniqueness behavior.
- Do not bypass field hooks or access controls.
- Preserve unrelated nested SEO properties when updating one SEO field. Use immutable nested merging rather than replacing the entire SEO object.
- Do not overwrite author, category, tags, status, cover image, publication dates, or any unrelated fields.

---

## 12. UI Changes in Payload Admin

Place Markdown import controls in a logical editorial location based on the existing post form.

Preferred placement:

- A dedicated `Markdown Import` collapsible, group, or tab near Content.
- Avoid placing internal hash fields in the visible UI.
- Avoid cluttering the primary writing experience.

Required UI text must explain:

- The expected Zi-Blog format.
- That Markdown is converted into Content.
- That unchanged Markdown does not overwrite manual Content edits.
- Whether an explicit import checkbox is required.
- That clearing Markdown does not clear Content.

If using an import checkbox:

- Label: `Import Markdown into Content`.
- Description: clearly state that checking it applies the current Markdown source on the next Save or Publish.
- Reset it after successful conversion.

If using a force checkbox:

- Label: `Force re-import Markdown`.
- Explain that it intentionally overwrites the current Lexical Content using the stored Markdown source.
- Reset it after successful conversion.

Do not build a custom Admin component unless standard Payload fields cannot provide the required safe UX.

---

## 13. API Changes

No new public API endpoint is required for the Admin import workflow.

Consider the following API controls:

- Restrict public reads of `markdownSource` and `lastImportedMarkdownHash` through field access or public query projections.
- Prevent untrusted public clients from setting the hash field.
- Preserve existing post mutation authorization.
- Do not add a public conversion endpoint.

If the project’s existing Local API or REST API permits editors to create posts, the same hook behavior should apply consistently, subject to the selected explicit-trigger semantics.

---

## 14. Authorization and Security

- Reuse the post collection’s existing create/update permissions.
- Only users already authorized to edit posts may import Markdown.
- Do not weaken access control to make import easier.
- Treat Markdown as untrusted input.
- Use official Lexical conversion rather than converting to and storing raw HTML.
- Do not enable arbitrary HTML parsing.
- Ensure generated links and nodes continue through the existing safe public renderer.
- Do not expose internal hash values unnecessarily.
- Limit source size using an existing field limit or a documented reasonable validation if the project has no limit. Avoid an arbitrary limit that could reject legitimate long articles without product justification.

---

## 15. Caching

The import occurs as part of the existing post mutation lifecycle.

- Do not add a separate cache.
- Preserve the project’s existing revalidation behavior for updated or published posts.
- Ensure downstream cache invalidation sees imported content as a normal content update.
- Do not trigger public revalidation for drafts unless the existing workflow already does so.

---

## 16. Events and Jobs

No new event or background job is required for the core Admin import.

- Existing post-created, post-updated, or post-published events should continue to run normally after the imported content is persisted.
- Do not emit an additional domain event unless the repository already records editorial import actions and there is a concrete consumer.
- Do not use a background job for synchronous editor import because editors need immediate validation feedback.

Optional future audit telemetry may record that Markdown import occurred, but it is not required for Phase 4 unless the project already has an audit framework.

---

## 17. Migration and Backward Compatibility

### 17.1 Migration approach

Use the repository’s existing migration policy.

Expected schema change:

- Add nullable Markdown source.
- Add nullable last-imported hash.
- Optionally add a boolean import/force-import trigger with a safe default of `false`.

### 17.2 Compatibility requirements

- Existing posts require no data transformation.
- Existing Lexical JSON must remain untouched.
- Existing posts without Markdown fields must continue to load and save.
- Deployment must not require re-importing old posts.
- Migration must not publish, unpublish, or alter workflow status.
- Rollback should be possible by reverting application code while leaving nullable columns harmlessly present, unless the repository requires a follow-up down migration.

### 17.3 Generated artifacts

Update generated Payload types and any schema snapshots using existing commands. Do not hand-edit generated types.

---

## 18. Testing Plan

Use the existing test framework and repository conventions.

### 18.1 Parser unit tests

Add tests for at least:

1. Full metadata and Markdown content.
2. Metadata values containing additional colons.
3. CRLF input.
4. Missing optional metadata.
5. Missing `CONTENT:` delimiter.
6. Empty content after `CONTENT:`.
7. Fenced code block in Markdown body.
8. `CONTENT:` text inside the article body.
9. `CONTENT:` inside a fenced code block before any valid delimiter does not produce a false delimiter.
10. Unknown metadata does not overwrite any post field.
11. Markdown body whitespace and line structure are preserved.
12. H1 handling follows the chosen documented rule.

### 18.2 Hash unit tests

Test:

- Deterministic result for identical input.
- LF and CRLF equivalence if normalization defines them as equivalent.
- Changed content produces a different hash.
- Metadata changes produce a different hash.

### 18.3 Import service tests

Add tests for:

1. Create with new Markdown imports content and metadata.
2. Update with changed Markdown re-imports content.
3. Save with unchanged Markdown does not touch content.
4. Manual Lexical content edit remains when Markdown is unchanged.
5. Explicit force re-import, if implemented.
6. Clearing `markdownSource` does not clear content.
7. Missing metadata preserves existing values.
8. Nested SEO updates preserve unrelated SEO fields.
9. Failed parsing preserves prior content and hash.
10. Failed conversion preserves prior content and hash.
11. Successful conversion updates the hash.
12. Import checkbox resets after successful conversion.
13. Unrelated partial update does not trigger import.
14. Both create and update operation contexts are handled.

### 18.4 Lexical conversion assertions

Do not snapshot the entire Lexical document unless the repository already uses stable converter snapshots.

Assert meaningful structure:

```typescript
{
  root: {
    type: 'root',
    children: expect.any(Array),
  },
}
```

Also assert representative node behavior for:

- Paragraph.
- H2.
- H3.
- H4.
- Bold text.
- Italic text.
- Inline code.
- Unordered list.
- Ordered list.
- Nested list where supported.
- Quote.
- Horizontal rule.
- Link.
- Fenced code block.
- Code language, when supported.

### 18.5 Hook/integration tests

Where the test infrastructure permits, verify through Payload Local API or the existing integration harness:

- Creating a draft from Markdown.
- Updating Markdown.
- Saving an unchanged document.
- Publishing a post after import without changing workflow behavior.
- Existing posts without Markdown fields still save correctly.
- Access control remains enforced.
- Autosave behavior matches the selected trigger strategy.

### 18.6 Regression validation

Run the project’s existing content, post lifecycle, SEO, rendering, and Payload Admin tests to ensure the feature does not break established behavior.

---

## 19. Implementation Steps

Codex must follow this sequence unless repository constraints justify a documented deviation.

### Step 1 — Inspect and record confirmed architecture

- Read all instruction files.
- Locate the post collection and content module.
- Confirm field paths, hooks, workflow, access, versions, and autosave.
- Inspect installed Payload Lexical APIs and types.
- Confirm tests and migration commands.
- Present a concise implementation approach.

### Step 2 — Define types and structured errors

- Add the parser result type.
- Add import input/output types.
- Add parser/conversion error categories compatible with existing application error conventions.
- Avoid `any` and unsafe casts.

### Step 3 — Implement the parser

- Use a line scanner with code-fence awareness.
- Parse recognized metadata before the valid delimiter.
- Preserve Markdown body content.
- Add parser unit tests before integrating with Payload.

### Step 4 — Implement deterministic hashing

- Normalize line endings consistently.
- Use a platform-safe SHA-256 implementation already available in the Node runtime.
- Add focused unit tests.

### Step 5 — Extract or reuse shared Lexical configuration

- Reuse the existing shared configuration if available.
- Otherwise refactor the smallest possible shared feature/editor factory.
- Verify the Admin editor remains feature-equivalent.
- Do not remove or reorder custom features without evidence that order is irrelevant.

### Step 6 — Implement the Markdown import service

- Resolve effective source and prior hash from create/update context.
- Apply the chosen autosave trigger rule.
- Skip empty or unchanged source when not forced.
- Parse and validate source.
- Convert through the official installed converter.
- Validate Lexical root shape.
- Map present metadata immutably.
- Update hash and reset trigger fields only after success.
- Add service tests.

### Step 7 — Integrate through a thin Payload hook

- Add or extend the appropriate `beforeChange` hook.
- Preserve existing hook ordering.
- Adapt service errors into user-friendly Payload errors.
- Add structured logging without article content.
- Verify behavior for create, update, draft, autosave, and publish operations.

### Step 8 — Add Admin fields and UX text

- Add Markdown source.
- Add hidden hash.
- Add explicit import/force trigger if required.
- Place fields in the appropriate tab/group/sidebar.
- Apply field access restrictions.

### Step 9 — Add schema migration and regenerate types

- Generate a reviewable migration using the project’s established workflow.
- Ensure fields are nullable/backward compatible.
- Regenerate Payload types.
- Review generated changes for unintended schema modifications.

### Step 10 — Verify rendering compatibility

- Create representative imported content.
- Confirm the Payload editor displays converted nodes correctly.
- Confirm the public rich-text renderer handles those nodes.
- Add a focused renderer fix only when a verified gap exists.

### Step 11 — Optional CLI import

Implement only after the Admin workflow is complete and validated, and only if it fits the current project structure.

Recommended command:

```bash
pnpm import:post ./content/article.md
```

CLI requirements:

- Initialize Payload using the current config.
- Read the file as UTF-8.
- Reuse the same parser, hash, Lexical configuration, and import service.
- Create a draft only.
- Never publish automatically.
- Validate duplicate slug through existing rules.
- Return clear exit codes and errors.
- Do not duplicate conversion logic.

Treat the CLI as optional Phase 4 scope. Do not delay or compromise the Admin workflow for it.

### Step 12 — Documentation

Update the appropriate repository documentation with:

- Zi-Blog source format.
- How to use Markdown Import in Admin.
- Metadata mapping.
- Import trigger behavior.
- Manual-edit overwrite protection.
- Supported Markdown features.
- H1 and code-language behavior.
- Known limitations.
- Test commands.
- CLI usage, only if implemented.

### Step 13 — Validation

Run the exact scripts defined by the repository for:

```text
format check
lint
typecheck
unit tests
relevant integration tests
build
```

Also start or build Payload Admin in the supported local/test mode and verify there is no runtime configuration error.

Do not claim a command passed unless it was executed successfully.

### Step 14 — Final implementation report

Report:

- Confirmed architecture decisions.
- Files created and modified.
- Final import flow.
- Data migration impact.
- Authorization/security impact.
- Commands executed.
- Test and build results.
- Supported Markdown features.
- Remaining limitations.
- Optional CLI status.

---

## 20. Risks and Mitigations

### Risk: Autosave repeatedly converts partial Markdown

Mitigation:

- Inspect autosave first.
- Use an explicit import checkbox when autosave invokes the same hook while typing.
- Reset the checkbox after a successful import.

### Risk: Manual Lexical edits are overwritten

Mitigation:

- Compare deterministic source hash.
- Skip conversion when Markdown is unchanged.
- Require an explicit force action for intentional overwrite.

### Risk: Converter uses a different editor configuration

Mitigation:

- Create one shared configuration source.
- Test that existing custom features remain present.

### Risk: Existing SEO fields are accidentally replaced

Mitigation:

- Inspect exact nested schema.
- Merge only imported SEO properties.
- Add preservation tests for unrelated SEO fields.

### Risk: Hook order changes workflow behavior

Mitigation:

- Inspect current hooks and document ordering.
- Import before content-dependent validation but without bypassing workflow/access hooks.
- Run lifecycle regression tests.

### Risk: Package API differs from examples online

Mitigation:

- Inspect installed TypeScript declarations and package source.
- Compile against the actual `3.86.0` package.
- Do not use `any` to suppress incompatibility.

### Risk: Fenced code language is lost

Mitigation:

- Verify actual converter output.
- Add a compatible transformer only when supported by the current editor configuration.
- Otherwise document the limitation clearly.

### Risk: Internal Markdown source leaks publicly

Mitigation:

- Add field-level read restrictions or exclude it from public projections.
- Test public APIs if current access configuration could expose the field.

### Risk: Schema migration affects existing posts

Mitigation:

- Add nullable fields only.
- Do not backfill or transform content.
- Review migration output before applying.

---

## 21. Acceptance Criteria

Phase 4 is complete only when all applicable criteria below are satisfied.

1. An authorized editor can paste a complete Zi-Blog Markdown document into Payload Admin.
2. Save or Publish imports the Markdown using the selected safe trigger behavior.
3. `CONTENT:` Markdown is stored as valid Lexical JSON in the existing content field.
4. Imported content contains a valid root node with child nodes.
5. Paragraphs, H2, H3, H4, bold, italic, inline code, lists, quotes, horizontal rules, links, and code blocks convert correctly within the verified converter capabilities.
6. H1 behavior is explicitly prevented, validated, or documented according to the selected implementation.
7. Code-block language behavior is tested and documented.
8. Zi-Blog metadata maps to the confirmed existing fields.
9. Missing metadata does not overwrite existing field values.
10. Unrelated post fields remain unchanged.
11. Saving unchanged Markdown does not overwrite manual Lexical edits.
12. Changing Markdown re-imports and updates the stored hash.
13. Clearing Markdown does not clear existing content.
14. A force import works safely if implemented.
15. Existing posts without Markdown source continue to work.
16. Existing drafts, versions, autosave, preview, access control, and publish workflow continue to work.
17. Existing Lexical features and custom blocks remain available.
18. Raw Markdown and HTML are not stored in the rich-text field.
19. No destructive data migration is introduced.
20. Generated Payload types are updated.
21. TypeScript compilation succeeds.
22. Lint and formatting checks succeed.
23. New unit and integration tests pass.
24. Existing relevant regression tests pass.
25. The application build succeeds.
26. Payload Admin starts without a runtime configuration error.
27. Documentation is updated.
28. The final report accurately lists commands, results, changed files, and limitations.

---

## 22. Non-Goals and Prohibited Changes

Do not:

- Store raw Markdown in the existing rich-text content field.
- Store generated HTML in the rich-text content field.
- Construct Lexical JSON manually through string manipulation when the official converter supports the required node.
- Use a different editor configuration for conversion and editing.
- Re-import on every Save.
- Delete Markdown source after import without an approved product reason.
- Clear content when Markdown source is cleared.
- Modify or migrate existing article content.
- Remove existing Lexical features or custom blocks.
- Rename existing public fields unnecessarily.
- Publish imported posts automatically.
- Add a public conversion endpoint.
- Add an external queue, worker, Redis, or microservice for this feature.
- Add broad refactors unrelated to Markdown import.
- Bypass existing application services, access control, or workflow validation.
- Use `any`, unchecked assertions, or swallowed exceptions to make compilation pass.
- Mark the work complete when tests, build, migration, or runtime verification are missing.

---

## 23. Recommended Codex Execution Instruction

Use this plan as the implementation contract.

Codex must first inspect the repository and installed package types, present a concise confirmed approach, then implement the feature directly. It must make the least invasive changes that satisfy the acceptance criteria, run all relevant validation commands, and provide an evidence-based final report. Where the repository differs from example names or paths in this plan, follow the repository and document the mapping rather than forcing the examples.
