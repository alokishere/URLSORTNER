# Domain migration implementation report

## Root causes and changes

Vite exposed neither the old API_BASE_URL nor GOOGLE_CLIENT_ID names. Axios therefore selected a suspended hardcoded host, and Google sign-in rendered a technical configuration message. The backend separately allowed suspended origins, redirected its root to the old frontend, and generated short URLs from request Host. SEO and display strings also retained the old hosts. The complete pre-change inventory is in [domain-audit-before.md](domain-audit-before.md).

Production origins now come from validated environment configuration; trailing slashes normalize away. Production configuration rejects missing origins, HTTP, localhost, deprecated hosts, and mismatched backend/API origins. Development supports local defaults. Axios remains the single API client with credentials enabled. Existing routes and response fields are unchanged.

Short URL responses, QR payloads, activity text, dashboard labels, and locally stored guest-link displays use the canonical backend plus existing short ID. No database schema or data migration was made by this task. Existing QR lifecycle edits were already present and retained. Existing aliases, destination URLs, tracking, claim validation, expiration, and permissions remain intact. The existing HttpOnly host-only JWT cookie remains Secure/SameSite=None in production, supporting the Vercel frontend fallback without a shared cookie domain. Browsers blocking third-party cookies may still prevent sessions on that cross-site fallback.

Google uses GIS popup credentials -> POST /user/google -> backend ID-token verification -> existing JWT cookie and frontend dashboard navigation. No OAuth redirect callback exists; adding one or a client secret would change the architecture. The configured Google button remains Google's rendered button. Missing client configuration or script failure displays an explicitly unavailable control; selecting it reveals the friendly email/password alternative, never a fake successful login or technical banner.

## Vercel environment variables

Frontend project (root directory `frontend`, Vite, build `npm run build`, output `dist`):

| Variable | Production value | Requirement |
| --- | --- | --- |
| VITE_API_BASE_URL | https://u.alokdev.in | Required at build time |
| VITE_FRONTEND_URL | https://url.alokdev.in | Required at build time |
| VITE_GOOGLE_CLIENT_ID | Your existing Google Web application client ID | Required for Google; public identifier |

Backend project (root directory `backend`, Express entry `index.js`):

| Variable | Production value | Requirement |
| --- | --- | --- |
| NODE_ENV | production | Required for secure cookies and strict configuration |
| FRONTEND_URL | https://url.alokdev.in | Required |
| BACKEND_URL | https://u.alokdev.in | Canonical short-link origin |
| API_BASE_URL | https://u.alokdev.in | Set equal to BACKEND_URL; also accepted as its alias |
| CORS_ORIGINS | https://ekurl.vercel.app | Required to enable fallback; primary is included automatically |
| MONGO_URI | Existing database connection secret | Required; preserve existing value |
| JWT_SECRET | Existing signing secret | Required; preserve existing value to retain sessions |
| GOOGLE_CLIENT_ID | Same Web client ID as frontend | Required for Google login |
| RESEND_API_KEY | Existing Resend secret | Required for password-reset delivery |
| EMAIL_FROM | Sender at a domain verified in Resend | Required for password-reset delivery |
| PORT | 3000 | Optional local listener |

No SMTP variables, Google client secret, cookie domain variable, or separate session secret are consumed. Do not copy backend secrets into any VITE_ variable. The existing unused backend GOOGLE_CLIENT_SECRET was not overwritten. Email delivery settings remain unchanged; verify that EMAIL_FROM does not depend on a suspended sender domain before rollout. Google/email settings are feature-specific rather than fatal startup requirements so password login remains available if those services are not configured.

For development, use NODE_ENV=development, frontend VITE_API_BASE_URL=http://localhost:3000 and VITE_FRONTEND_URL=http://localhost:5173, backend FRONTEND_URL=http://localhost:5173, BACKEND_URL/API_BASE_URL=http://localhost:3000. Use a development MongoDB and JWT secret. PORT is optional. Local reset links now work with HTTP. Production builds cannot silently fall back to localhost.

Ignored local .env files were updated only for domain settings and the public Vite client-ID key; secret values were preserved. These local edits do not update Vercel.

## Google Cloud steps

1. Open Google Cloud Console -> Google Auth Platform -> Clients (or APIs & Services -> Credentials) -> existing OAuth 2.0 Web application client.
2. Add Authorized JavaScript origins `https://url.alokdev.in` and `https://ekurl.vercel.app`. Retain `http://localhost:5173` and any actually used local Vite origin for development.
3. This JavaScript popup implementation needs no Authorized redirect URI. Do not add an invented backend callback. `/user/google` is the application's JSON credential endpoint, not a Google redirect URI.
4. Review Branding/consent-screen homepage, privacy/terms URLs, authorized domain `alokdev.in`, and test users if the app remains in testing mode. Remove obsolete application settings after confirming they are not shared with another application.
5. Set matching GOOGLE_CLIENT_ID and VITE_GOOGLE_CLIENT_ID in their respective Vercel projects, then rebuild/redeploy the frontend and backend.

Reference: [Google GIS JavaScript API](https://developers.google.com/identity/gsi/web/reference/js-reference) documents popup JavaScript callback delivery separately from redirect mode.

## Deployment steps

1. In each Vercel project, Settings -> General -> Root Directory: confirm frontend/backend respectively. Preserve the backend's existing deployment integration. Vercel supports Express index.js entries; see [Express on Vercel](https://vercel.com/docs/frameworks/backend/express).
2. Settings -> Domains: assign `url.alokdev.in` to the frontend and `u.alokdev.in` to the backend. Keep existing Vercel fallback domains. Apply the DNS records shown by Vercel and wait for valid TLS.
3. Settings -> Environment Variables: set the values above for Production, and explicitly set matching values for any Preview deployment intended for testing. Do not overwrite database, JWT, or mail secrets. Never use wildcard CORS; add only an approved preview origin when needed.
4. Deploy backend changes first, then frontend. Redeploy after changing VITE_ variables, which are embedded at build time. Existing frontend rewrite rules remain intact. The sitemap, robots.txt, canonical, Open Graph, Twitter and JSON-LD URLs are generated from VITE_FRONTEND_URL; backend responses receive noindex headers.
5. Confirm OPTIONS /user/login from each frontend origin returns 204, the exact allow-origin, and allow-credentials:true. Confirm root backend redirect points to the new frontend.
6. In a browser on both frontend domains, test registration/password login, refresh/session, logout, Google popup/new and linked accounts, password reset delivery, guest create/claim, editing/deleting, redirect/click analytics, QR scan, and admin permissions. Keep the primary frontend as canonical on the fallback deployment.

No deployment or Google/Vercel dashboard mutation was performed in this task.

## Tests and actual results (2026-11-01)

- `npm test --prefix backend`: 24 passed, 0 failed, 1 skipped (25 total). Existing controller tests cover Google account behavior, password reset, aliases, QR lifecycle, profile restrictions. New tests cover strict production origin config, both allowed CORS preflights, rejection of localhost writes, root redirect/noindex, and canonical short links independent of Host.
- MongoDB integration test skipped because TEST_MONGO_URI was not configured. No production database was used for testing.
- `npm run build --prefix frontend`: passed, including prerender and metadata generation.
- `npm run lint --prefix frontend`: passed.
- Four standalone frontend config assertions passed: required production config, localhost rejection, slash normalization, development defaults.
- Final application-source and built-output scan: no deprecated runtime host references or old technical Google banner. A deprecated URL intentionally remains in a rejection test; historical references remain in the audit report.
- `git diff --check`: passed.
- Read-only live checks: frontend root 200; backend /user/ 200; unauthenticated /user/session 401. Live OPTIONS /user/login returns 204 **without** Access-Control-Allow-Origin for the new frontend: deployment still needs the CORS fix. These live probes verify the existing deployment, not the local changes.

Google browser consent, real token exchange, cookie persistence/logout across both deployments, email delivery, MongoDB-backed creation/claim/redirect tracking/analytics, QR scans and admin dashboard are not verified end to end. Existing controller tests use test doubles and do not establish these live behaviors. There is no OTP endpoint in this application; email verification uses the existing Google identity endpoint.

Guest localStorage is origin-specific. Existing records/tokens accessible on the current origin are retained and displayed with the canonical host. Data on the suspended origin cannot be read from the new origin; recovery would require access to that origin or a user-provided export. Existing printed old-domain QR codes cannot be repaired without control of the old domain; newly generated QR codes use the new host.

## Files changed by this task

- backend/config/env.js (new), backend/index.js, backend/controllers/url.controller.js, backend/utils/passwordResetEmail.js, backend/.env.example.
- backend/test/domain-config.test.js (new), backend/test/url.controller.test.js, backend/test/password-reset.controller.test.js.
- frontend/src/config/env.js (new), frontend/src/axios.jsx, frontend/src/auth/GoogleSignInButton.jsx.
- frontend/src/lib/dashboardData.js, frontend/src/lib/guestLinks.js, frontend/src/pages/Analytics.jsx, frontend/src/pages/dashboard/QRCodePage.jsx, frontend/src/components/dashboard/DashboardPrimitives.jsx, frontend/src/sections/landing/FeaturesSection.jsx.
- frontend/vite.config.js, frontend/index.html, frontend/.env.example, frontend/README.md; frontend/public/robots.txt removed in favor of generated build output.
- Ignored frontend/.env and backend/.env; docs/domain-audit-before.md and this report.

Other existing modified files shown by git status predate this work. No commits, data deletions, secret rotations, or schema changes were performed by this task.
