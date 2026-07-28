# Phase 3 public UI architecture

Phase 3 applies the Modern Technical Editorial direction to the public
application while retaining the Phase 2 localized routes and public-content
boundaries.

## Design tokens

Semantic tokens live in `apps/web/src/app/(frontend)/globals.css`. Light and
dark themes share the same token names for canvas, surface, text, border,
brand, radius, elevation, typography, and motion. Components must consume
semantic utilities such as `bg-surface`, `text-text-secondary`,
`border-border-subtle`, and `text-brand` instead of selecting unrelated raw
palette values.

Cross-module visual primitives live in `apps/web/src/components/ui`. Content
components remain in `components/content`, and the public shell remains in
`components/layout`. Client components are limited to active navigation,
language switching, mobile navigation, search, and theme preference.

## Homepage query composition

`getHomePageContent(locale)` is the only homepage data composition boundary.
It returns:

- one deterministic featured post;
- at most six latest post summaries;
- at most six active topics;
- at most three active series with published-post counts;
- the public site name and description;
- an empty popular-post collection until an analytics read model exists.

All post queries reuse the published public-feed filter and summary selection.
Draft, unlisted, incomplete localized, and archived content are not introduced
into homepage or search rendering. The series-count input is a bounded summary
query and does not load rich-text bodies.

## Images and fallback artwork

CMS cover images continue through `next/image` with explicit responsive sizes.
Only the featured cover is prioritized. Other card images remain lazy-loaded.

When a cover is absent, `PostCover` renders deterministic inline technical
artwork selected from the category and slug. The fallback is decorative,
contains no random values, and does not create an empty gradient placeholder.
New homepage sections must reuse `PostCover` or provide equivalent explicit
dimensions, responsive sizes, and accessible alt behavior.

## Theme behavior

Dark mode is rendered only when `SiteSettings.enableDarkMode` is enabled.
`theme-init.js` runs before interactive hydration, resolves the persisted
`zi-blog-theme` cookie or the operating-system preference, and applies the
root `.dark` class. The theme control changes the class and cookie together.
The same semantic tokens are used by both themes, and reduced-motion CSS
disables nonessential transitions and animation.

## Adding a homepage section

1. Add a bounded summary field to `HomepageContent`.
2. Populate it inside `queryHomePageContent` using the existing public filters.
3. Keep the section a Server Component unless it requires genuine interaction.
4. Omit unsupported or empty data cleanly.
5. Add deterministic unit behavior and publication-boundary integration
   coverage.
6. Reuse semantic tokens, shared headings, responsive image rules, and existing
   cache tags.

No Payload schema or migration was required for Phase 3.
