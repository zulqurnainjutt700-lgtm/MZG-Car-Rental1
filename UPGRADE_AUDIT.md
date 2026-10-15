# MZG platform upgrade audit and implementation sequence

The repository was clean at the start of this upgrade. Existing architecture:
static HTML, shared CSS/vanilla JavaScript, a Node HTTP backend and custom scrypt
authentication with HttpOnly sessions, CSRF protection and administrator MFA.
Production uses Vercel functions and a private Supabase PostgreSQL schema through
the existing transaction compatibility driver. Local SQLite remains supported.
Media are optimized with Sharp and persisted as database blobs, not ephemeral files.
CMS drafts/publishing/history, fleet editing, quotations and payment ledger already exist.

Priorities:
1. Compact mobile hero, responsive forms/navigation, consistent focus, safe floating controls.
2. Shared inventory availability, active/overdue blocking, maintenance, extension and actual return.
3. Admin availability workspace and direct CMS/fleet image upload controls.
4. Branded email delivery and durable notification retries/reminders.
5. Responsive browser validation, API/security regressions, deployment verification.

Known external prerequisites: real SMTP/transactional sender credentials and delivery
testing are outstanding. Google's public Safe Browsing report flagged this hostname;
Search Console investigation/review is required. Changing SSL does not clear that flag.
No browser security warning will be bypassed for testing.

Mobile audit: overlapping hero breakpoints force a 780px section, contain the whole
wide image near its bottom and leave large gaps. Navigation lacks body scroll lock
and a focus trap. Search lacks pickup/return time fields. Input focus combines
parent borders and internal outlines. These are being corrected before backend work.

The Wheelzie/mobile reference files were not attached to this latest request;
implementation follows the written design direction and existing supplied assets.

Branding decision: the owner explicitly requested retaining the currently uploaded
ATLANTA logo and saved Waseeq business name. This upgrade does not reset either.
