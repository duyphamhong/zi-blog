# Phase 3 — Public Web UI Enhancement Plan

## 1. Goal

Enhance the Zi-Blog public-facing web application from the current minimal layout into a polished **Modern Technical Editorial** experience based on the approved visual direction.

The implementation must:

- Preserve all existing public features, routes, Payload CMS integration, and content behavior.
- Improve visual hierarchy, information density, navigation, discoverability, responsiveness, accessibility, and perceived quality.
- Establish a reusable design system instead of styling the homepage as a one-off implementation.
- Keep content rendering server-first with small client-side interactive islands.
- Avoid premature backend, infrastructure, or domain changes.
- Remain compatible with the existing modular monolith architecture.

This phase primarily targets the **public Next.js web application**, not a full redesign of the Payload Admin Panel.

---

## 2. Design Direction

Use the generated Zi-Blog mockup as the visual reference, but implement the interface with real components, CSS, optimized images, and CMS content. Do not use the full mockup image as a webpage background.

### Visual identity

```text
Style:
Modern Technical Editorial

Primary characteristics:
- Bright, clean editorial layout
- Strong deep-navy typography
- Cyan-to-blue accent palette
- Technical illustrations and article thumbnails
- Soft shadows and subtle borders
- Rounded cards without excessive decoration
- Clear section hierarchy
- Dense enough to feel useful, but not crowded
```

### UX principles

1. Content remains the primary visual focus.
2. Decorative visuals must reinforce the engineering identity.
3. Every interactive element must have a clear hover, focus, active, loading, and disabled state.
4. Mobile layouts must be designed intentionally, not produced only by stacking desktop columns.
5. Motion must be subtle and respect `prefers-reduced-motion`.
6. No existing functionality may be removed merely to simplify the redesign.

---

## 3. Current Assumptions

Before implementation, Codex must verify these assumptions against the repository:

- The existing project already runs with Next.js App Router, Payload CMS, TypeScript, Tailwind CSS, and PostgreSQL.
- A functional homepage already displays featured and latest posts.
- Existing collections or query services already provide posts, categories, tags, authors, series, media, and site settings.
- Public queries already filter out drafts, archived posts, private posts, and scheduled posts that are not yet published.
- Existing routes and SEO behavior must remain backward compatible.
- The existing homepage screenshot represents a working baseline rather than a static design prototype.

Do not invent missing APIs, collections, globals, route paths, or component conventions. Inspect the code first and adapt this plan to the actual repository structure.

---

## 4. Scope

### 4.1 In scope

- Public site design-system foundation.
- Global header and navigation.
- Search entry point and search overlay/page integration.
- Theme switcher when dark mode is enabled.
- Redesigned homepage.
- Featured article presentation.
- Latest post cards.
- Topic/category navigation chips.
- Series preview section.
- Popular or trending preview section when data already exists.
- Reusable article-card variants.
- Shared metadata presentation.
- Responsive behavior.
- Loading, empty, and error states.
- Accessibility improvements.
- Image optimization.
- Visual regression and critical interaction tests.
- Consistent presentation on core listing pages where existing shared cards are reused.

### 4.2 Conditionally in scope

Only implement the following when the required data or configuration does not already exist:

- Optional homepage configuration fields in an existing Payload global.
- Optional cover-image fallback strategy.
- Optional category icon field or icon mapping.
- Optional series progress calculation based on existing series/post data.

### 4.3 Out of scope

- Replacing Payload CMS.
- Rewriting the domain model.
- New microservices.
- New external search infrastructure.
- Full Payload Admin redesign.
- Newsletter delivery workflow.
- New recommendation engine.
- New analytics pipeline.
- New membership or paid-content features.
- Complex animation frameworks.
- A theme marketplace.

---

## 5. Affected Modules

The actual names must follow the repository, but ownership should remain equivalent to the following.

### `platform`

Owns:

- Site header.
- Site footer.
- Main navigation presentation.
- Theme integration.
- Global page shell.
- Site-brand presentation.

### `content`

Owns:

- Homepage content query composition.
- Featured-post presentation.
- Post cards.
- Category/topic chips.
- Series preview cards.
- Article metadata presentation.
- Cover-image fallback behavior.

### `search`

Owns:

- Search trigger.
- Search dialog or command interface.
- Search result rendering.
- Search loading, empty, and error states.

### `analytics`

No redesign-specific analytics implementation is required. Existing events may be reused for:

- Search opened.
- Search submitted.
- Featured article selected.
- Topic selected.
- Article selected.

Do not add direct page-view counters in UI components.

### `shared` or `packages/ui`

Owns reusable visual primitives only when these are genuinely cross-module:

- Button.
- Badge.
- Icon button.
- Surface/card primitive.
- Container.
- Section heading.
- Skeleton.
- Visually hidden helper.

Do not move domain-specific post or series components into a generic UI package.

---

## 6. Architecture Changes

### 6.1 Rendering model

Use Server Components by default.

Keep these as Server Components where possible:

- Homepage.
- Hero content.
- Featured-post section.
- Latest-post section.
- Series section.
- Popular-post section.
- Post-card rendering.
- Navigation content.

Use isolated Client Components only for:

- Mobile navigation toggle.
- Theme switcher.
- Search dialog interactions.
- Optional horizontally scrollable chip controls when keyboard behavior requires client logic.
- Optional bookmark/like controls already supported by the application.

Do not mark the entire homepage or site header as a Client Component.

### 6.2 Data access

Create or reuse one centralized homepage query use case instead of making independent Payload queries inside each component.

Suggested contract:

```ts
export type HomepageContent = {
  hero: HomepageHero
  featuredPost: PostSummary | null
  latestPosts: PostSummary[]
  featuredTopics: TopicSummary[]
  featuredSeries: SeriesSummary[]
  popularPosts: PostSummary[]
}

export interface HomepageQueryService {
  getHomepageContent(input: {
    locale: SupportedLocale
  }): Promise<HomepageContent>
}
```

Requirements:

- Return summary projections only.
- Do not load full rich-text content for homepage cards.
- Use deterministic ordering.
- Bound every query.
- Avoid N+1 relationship loading.
- Reuse current published-content authorization rules.
- Gracefully support sections with no content.

### 6.3 Component hierarchy

Target structure:

```text
PublicLayout
├── SiteHeader
│   ├── Brand
│   ├── DesktopNavigation
│   ├── SearchTrigger
│   ├── ThemeSwitcher
│   ├── LocaleSwitcher
│   └── MobileNavigation
├── Main
│   └── Homepage
│       ├── HeroSection
│       ├── FeaturedPostSection
│       ├── TopicNavigation
│       ├── LatestPostsSection
│       ├── FeaturedSeriesSection
│       └── PopularPostsSection
└── SiteFooter
```

### 6.4 Dependency constraints

```text
Page/UI
→ homepage query service
→ content/search/platform application boundary
→ Payload adapter or existing repository/query implementation
```

UI components must not construct arbitrary Payload query objects.

---

## 7. Suggested File Placement

Codex must inspect the existing repository and follow established conventions. When no equivalent structure exists, prefer placement similar to:

```text
apps/web/src/
├── app/
│   └── (public)/
│       ├── layout.tsx
│       ├── page.tsx
│       ├── loading.tsx
│       └── error.tsx
├── design-system/
│   ├── tokens.css
│   ├── typography.css
│   └── motion.css
├── modules/
│   ├── platform/
│   │   └── ui/
│   │       ├── site-header.tsx
│   │       ├── desktop-navigation.tsx
│   │       ├── mobile-navigation.tsx
│   │       ├── theme-switcher.tsx
│   │       ├── locale-switcher.tsx
│   │       └── site-footer.tsx
│   ├── content/
│   │   ├── application/
│   │   │   └── get-homepage-content.ts
│   │   └── ui/
│   │       ├── hero-section.tsx
│   │       ├── featured-post-card.tsx
│   │       ├── post-card.tsx
│   │       ├── post-meta.tsx
│   │       ├── topic-navigation.tsx
│   │       ├── series-card.tsx
│   │       ├── popular-post-list.tsx
│   │       └── post-cover.tsx
│   └── search/
│       └── ui/
│           ├── search-trigger.tsx
│           ├── search-dialog.tsx
│           └── search-result-list.tsx
└── shared/
    └── ui/
        ├── button.tsx
        ├── badge.tsx
        ├── container.tsx
        ├── section-heading.tsx
        └── skeleton.tsx
```

If reusable primitives already exist in `packages/ui`, extend them instead of creating duplicates.

---

## 8. Design System Foundation

Implement tokens before page-specific styling.

### 8.1 Color tokens

Define semantic tokens rather than scattering raw Tailwind colors.

```text
Background:
- canvas
- canvas-subtle
- surface
- surface-elevated

Text:
- text-primary
- text-secondary
- text-muted
- text-inverse

Borders:
- border-subtle
- border-strong

Brand:
- brand-primary
- brand-hover
- brand-soft
- brand-gradient-start
- brand-gradient-end

Feedback:
- success
- warning
- danger
- info
```

Light and dark themes must use the same semantic token names.

### 8.2 Typography

Define a consistent editorial scale for:

- Display headline.
- Page title.
- Section title.
- Card title.
- Body.
- Small metadata.
- Eyebrow/overline.
- Code and technical labels.

Guidelines:

- Hero headline must no longer dominate almost the entire viewport.
- Use responsive font sizing with controlled line lengths.
- Body copy should remain readable between approximately 60–75 characters per line.
- Avoid multiple unrelated font families.
- Use the existing project font when suitable; do not add a font dependency without justification.

### 8.3 Spacing and layout

Create consistent tokens for:

- Page container widths.
- Section vertical spacing.
- Card padding.
- Grid gaps.
- Border radius.
- Header height.

Recommended behavior:

```text
Large desktop:
3-column article grid

Tablet:
2-column article grid

Mobile:
1-column article grid
```

### 8.4 Elevation

Use shadows sparingly:

- Default cards should rely mainly on border and surface contrast.
- Hovered cards may gain a subtle shadow and small translation.
- Avoid heavy floating panels throughout the page.

### 8.5 Motion

Allowed motion:

- 150–250 ms hover transitions.
- Subtle card lift.
- Icon movement of a few pixels.
- Search/mobile navigation entrance.

Do not introduce parallax, autoplay animations, or large hero motion in this phase.

---

## 9. UI Changes

## 9.1 Global header

### Desktop

Include:

- Zi-Blog brand/logo.
- Main content navigation.
- Search entry point.
- Theme switcher when enabled.
- Locale selector.
- Existing account/community actions when already available.

Behavior:

- Sticky header with a subtle backdrop or solid surface.
- Clear active navigation state.
- Search must be keyboard accessible.
- Avoid layout shift when the header becomes sticky.

### Mobile

- Keep brand visible.
- Keep search available.
- Collapse primary navigation into an accessible dialog or menu.
- Trap focus correctly if a modal navigation is used.
- Close on Escape.
- Restore focus to the trigger after close.

## 9.2 Hero section

Replace the current oversized single-column text block with a balanced two-column layout.

### Left column

- Editorial eyebrow.
- Responsive headline.
- Short supporting text.
- Primary CTA: browse articles.
- Secondary CTA: browse series.

### Right column

Implement a lightweight technical visual composed from one of:

- Optimized SVG illustration.
- CSS gradient surfaces and layered cards.
- Static technical illustration stored as media.
- Small decorative code card using real text.

Requirements:

- Decorative content must not become an accessibility obstacle.
- Purely decorative images use empty alt text.
- Do not use the full generated page mockup as the illustration.
- Avoid adding a heavy canvas or 3D runtime.

### Responsive behavior

- Desktop: two columns.
- Tablet: narrower two-column or stacked layout depending on available width.
- Mobile: content first; illustration second or hidden when it does not add enough value.

## 9.3 Featured post

Create a prominent editorial card with:

- Cover image or fallback artwork.
- `Nổi bật` label.
- Category.
- Title.
- Excerpt.
- Author.
- Published date.
- Reading time.
- Clear full-card link or CTA.

Rules:

- Do not render an empty gradient panel when no cover exists.
- Provide a deterministic fallback derived from category, not a random visual per render.
- Avoid nested interactive elements inside a linked card.
- Preserve semantic heading order.

## 9.4 Topic navigation

Render key categories or topics as chips with optional icons.

Requirements:

- Links, not fake buttons, when they navigate to category pages.
- Horizontal overflow on small screens must remain keyboard accessible.
- Selected state is only used when a real active filter exists.
- Do not hard-code topic names when category data already exists.
- Limit homepage topics to a controlled number.

## 9.5 Latest posts

Use a three-column editorial card grid on large screens.

Each card includes:

- Optimized cover image.
- Category badge.
- Limited tag badges.
- Title.
- Excerpt.
- Author or publication identity.
- Date.
- Reading time.

Card constraints:

- Use a stable image aspect ratio.
- Clamp titles and excerpts consistently without hiding essential information from assistive technology.
- Do not load full post bodies.
- Use consistent card heights when practical, but do not force inaccessible fixed-height content.

## 9.6 Featured series

Display a compact series preview containing:

- Series icon or cover.
- Title.
- Short description.
- Number of published posts.
- Optional reading-progress indicator only when progress has real meaning.

Do not show artificial percentages unless they are calculated from a real user or series-completion model. When no real progress exists, show post count and a link instead.

## 9.7 Popular or trending section

Use existing popular/trending data only.

Display:

- Ordered article list.
- Compact metadata.
- Link to the corresponding listing page when that route already exists.

If no statistics read model or trending query exists yet:

- Do not calculate popularity in the React component.
- Hide the section or use an existing deterministic editorial selection.
- Record the missing capability as follow-up work rather than expanding Phase 3 into analytics implementation.

## 9.8 Footer

Enhance the current footer or add one when missing.

Include only configured information such as:

- Brand description.
- Main content links.
- Categories.
- RSS.
- Social links.
- Copyright.
- Privacy/terms links when they exist.

Do not hard-code personal contact information unless it is already an approved site setting.

## 9.9 Dark mode

When enabled by project configuration:

- Use semantic color tokens.
- Prevent a light-theme flash during initial rendering.
- Persist preference using the existing theme strategy or a server-readable cookie.
- Respect system preference as the initial default when no explicit preference exists.
- Ensure article images, code blocks, borders, and muted text remain legible.

## 9.10 Search experience

Reuse the current search backend or page.

The enhanced search entry may provide:

- Header search trigger.
- Keyboard shortcut hint.
- Search dialog on desktop.
- Dedicated search page fallback.
- Debounced input only if the existing API supports it safely.
- Loading, empty, error, and no-result states.

Do not add a new search engine in this phase.

---

## 10. Data Model Changes

### Default decision

No database or Payload schema migration should be required purely for visual changes.

### Conditional extension

Inspect current globals and collections first. Only extend the model if the homepage cannot be configured using existing data.

Possible backward-compatible optional fields:

```text
Site settings or Homepage global:
- heroEyebrow
- heroTitle
- heroDescription
- primaryCtaLabel
- primaryCtaHref
- secondaryCtaLabel
- secondaryCtaHref
- heroIllustration
- featuredTopicLimit
- latestPostLimit
- featuredSeriesLimit
- showPopularSection
```

Prefer optional fields with safe defaults so existing installations keep working.

Do not create a new homepage-builder abstraction or arbitrary block system merely for this redesign.

### Media considerations

If cover images already exist, reuse them.

When media metadata supports it, ensure:

- Alt text is available.
- Width and height are known.
- Responsive sizes are generated or supported.
- Existing S3/local storage behavior remains unchanged.

---

## 11. API Changes

### Default decision

Do not expose new public endpoints when the homepage can use existing server-side query services or Payload Local API access.

### Homepage query

Create or refine an internal query service that returns a stable view model.

The page must not depend directly on raw Payload documents because:

- Raw documents may contain fields that should not be exposed.
- Relationship shapes may vary with depth.
- The UI should not know CMS-specific query details.

### Search

Reuse existing search contracts.

Do not weaken filters that prevent draft, private, unlisted, archived, or future-scheduled content from appearing publicly.

---

## 12. Authorization and Security

This phase does not change editorial permissions.

Requirements:

- Public homepage queries return only publicly visible content.
- Draft preview behavior remains isolated from normal public caching.
- Search results do not expose drafts or private content.
- Locale, category, tag, or pagination input is validated.
- No HTML from CMS fields is rendered unsafely in card excerpts.
- External links use safe attributes when opening a new tab.
- Search input is treated as untrusted input.
- Existing Content Security Policy must support any new static assets without broad unsafe exceptions.

Do not weaken Payload access control to make homepage queries easier.

---

## 13. Caching

### Homepage

Cache the homepage using the project’s existing Next.js caching strategy.

Use explicit invalidation for changes affecting:

- Featured post.
- Latest posts.
- Featured categories/topics.
- Featured series.
- Popular/trending read model.
- Navigation.
- Site settings.

### Cache behavior

- Reuse existing cache tags or invalidation abstractions.
- Do not introduce a second unrelated cache convention.
- Do not place personalized theme/account data inside a shared cached payload.
- Preview requests must bypass public caches.
- Search remains dynamic or short-lived according to existing design.

### Images

- Use the existing Next.js image strategy.
- Provide explicit dimensions or responsive sizing.
- Prioritize only the true above-the-fold primary image.
- Lazy-load below-the-fold article thumbnails.

---

## 14. Events and Jobs

No new background job is required for the UI redesign.

Existing events may trigger homepage cache invalidation:

```text
PostPublished
PostUpdated
PostArchived
PostSlugChanged
SeriesUpdated
NavigationUpdated
SiteSettingsUpdated
```

Use existing handlers where present.

Do not introduce a message broker for cache invalidation in this phase.

---

## 15. Migration

### UI migration

Implement incrementally so the application remains deployable throughout the phase.

Recommended order:

```text
1. Introduce design tokens without changing layouts.
2. Add reusable primitives.
3. Replace shared public shell.
4. Replace homepage sections one at a time.
5. Enable dark theme after all components use semantic tokens.
6. Reuse new cards on existing listing pages.
7. Remove obsolete styles only after usage is verified.
```

### Database migration

Not required unless optional homepage/global fields are added.

When fields are added:

- Make them optional initially.
- Supply code-level fallbacks.
- Generate an explicit Payload migration.
- Preserve existing data.
- Do not require a destructive backfill.

### CSS migration

- Identify duplicated global and component-level Tailwind classes.
- Replace them progressively with tokens and reusable variants.
- Remove dead CSS only after repository-wide search.
- Avoid a full styling rewrite in one unreviewable commit.

---

## 16. Testing

## 16.1 Unit or component tests

Test relevant deterministic behavior:

- Post-summary mapping.
- Cover-image fallback selection.
- Metadata formatting.
- Topic limit and ordering.
- Empty-section behavior.
- Theme preference resolution when implemented locally.

Do not rely on large snapshot tests as the only verification.

## 16.2 Integration tests

Test:

- Homepage query returns only visible published content.
- Featured-post selection is deterministic.
- Latest-post ordering is correct.
- Optional sections handle missing content.
- Locale-specific content is respected when localization already exists.
- Preview content does not leak into the normal homepage response.

## 16.3 End-to-end tests

At minimum:

```text
Visitor opens homepage
→ header, hero, featured article, and latest posts render

Visitor opens mobile navigation
→ menu is keyboard accessible and closes correctly

Visitor opens search
→ can enter a query and reach results

Visitor changes theme
→ preference persists without inaccessible contrast

Visitor selects featured article
→ reaches the correct canonical post route

Visitor selects a topic
→ reaches the correct category or tag listing
```

## 16.4 Visual regression

Capture representative screenshots for:

- Desktop: approximately 1440 px viewport.
- Laptop/tablet landscape: approximately 1024 px.
- Tablet/mobile: approximately 768 px.
- Mobile: approximately 390 px.
- Light theme.
- Dark theme when enabled.
- Empty homepage section state.
- Long Vietnamese title state.

Use the repository’s existing visual-test tool. Do not add a new testing framework solely for screenshots when Playwright or equivalent is already available.

## 16.5 Accessibility

Validate:

- Keyboard-only navigation.
- Visible focus indicators.
- Heading hierarchy.
- Link and button accessible names.
- Dialog semantics.
- Color contrast.
- Reduced motion.
- Image alt behavior.
- Zoom up to 200% without loss of core functionality.

Use existing accessibility tooling when present.

## 16.6 Performance

Measure before and after.

Target at minimum:

```text
LCP:
≤ 2.5 seconds under the agreed test profile

CLS:
≤ 0.1

INP:
≤ 200 ms for primary interactions under the agreed test profile
```

Also verify:

- No unnecessary client-side JavaScript for static sections.
- No full rich-text payload in listing cards.
- No unbounded homepage query.
- No oversized unoptimized hero image.
- No font-loading layout shift.

---

## 17. Implementation Steps

## Step 0 — Inspect and baseline

Codex must:

1. Read `AGENTS.md` and applicable module instructions.
2. Inspect public routes, layouts, current homepage, shared UI components, query services, Payload collections/globals, Tailwind configuration, and tests.
3. Identify the actual owning modules and file conventions.
4. Record the current route behavior and public query filters.
5. Run the existing validation commands before changes.
6. Capture baseline screenshots and performance observations.
7. Report any mismatch between this plan and the repository before implementing destructive changes.

Deliverable:

```text
Short implementation note listing:
- existing files to reuse
- files to change
- missing data capabilities
- required migration, if any
- risks discovered
```

## Step 1 — Establish semantic design tokens

Implement:

- Light-theme colors.
- Dark-theme colors when enabled.
- Typography scale.
- Spacing.
- Radius.
- Elevation.
- Motion.
- Page container.

Refactor only enough existing components to prove the token system before broad rollout.

## Step 2 — Build or refine shared primitives

Implement or reuse:

- `Button`.
- `IconButton`.
- `Badge`.
- `Container`.
- `SectionHeading`.
- `Surface` or card primitive.
- `Skeleton`.

Requirements:

- Variant APIs are typed.
- No `any`.
- Focus states are built in.
- Components do not encode content-domain behavior.

## Step 3 — Enhance the public shell

Implement:

- Header.
- Desktop navigation.
- Mobile navigation.
- Search trigger.
- Locale switcher.
- Theme switcher when enabled.
- Footer.

Preserve all existing routes and actions.

## Step 4 — Create homepage view model

Create or refine a single homepage query service that returns:

- Hero configuration.
- Featured post.
- Latest posts.
- Topics.
- Series.
- Popular/trending entries.

Add mapping tests and enforce public visibility rules.

## Step 5 — Implement hero and featured article

Implement the two-column hero and featured card using real responsive components.

Validate:

- Long Vietnamese copy.
- Missing hero illustration.
- Missing featured post.
- Missing cover image.
- Mobile stacking.

## Step 6 — Implement content discovery sections

Implement:

- Topic navigation.
- Latest posts.
- Featured series.
- Popular/trending section when supported.

Every section must have a deliberate empty state or be omitted cleanly.

## Step 7 — Add interactive islands

Implement only required client behavior:

- Mobile menu.
- Search dialog.
- Theme switcher.

Ensure keyboard support, focus management, and hydration stability.

## Step 8 — Apply responsive and dark-theme behavior

Verify every component at target viewport sizes.

Fix:

- Overflow.
- Long titles.
- Image cropping.
- Chip scrolling.
- Header collisions.
- Dark-theme contrast.
- Theme flash.

## Step 9 — Reuse new cards on core listing pages

Where current category, tag, author, search, or series pages use duplicated card markup, replace it with the new post-card variants without changing query behavior.

Do not expand this step into a complete redesign of every public page.

## Step 10 — Complete states and polish

Implement:

- Homepage loading skeleton.
- Search loading and empty states.
- Section empty states.
- Safe error boundary presentation.
- Hover/focus/active states.
- Reduced-motion behavior.

## Step 11 — Validate and document

Run the repository’s existing commands equivalent to:

```text
pnpm lint
pnpm format:check
pnpm typecheck
pnpm test
pnpm test:integration
pnpm test:e2e
pnpm build
```

Only claim commands that were actually executed.

Update relevant documentation with:

- Design tokens.
- Component ownership.
- Homepage query composition.
- Image usage rules.
- Dark-mode behavior.
- Adding a new homepage section.

---

## 18. Suggested Delivery Slices

Keep reviews small and reversible.

### Slice 3.1 — Design foundation

```text
Design tokens
Typography
Container
Button/badge/card primitives
Documentation
```

### Slice 3.2 — Public shell

```text
Header
Navigation
Search trigger
Mobile navigation
Theme switcher
Footer
```

### Slice 3.3 — Homepage hero and featured content

```text
Homepage query view model
Hero
Featured post
Cover fallback
```

### Slice 3.4 — Discovery sections

```text
Topic chips
Latest-post grid
Series preview
Popular/trending preview
```

### Slice 3.5 — Quality hardening

```text
Responsive fixes
Dark mode
Loading/empty/error states
Accessibility
Visual regression
Performance verification
Documentation
```

Each slice must pass type checking and relevant tests before the next slice begins.

---

## 19. Risks and Mitigations

### Risk: hard-coded homepage content

Mitigation:

- Reuse site settings, navigation, category, series, and post data.
- Add only minimal optional CMS fields when genuinely missing.

### Risk: generated design is copied literally

Mitigation:

- Treat the image as visual direction.
- Use real components and current data constraints.
- Remove decorative elements that reduce usability or performance.

### Risk: excessive client JavaScript

Mitigation:

- Keep content sections as Server Components.
- Isolate search, mobile menu, and theme control.

### Risk: inconsistent styling during migration

Mitigation:

- Introduce tokens and primitives first.
- Migrate section by section.
- Avoid leaving duplicate competing component systems.

### Risk: homepage query becomes expensive

Mitigation:

- Use summary projections.
- Bound list sizes.
- Avoid N+1 relationships.
- Cache and explicitly invalidate.

### Risk: missing cover images make cards look unfinished

Mitigation:

- Add a deterministic category-based fallback component.
- Do not use empty gradients.

### Risk: dark mode causes theme flash

Mitigation:

- Resolve initial theme before paint using the current server-compatible theme strategy.

### Risk: visual polish reduces accessibility

Mitigation:

- Make focus states and contrast part of primitives.
- Test keyboard, zoom, screen-reader semantics, and reduced motion before acceptance.

### Risk: phase expands into backend feature work

Mitigation:

- Hide unsupported popular/series sections cleanly.
- Record analytics or content-model gaps as follow-up items.
- Do not add infrastructure to satisfy a visual mockup.

---

## 20. Acceptance Criteria

Phase 3 is complete when all applicable criteria are satisfied.

### Functional

- Existing public routes and content workflows continue to work.
- Homepage renders real CMS-managed content.
- Featured article links to the correct post.
- Latest articles are correctly ordered and bounded.
- Topic links reach the corresponding listing pages.
- Search entry reaches the current search experience.
- Locale switching remains functional.
- Theme switching works when enabled.
- Unsupported optional sections are omitted safely.

### Visual

- Homepage follows the Modern Technical Editorial direction.
- Hero uses a balanced two-column desktop layout.
- Featured content includes meaningful imagery or fallback artwork.
- Latest posts display in a consistent editorial grid.
- Typography, spacing, cards, badges, and buttons use shared tokens.
- Desktop, tablet, and mobile layouts appear intentionally designed.
- Light and dark themes are visually coherent when dark mode is enabled.

### Architecture

- Homepage components do not issue arbitrary Payload queries.
- Data access is centralized behind an application/query boundary.
- Domain-specific components remain in their owning module.
- Static content sections remain Server Components.
- Client Components are limited to interactive behavior.
- No new microservice, queue, or search engine is introduced.

### Security and authorization

- Draft, private, archived, and future-scheduled content remains inaccessible publicly.
- Search and homepage queries preserve existing access rules.
- No unsafe HTML is introduced.
- No access-control rule is weakened.

### Accessibility

- All main functionality is keyboard accessible.
- Focus indicators are visible.
- Heading hierarchy is valid.
- Interactive controls have accessible names.
- Contrast meets the project’s WCAG target.
- Reduced-motion preference is respected.
- Layout remains usable at 200% zoom.

### Performance

- Homepage does not fetch full post content for cards.
- Images have appropriate dimensions and loading behavior.
- Layout shift is controlled.
- Interactive JavaScript is limited to required islands.
- Agreed Core Web Vitals targets are met or documented with measured blockers.

### Quality

- Lint passes.
- Type checking passes.
- Relevant unit/integration tests pass.
- Critical E2E journeys pass.
- Production build passes.
- Visual review screenshots are provided for target breakpoints.
- Documentation is updated.
- No incomplete work is described as production-ready.

---

## 21. Final Codex Report Format

After implementation, Codex must report:

```text
Summary
- What was enhanced
- Which visual direction was implemented

Files changed
- Grouped by module

Architecture impact
- Query boundaries
- Server/client component decisions

Data and migration impact
- Payload fields added, if any
- Migration generated, if any

Caching impact
- Cache keys/tags reused or added
- Invalidation paths

Security impact
- Public content filtering
- Search/input considerations

Accessibility
- Keyboard and focus behavior
- Contrast/reduced-motion validation

Performance
- Data-query changes
- Image optimization
- Before/after measurements when available

Tests executed
- Exact commands
- Results

Known limitations
- Unsupported data sections
- Deferred improvements

Review artifacts
- Desktop screenshot
- Tablet screenshot
- Mobile screenshot
- Dark-theme screenshot when enabled
```

---

## 22. Definition of Done

Phase 3 is done only when the redesigned homepage is implemented with real CMS data, shared design-system foundations are in place, responsive and accessible behavior is verified, existing functionality remains intact, relevant tests and build checks pass, and review screenshots are available.
