# Implementation Rules

Codex must read and follow this file before implementing any plan.

## Rule 1 — Branch, pull request, and merge workflow

Before implementing a new plan:

1. Fetch the latest remote state.
2. Check out `main` and update it to the latest remote `main` with a
   fast-forward-only pull.
3. Create a new branch from that updated `main` with a name that describes the
   plan or change.

After implementation:

1. Run the required validation.
2. Commit the completed changes on the implementation branch.
3. Push the branch and create a pull request for human review.

Codex must not merge the pull request. A human must review and merge it.

## Rule 2 — No hard-coded strings

Never hard-code string values directly in application code. Define every string
as a named constant in the owning constant file, then import and use that
constant from seed data, server queries, route components, React components,
validation, and tests. User-facing strings must be defined directly in every
supported locale dictionary (`apps/web/src/modules/platform/i18n/dictionaries/en.ts`
and `vi.ts`) and resolved through the active locale. Do not create parallel
locale seed constants when the dictionary already owns the value. Route segments, enum values,
database field names, protocol values, regular expressions, and other
non-copy technical literals must also be centralized in the appropriate
domain-owned constant file rather than repeated inline.
