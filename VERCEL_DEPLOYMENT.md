# MZG Car Rental: GitHub and Vercel deployment

## Current production: Vercel + Supabase

Production routes now use `api/backend.js` and private Supabase PostgreSQL storage. See [SUPABASE_DEPLOYMENT.md](SUPABASE_DEPLOYMENT.md) for current configuration, migration and backup instructions. SQLite is retained for local/offline usage. The persistent-server/proxy instructions below describe the alternative architecture and are not required for the current direct serverless deployment.


## What deploys

The existing design, images and public pages deploy on Vercel. `npm run build` copies only public site files into `dist`; secrets, databases, source code and account HTML are excluded. Vercel routes API, admin, private account, CMS/public-page, media and sitemap requests through `api/gateway.js` to the existing persistent Node backend. This keeps the current authentication system and its SQLite database intact.

**Vercel alone does not provide this application's persistent SQLite storage.** Do not move the database into `/tmp`: accounts and bookings would be lost across instances/redeployments. Until the backend is configured, the original public snapshot is usable but accounts/bookings explicitly return a 503 setup message. No requests are silently saved or falsely confirmed. WhatsApp rental enquiries remain available.

## 1. Import the GitHub repository into Vercel

- Framework preset: **Other**.
- Node.js: **24.x**.
- Build command: `npm run build`.
- Output directory: `dist`.
- Root directory: the repository root (where `package.json` and `vercel.json` live).
- Install command: default `npm install` / lockfile installation.

The supplied `vercel.json` sets these build options. Import the source files, not the ZIP file itself. Existing `.html` links remain unchanged.

After Vercel assigns a URL, set `PUBLIC_ORIGIN=https://YOUR-PROJECT.vercel.app` and redeploy. The build generates `sitemap.xml` and `robots.txt` using this origin; automatic production hostname detection is also supported. Add a custom domain later by updating this value and the backend's exact matching origin.

## 2. Run the account backend on persistent Node hosting

Use a Node 24 service with a persistent disk (a VPS or a hosting plan that explicitly supports persistent disks). Deploy the same source repository there. Do not use an ephemeral filesystem or several independent SQLite replicas.

- Install: `npm ci`.
- Start: `npm start`.
- Health check: `/healthz`.
- `BIND_HOST=0.0.0.0`.
- `PORT`: use the hosting platform's port.
- `AUTH_DIRECTORY`: an absolute path on the persistent mounted disk, e.g. `/var/data/mzg`.
- `PUBLIC_ORIGIN`: the exact HTTPS Vercel production origin, without a trailing slash.
- `SECURE_AUTH_COOKIES=true`.
- `BACKEND_PROXY_SECRET`: a random secret of at least 32 bytes, kept only in hosting environment settings.

To generate a secret locally: `node -e "console.log(require('node:crypto').randomBytes(32).toString('hex'))"`. Never commit it or paste it into chat. Back up the database securely using a consistent SQLite backup; never publish `.private`. Existing local customers are not automatically uploaded: transfer their database privately to the mounted disk only if required.

Use one backend service instance. Keep TLS enabled. Private routes reject direct access when the shared proxy secret is set. The gateway preserves the original browser Origin for CSRF checks; do not use wildcards or disable origin validation. Only the configured production site can submit account mutations. Preview deployments should use a separate test backend/database; they intentionally cannot mutate the production backend through a different Origin.

## 3. Connect Vercel to the backend

Set these environment variables in Vercel's **Production** environment and redeploy:

| Variable | Value |
| --- | --- |
| `PUBLIC_ORIGIN` | `https://YOUR-PROJECT.vercel.app` |
| `BACKEND_ORIGIN` | The backend's HTTPS origin, without a path |
| `BACKEND_PROXY_SECRET` | The same secret configured on the backend |

Do not set SQLite credentials/directories on Vercel. Configure `ADMIN_ENCRYPTION_KEY` on the backend, as described in `ADMIN_SETUP.md`. Connected public pages are rendered from the published database CMS; the unconnected fallback does not reflect CMS edits. Host-only session cookies are forwarded to the browser on the Vercel domain; the backend requires Secure, HttpOnly, SameSite=Strict cookies.

## 4. Email and owner access

Configure `SMTP_HOST`, `SMTP_PORT`, `SMTP_SECURE`, `SMTP_USER`, `SMTP_PASS` and `SMTP_FROM` on the **backend** as described in `ACCOUNT_SETUP.md`. Use a verified sender and working SMTP credentials; email verification/reset cannot work until this is done. `npm run check:smtp` verifies the SMTP connection, not inbox delivery.

Create your owner account through the website, verify its email, then use the trusted backend terminal to promote it with `node admin-owner.cjs setup YOUR_EMAIL --confirm-owner-operation`. That CLI uses the same `AUTH_DIRECTORY` environment variable as the server. Never place an owner password in source code. Sign in at `/admin`, then enroll authenticator MFA. See `ADMIN_SETUP.md` for encryption-key configuration, permissions and safe recovery.

## 5. Deployment verification

Run `npm test` and `npm run test:deployment` locally. After deployment, manually verify homepage/fleet images, signup, delivered verification email, sign-in persistence, a Pending rental request, owner review and sign-out. Local checks do not prove external email delivery or a successful live deployment.

Official references: [Vercel configuration](https://vercel.com/docs/project-configuration/vercel-json), [Node 24 support](https://vercel.com/changelog/node-js-24-lts-is-now-generally-available-for-builds-and-functions), [Vercel rewrites](https://vercel.com/docs/routing/rewrites).
