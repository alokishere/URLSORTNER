const User = require("../models/user.model");
const jwt = require("jsonwebtoken");
const { createHash, randomBytes } = require("crypto");
const passwordResetEmail = require("../utils/passwordResetEmail");
const googleAuth = require("../utils/googleAuth");
const {
  validPassword,
  hashPassword,
  verifyPassword,
} = require("../utils/password");

const cookieOptions = () => ({
  httpOnly: true,
  sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
  secure: process.env.NODE_ENV === "production",
  maxAge: 7 * 24 * 60 * 60 * 1000,
});
const clearCookieOptions = () => {
  const { maxAge, ...options } = cookieOptions();
  void maxAge;
  return options;
};
const issueSession = (res, user) => {
  const token = jwt.sign(
    { id: user._id, sv: user.sessionVersion ?? 0 },
    process.env.JWT_SECRET,
    { expiresIn: "7d" },
  );
  res.cookie("token", token, cookieOptions());
};
const publicUser = (user) => ({
  id: user._id,
  fullName: user.fullName,
  email: user.email,
  roles: user.roles,
  isActive: user.isActive,
});
const owns = (req, id) => String(req.user?._id) === String(id);
const passwordResetResponse = {
  message:
    "If an account exists with this email, you will receive a password reset link shortly.",
};
const normalizeEmail = (value) =>
  typeof value === "string" ? value.trim().toLowerCase() : "";
const isValidEmail = (value) =>
  value.length <= 254 && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
const hashResetToken = (token) =>
  createHash("sha256").update(token, "utf8").digest("hex");
const friendlyGoogleError = "Google sign-in couldn't be completed. Please try again.";

const googleUserQuery = (providerId) => ({
  authProviders: { $elemMatch: { provider: "google", providerId } },
  isActive: { $ne: false },
});

const validGoogleCredential = (credential) =>
  typeof credential === "string" && credential.length >= 100 && credential.length <= 10000;

async function verifyGoogleEmailCredential(credential) {
  if (!validGoogleCredential(credential)) {
    const error = new Error(friendlyGoogleError);
    error.code = "GOOGLE_TOKEN_INVALID";
    throw error;
  }
  const payload = await googleAuth.verifyGoogleIdToken(credential);
  const email = normalizeEmail(payload.email);
  if (!email || email.length > 50 || !isValidEmail(email)) {
    const error = new Error(friendlyGoogleError);
    error.code = "GOOGLE_TOKEN_INVALID";
    throw error;
  }
  return { payload, email };
}

function sendGoogleVerificationError(res, error) {
  if (error?.code === "GOOGLE_CONFIG_MISSING") {
    console.error("Google authentication is not configured");
    return res.status(503).json({ error: friendlyGoogleError });
  }
  if (error?.code !== "GOOGLE_TOKEN_INVALID")
    console.error("Google email verification failed", { error: error?.message || "Unknown Google error" });
  return res.status(401).json({ error: friendlyGoogleError });
}

async function googleLogin(req, res) {
  const credential = req.body?.credential;
  if (typeof credential !== "string" || credential.length < 100 || credential.length > 10000)
    return res.status(400).json({ error: friendlyGoogleError });

  try {
    const payload = await googleAuth.verifyGoogleIdToken(credential);
    const email = typeof payload.email === "string" ? payload.email.trim().toLowerCase() : "";
    if (!email || email.length > 50 || !isValidEmail(email))
      return res.status(401).json({ error: friendlyGoogleError });

    let user = await User.findOne(googleUserQuery(payload.sub));
    if (user) {
      issueSession(res, user);
      return res.status(200).json({ message: "Google sign-in successful", user: publicUser(user) });
    }

    const existingEmailUser = await User.findOne({ email });
    if (existingEmailUser)
      return res.status(409).json({
        error: "An account already exists with this email. Sign in with your password first, then link Google from your authenticated profile settings.",
      });

    const claimedName = typeof payload.name === "string" ? payload.name.trim() : "";
    const fullName = (claimedName || email.split("@")[0]).slice(0, 40);
    try {
      user = await User.create({
        fullName,
        email,
        authProviders: [{ provider: "google", providerId: payload.sub }],
      });
    } catch (error) {
      if (error?.code !== 11000) throw error;
      const concurrentGoogleUser = await User.findOne(googleUserQuery(payload.sub));
      if (!concurrentGoogleUser)
        return res.status(409).json({ error: friendlyGoogleError });
      user = concurrentGoogleUser;
    }

    issueSession(res, user);
    return res.status(201).json({ message: "Google account created", user: publicUser(user) });
  } catch (error) {
    if (error?.code === "GOOGLE_CONFIG_MISSING") {
      console.error("Google authentication is not configured");
      return res.status(503).json({ error: friendlyGoogleError });
    }
    if (error?.code !== "GOOGLE_TOKEN_INVALID")
      console.error("Google authentication failed", { error: error?.message || "Unknown Google error" });
    return res.status(401).json({ error: friendlyGoogleError });
  }
}

async function linkGoogleAccount(req, res) {
  const credential = req.body?.credential;
  if (typeof credential !== "string" || credential.length < 100 || credential.length > 10000)
    return res.status(400).json({ error: friendlyGoogleError });

  try {
    const payload = await googleAuth.verifyGoogleIdToken(credential);
    const email = typeof payload.email === "string" ? payload.email.trim().toLowerCase() : "";
    if (!email || email.length > 50 || !isValidEmail(email))
      return res.status(401).json({ error: friendlyGoogleError });

    if (email !== normalizeEmail(req.user.email))
      return res.status(409).json({
        error: "Use a Google account with the same verified email as your Ek URL account.",
      });

    const linkedUser = await User.findOne(googleUserQuery(payload.sub));
    if (linkedUser && String(linkedUser._id) !== String(req.user._id))
      return res.status(409).json({ error: "This Google account is already linked to another user." });

    const currentGoogleProvider = (req.user.authProviders || []).find(
      (provider) => provider.provider === "google",
    );
    if (currentGoogleProvider) {
      if (currentGoogleProvider.providerId === payload.sub)
        return res.status(200).json({ message: "Google account is already linked." });
      return res.status(409).json({ error: "A different Google account is already linked." });
    }

    const updatedUser = await User.findOneAndUpdate(
      {
        _id: req.user._id,
        email,
        authProviders: { $not: { $elemMatch: { provider: "google" } } },
      },
      { $push: { authProviders: { provider: "google", providerId: payload.sub } } },
      { new: true },
    );
    if (updatedUser)
      return res.status(200).json({ message: "Google account linked successfully.", user: publicUser(updatedUser) });

    const refreshedUser = await User.findById(req.user._id);
    const refreshedGoogleProvider = (refreshedUser?.authProviders || []).find(
      (provider) => provider.provider === "google",
    );
    if (refreshedGoogleProvider?.providerId === payload.sub)
      return res.status(200).json({ message: "Google account is already linked." });
    return res.status(409).json({ error: "This account could not be linked. Please try again." });
  } catch (error) {
    if (error?.code === 11000)
      return res.status(409).json({ error: "This Google account is already linked to another user." });
    if (error?.code === "GOOGLE_CONFIG_MISSING") {
      console.error("Google authentication is not configured");
      return res.status(503).json({ error: friendlyGoogleError });
    }
    if (error?.code !== "GOOGLE_TOKEN_INVALID")
      console.error("Google account linking failed", { error: error?.message || "Unknown Google error" });
    return res.status(401).json({ error: friendlyGoogleError });
  }
}

async function verifyGoogleEmail(req, res) {
  try {
    const { email } = await verifyGoogleEmailCredential(req.body?.credential);
    return res.status(200).json({ verified: true, email });
  } catch (error) {
    return sendGoogleVerificationError(res, error);
  }
}

async function forgotPassword(req, res) {
  const email = normalizeEmail(req.body?.email);
  if (!isValidEmail(email))
    return res.status(400).json({ error: "A valid email is required" });

  try {
    const user = await User.findOne({ email, isActive: { $ne: false } });
    if (!user) return res.status(200).json(passwordResetResponse);

    const token = randomBytes(32).toString("base64url");
    const tokenHash = hashResetToken(token);
    const resetPasswordExpiresAt = new Date(Date.now() + 15 * 60 * 1000);

    await User.updateOne(
      { _id: user._id },
      {
        $set: { resetPasswordTokenHash: tokenHash, resetPasswordExpiresAt },
      },
    );

    try {
      await passwordResetEmail.sendPasswordResetEmail({
        email: user.email,
        fullName: user.fullName,
        token,
        userId: user._id,
      });
    } catch (error) {
      await User.updateOne(
        { _id: user._id, resetPasswordTokenHash: tokenHash },
        { $unset: { resetPasswordTokenHash: 1, resetPasswordExpiresAt: 1 } },
      );
      console.error("Password reset email delivery failed", {
        userId: String(user._id),
        error: error?.message || "Unknown email provider error",
      });
    }

    return res.status(200).json(passwordResetResponse);
  } catch (error) {
    console.error("Password reset request failed", {
      error: error?.message || "Unknown reset error",
    });
    return res.status(200).json(passwordResetResponse);
  }
}

async function resetPassword(req, res) {
  const { token, password } = req.body || {};
  if (
    typeof token !== "string" ||
    token.length < 40 ||
    token.length > 100 ||
    !validPassword(password)
  )
    return res.status(400).json({ error: "This reset link is invalid or expired. Request a new one." });

  try {
    const passwordHash = await hashPassword(password);
    const resetPasswordTokenHash = hashResetToken(token);
    const user = await User.findOneAndUpdate(
      {
        resetPasswordTokenHash,
        resetPasswordExpiresAt: { $gt: new Date() },
        isActive: { $ne: false },
      },
      {
        $set: { passwordHash },
        $unset: { password: 1, resetPasswordTokenHash: 1, resetPasswordExpiresAt: 1 },
        $inc: { sessionVersion: 1 },
      },
      { new: true },
    );

    if (!user) return res.status(400).json({ error: "This reset link is invalid or expired. Request a new one." });
    return res.status(200).json({ message: "Password reset successfully" });
  } catch (error) {
    console.error("Password reset failed", {
      error: error?.message || "Unknown reset error",
    });
    return res.status(500).json({ error: "Unable to reset password right now" });
  }
}

async function registerUser(req, res) {
  try {
    const { fullName, email, password } = req.body || {};
    if (
      !validPassword(password) ||
      typeof email !== "string" ||
      typeof fullName !== "string"
    )
      return res.status(400).json({ error: "Invalid account details" });
    const normalizedEmail = email.trim().toLowerCase();
    if (await User.findOne({ email: normalizedEmail }))
      return res
        .status(400)
        .json({ error: "Unable to create account with these details" });
    const passwordHash = await hashPassword(password);
    const user = await User.create({
      fullName,
      email: normalizedEmail,
      passwordHash,
    });
    issueSession(res, user);
    return res
      .status(201)
      .json({
        message: "User registered successfully",
        user: publicUser(user),
      });
  } catch {
    return res
      .status(400)
      .json({ error: "Unable to create account with these details" });
  }
}

async function loginUser(req, res) {
  try {
    const { email, password } = req.body || {};
    if (typeof email !== "string" || !validPassword(password))
      return res.status(401).json({ error: "Email or password is incorrect. Please try again." });
    let user = await User.findOne({ email: email.trim().toLowerCase() }).select(
      "+password +passwordHash",
    );
    if (
      !user ||
      user.isActive === false ||
      !(await verifyPassword(user, password))
    )
      return res.status(401).json({ error: "Email or password is incorrect. Please try again." });
    if (!user.passwordHash) {
      const passwordHash = await hashPassword(password);
      user = await User.findOneAndUpdate(
        {
          _id: user._id,
          password: user.password,
          passwordHash: { $exists: false },
          isActive: { $ne: false },
        },
        { $set: { passwordHash }, $unset: { password: 1 } },
        { new: true },
      );
      if (!user)
        return res
          .status(409)
          .json({ error: "Account changed. Please retry signing in." });
    }
    issueSession(res, user);
    return res
      .status(200)
      .json({ message: "Login successful", user: publicUser(user) });
  } catch {
    return res.status(500).json({ error: "Unable to sign in right now" });
  }
}

async function logoutUser(req, res) {
  try {
    const token = req.cookies?.token;
    if (token) {
      try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        await User.updateOne(
          {
            _id: decoded.id || decoded._id,
            ...(decoded.sv == null || decoded.sv === 0
              ? {
                  $or: [
                    { sessionVersion: 0 },
                    { sessionVersion: { $exists: false } },
                  ],
                }
              : { sessionVersion: decoded.sv }),
          },
          { $inc: { sessionVersion: 1 } },
        );
      } catch (error) {
        if (!(error instanceof jwt.JsonWebTokenError)) throw error;
      }
    }
    res.clearCookie("token", clearCookieOptions());
    return res.status(200).json({ message: "Logout successful" });
  } catch {
    return res.status(500).json({ error: "Unable to sign out right now" });
  }
}

async function getSession(req, res) {
  return res
    .status(200)
    .json({ authenticated: true, user: publicUser(req.user) });
}

async function updateUser(req, res) {
  try {
    if (!owns(req, req.params.id))
      return res.status(403).json({ error: "Forbidden" });
    const body = req.body || {};
    if ("roles" in body || "isActive" in body)
      return res
        .status(403)
        .json({ error: "Cannot change account permissions" });
    let verifiedGoogle = null;
    if ("email" in body) {
      try {
        verifiedGoogle = await verifyGoogleEmailCredential(body.googleCredential);
      } catch (error) {
        if (error?.code === "GOOGLE_CONFIG_MISSING")
          return res.status(503).json({ error: "Google verification is not available right now." });
        return res.status(401).json({ error: "Verify your email with Google before changing it." });
      }
      const requestedEmail = normalizeEmail(body.email);
      if (!isValidEmail(requestedEmail) || requestedEmail !== verifiedGoogle.email)
        return res.status(409).json({ error: "The profile email must match the verified Google email." });

      const emailOwner = await User.findOne({
        email: requestedEmail,
        _id: { $ne: req.user._id },
      });
      if (emailOwner)
        return res.status(409).json({ error: "That email address is already used by another account." });

      const linkedUser = await User.findOne(googleUserQuery(verifiedGoogle.payload.sub));
      if (linkedUser && String(linkedUser._id) !== String(req.user._id))
        return res.status(409).json({ error: "This Google account is already linked to another user." });

      const currentGoogleProvider = (req.user.authProviders || []).find(
        (provider) => provider.provider === "google",
      );
      if (currentGoogleProvider && currentGoogleProvider.providerId !== verifiedGoogle.payload.sub)
        return res.status(409).json({ error: "A different Google account is already linked." });
    }
    const user = await User.findById(req.user._id).select(
      "+password +passwordHash",
    );
    if (!user) return res.status(404).json({ error: "User not found" });
    if ("password" in body) {
      if (
        !validPassword(body.password) ||
        !(await verifyPassword(user, body.currentPassword))
      )
        return res
          .status(400)
          .json({ error: "Invalid current or new password" });
      user.passwordHash = await hashPassword(body.password);
      user.password = undefined;
      user.sessionVersion = (user.sessionVersion ?? 0) + 1;
    }
    if ("fullName" in body) user.fullName = body.fullName;
    if (verifiedGoogle) {
      user.email = verifiedGoogle.email;
      const hasGoogleProvider = (user.authProviders || []).some(
        (provider) => provider.provider === "google",
      );
      if (!hasGoogleProvider) {
        user.authProviders = user.authProviders || [];
        user.authProviders.push({ provider: "google", providerId: verifiedGoogle.payload.sub });
      }
    }
    await user.save();
    if ("password" in body) issueSession(res, user);
    return res
      .status(200)
      .json({ message: "User updated successfully", user: publicUser(user) });
  } catch {
    return res.status(400).json({ error: "Unable to update account" });
  }
}

async function deleteUser(req, res) {
  try {
    if (!owns(req, req.params.id))
      return res.status(403).json({ error: "Forbidden" });
    const user = await User.findByIdAndDelete(req.user._id);
    if (!user) return res.status(404).json({ error: "User not found" });
    res.clearCookie("token", clearCookieOptions());
    return res
      .status(200)
      .json({ message: "User deleted successfully", user: publicUser(user) });
  } catch {
    return res.status(400).json({ error: "Unable to delete account" });
  }
}
module.exports = {
  registerUser,
  loginUser,
  logoutUser,
  getSession,
  updateUser,
  deleteUser,
  forgotPassword,
  resetPassword,
  googleLogin,
  linkGoogleAccount,
  verifyGoogleEmail,
};
