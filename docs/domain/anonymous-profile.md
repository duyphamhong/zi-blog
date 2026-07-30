# Anonymous profile

An anonymous profile is a server-resolved guest identity tied to a secure,
HttpOnly browser cookie. The cookie token is HMAC-hashed before lookup and is
never returned to a client component. Cookie loss creates a new guest identity.

Profiles may select a validated display name and one preset avatar. Only staff
can change profile status; blocked profiles cannot create community mutations.
