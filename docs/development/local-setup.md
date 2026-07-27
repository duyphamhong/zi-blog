# Local setup

1. Install Node.js 22.17.1 and activate Corepack.
2. Copy the root `.env.example` to `.env`.
3. Replace `PAYLOAD_SECRET` and the seed password.
4. Start PostgreSQL with `docker compose up -d postgres`.
5. Run `pnpm install`, `pnpm db:migrate`, and `pnpm seed`.
6. Start the app with `pnpm dev`.

The public site is available at <http://localhost:3000> and Payload Admin at
<http://localhost:3000/admin>.

The root scripts delegate to the `web` workspace. On a Windows installation
where Corepack cannot create global shims, use `corepack pnpm` instead of
`pnpm`; repository scripts already use Corepack for their nested calls.

Run `docker compose up --build` for the full-container workflow. Production
Payload initialization runs committed migrations through `prodMigrations`.
Seeding is always a separate explicit command.

Local media is written to `apps/web/public/media` and ignored by Git. The
container workflow mounts a named volume at the same runtime path.
