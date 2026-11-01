# Pre-change domain audit

Captured before implementation. Secret values are excluded. Existing uncommitted QR/auth work is preserved.

## Outdated references

- `frontend/.env.example:1`: `BASE_URL=https://www.ekurl.vercel.app`
- `frontend/README.md:14`: `In Google Cloud Console, add each frontend origin (for example `https://app.ekurl.in` and local Vite origins) under OAuth client **Authorized JavaScript origins**. This flow does not use a server OAuth callback or client secret, so no redirect URI is required for the sign-in button.`
- `frontend/index.html:11`: `<link rel="canonical" href="https://app.ekurl.in/" />`
- `frontend/index.html:22`: `<meta property="og:url" content="https://app.ekurl.in/" />`
- `frontend/index.html:23`: `<meta property="og:image" content="https://app.ekurl.in/primarylogo.avif" />`
- `frontend/index.html:34`: `<meta name="twitter:image" content="https://app.ekurl.in/primarylogo.avif" />`
- `frontend/index.html:51`: `"url": "https://app.ekurl.in/"`
- `frontend/public/robots.txt:4`: `Sitemap: https://app.ekurl.in/sitemap.xml`
- `frontend/src/axios.jsx:6`: `const productionApiBaseUrl = import.meta.env.API_BASE_URL || 'https://www.ekurl.in';`
- `frontend/src/axios.jsx:20`: `: 'www.ekurl.in';`
- `frontend/src/components/dashboard/DashboardPrimitives.jsx:337`: `ekurl.in/{url.shortID}`
- `frontend/src/pages/Analytics.jsx:148`: `<PageIntro eyebrow="Link analytics" title={`ekurl.in/${sortid}`} description="Recorded visits for this short link." actions={<Button variant="secondary" onClick={() => navigate(-1)}><ArrowLeft className="h-4 w-4" aria-hidden="true" />Back</Button>} />`
- `frontend/src/pages/Analytics.jsx:179`: `title={`ekurl.in/${sortid}`}`
- `frontend/src/pages/dashboard/QRCodePage.jsx:150`: `{link.title?.trim() || link.shortUrl || `ekurl.in/${link.shortID}`}`
- `frontend/src/sections/landing/FeaturesSection.jsx:15`: `<div className="flex h-11 items-center justify-between border-b border-(--border) px-3 sm:px-4"><span className="truncate rounded-full border border-(--border) bg-(--background) px-3 py-1 text-[10px] text-(--secondary-text)">app.ekurl.in/dashboard</span><span className="text-[10px] text-(--secondary-text)">Last 30 days</span></div>`
- `frontend/vite.config.js:6`: `const publicUrls = ["https://app.ekurl.in/"];`
- `backend/.env.example:5`: `EMAIL_FROM=Ek URL <no-reply@mail.ekurl.in>`
- `backend/.env.example:6`: `FRONTEND_URL=https://app.ekurl.in`
- `backend/.env.example:7`: `CORS_ORIGINS=https://app.ekurl.in`
- `backend/controllers/url.controller.js:457`: `detail: url?.shortID ? `ekurl.in/${url.shortID}` : "A link in your workspace",`
- `backend/controllers/url.controller.js:468`: `detail: `ekurl.in/${url.shortID}`,`
- `backend/index.js:23`: `"https://ekurl.in",`
- `backend/index.js:24`: `"https://app.ekurl.in",`
- `backend/index.js:75`: `return res.redirect(301, "https://app.ekurl.in");`
- `backend/test/password-reset.controller.test.js:147`: `process.env.FRONTEND_URL = "https://app.ekurl.in";`

## Ignored local environment files

- frontend/.env: API_BASE_URL points to https://www.ekurl.vercel.app; unprefixed Google client ID is not exposed by Vite.
- backend/.env: FRONTEND_URL points to https://app.ekurl.in. Google secret exists but this GIS flow does not use it. No secrets recorded.

## Architectural findings

- Axios uses unexposed API_BASE_URL, a suspended production fallback, hostname-based localhost selection, and an obsolete redirecturl property.
- Backend shortUrlFor derives links from request protocol/Host; canonical backend configuration is absent. MongoDB stores aliases/short IDs, not full short URLs.
- CORS allows localhost in production and includes deprecated domains and a backend origin.
- Google Identity Services returns an ID token to the frontend; POST /user/google verifies it. No redirect callback, OAuth client secret, or OTP route exists.
- JWT cookie is host-only, HttpOnly, Secure/SameSite=None in production. Keep these settings for the cross-site Vercel fallback.
- Password reset is the only email template; it reads FRONTEND_URL and currently requires HTTPS even in local development.
- Guest claims use existing localStorage keys and server-side hashed expiring claim tokens. Storage cannot be recovered automatically from suspended origins.
- Manifest uses relative URLs; no webhook URL found. Test localhost URLs are intentional. Landing-page author link and example destination URLs are unrelated.
- Frontend Vercel rewrites exist; no backend Vercel config is checked in. Existing routes are the contract; preserve paths and response fields.
