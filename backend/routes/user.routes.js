const express = require("express");
const { rateLimit } = require("express-rate-limit");
const {
  registerUser,
  loginUser,
  logoutUser,
  updateUser,
  deleteUser,
  getSession,
  forgotPassword,
  resetPassword,
  googleLogin,
  linkGoogleAccount,
  verifyGoogleEmail,
} = require("../controllers/user.controller");
const authenticateUser = require("../middleware/auth");

const router = express.Router();

// Define your routes here
router.get("/", (req, res) => {
  res.send("User route is working!");
});

router.post("/register", registerUser);
const loginLimiter = rateLimit({ windowMs: 15 * 60 * 1000, limit: 30, standardHeaders: "draft-8", legacyHeaders: false, message: { error: "Too many login attempts. Please try again later." } });
router.post("/login", loginLimiter, loginUser);
const passwordResetLimiter = rateLimit({ windowMs: 15 * 60 * 1000, limit: 5, standardHeaders: "draft-8", legacyHeaders: false, message: { error: "Too many password reset attempts. Please try again later." } });
router.post("/forgot-password", passwordResetLimiter, forgotPassword);
router.post("/reset-password", passwordResetLimiter, resetPassword);
const googleLoginLimiter = rateLimit({ windowMs: 15 * 60 * 1000, limit: 10, standardHeaders: "draft-8", legacyHeaders: false, message: { error: "Too many Google sign-in attempts. Please try again later." } });
router.post("/google", googleLoginLimiter, googleLogin);
const googleLinkLimiter = rateLimit({ windowMs: 15 * 60 * 1000, limit: 10, standardHeaders: "draft-8", legacyHeaders: false, message: { error: "Too many Google linking attempts. Please try again later." } });
router.post("/google/link", googleLinkLimiter, authenticateUser, linkGoogleAccount);
const googleEmailVerificationLimiter = rateLimit({ windowMs: 15 * 60 * 1000, limit: 10, standardHeaders: "draft-8", legacyHeaders: false, message: { error: "Too many Google verification attempts. Please try again later." } });
router.post("/google/verify-email", googleEmailVerificationLimiter, authenticateUser, verifyGoogleEmail);
router.post("/logout", logoutUser);
router.get("/session", authenticateUser, getSession);
router.put("/update/:id", authenticateUser, updateUser);
router.delete("/delete/:id", authenticateUser, deleteUser);

module.exports = router;
