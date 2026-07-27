# Zi-Blog agent guide

Before implementation, read:

1. `ChatGPT-Instruction.md`
2. `docs/instructions/ChatGPT-Instruction.md`
3. `docs/rules/implementation-rules.md`
4. The applicable plan or ADR

## Ownership

- `src/modules/content`: public content queries, projections, and content rules.
- `src/modules/identity`: roles and identity access policy.
- `src/modules/media`: media presentation and policy.
- `src/modules/seo`: metadata and indexing rules.
- `src/modules/platform`: site settings, navigation, health, and cache paths.
- `src/shared`: narrow cross-module primitives only.
- `src/payload`: declarative Payload collections, globals, fields, hooks,
  migrations, and seed data.

Keep business rules out of React components and keep hooks thin. Public
components must use module queries rather than constructing Payload queries.
Never expose drafts, unlisted content in indexes, or raw Users documents.

Schema changes require a committed Payload migration. Keep official Payload
packages on one exact version and justify new dependencies. Do not add unused
packages or generic `utils`, `helpers`, `common`, or `services` folders.

Run the proportional checks during development and `pnpm validate` before
handoff. When generated Payload types or the Admin import map can change, run
`pnpm payload:types` and `pnpm payload:importmap` and review their diffs.
