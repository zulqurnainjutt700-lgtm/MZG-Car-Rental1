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

Production deployment `5bccce9` reported Ready and `/api/me` returned
`emailDeliveryConfigured:true`. A real production password-reset request returned
202 and the owner confirmed the reset email arrived. The password was not changed.
An isolated Pending booking notification also passed through the durable outbox
and real Gmail SMTP; the database recorded sent and the owner confirmed receipt.
The message was clearly marked TEST ONLY; no production rental was created.

Verification, reset completion, token expiry/replay, booking ownership and outbox
retry behavior passed isolated automated tests. A new production customer's full
signup-to-verification journey was not performed, and scheduled reminder execution
has not been observed. These remain distinct from confirmed SMTP delivery.

Verification links expire after 24 hours; reset links after 30 minutes. Tokens
are hashed in the private database, one-use, and invalidated after use. Resend
and password-reset requests are rate-limited. Reset delivery is now awaited before
the function response, preventing serverless suspension of an unfinished send.
An isolated delayed-delivery regression test covers this behavior.

Booking notifications use the existing durable outbox and status-aware retries.
Pickup/return/overdue scheduling remains daily on the current Vercel configuration.
No real customer booking or password is changed for email delivery testing.
