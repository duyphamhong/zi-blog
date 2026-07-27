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

## VS Code development and debugging

Open the repository root, not `apps/web`, as the VS Code workspace. Before the
first debug session:

1. Activate Node.js 22.17.1 and restart VS Code if its integrated terminal still
   reports a different version.
2. Copy `.env.example` to `.env`, then replace `PAYLOAD_SECRET` and
   `SEED_ADMIN_PASSWORD`.
3. Start Docker Desktop.
4. Run **Tasks: Run Task** from the Command Palette and select
   **Development: first-time setup**.

After setup, open **Run and Debug**, select **Zi-Blog: full stack**, and press
`F5`. The launch profile starts PostgreSQL, launches Next.js under the Node
debugger, and opens a Chrome debugging session when the development server is
ready.

Use **Zi-Blog: server only** when debugging Payload hooks, access rules, server
components, route handlers, or queries without opening Chrome. Use
**Zi-Blog: browser only** to attach the browser debugger to a development server
that is already running.

Set breakpoints directly in `.ts` and `.tsx` source files. Server-side
breakpoints appear in the Node debug session, while client component breakpoints
appear in the Chrome debug session. Stop the debug session before running the
**Database: stop** task.

Run the **Database: migrate** task explicitly after pulling or creating a schema
migration. F5 intentionally does not auto-accept migration warnings: Payload
may request confirmation when a local database contains schema changes pushed
in development mode.

Run `docker compose up --build` for the full-container workflow. Production
Payload initialization runs committed migrations through `prodMigrations`.
Seeding is always a separate explicit command.

Local media is written to `apps/web/public/media` and ignored by Git. The
container workflow mounts a named volume at the same runtime path.
