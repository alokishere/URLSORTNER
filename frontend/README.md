# Ek URL frontend

The app uses Vite and React. Copy `.env.example` to `.env` for local development.

## Google sign-in

Google Identity Services uses a browser-issued ID token; the backend verifies it with `GOOGLE_CLIENT_ID`, creates or retrieves the account, and sets the existing HTTP-only session cookie. The client ID is public configuration, but the backend JWT secret and database credentials must remain server-only.

Set these values in deployment environments:

- Frontend: `VITE_API_BASE_URL` and `VITE_GOOGLE_CLIENT_ID`.
- Backend: `GOOGLE_CLIENT_ID`, `FRONTEND_URL`, `CORS_ORIGINS`, `JWT_SECRET`, and the existing database/email settings.

In Google Cloud Console, add each frontend origin (for example `https://app.ekurl.in` and local Vite origins) under OAuth client **Authorized JavaScript origins**. This flow does not use a server OAuth callback or client secret, so no redirect URI is required for the sign-in button.

This template provides a minimal setup to get React working in Vite with HMR and some ESLint rules.

Currently, two official plugins are available:

- [@vitejs/plugin-react](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react) uses [Oxc](https://oxc.rs)
- [@vitejs/plugin-react-swc](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react-swc) uses [SWC](https://swc.rs/)

## React Compiler

The React Compiler is not enabled on this template because of its impact on dev & build performances. To add it, see [this documentation](https://react.dev/learn/react-compiler/installation).

## Expanding the ESLint configuration

If you are developing a production application, we recommend using TypeScript with type-aware lint rules enabled. Check out the [TS template](https://github.com/vitejs/vite/tree/main/packages/create-vite/template-react-ts) for information on how to integrate TypeScript and [`typescript-eslint`](https://typescript-eslint.io) in your project.
