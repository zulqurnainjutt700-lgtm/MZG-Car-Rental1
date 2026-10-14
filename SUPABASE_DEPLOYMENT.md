# Free Vercel + Supabase backend

The public design is unchanged. The existing custom authentication, owner MFA,
authorization, CMS and booking rules run inside a Vercel Node function. PostgreSQL
replaces local SQLite in production; SQLite remains supported locally.

## Private configuration

Configure `DATABASE_URL` using Supabase's pooler PostgreSQL connection string.
Keep certificate verification enabled. Never commit database credentials.
The application uses its own `mzg_private` schema. Tables have row level security
enabled and the schema has no public privileges; they are not browser REST tables.
Only the trusted backend database login can use them.

Set Production variables in Vercel:

- `DATABASE_URL`: private pooler connection string with database password.
- `PUBLIC_ORIGIN=https://mzg-car-rental2.vercel.app`
- `ADMIN_ENCRYPTION_KEY`: the original local 32-byte MFA key, base64 encoded,
  if migrating enrolled administrators. A different key cannot decrypt existing MFA.
- `SMTP_HOST`, `SMTP_PORT`, `SMTP_SECURE`, `SMTP_USER`, `SMTP_PASS`, `SMTP_FROM`:
  configure a real mail provider for verification and password-reset delivery.
- `BACKUP_INTERVAL_HOURS=0`: serverless processes cannot schedule disk backups.

Do not set `BACKEND_ORIGIN` for the direct Vercel backend deployment.
Production routing uses api/backend.js after verified database migration. The legacy api/gateway.js remains available only for the alternative persistent-server deployment.

## Existing data

After explicit permission to transfer private data:
`node migrate-to-postgres.cjs --confirm-private-data-transfer`.
It refuses a destination with existing accounts, verifies source SQLite integrity,
copies in one transaction, compares table fingerprints, preserves local data and
does not transfer live sessions/reset tokens/invitations. Sign in again after deployment.

## Backups and operational limits

Use private `pg_dump --schema=mzg_private` backups and verify restoration in a
separate database before a destructive restore. The previous SQLite backup buttons
are intentionally unavailable on PostgreSQL: ephemeral Vercel files are not backups.
Free provider usage/size/execution limits apply. Supabase may pause an inactive free
project; resume it in the provider dashboard. Automatic emails need a configured sender.

The compatibility database driver maintains existing synchronous transaction
boundaries using a dedicated PostgreSQL worker. Queries are parameterized, TLS is
verified, and inventory-sensitive transactions use a database advisory lock across
server instances. Transactions must not span asynchronous application work.
