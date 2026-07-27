# Bilingual editorial workflow

Each post, taxonomy, media item, author profile, and global is one record with
Vietnamese and English field values.

## Editing

1. Open the document in Payload Admin.
2. Select `Tiếng Việt` or `English` in the locale control.
3. Edit the localized fields. Shared relationships and workflow fields apply to
   both languages.
4. Save a draft in either locale as work progresses.
5. Use Preview to open the authenticated, noindex preview for the selected
   locale.

The public site does not fall back to the other language. An incomplete
translation has no public URL and the language switcher remains disabled for
that target.

## Publishing

Before moving a draft to published, complete these fields in both locales:

- title
- slug
- excerpt
- content

Payload returns `TRANSLATION_INCOMPLETE` with the missing locale/field details
when the transition is blocked. Slugs may match across Vietnamese and English,
but duplicate slugs within the same locale are rejected.

Search entries are derived automatically after publication. Do not edit
`search-documents` directly.
