# ADR-0005: Use local media storage in Phase 1

Status: Accepted

## Decision

Store development uploads under `apps/web/public/media` and mount a persistent
Docker volume there.

## Consequences

This is suitable for local and single-instance evaluation only. Multi-instance
or durable production deployment requires an S3-compatible Payload storage
adapter and a media migration plan.
