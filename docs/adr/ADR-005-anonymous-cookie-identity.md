# ADR-005: Anonymous cookie identity

## Decision

Use a cryptographically random, HttpOnly cookie and HMAC-hashed lookup key for
guest identity.

## Consequences

The application does not persist raw IP addresses or browser fingerprints.
Deleting the cookie intentionally results in a new anonymous profile.
