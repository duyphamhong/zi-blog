# ADR-0003: Use PostgreSQL

Status: Accepted

## Decision

Use Payload's PostgreSQL adapter and committed migrations as the durable schema
contract.

## Consequences

Developers need PostgreSQL for integration tests and full local validation.
Production schema push is disabled, and every schema change requires a reviewed
migration.
