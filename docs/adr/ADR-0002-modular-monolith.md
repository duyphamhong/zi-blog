# ADR-0002: Use a modular monolith

Status: Accepted

## Decision

Deploy one Next.js and Payload application while organizing content, identity,
media, SEO, platform, and shared concerns by explicit ownership.

## Consequences

Deployment stays simple and module boundaries remain extractable. Empty future
modules and service wrappers without policy are prohibited.
