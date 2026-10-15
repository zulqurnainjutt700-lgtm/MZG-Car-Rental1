# Email activation — 15 October 2026

Gmail SMTP uses port 587 with required STARTTLS (`SMTP_SECURE=false` means the
connection upgrades to TLS; plaintext authentication is not permitted). The
mailer validates certificates against Node and operating-system trusted roots.
Certificate verification is never disabled. Port 465 encountered a local chain
validation error; port 587 authenticated successfully.

Duplicate SMTP entries in the private local environment were consolidated,
retaining the latest supplied credentials. No password was committed. All six
SMTP settings were saved privately in Vercel Production with owner approval.

`npm run check:smtp` succeeded. Gmail accepted the requested non-sensitive test
email, and the owner confirmed receipt. This verifies local delivery. Production
delivery is checked separately after the deployment applies the environment.

Verification links expire after 24 hours; reset links after 30 minutes. Tokens
are hashed in the private database, one-use, and invalidated after use. Resend
and password-reset requests are rate-limited. Reset delivery is now awaited before
the function response, preventing serverless suspension of an unfinished send.
An isolated delayed-delivery regression test covers this behavior.

Booking notifications use the existing durable outbox and status-aware retries.
Pickup/return/overdue scheduling remains daily on the current Vercel configuration.
No real customer booking or password is changed for email delivery testing.
