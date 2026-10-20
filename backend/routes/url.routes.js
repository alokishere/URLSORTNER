const express = require("express");
const { rateLimit } = require("express-rate-limit");
const {
  claimGuestUrls,
  deleteUrl,
  generateNewShortID,
  getAnalytics,
  getallUrls,
  getQrCode,
  setUrlStatus,
  updateUrl,
} = require("../controllers/url.controller");
const authenticateUser = require("../middleware/auth");
const optionalAuth = require("../middleware/optionalAuth");

const router = express.Router();
const guestCreateLimiter = rateLimit({
  windowMs: 60 * 60 * 1000,
  limit: 30,
  standardHeaders: "draft-8",
  legacyHeaders: false,
  skip: (req) => Boolean(req.user),
  message: { error: "Too many guest links created. Please try again later or sign in." },
});

router.post("/", optionalAuth, guestCreateLimiter, generateNewShortID);

router.use(authenticateUser);
router.get("/", getallUrls);
router.post("/claim", claimGuestUrls);
router.get("/:shortID/analytics", getAnalytics);
router.get("/:id/qr", getQrCode);
router.patch("/:id/status", setUrlStatus);
router.patch("/:id", updateUrl);
router.delete("/:id", deleteUrl);

module.exports = router;
