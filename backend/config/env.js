const production = () => process.env.NODE_ENV === "production";
function origin(value, name) {
  let url;
  try {
    url = new URL(value);
  } catch {
    throw new Error(`${name} must be an absolute origin`);
  }
  if (
    !["http:", "https:"].includes(url.protocol) ||
    url.username ||
    url.password ||
    url.pathname !== "/" ||
    url.search ||
    url.hash ||
    (production() &&
      (url.protocol !== "https:" ||
        ["localhost", "127.0.0.1", "[::1]"].includes(url.hostname))) ||
    /(^|\.)ekurl\.in$/.test(url.hostname)
  )
    throw new Error(
      `${name} must be a valid, non-deprecated origin (HTTPS in production)`,
    );
  return url.origin;
}
function getConfig() {
  const frontendUrl = origin(
    process.env.FRONTEND_URL || (production() ? "" : "http://localhost:5173"),
    "FRONTEND_URL",
  );
  const backendUrl = origin(
    process.env.BACKEND_URL ||
      process.env.API_BASE_URL ||
      (production() ? "" : `http://localhost:${process.env.PORT || 3000}`),
    "BACKEND_URL",
  );
  if (
    process.env.API_BASE_URL &&
    origin(process.env.API_BASE_URL, "API_BASE_URL") !== backendUrl
  )
    throw new Error("API_BASE_URL and BACKEND_URL must match");
  const extra = (process.env.CORS_ORIGINS || "")
    .split(",")
    .map((v) => v.trim())
    .filter(Boolean)
    .map((v) => origin(v, "CORS_ORIGINS"));
  const local = production()
    ? []
    : [
        "http://localhost:3000",
        "http://localhost:5173",
        "http://localhost:5174",
        "http://127.0.0.1:5173",
        "http://127.0.0.1:5174",
      ];
  return {
    frontendUrl,
    backendUrl,
    corsOrigins: [...new Set([frontendUrl, ...extra, ...local])],
  };
}
function validateEnvironment() {
  for (const name of ["MONGO_URI", "JWT_SECRET"])
    if (!process.env[name]?.trim()) throw new Error(`${name} is required`);
  return getConfig();
}
module.exports = { getConfig, validateEnvironment };
