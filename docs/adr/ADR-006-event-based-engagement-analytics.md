# ADR-006: Event-based engagement analytics

## Decision

Record validated events first and derive post statistics asynchronously.

## Consequences

Public rendering does not increment a mutable post counter. Raw analytics data
remains private and aggregation can be retried without exposing it to visitors.
