# ADR-0004: Use Payload built-in drafts for Phase 1

Status: Accepted

## Decision

Use Payload `_status` with only `draft` and `published`. Authors cannot publish;
editors and super administrators can.

## Consequences

There is no duplicate status field. Review, approval, scheduling, and archive
states require a later ADR and migration that preserves the public query
contract.
