# Module boundaries

## Content

Owns publication predicates, slug and reading-time rules, public post
projections, and all public content queries. Public React routes may call these
queries but may not construct Payload filters.

## Identity

Owns roles, actor normalization, and reusable access-control functions. Payload
collections enforce record ownership and field transition policy using this
module.

## Media

Owns media URL presentation. Upload schema and ownership metadata stay in the
Payload adapter layer.

## SEO

Owns metadata fallback rules and indexability decisions. Sitemap and RSS routes
consume public content projections.

## Platform

Owns sanitized site settings, navigation projections, cache paths/tags, and
health boundaries.

## Shared

Contains only narrow cross-module primitives, currently Payload initialization
and formatting. It is not a generic business-logic folder.

Reserved Phase 2 modules (`community`, `analytics`, `search`, `notification`,
and `moderation`) do not exist until they have a real consumer.
