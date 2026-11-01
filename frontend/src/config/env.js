export function resolveConfig(env) {
  function origin(value, name) {
    let url;
    try { url = new URL(value); } catch { throw new Error(`${name} must be an absolute origin`); }
    if (!['http:', 'https:'].includes(url.protocol) || url.username || url.password || url.pathname !== '/' || url.search || url.hash ||
        (env.PROD && (url.protocol !== 'https:' || ['localhost', '127.0.0.1', '[::1]'].includes(url.hostname))) ||
        /(^|\.)ekurl\.in$/.test(url.hostname)) throw new Error(`${name} must be a valid, non-deprecated origin (HTTPS in production)`);
    return url.origin;
  }
  return {
    apiBaseUrl: origin(env.VITE_API_BASE_URL || (env.PROD ? '' : 'http://localhost:3000'), 'VITE_API_BASE_URL'),
    frontendUrl: origin(env.VITE_FRONTEND_URL || (env.PROD ? '' : 'http://localhost:5173'), 'VITE_FRONTEND_URL'),
    googleClientId: env.VITE_GOOGLE_CLIENT_ID?.trim() || '',
  };
}
