# Hostinger VPS deployment

## Production topology

Zi-Blog is deployed as one `web` container and one PostgreSQL container. The
web container joins the VPS-wide external Docker network `public-ingress` with
the DNS alias `zi-blog-web`; it does not publish ports 80 or 443. The separate
Nginx gateway repository owns public TLS termination and proxies the configured
blog hostname to `zi-blog-web:3000`.

Persistent PostgreSQL data and local Phase 1 uploads use the named Docker
volumes `zi-blog_postgres_data` and `zi-blog_web_media`. Back up both before a
schema migration or any destructive recovery action.

## GitHub Actions CD

`.github/workflows/deploy.yml` runs after the `CI` workflow succeeds on `main`.
It can also be started manually from `main`. The workflow packages the validated
revision, uploads it over SSH, applies only committed Payload migrations,
restarts the app, verifies container readiness, and finally calls the public
readiness endpoint.

The migration container runs without a TTY and with stdin disconnected. This is
required because the remote deployment script itself is streamed to SSH over
stdin; allowing `docker compose run` to inherit that stream would consume the
remaining commands before the `web` service is created.

Create a GitHub Environment named `production`, then add these environment
secrets:

| Secret                                                       | Purpose                                                                     |
| ------------------------------------------------------------ | --------------------------------------------------------------------------- |
| `VPS_HOST`, `VPS_SSH_PORT`, `VPS_SSH_USER`                   | Hostinger SSH connection. `VPS_SSH_PORT` may be omitted for port 22.        |
| `VPS_SSH_PRIVATE_KEY`                                        | Deploy key allowed to connect to the VPS.                                   |
| `VPS_SSH_KEY_PASSPHRASE`                                     | Optional passphrase for the deploy key; omit only for an unencrypted key.   |
| `VPS_SSH_KNOWN_HOSTS`                                        | Recommended pinned `known_hosts` entry for the VPS.                         |
| `VPS_DEPLOY_PATH`                                            | Optional deployment root; defaults to `/opt/zi-blog`.                       |
| `NEXT_PUBLIC_SERVER_URL`                                     | Public HTTPS origin, for example `https://blog.example.com`.                |
| `PAYLOAD_SECRET`                                             | Random secret of at least 32 characters; keep it stable after first deploy. |
| `POSTGRES_DB`, `POSTGRES_USER`, `POSTGRES_PASSWORD`          | Dedicated production database credentials.                                  |
| `SEED_ADMIN_EMAIL`, `SEED_ADMIN_NAME`, `SEED_ADMIN_PASSWORD` | Initial-admin values retained for explicit seed operations only.            |

Never commit `.env.production` or paste a secret into workflow YAML. The
workflow creates it on the VPS for the selected release only.

## Nginx gateway and DNS

Before the first deployment, point the intended hostname at the VPS and add the
site to `G:\Projects\Nginx-vps-deploy\nginx-vps-deploy\nginx-gateway\sites\sites.json`:

```json
{
  "id": "zi-blog",
  "server_names": ["blog.example.com"],
  "upstream_host": "zi-blog-web",
  "upstream_port": 3000,
  "tls_cert_name": "blog-example-com",
  "force_https": true
}
```

Deploy the gateway change and provision its TLS certificate before enabling the
Zi-Blog CD workflow. The final public health check intentionally fails until
this route is live.

The `Provision Zi-Blog TLS certificate` workflow is manually triggered and
uses the existing gateway webroot to issue `blog.appzihub.fun`. Run it before
merging the gateway route PR; it uses `SEED_ADMIN_EMAIL` as the Certbot contact
email and never prints SSH credentials.

## First deployment and operations

The database starts empty. CD runs migrations but deliberately does not run
`pnpm seed`, so it never overwrites production content. If sample data is
needed for a disposable first install, run the seed command explicitly from
the release directory with the approved production environment, then remove
the sample data before real use.

For a Phase 2 localization migration, follow
`docs/operations/phase-2-localization-migration.md` first: its source-locale
audit determines whether `LEGACY_CONTENT_LOCALE` must be `en` or `vi`. The CD
workflow defaults it to `en` only for a new database.
