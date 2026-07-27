# ADR-0001: Use Payload CMS

Status: Accepted

## Decision

Use Payload 3.86.0 for Admin UI, authentication, access control, persistence
integration, drafts/versions, uploads, APIs, Local API, and Lexical editing.
Preserve the official blank template's generated Next.js route group.

## Consequences

Payload packages stay on one exact version. Collection files remain declarative;
reusable policy and query behavior lives in owning modules.
