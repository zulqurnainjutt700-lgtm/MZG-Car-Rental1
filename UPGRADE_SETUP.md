# Platform upgrade operations

The public design, uploaded ATLANTA logo and saved Waseeq business name are retained
at the owner's explicit request. Existing customer accounts, MFA keys, bookings and
CMS publications are not reset by this release.

## Database migration

Schema version 4 is additive: `booking_operations`, `maintenance_blocks`, and
`email_jobs`, plus their indexes. SQLite migration is in `admin-schema.cjs`;
PostgreSQL migration is in `postgres-schema.sql`. Existing records are retained.
The PostgreSQL adapter applies the idempotent private-schema migration at startup,
with row-level security enabled. Do not expose the database credential to clients.
Back up the private database before deployment using the existing backup procedure.

## Availability operations

Every fleet record represents one physical inventory unit. Pending requests do not
reserve that unit. Confirmed overlapping intervals conflict; adjacent intervals do
not. Active rentals block all new periods until a staff member explicitly records
actual return. Passing the scheduled return time creates an overdue state, never
an automatic check-in. Use `/admin/availability` to record pickup, extend a rental,
record actual return, and create or release scheduled maintenance blocks.

Confirmation, extension and maintenance operations use the existing database
transaction lock. PostgreSQL takes a transaction-scoped advisory lock, so separate
function instances serialize inventory-sensitive updates. Customer submission
rechecks availability on the server; a previously displayed search result is not
a reservation. Configure the no-date catalogue policy in Website settings.

## Email setup

Gmail configuration in private `.env` locally and Vercel Production settings:

```
SMTP_HOST=smtp.gmail.com
SMTP_PORT=465
SMTP_SECURE=true
SMTP_USER=YOUR_GMAIL_ADDRESS
SMTP_FROM=YOUR_GMAIL_ADDRESS
SMTP_PASS=YOUR_GOOGLE_APP_PASSWORD
```

Use the Gmail account that generated the App Password. Never use a regular Google
password. Do not commit `.env` or paste passwords into chat. Restart the local
server or redeploy Vercel after changing environment variables. `npm run check:smtp`
checks SMTP authentication only. The owner can send a real test from
`/admin/notifications`; confirm actual inbox receipt before calling email operational.

Alternatively set `RESEND_API_KEY` and `EMAIL_FROM` for a verified sender; Resend
takes precedence. With a custom sending domain, copy the provider's exact SPF/DKIM
records into DNS, avoid duplicate SPF records, and configure DMARC according to
your domain policy. Gmail's own domain DNS is managed by Google; do not add
gmail.com records to an unrelated domain. Provider secrets stay server-side.

Booking and password-change notifications use a persistent outbox, bounded retries
(five attempts), lease recovery, and deduplication. Resend uses idempotency keys;
SMTP is at-least-once and can duplicate a message after an uncertain network failure.
Email failure does not turn an already committed booking into an apparent failure.
Verification/reset emails keep their established direct delivery and resend flow.
Stale booking/reminder jobs are skipped after a relevant status change.

Set a private random `CRON_SECRET` of at least 32 characters in Vercel Production.
The included daily cron calls `/api/jobs/email` at 03:00 UTC (about 08:00 Pakistan
time). Vercel Hobby scheduling can vary within the hour; this is not a precise
pickup alarm or an hourly retry service. Owners can process due jobs manually in
Email notifications. For frequent retries/reminders use a compatible authenticated
scheduler or hosting plan. Unconfigured email remains pending; delivery is not
simulated. Inspect failed jobs and provider errors before retrying.

## Media

CMS, fleet, branding and SEO controls accept files directly and let owners reuse
library images. Images are decoded and re-encoded server-side with Sharp, with
strict format/size/pixel limits, and stored in the private database. They survive
function restarts and deployments. Files larger than 950 KB are optimized in the
browser before transfer; server upload limit is 1 MB. Public variants are up to
1920 px and 640 px. This workflow does not retain an archival camera-original
file. Keep originals separately when required. Focal-point and contain/cover
controls provide safe framing; no arbitrary CSS or executable CMS code is allowed.

## Deployment and verification

Use Node 24, `npm ci`, `npm test`, `npm run test:deployment`, then deploy the
existing Vercel project. Keep its existing `DATABASE_URL`, `ADMIN_ENCRYPTION_KEY`
and exact HTTPS `PUBLIC_ORIGIN`. No extra backend hosting is required for the
current Supabase/Vercel architecture. Do not use an ephemeral SQLite database
for production. See `SUPABASE_DEPLOYMENT.md` for existing provider setup.

After deployment check `/`, `/fleet.html`, `/admin`, owner MFA, direct admin routes,
one controlled request, media persistence, CMS publishing and SMTP inbox receipt.
Never modify real customer bookings merely to test a release. Roll back application
code through Vercel if needed; additive tables can remain in place.

The previously observed Google Safe Browsing warning requires investigation and
Search Console security review; an SSL setting does not clear that warning.
Do not disable browser protection to validate the site. Native iOS/Safari testing,
real SMTP delivery and production cron execution need separate verification.
