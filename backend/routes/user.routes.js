const express = require("express");
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
router.post("/login", loginUser);
router.post("/logout", logoutUser);
router.get("/session", authenticateUser, getSession);
router.put("/update/:id", updateUser);
router.delete("/delete/:id", deleteUser);

module.exports = router;
