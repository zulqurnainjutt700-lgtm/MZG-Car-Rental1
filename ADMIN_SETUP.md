# MZG administrator workspace

## Architecture and local use

Run Node 24, `npm ci`, then `npm start`. Open `http://127.0.0.1:3000/admin`. This is a dedicated administrator login. Direct `/admin/dashboard`, `/admin/pages`, `/admin/fleet`, `/admin/bookings`, `/admin/customers`, `/admin/media`, `/admin/seo`, `/admin/settings`, `/admin/maintenance`, `/admin/security` and `/admin/backups` routes work through the existing Node server.

One custom authentication system remains in use. Customer login never creates a verified administrator session. Administrator login uses the same secure password hashes/session infrastructure plus mandatory authenticator MFA. Customer users cannot access administrative APIs. Accounts assigned an admin/staff role receive no implicit permissions. Owners have full access; operational permissions are assigned explicitly from Security & access. Settings, maintenance, security logs/roles and backups are owner-only.

## One-time owner setup (no credentials in chat)

1. Create your personal customer account using `/signup.html` with a unique password of at least 12 characters. Configure SMTP and verify email before production use.
2. In your trusted backend terminal, with the same `AUTH_DIRECTORY` as the server, run `node admin-owner.cjs setup YOUR_EMAIL --confirm-owner-operation`.
3. This command refuses a second owner and revokes existing sessions. Sign in at `/admin` with your own credentials. No administrator password is generated, hardcoded or sent to chat.
4. Enter your current password to begin authenticator enrollment. Add the displayed secret manually to an authenticator app: time based, SHA1, 6 digits, 30 seconds, issuer MZG Car Rental. Confirm a current code. The key is shown only during setup, expires after 10 minutes, and is stored encrypted. Do not share it.
5. Future administrator sign-ins require both the password and a fresh authenticator code. Used codes cannot replay. Keep your server clock synchronized.

The backend does not silently grant the business email or first signup owner status. Existing accounts were not promoted during implementation. `manage-admin.cjs` remains a trusted-terminal utility; it cannot change the owner and grants no implicit permissions. Use the owner panel to assign operational access to existing accounts. The owner can assign an existing account directly or send a one-use invitation through configured SMTP. Invitations require an active, email-verified recipient account, expire after seven days, grant access only after acceptance by that account, and revoke sessions. If SMTP is missing or delivery fails, no invitation access is granted.

MFA recovery requires trusted server access: `node admin-owner.cjs recover-mfa YOUR_EMAIL --confirm-owner-operation`. It clears enrollment and revokes sessions; then the administrator must sign in with their password and enroll again. There is no public MFA bypass. Password reset uses the existing real SMTP reset flow and still requires MFA for administrator login afterward.

## Production prerequisites

- Persistent **single-instance** Node 24 hosting with a persistent private disk. Vercel static hosting alone cannot operate the CMS/database. Do not put SQLite in `/tmp` or create independently writable replicas.
- `AUTH_DIRECTORY` points to a private mounted disk; never serve or commit it.
- `PUBLIC_ORIGIN` is the exact HTTPS production site origin; `SECURE_AUTH_COOKIES=true`.
- `ADMIN_ENCRYPTION_KEY` is a privately generated 32-byte base64 key. Generate in your trusted terminal with `node -e "console.log(require('node:crypto').randomBytes(32).toString('base64'))"`. Store it in backend environment settings and a secure backup. Never put it in CMS settings, GitHub or chat. HTTPS administrator login fails closed without this key. Local development automatically creates a private `.private/admin-encryption.key`.
- SMTP variables from `ACCOUNT_SETUP.md` are required for actual verification/password reset delivery. No emails are simulated.
- Vercel `BACKEND_ORIGIN` and `BACKEND_PROXY_SECRET` must point to the backend, as described in `VERCEL_DEPLOYMENT.md`. Public pages, media, fleet data, sitemap, preview and admin routes now use the gateway when connected. Without it, only the original public snapshot is available and management/booking APIs report setup errors.
- Standard HTTPS, consistent disk backups, disk-space monitoring and tested provider recovery are required. The main backend writes `backend.pid` to prevent accidental duplicate instances and guard offline restore.

## CMS workflow

Website pages provides a field editor for the current HTML sections. Headings, paragraphs, image/alt fields, link/button labels and destinations, alignment, backgrounds, visibility and supported ordering can be changed. Original sections retain their existing structure; ordering is supported within their original wrapper. Template sections are appended after the original layout. Both original and template sections support duplication/removal, item editing and safe styling. Original sections can also be hidden/deleted and restored through published history. Duplicated original sections receive new DOM identifiers.

Fourteen approved templates are available: hero, image/text, text/image, car grid, promotional banner, features, statistics, testimonials, FAQ, contact, CTA, gallery, rental plans and rich text. Rich text supports safe multiline content, **bold**, _italic_ and ### subheadings rather than arbitrary HTML. No executable HTML, scripts or unrestricted CSS are accepted. Statistics/testimonial template content is administrator supplied; live dashboard metrics always come from database records.

Save draft does not change public content. Save & preview opens a restricted authenticated preview. Publish requires confirmation. Version rollback republishes a prior snapshot and preserves the previous publication. Revision checks reject stale concurrent saves. SEO edits are also drafts; publish the page to activate them. Sitemap and robots are generated by the backend from published SEO. SEO slugs create aliases while original `.html` destinations keep working.

Global business/contact/navigation/logo/footer settings update rendered public pages. Original images are preserved; uploaded media receives WebP variants (up to 1920 and 640 px). Use the returned `/media/ID.webp` or `/media/ID-small.webp` URL in page/fleet fields. Uploads accept PNG/JPEG/WebP up to 1 MB, decode with a 16-megapixel cap, strip metadata and resize. Replacing an image updates all URL references. Deletion is blocked for references in vehicles, bookings, drafts, publications, saved versions or global settings. Media is stored in private SQLite blobs and delivered only through validated image routes. Original static files are not destructively editable.

## Fleet, bookings, customers and revenue

The initial 24-car catalogue migrates into database records once, preserving IDs and images. Each record represents one physical unit with a unique internal reference. Availability/unavailable/maintenance/archived states control public requestability. Daily, weekly, monthly and deposit values are editable. Current customer estimates use the daily rate and round started 24-hour periods up; weekly/monthly negotiated rates are stored for owner quotations rather than automatically applied.

Archived records and booking snapshots are retained. New rental requests remain Pending. Confirmation, conflict checks and changes execute within SQLite transactions. Rejected/Cancelled states require a reason; terminal rentals cannot be reopened. Internal notes remain separate from customer-visible notes. Customer suspension revokes sessions and blocks sign-in; role elevation and owner demotion are not available through customer controls. There is no customer impersonation.

Record actual offline payments/refunds in the receipt ledger after confirming the transaction outside the website. Unique receipt references prevent duplicates. Dashboard recorded net revenue sums ledger payments minus refunds, not quoted amounts or the legacy prepaid field. This application does not charge cards or process refunds automatically. Exported CSV escapes spreadsheet formula prefixes.

Maintenance is enforced server-side with HTTP 503/Retry-After; admin access remains available. Booking requests can also be paused independently. Published pages and requestability depend on the configured backend, not an overlay or browser-only flag.

## Backups and restoration

Owner Backups creates a SQLite `VACUUM INTO` snapshot under the private backend disk. Both SQLite integrity and foreign-key checks are performed, followed by a stored SHA256. Downloads require owner authorization and hash verification. These files contain private customer information and encrypted MFA secrets: keep them private.

Set `BACKUP_INTERVAL_HOURS=24` (permitted 1–168) to schedule snapshots while the persistent Node process runs. The interval does not execute during downtime. No automatic deletion/retention or offsite replication is configured: implement provider-level retention and encrypted offsite backups, including the MFA encryption key. Uploaded images are inside the database snapshot. Separate `.private/admin-encryption.key` or production environment encryption keys need independent secure backup.

Restore is intentionally offline:

1. Stop the backend service. Confirm no other process is using the database.
2. Check the expected SHA256 against your recorded backup hash.
3. Run `node restore-backup.cjs PRIVATE_BACKUP_PATH EXPECTED_SHA256 --confirm-restore` with the correct `AUTH_DIRECTORY`.
4. The command rejects a live PID, mismatched hashes, missing schema or failed integrity checks; preserves the current database privately; restores the snapshot; and revokes all sessions and email tokens.
5. Start the service, sign in again and verify fleet, published content, customers and rental history. Restore the original encryption key; otherwise use the protected MFA recovery command and enroll again.

Automated tests verified backup and restore on disposable test data only. The actual business database was not restored or downloaded externally.

## Verification

`npm test` covers public links/assets/customer regressions and isolated administrator integration (routes, owner provisioning, MFA, authorization, CMS drafts/publication/rollback, media, fleet, bookings/conflicts, receipts, customers/permissions, settings/SEO/maintenance, restart persistence and verified backup/restore). `npm run test:deployment` verifies the public build, sitemap, data exclusions and gateway forwarding with a stub HTTPS transport. It does not prove a live Vercel deployment or external SMTP delivery. Scheduled real-time execution, actual email inbox delivery, production disk mounting/HTTPS and the provider's live deployment must be verified after configuration.

Security references used: [RFC 6238 TOTP](https://www.rfc-editor.org/rfc/rfc6238), [OWASP MFA guidance](https://cheatsheetseries.owasp.org/cheatsheets/Multifactor_Authentication_Cheat_Sheet.html).
