# Website recheck — 15 October 2026

Read-only live crawl: 17 public/authentication/SEO pages, 24 fleet records and
123 referenced images/scripts/styles returned successfully. No missing anchors
were detected in the crawled documents. Anonymous requests to admin dashboard,
media and customer booking APIs returned 401. Private account pages redirected
to sign-in (303). The complete isolated regression suite passed.

Issues fixed during this check:

- Production deployment aliases served sign-in forms whose Origin differed from
  `PUBLIC_ORIGIN`, causing the reported 403. Newly deployed aliases now redirect
  page requests to the configured main HTTPS domain. APIs and POST origin checks
  remain protected; no broad origin allowlist was introduced. Existing immutable
  deployment URLs retain their old code: use the main domain for ongoing access.
- Fleet search times were reset to 10:00 when opening a booking or returning from
  sign-in. Selected times are now retained in the modal and login draft.
- Booking opened for today silently changed to tomorrow. The selected date is
  now preserved and normal server-side future-time validation remains enforced.
- Changing search fields while a request was in progress could leave the submit
  button disabled. Superseding a search now clears its busy state.

Browser check on an isolated customer account preserved 20–22 November 2026,
14:30–17:45 and correctly quoted three daily periods. No booking was submitted
to production. No browser console errors were captured in that check.
Canonical redirect tests cover fixed-target safety, query preservation, and
unchanged API/POST behavior. Deployment build tests passed.

Outstanding: Gmail SMTP password remains empty, so verification/reset/notification
delivery cannot be called operational. The previous Safe Browsing warning requires
Google review. This audit is not a guarantee of zero bugs or a full penetration
test; native mobile browser and real provider delivery checks remain separate.
