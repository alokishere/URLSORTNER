const { OAuth2Client } = require("google-auth-library");

const GOOGLE_ISSUERS = new Set([
  "https://accounts.google.com",
  "accounts.google.com",
]);

const verifyGoogleIdToken = async (credential) => {
  const clientId = process.env.GOOGLE_CLIENT_ID;
  if (!clientId) {
    const error = new Error("Google authentication is not configured");
    error.code = "GOOGLE_CONFIG_MISSING";
    throw error;
  }

  const client = new OAuth2Client(clientId);
  const ticket = await client.verifyIdToken({
    idToken: credential,
    audience: clientId,
  });
  const payload = ticket.getPayload();
  const audience = Array.isArray(payload?.aud) ? payload.aud : [payload?.aud];

  if (
    !payload?.sub ||
    !GOOGLE_ISSUERS.has(payload.iss) ||
    !audience.includes(clientId) ||
    payload.email_verified !== true
  ) {
    const error = new Error("Invalid Google identity token");
    error.code = "GOOGLE_TOKEN_INVALID";
    throw error;
  }

  return payload;
};

module.exports = { verifyGoogleIdToken };
