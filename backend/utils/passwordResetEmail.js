const { Resend } = require("resend");

const escapeHtml = (value) =>
  String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");

const getResetUrl = (token) => {
  const configuredFrontendUrl = process.env.FRONTEND_URL;
  if (!configuredFrontendUrl) throw new Error("FRONTEND_URL is not configured");

  const frontendUrl = new URL(configuredFrontendUrl);
  if (frontendUrl.protocol !== "https:")
    throw new Error("FRONTEND_URL must use HTTPS");

  const resetUrl = new URL("/reset-password", frontendUrl);
  resetUrl.searchParams.set("token", token);
  return resetUrl.toString();
};

const createPasswordResetEmail = ({ fullName, token }) => {
  const resetUrl = getResetUrl(token);
  const safeName = escapeHtml(fullName || "there");
  const safeUrl = escapeHtml(resetUrl);

  return {
    resetUrl,
    subject: "Reset your Ek URL password",
    text: [
      `Hi ${fullName || "there"},`,
      "",
      "We received a request to reset your Ek URL password.",
      "Use this link to choose a new password:",
      resetUrl,
      "",
      "This link expires in 15 minutes and can be used only once.",
      "If you did not request this, you can safely ignore this email.",
      "",
      "— Ek URL",
    ].join("\n"),
    html: `<!doctype html>
<html lang="en">
  <body style="margin:0;background:#f7f4ed;color:#252823;font-family:Arial,Helvetica,sans-serif;">
    <div style="max-width:560px;margin:0 auto;padding:32px 20px;">
      <div style="background:#ffffff;border:1px solid #c7d3c0;border-radius:20px;padding:36px 32px;">
        <div style="display:inline-block;background:#8fa28a;color:#f7f4ed;border-radius:12px;padding:10px 14px;font-weight:700;letter-spacing:.08em;">EK URL</div>
        <h1 style="margin:28px 0 12px;font-size:28px;line-height:1.2;color:#252823;">Reset your password</h1>
        <p style="margin:0 0 18px;line-height:1.6;color:#5f655d;">Hi ${safeName}, we received a request to reset your Ek URL password.</p>
        <p style="margin:0 0 26px;line-height:1.6;color:#5f655d;">Choose a new password using the button below. This link expires in <strong>15 minutes</strong> and can be used only once.</p>
        <a href="${safeUrl}" style="display:inline-block;background:#c8a96b;color:#252823;text-decoration:none;border-radius:12px;padding:14px 22px;font-weight:700;">Reset Password</a>
        <p style="margin:28px 0 8px;font-size:13px;line-height:1.6;color:#5f655d;">If the button does not work, copy and paste this URL into your browser:</p>
        <p style="margin:0;word-break:break-all;font-size:13px;line-height:1.6;"><a href="${safeUrl}" style="color:#4f684e;">${safeUrl}</a></p>
        <p style="margin:28px 0 0;font-size:13px;line-height:1.6;color:#5f655d;">If you did not request this email, you can safely ignore it.</p>
      </div>
      <p style="margin:18px 0 0;text-align:center;font-size:12px;color:#7a8176;">Ek URL · Simplify every share.</p>
    </div>
  </body>
</html>`,
  };
};

const sendPasswordResetEmail = async ({ email, fullName, token, userId }) => {
  if (!process.env.RESEND_API_KEY)
    throw new Error("RESEND_API_KEY is not configured");
  if (!process.env.EMAIL_FROM) throw new Error("EMAIL_FROM is not configured");

  const message = createPasswordResetEmail({ fullName, token });
  const resend = new Resend(process.env.RESEND_API_KEY);
  const { error } = await resend.emails.send({
    from: process.env.EMAIL_FROM,
    to: [email],
    subject: message.subject,
    html: message.html,
    text: message.text,
  });

  if (error) {
    const providerError = new Error(
      error.message || "Resend rejected the email",
    );
    providerError.code = error.name || error.statusCode;
    providerError.userId = userId;
    throw providerError;
  }
};

module.exports = { createPasswordResetEmail, sendPasswordResetEmail };
