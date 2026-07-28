# Markdown import

Zi-Blog editors can import a complete localized article into the existing
Payload Lexical `content` field. The source remains available for later
re-imports and is never exposed by public post reads.

## Source format

Use the supported metadata keys before a standalone `CONTENT:` line:

```markdown
TITLE: Safe Markdown imports
SLUG: safe-markdown-imports
EXCERPT: A summary long enough to satisfy the normal post validation rules.
SEO_TITLE: Safe Markdown imports with Payload
SEO_DESCRIPTION: Convert a Zi-Blog article into structured Lexical content.
CONTENT:

## First section

Write standard Markdown here.
```

The supported metadata mapping is:

| Markdown key             | Payload field         |
| ------------------------ | --------------------- |
| `TITLE`                  | `title`               |
| `SLUG`                   | `slug`                |
| `EXCERPT`                | `excerpt`             |
| `SEO_TITLE`              | `seo.metaTitle`       |
| `SEO_DESCRIPTION`        | `seo.metaDescription` |
| Content after `CONTENT:` | `content`             |

Metadata is optional. A missing key preserves the existing field value. An
included empty `TITLE`, `SLUG`, or `EXCERPT` is rejected because those fields
are required by the post schema. Unknown metadata is ignored.

## Admin workflow

1. Open a post and select the Vietnamese or English locale to import.
2. Expand **Markdown Import**.
3. Paste the complete source into **Zi-Blog Markdown source**.
4. Check **Import Markdown into Content**.
5. Save the draft or publish through the normal Payload workflow.
6. Review the converted **Content** field.

Autosave runs every two seconds, so conversion requires the explicit checkbox.
The checkbox resets after a successful import. Checking it again intentionally
force re-imports the stored source and replaces the current Lexical content.

Saving without the checkbox never converts the source. This protects manual
edits made directly in the Lexical editor. Changing or clearing the source
without checking the box also leaves Content unchanged; clearing the source
never clears Content.

Import does not change publication state, author, category, tags, visibility,
publication dates, cover images, or unrelated SEO values. Existing post access
rules, bilingual publication readiness, drafts, versions, search
synchronization, and cache invalidation continue to apply.

## Supported Markdown

The importer uses Payload 3.86.0's official Markdown-to-Lexical converter with
the same editor configuration as the Admin content field. Verified structures
include:

- paragraphs;
- H2, H3, and H4;
- bold, italic, and inline code;
- unordered, ordered, and nested lists;
- block quotes;
- horizontal rules;
- links;
- fenced code blocks.

The page title is the public H1, so H1 headings in imported article content are
rejected with an actionable validation message. H1-looking text inside a fenced
code block is preserved.

Fenced code language is preserved when supplied, for example
` ```typescript `. The converter maps fenced code to the existing `code` block.
The current block supports `language`, `filename`, and `code`; Markdown import
sets language and code, while filename can be added later in the Lexical editor.

Raw HTML is not enabled as an import path. Unsupported Markdown extensions may
fall back to plain text according to Payload's installed converter. The
importer does not read custom `[P]`, `[H2]`, or similar markers.

## Validation

Focused checks:

```bash
pnpm test:unit
pnpm test:integration
pnpm typecheck
pnpm build
```

Schema changes are committed in the Phase 4 Payload migration. Existing posts
are not backfilled or rewritten. There is no Phase 4 CLI importer; the
autosave-safe Payload Admin workflow is the supported entry point.
