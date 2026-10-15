# Upgrade verification — 15 October 2026

## Automated checks performed

`npm test` passed: site assets/links, owner-supplied hero, customer authentication,
CSRF/origin and ownership checks, account persistence, administrator MFA and roles,
CMS drafts/publish/rollback, media decoding, fleet lifecycle, booking approval and
conflicts, payments, settings/SEO, maintenance, verified local backup/restore,
inventory operational rules, email queue behavior and Vercel request normalization.
These mutation tests use isolated local databases, not real customer records.
Email queue tests use an isolated fake transport and do not prove inbox delivery.

`npm run test:deployment` passed: production build, 24 fleet assets, dynamic-route
protection from CDN shadowing, sitemap/robots and gateway forwarding tests.
Gateway network checks use a stub transport, not the deployed production service.

Supabase connection checked with certificate verification: schema version 4,
public availability query and administrator overview query executed successfully
against the private PostgreSQL schema; 24 fleet records returned. No customer
accounts or bookings were edited during this check.

## Browser checks performed

Chromium in-app browser, localhost. Homepage measured at actual CSS widths
321, 359, 374, 389, 414, 480, 767, 1022, 1440 and 1918 px. No horizontal overflow
in those measurements. Browser zoom/rounding means these are near, not exactly,
all requested target widths. Mobile hero heights measured 559–588 px across the
narrow widths; the former fixed 780 px behavior is removed. Full car group visible
in captured mobile and desktop views. Optimized hero resources loaded successfully.

Customer dashboard, profile, booking history and account settings: measured at
321, 389, 767 and 1440 px with no horizontal overflow. Customer sign-in redirected
to the real user-specific dashboard; bookings and overdue labels matched the
isolated test records. No captured browser error messages during this portal check.

Public fleet, about, contact, plans, policy and legal pages were inspected at
multiple widths. One early login overflow measurement was taken while layout was
settling; the settled 389 px login view fit its viewport. A longer repeated public
page sweep timed out, so a complete all-page/all-width matrix is not claimed.

Public mobile drawer opened, locked page scrolling, closed with Escape and
navigated to the fleet. Fleet data loaded and displayed the stored vehicle names.
Admin mobile dashboard, calendar and CMS fitted 389 px without document overflow;
the timeline scrolls inside its own table region. The admin drawer and page links
worked. Charts use stored database records, not decorative metrics.

Admin media upload was submitted in the browser, optimized successfully and remained
in the isolated database after refresh. CMS media picker displayed library/original
assets; an isolated CMS draft saved successfully without publishing production data.

Screenshots in the workspace: `mobile-upgrade-preview.png`,
`desktop-upgrade-preview.png`, `admin-mobile-upgrade-preview.png`, and
`admin-desktop-upgrade-preview.png`. Administrator screenshots show disposable QA
records, not production revenue/customer statistics. `vercel-scheduler-preview.png`
records the saved private Production scheduler variable; it does not show its value.

## Measured asset sizes

Owner hero original: 1,786,751 bytes; desktop WebP: 101,098 bytes; mobile WebP:
79,400 bytes. Twenty-four original fleet images total 40,293,741 bytes; the 1200 px
WebP variants total 1,559,088 bytes. Originals were retained in the repository.
These are file-size measurements, not Lighthouse scores or field Core Web Vitals.

## Not yet verified / external requirements

SMTP authentication and real email delivery are not operational: the local
`SMTP_PASS` value is empty. Cron secret saved in Vercel Production with owner
approval; applying it requires a new deployment. Daily cron execution has not been
observed. Native Android/iOS/Safari, exact every-width matrix, archival camera-original
media retention and field performance are not verified/implemented. Image framing
uses focal-point controls rather than a destructive image editor. Google's prior
Safe Browsing flag still needs the owner's Search Console security review.
