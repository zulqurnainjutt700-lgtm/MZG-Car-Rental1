# Google Safe Browsing investigation — 15 October 2026

## Report supplied by owner

Search Console lists **Deceptive pages** and **Possible Phishing Detected on User Login** for https://mzg-car-rental2.vercel.app/. Both show sample URLs as N/A. These findings remain unresolved. No security review has been submitted by this investigation.

## Checks actually performed

- Read-only HTTP inspection of homepage, customer login, signup, administrator login and privacy page: HTTP 200; no external script sources or iframe elements in those five responses; Content-Security-Policy present.
- Inspected customer and admin credential handlers: customer requests use local `/api/` endpoints; administrator requests use local APIs. This is a custom MZG account system, not Google sign-in.
- Compared deployed `shared.js`, `assets/admin.js`, `assets/account-auth.js` and `assets/auth-pages.js` to project files. They match after normalizing Windows line endings.
- Ran `node verify-auth.cjs`: passed isolated authentication, token, session, authorization, CSRF/origin and booking regressions. No production credentials were entered or changed.
- Google ownership verification was deployed and its token was found in live homepage HTML in the preceding change.

## Limits and next steps

## Remediation and expanded checks

- Owner authorized restoring MZG branding. Production global settings now use `MZG Car Rental` and source text logos instead of the uploaded ATLANTA logos; all other settings retained. Original settings saved only in a private rollback snapshot. This identity mismatch is confirmed; whether it caused Google's flag is unknown.
- Found six source password forms without explicit POST configuration. Set explicit same-origin API actions and POST methods. The shared renderer also sets POST on password forms in older saved HTML, preventing default GET password submission if JavaScript is delayed/unavailable. No evidence was found that passwords were actually exposed this way.
- Added explicit MZG-only account/password context to customer/admin login views; neither is Google sign-in.
- Read-only expanded audit: 17 routes, seven deployed JavaScript files matching the project after line-ending normalization. No external script elements, frames, inline executable script elements, `javascript:` links or meta refresh elements in inspected responses. Three ordinary-versus-Googlebot/referrer comparisons matched exactly. This is limited evidence, not a general cloaking/malware guarantee.
- Tested sensitive files `.env`, `.git/config`, `server.cjs`, `postgres-schema.sql` and `.private/auth.sqlite`: HTTP 404. Tested private admin dashboard/settings and customer bookings APIs anonymously: HTTP 401.
- Reproduction commands: `node --use-system-ca audit-safe-browsing.cjs`, `npm test`, `npm run test:deployment`. Audit script performs only GET requests and saves `SAFE_BROWSING_AUDIT_RESULTS.json` with public metadata; no credentials or user records.

## Draft for owner review (not submitted)

Our Search Console property reports “Deceptive pages” and “Possible Phishing Detected on User Login”, with sample URLs N/A. This site operates a first-party MZG Car Rental customer account and administrator login, not Google/Gmail sign-in. We restored consistent MZG branding after finding uploaded ATLANTA logos inconsistent with the site's MZG identity. We hardened six password forms with explicit same-origin POST submission and protected older rendered forms against default GET submission. We clarified the account identity on login screens.

We inspected 17 routes, compared seven deployed JavaScript files against the project, checked ordinary and Google-referrer responses on three routes, and confirmed selected secret-file and private-API access restrictions. These inspected pages did not contain external script elements, embedded frames or meta refresh redirects. We request re-evaluation of the corrected site. If an issue remains, please identify affected URLs or specific deceptive content so we can investigate further. We do not claim to know the original detection trigger.

## Remaining review limits

These are targeted checks, not proof that the entire deployed site is uncompromised or that Google's findings are false positives. They do not clear the warning. Hosting account access history and unpublished/private content were not audited. Public identity claims still depend on the owner's business information being accurate. Uploaded ATLANTA header/footer logos have been removed from current use with owner approval; historical media records have been retained.

Google has not supplied a flagged URL or detection payload. Do not invent a root cause or claim phishing was removed. Finish the investigation, correct substantiated issues, then submit an evidence-based review through Search Console. If reporting an apparent classification error, describe the legitimate account purpose and exact checks, acknowledge that no specific sample URL was supplied, and request identification of any remaining deceptive content.

Do not bypass browser warnings, disable Safe Browsing, or switch domains to evade classification. Keep the existing property and investigation evidence.

Official instructions: https://support.google.com/webmasters/answer/9044101
