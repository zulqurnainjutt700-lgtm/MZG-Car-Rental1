# MZG Car Rental — Product Requirements Document (PRD) v2.0

**Prepared:** 16 October 2026  
**Status:** **COMPLETE SPECIFICATION — Final owner sign-off pending**  
**Source of truth:** Conversational owner approvals through 16 October 2026, with v1.1 and v1.0 as baseline. Later approved decisions supersede earlier proposals.  
**Scope:** Product requirements only; not a TRD, database design, implementation proof, or production readiness claim.  
**Brand:** MZG Car Rental exclusively.  
**Audience:** Owner, designers, developers/Codex, QA, operations.

## 1. Executive decision summary (read this first)

**Approved:** Login-gated checkout; admin-approved bookings; future reservation requests allowed even while the car is rented, subject to time-conflict and physical-return risk checks; actual check-in required to finish an active rental; online and manual payments; flexible admin-chosen payment timing; payment-gated confirmation for advance/full-pay bookings; fixed 24-hour temporary holds with *manual* expiration resolution; category-level refundable deposits; configurable cancellation, late-return, car/category minimum duration; optional unlimited mileage; no fixed maximum advance-booking horizon; same-day requests allowed; 24-hour rental-day calculation; online payment retry safeguards; configurable discount stacking; independent optional delivery and custom-return switches.

**Decision handling:** All product-level choices are resolved below with conservative operating defaults. Exact prices, merchant credentials, legally applicable tax rates and supplier contracts remain **launch configuration or external verification**, not missing product decisions. See §8.

**Approval status:** Individual feature decisions approved conversationally. Defaults selected by the assistant for previously open decisions are explicitly identified; they require final owner acceptance of the full document.

## 2. Product purpose and target users

Provide a dependable, professional, responsive Lahore-first vehicle rental platform with a public fleet, verified customer accounts, governed booking/payment workflows, physical-car inventory control, rich owner/staff dashboard, and owner-managed content. Multi-branch/corporate/driver services are approved capabilities but can be feature-flagged until operationally offered.

Users: guest, registered customer, verified renter, driver/staff, branch staff, finance staff, Super Admin. Staff permissions follow least privilege, with audit history and branch boundaries.

## 3. Consolidated approved feature inventory



### 3.1. Customer-facing rental journey
- Visitors can browse fleet, car specifications, pricing, images, offers, policies and compare cars without signing in. Booking action requires account signup/sign-in. Show an explicit sign-in/create-account prompt, preserve selected car/dates, redirect back, and enforce authentication on the backend.
- Registered customer dashboard: profile details/photo, password and email verification, My Bookings, booking status, notification inbox, wishlist/favorites, compare (2–3 cars), rewards/referrals, document verification and customer support.
- Customer sends booking request; **Pending is not confirmed inventory**. Admin confirms/rejects; email and in-app updates. A request must not create overlapping confirmed reservations.
- Booking status: Pending, Confirmed, Active/handed over, Overdue, Completed only after physical return and admin check-in; Cancelled and Rejected. Admin can record external/phone/WhatsApp/manual bookings; same availability checks apply.
- Customer may request booking modification (car/pickup date/time) before handover or extension after handover; admin approves/rejects; availability, pricing and other confirmed bookings checked again. Extensions must not take dates already confirmed for another customer.
- Car delivery to home/office/hotel and selection of custom return location are **two independent admin-controlled optional fields**. With either OFF, corresponding customer choice is hidden and no associated fee charged. Standard pickup/return shown as configured.
- Customer can save unfinished bookings as private drafts and resume later; drafts do **not** hold inventory. Reminder requires consent; re-check availability on resume.
- Customer can request cancellation and track approval/refund under configured policy; accepted policy version captured at submission.

### 3.2. Physical vehicle inventory and handover
- Every actual physical car gets a distinct identity, even when multiple cars share the same model. Fleet pages can show real cars and their actual images; false stock/availability must not be shown.
- Admin adds/edits/hides vehicles, rates (daily/weekly/monthly), category, year, seats, transmission, registration, gallery, operational state, location/branch and document status. Hiding from website never removes booking/history records.
- **Final owner decision:** a currently rented car may receive a *future-dated advance booking request* (never an overlapping confirmed booking); requests carry return-risk warnings and require admin approval. Current rental remains Active/Overdue until actual check-in; an uncertain return cannot be treated as assured future availability. Scheduled end time never releases it. Calendar still tracks previously confirmed future obligations and prevents conflicts. If the product also takes advance bookings before handover, confirmed future dates must still be protected; no replacement car promises without operator approval.
- Maintenance, administrative blocks, expired legally required vehicle documents, and accident condition can restrict availability; admin releases only after clearance. Admin calendar shows booking ranges, conflict reasons, rented/overdue/maintenance states, and manually blocked ranges.
- Pickup and return: admin records actual dates/times, odometer, fuel, photos, checklist (tyres, lights, AC, brakes/body), condition and handover/return confirmation. Late return, excess mileage, fuel shortages, damage and traffic challans can be recorded with evidence and reviewed charges.
- Accident reporting and roadside assistance: customers can report breakdown/tyre/battery/accident and location **only if voluntarily shared**, admin responds and may arrange repair/recovery/replacement. Substitute vehicle assigned after admin approval; preserve booking/inspection history and any price adjustment.
- Admin records registration, token tax, fitness/legally applicable documents, insurance, renewals and expiry alerts; enforce blocks for legally mandatory expired papers. Optional compatible GPS-device integration may expose last location/trip history/geofence alerts to authorized roles under an explicit privacy policy and retention rule; GPS hardware/service is a dependency, not a website-native capability.

### 3.3. Prices, payment, contracts and rewards
- Rate plans include daily/weekly/monthly and longer 1/3/6-month rental packages; admin manages products, duration/rates and renewals with manual approval. Estimates, taxes and extras itemized before booking.
- **Discounts:** individual and bulk-car admin operations; percentage or fixed PKR reduction; start/end dates, enable/disable, eligibility, original/discounted values and audit record. Promo codes, scheduled campaigns, usage limits and discount stacking rules; customer-facing price and invoice use one authoritative calculation.
- Refundable security deposits set by **category** (Economy/Sedan/SUV/Premium/etc.; no per-car override approved); admin can mark received, withheld/adjusted, partially/fully refunded with reasons/receipts. Deposit must not be silently counted as income.
- Admin records advance, outstanding, manual/offline payments, refunds, invoice/receipts and additional rental charges; customer's view shows history/balance. Confirming a booking and marking it paid are distinct steps. Final price changes need authorization and an immutable history.
- Admin enables applicable tax and service/delivery fees, with lawful rates/fee descriptions; price breakdown in PKR. Invoices and receipts downloadable as PDF; amended invoices retain revision history. **Online + manual payments approved:** JazzCash, Easypaisa, bank transfer, and debit/credit cards, each independently enabled by admin; automatic online charging depends on approved merchant gateway integrations.
- Rental agreement PDF generated per booking with policy/version, car, parties, times, price/deposit, signatures and audit trail; digitally signing must capture explicit consent and signer verification; electronic signing and enforceability subject to legal review.
- Loyalty points, VIP tiers, reward expiration, referral codes, fraud controls, vouchers and rewards dashboard are approved. Referral points become claimable only after qualifying first completed rental. Prevent self-referrals and define stacking/expiry/reversal rules.
- Corporate rental inquiry for multi-car rentals, custom quotation, company records, monthly packages and optional website toggle; quote validity and approval must be explicit.
- Optional driver service (Self-Drive/With Driver), driver assignment, availability, profiles, attendance, salary/payment ledger and feedback. If no driver service is offered, hide controls via admin setting.

### 3.4. Customer trust and communications
- Signup verification, password reset, booking request/status/cancellation/extension email; customer inbox and admin alert center. Scheduled pickup/return reminders, late return/payment/document/insurance/maintenance alerts should log failures/retries and not claim delivery without verification.
- Public reviews from customers with completed bookings only; owner moderation prior to publishing, review authenticity and consent. Keep **private satisfaction surveys** separate from public testimonials.
- Complaints/support tickets with category, conversation and status; emergency roadside help escalation; customer can follow statuses and history.
- WhatsApp floating CTA, car-specific prepared inquiry message, contact form/email/phone and admin-editable contact details. WhatsApp opening does not itself place a booking.
- Admin-targeted marketing announcements and campaigns via customer notifications and **opt-in** email only; audience segmentation, scheduling, unsubscribe controls.
- Account deletion/privacy requests with identity confirmation and safeguards for active rentals/unpaid bills; deletion/anonymization subject to lawful financial/contract retention, data export and preferences.
- Eligibility includes configurable driver minimum age, licence validity and experience; authenticated customer may request booking, but verified identity and licence must be confirmed before handover. Protect uploaded CNIC/front/back and licence with restricted storage and access logs.

### 3.5. Admin, CMS, quality and business intelligence
- Super Admin can create/revoke staff access and set least-privilege roles, including branch scope. Protected admin sign-in, MFA, records of changes and non-editable staff audit logs with old/new price and discount details.
- Owner-managed CMS: page headings, text, CTA, supported sections, menus, public notices, homepage offers, About/Contact, SEO, legal policy pages, Blog/News; media uploaded directly, optimized, crop/contain controls; draft/preview/publish/rollback. Changes persist after deployment. Section creation/reorder limited to validated supported blocks unless a future page-builder is explicitly scoped.
- Multi-branch support: physical car assignment and reporting per branch; branch selection hidden when only one active branch. Prevent branch staff access to unauthorized branches.
- Analytics: daily/monthly revenue, counts by status, car utilization, most popular models, maintenance/insurance expenses, car-level profit estimates, per-branch reports, export to CSV/Excel/PDF where implemented. Distinguish received money from deposits, refunds, unpaid balances and projections.
- Fleet operating costs: service/repair, fuel, insurance, challan/fines, receipts; finance-only views; driver payroll and corporate ledger. Projections are not the same as accounting net profit.
- SEO: editable titles/descriptions/canonicals/URLs, sitemap, valid indexing, Search Console and analytics with privacy-compliant measurement. English default, optional Urdu language toggle; all critical booking and legal UI translated; PKR pricing only unless owner approves more currencies.
- Reliable responsive UI, accessible forms, performant media, mobile fleet/booking and admin, correct focus styling and robust error/monitoring. Owner health page, secure encrypted offsite database backups, restore testing and operational alerts.


### 3.6. Approved operational details not to omit
- **Customer referral/rewards portal:** loyalty balance, earned/spent/expired points, vouchers, referral results, redemption history; admin can correct balances with immutable audit reasons.
- **Driver attendance/pay:** assignment calendars, attendance, duty hours, payroll ledger and restricted access.
- **Vehicle and customer documents:** document expiry, upload, renewal history, reminders; eligibility is prerequisite to handover, not necessarily to initial booking request.
- **Policies and legal pages:** Privacy, Terms, Cancellation, Rental Terms; admin edit, version/publish history; customer consent to the exact version stored with booking.
- **Booking drafts, reviews, satisfaction surveys, corporate accounts, blog, multilingual English/Urdu, customer complaint/ticket system**, and emergency assistance remain included as approved.
- **Manual booking:** phone/WhatsApp/operator bookings must use same physical vehicle/date checks as public requests.
- **Fleet profitability:** rental revenue, service/insurance/driver-related costs and expense receipts; display estimated contribution separately from final accounting profit.
- **Physical inspection:** baseline and return photos, odometer, fuel, damage and signed handover evidence; fines may be disputed and evidenced.

## 4. Approved booking and payment state machine

### 4.1 Booking lifecycle
`Draft → Pending Request → Admin Reviewed → [Payment Hold → Payment Verified → Confirmed] OR [Pay-at-Pickup → Confirmed] → Handed Over/Active → [Extension Requested / Overdue] → Physically Returned & Admin Checked-in → Completed`

Alternate outcomes: Rejected, Customer Cancellation Requested, Cancelled; cancellation/refund sub-workflows preserved. **A draft or ordinary pending request does not reserve inventory.**

- Booking requires logged-in user on UI **and server**. After authentication, previously chosen car/dates are restored safely; server revalidates all values.
- Admin must approve requested car, pickup/return time, optional driver/delivery, rental terms and pricing.
- For **advance/full payment required**: admin approval creates a **24-hour temporary reservation hold** on that exact car and interval; verified required payment permits confirmation. A failed/unknown transaction cannot be treated as paid.
- For **Pay at Pickup**: admin can directly confirm; payment remains due. Booking status and payment status are independent.
- If no required payment by 24 hours: status becomes Hold Overdue; alert admin. **Do not automatically cancel/release inventory.** Only authorized admin can extend hold, cancel and release, or settle according to a logged action.
- A confirmed future booking reserves *that physical vehicle* in its confirmed interval. Extensions must not overlap later confirmed dates or maintenance blocks.
- A rented car may receive a **future-dated advance request** while currently Active/Overdue. Display future status as *request subject to return confirmation*, not guaranteed stock. Admin reviews future conflict plus late/uncertain return risk before confirmation; no conflicting promise to multiple customers.
- A vehicle continues Active/Overdue until actual handover back and admin check-in, irrespective of scheduled return timestamp. Admin check-in alone never erases previously confirmed future bookings.
- Same-day requests permitted, including for cars satisfying present safety/inventory conditions; no arbitrary maximum future date.
- For time calculation: rental day = 24 hours (Asia/Karachi); extra hours and grace follow admin-configured late rules. Booking minimum days adjustable by car/category.

### 4.2 Payment/refund lifecycle
- Approved methods: online JazzCash, Easypaisa, card where actual gateway available; manual cash/bank transfer/mobile-wallet proof subject to admin verification. Admin can enable each separately; disabled/unintegrated methods must not be presented as operational.
- Admin can set **full now, advance now, or pay at pickup per booking**; customer sees the exact due amount/deadline and instructions before payment.
- Retry after failed gateway payment requires prior-transaction reconciliation; deduplicate by gateway transaction ID/idempotency key, never double-charge; unresolved charged-but-unconfirmed transaction is Payment Under Review.
- Security deposit set by category, tracked as liability, separate from rental income; return inspection and outstanding costs reviewed first, then admin approves full/partial/zero refundable amount with justification. Refund may occur online or manually depending on provider support.
- Cancellation deadlines, fee percentages and exceptional waivers are managed by admin with recorded policy version and approval reason.
- Late fees/grace hourly/full-day by car or category; mileage ordinarily limited, with optional admin-enabled unlimited mileage on selected car/package; excess-KM charges configured for others.
- Car-specific/bulk discounts, promo codes, loyalty/referral discounts may stack only under admin-defined rules and maximum cap, with deterministic application and no unintended negative totals.
- Charge calculation and invoice should separately itemize rent, eligible discount, tax, driver/delivery fees, damage/fines/extra KM, deposit, refunds and remaining balance.
- Tax settings are configuration, **not** a declaration of any specific statutory tax obligation; validate with appropriate finance/legal advice.

## 5. Public, customer and admin UX requirements

**Guest:** clean branded public website, responsive navigation, pricing/fleet/car details, availability cues, policies, blogs, reviews, offers; sign-in gate at Book Now. All content true to physical inventory.

**Customer:** account verification, saved details, bookings/status/calendar, optional return/delivery, payments and receipt downloads, required documents, digital agreement, car condition report, modifications/extensions, ticketing/roadside assistance, rewards/referrals, wishlist/compare, notifications, cancellation, privacy/settings. Do not expose other customers' data.

**Admin:** KPI dashboard, booking approvals/manual booking/holds, calendar, car status and inspection, fleet/media CMS, payment reconciliation/refunds, campaigns, SEO/blog/legal pages, branches, driver duty/payroll, corporate quotes, customer verification, complaints, audit, incident/fine workflows, analytics/backups/health alerts.

**Content administration:** direct uploads, server-side optimization, sensible fit/crop controls, preview/draft/publish/rollback and original policy/version trails. Super Admin controls staff by role and branch. User-facing orange/white modern brand; correct mobile spacing and visible accessible controls.

## 6. Nonfunctional requirements and success checks

- Authorization enforced server-side for customer/admin, finance and location/document access; secure sessions, admin MFA, password resets, upload validation, encryption of secrets and sensitive data, rate limits and audit logs.
- Protect CNIC/licence files and GPS locations. Define consent, retention, deletion/anonymization subject to lawful records.
- Correct concurrent inventory/hold transactions; never confirm overlapping physical vehicle dates; scheduled return ≠ physical return. Last-write-wins must not corrupt bookings or prices.
- Reliable notifications: queue/retry/log email/in-app; paid booking, changed status, pickup/return reminders and staff incidents visible.
- Reliable mobile-first page load, optimized assets, accessibility, English default + optional Urdu, PKR labels, secure HTTPS, backup/restore tests, technical error alerts and SEO.
- No claims of integrations being tested or live without QA evidence. Current site/repo implementation requires separate audit during TRD/testing stage.

## 7. Final QA acceptance scenarios

1. Guest can browse but cannot POST booking; login restores selection and revalidates.
2. Two staff simultaneously confirm same physical vehicle and overlapping times: exactly one succeeds; canceled/pending/draft does not permanently block.
3. Active Corolla with scheduled return 20 Oct may accept request for 25 Oct; admin sees return-risk notice; request for date overlapping confirmed booking is rejected or cannot confirm.
4. Late rental does **not** auto-complete/appear physically returned. Existing future commitments trigger operational alert, not duplicate allocation.
5. Customer requests extension that collides with future confirmed booking: admin cannot silently approve; clear alternatives.
6. Advance/full-pay booking gets 24-hour hold after admin review; verified payment confirms; expired unpaid hold triggers alert but not auto-release.
7. Pay-at-pickup approved booking confirms without immediate online payment, with outstanding amount shown.
8. Failed payment retry does not duplicate charge; deducted-but-unknown payment becomes under review, not blindly charged again.
9. Discounts stack only within configured rules/cap; invoice, quote and receipt reconcile exactly.
10. Category deposit tracked separately and refund requires inspection+charge review+admin approval.
11. Delivery and custom-return ON/OFF switches independently hide corresponding public inputs and fees.
12. Customer licence/CNIC protected; no handover without verification; audit staff reads and changes.
13. Expired legally required vehicle document and maintenance block stop confirmation; staff cannot override without documented clearance.
14. Staff can't view forbidden branch/finance records; no silent edits to published policy/history.
15. Mobile workflow, email jobs, source-of-truth booking states, manual booking, backups and restore all exercised before production sign-off.

## 8. Previously pending decisions — resolved operating policy

The following policies complete the product specification. **Owner-approved** choices remain authoritative; entries marked **selected default** are proposed final decisions for owner to ratify with the v2.0 sign-off. Commercial configuration values must be entered before accepting real transactions.

| ID | Final rule | Decision basis | Implementation/launch gate |
|---|---|---|---|
| D-01 | **Extension payments are flexible:** for each approved extension admin selects full upfront, advance upfront, or pay at return. Return date can change only when conflict-safe; if payment upfront is required, use a tracked due/verification state before activation. | **Selected default**, consistent with owner-approved flexible booking payments | Admin selection recorded with price and customer consent. |
| D-02 | **Numeric values configurable:** category deposit, car/category rates, late fee/grace, mileage fees, cancellation/refund, staff charges and loyalty/rewards use admin-managed settings. No placeholder amount is billable. | **Selected default** implementing owner-approved configurability | Owner enters real PKR values and verifies displayed terms before go-live. |
| D-03 | **Payments:** bank transfer/cash can be manual, JazzCash/Easypaisa/cards only through an enabled, authenticated and end-to-end-tested gateway/merchant account. Unintegrated methods remain disabled. Customer retries can be initiated only after checking existing payment intent to avoid duplicate charging. | Owner-approved methods + **selected safe default** for provider | Processor/merchant contract, credentials and webhook verification are supplier prerequisites, not PRD feature gaps. |
| D-04 | **Overdue car with future commitment:** notify admins immediately, block handover of same physical car, contact affected future customer, offer approved substitute car or agreed change/cancellation/refund; preserve original reservation, consent and financial audit. Never silently double-book, pretend returned or promise delivery. | **Selected default** resolving future-risk exception | Admin owns timely response; operational SLA set in branch settings (default urgent priority, no fabricated guaranteed ETA). |
| D-05 | **Rollout priority:** Release 1 = usable public fleet, auth, verified bookings, admin operations, date/physical car checks, payment bookkeeping and online processing only when provider verified, inspection/return, notifications, media/CMS, legal and security. Release 2 = reviews, offers/rewards, referrals, corporate, driver payroll, multi-branch UI, blog, reporting enhancements. Release 3 = hardware-dependent GPS/advanced automation. | **Selected default phased rollout**; all remain in approved full scope | A phase is not claimed live until its acceptance tests pass. Future phases are not silently dropped. |
| D-06 | **Hold conflict priority:** an existing Confirmed or Active booking takes precedence; then the earliest valid, non-cancelled admin-approved Payment Hold for the specific vehicle/time. New conflicting requests may remain Pending/waitlisted but are never confirmed/held against reserved stock. Hold extension preserves priority only when an admin explicitly extends it and no earlier commitment conflicts. | **Selected default** | Transactional date-overlap protection across public and manual bookings. |
| D-07 | **Legally sensitive documents:** rental terms, e-signatures, cancellation/deposit disclosures, privacy/CNIC/GPS retention and tax treatments need local professional verification before production use. No arbitrary tax rate or legal retention period is invented. | **Selected safe external-compliance gate** | Finance/legal owner signs off final text and amounts before launch. |
| D-08 | **GPS** is optional and **OFF by default**. Only activate after compatible tracker/vendor, documented customer notice/consent where needed, role limits and defined retention controls. | **Selected default** | Hardware and vendor integration required. |
| D-09 | **Rewards/referrals:** rewards earn only on eligible completed paid rentals, self-referral prohibited, refunded/cancelled bookings reverse unredeemed rewards, admin specifies rate/expiry/redemption caps and logs adjustments. OFF until real values and terms are entered. | **Selected default** | Configure and disclose rates, expiry and eligibility before opening program. |
| D-10 | **Global policy changes:** preserve agreed terms per booking; Super Admin can publish new policy version prospectively, with immutable past terms and approvals. | Owner-approved policy versioning + **selected default** | Acceptance and policy history visible for disputes. |
| D-11 | **24-hour payment holds:** exactly 24 hours after admin approval when advance/full payment is required; expiry warns but does not auto-cancel or release. Hold blocks conflicting confirmed/held allocation until admin resolves it. | **Owner-approved** | Explicit Cancel / Extend / Payment Confirm action with audit. |
| D-12 | **Deposit rule:** refundable amount by **category only**; do not quietly introduce per-car deposit override. | **Owner-approved** | Category defaults must be entered as real values. |
| D-13 | **Future advance booking:** may request dates even while vehicle currently rented. Availability claims must distinguish 'requestable future dates' from physically returned stock, and must apply return-risk controls and prior commitments. | **Owner-approved** | Warning/conditional confirmation when return is uncertain; staff must resolve operational risk. |
| D-14 | **Emergency assistance:** customer can submit request and optionally share location; no guarantee of immediate GPS-derived position or response ETA. | **Selected default** | Branch emergency phone/contact staffed and communicated. |

### 8.1 Launch checklist: configuration and third-party verification, not unanswered PRD questions

- Enter real category deposits; actual fleet inventory/registration identifiers; daily/weekly/monthly packages, 24-hour cycles, optional unlimited mileage, fees/grace, cancellation windows and applicable taxes.
- Connect and test chosen payment provider(s); configure manual settlement and unique transaction reconciliation; no real payments until confirmed.
- Verify legal terms, CNIC/licence handling, cancellation/refund, deposits, insurance and marketing/GPS notices against actual operating policies.
- Enter branch/driver support contacts, public company identity, transactional email credentials and notice templates without storing secrets in the PRD.
- Prove QA scenarios and permissions, backup restoration and mobile checkout. Audit current repository separately during TRD/implementation phase.
- Confirm active launch release scope and any deferred UI feature flags with owner; product scope here remains approved across phases.

## 9. Sign-off and change control

**Document status:** Complete specification, pending final owner sign-off. All previously open product decisions have explicit defaults; actual monetary values, credentials, legal validation and vendor setup are operational launch prerequisites.

**Approval declaration (when owner is ready):** “I approve MZG Car Rental PRD v2.0 including the Section 8 selected defaults, with launch configuration and external compliance gates to be completed before production.”

Until that separate approval: PRD-only stage. Next phase TRD → UI/UX specification → backend schema → implementation/tests is **on hold**.

