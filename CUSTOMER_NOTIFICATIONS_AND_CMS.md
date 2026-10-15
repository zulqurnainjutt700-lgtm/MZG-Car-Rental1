# Customer notifications and website controls

## Owner workflow

Open `/admin/notifications`. Enter a title, message and local destination, choose
individual active customers or all active customers, and select Website, Email,
or both. Review displays the actual recipient counts before confirmation. Sending
is owner-only, CSRF/MFA protected, rate-limited and logged. Repeated requests with
the same announcement identifier do not duplicate notices or email jobs.

Website notices are stored per customer and shown in the header bell after sign-in.
Unread counts persist; each customer can mark only their own notifications read.
The bell refreshes on opening, page visibility changes, and every minute while the
page is visible. This is an in-site inbox, not operating-system push notifications.

Administrator email updates go only to verified active customers who allow those
updates in Account Settings. Preferences are checked again before delivery.
Verification, password-security and booking emails remain independent. Website-only
announcements do not start email delivery. No real customer broadcast was sent
during implementation tests.

Email jobs use the existing persistent outbox and retries. At most two queue jobs
are attempted during a send request; remaining jobs stay queued. Use Process due
reminders / retries for additional batches. Existing Hobby cron runs daily, so a
large mailing list needs a more frequent scheduler/provider plan for prompt delivery.
The current composer limits each audience to 250 active customers.

## Editing the site

- Website pages: public headings, descriptions, supported section images/buttons,
  FAQs, rental-plan content, extra static labels, draft/preview/publish/rollback.
- Website settings: business contacts, separate logos/favicon, font choice, email
  link behavior, floating WhatsApp visibility, footer groups/links/copyright,
  navigation, pickup locations, rental rules and other existing business settings.
- Account & contact page text in Website settings: static headings, instructions,
  form labels, buttons and placeholders on supported account/contact pages. Saving
  publishes text while preserving form structure, validation and protected routes.
- Fleet/media/SEO retain their dedicated controls.

These are approved content/settings controls, not arbitrary executable HTML, CSS
or JavaScript access. Authentication logic and customer data permissions stay
server-controlled. Existing uploaded branding and business name are retained.

The footer keeps a semantic `mailto:` destination. Default behavior opens a chooser
with Gmail, the device email app, and copying the address. Owners can choose direct
Gmail or the device app in settings. A missing OS mail handler cannot be installed
or configured by the website. No email is sent merely by opening the chooser.

The verification notice links to `/verify-email.html`; without a token, signed-in
unverified customers can request a verification link there. Actual verification
still requires the secure email link. Merely clicking a button never verifies an
account.

## Persistence and checks

Additive schema v5 adds `notice_broadcasts`, `customer_notices` and
`notice_preferences` in SQLite and private PostgreSQL, with indexes/RLS. The CMS
leaf-label upgrade adds editable labels without resetting existing drafts, published
content, settings or revisions. Account text is persisted in private site settings.

Checks performed: isolated owner/customer API tests, recipient filtering, unverified
email exclusion, preferences, queue opt-out recheck, idempotency, read ownership,
safe destinations, escaped text, preserved form controls, CMS lifecycle and existing
authentication/bookings. Browser QA covered the mobile bell/inbox, mark-read,
verification destination, footer chooser, announcement review/send and settings
save updating the public footer. QA records are disposable and no test emails were
sent to real customers. PostgreSQL schema v5 and private inbox queries were checked.

Screenshots: `customer-notifications-preview.png` and
`admin-announcements-preview.png` show isolated QA accounts/data.

The cropped green support shortcut is now an icon-only WhatsApp button. The black
ChatGPT badge from the supplied screenshot was not found in website assets/scripts;
it appears to belong to the browser/assistant surface rather than this application.
