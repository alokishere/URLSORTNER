const express = require("express");
const { rateLimit } = require("express-rate-limit");
const {
  registerUser,
  loginUser,
  logoutUser,
  updateUser,
  deleteUser,
  getSession,
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
router.post("/logout", logoutUser);
router.get("/session", authenticateUser, getSession);
router.put("/update/:id", authenticateUser, updateUser);
router.delete("/delete/:id", authenticateUser, deleteUser);

module.exports = router;
