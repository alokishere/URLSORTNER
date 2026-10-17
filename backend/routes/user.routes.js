const express = require("express");
const {
  registerUser,
  loginUser,
  logoutUser,
  updateUser,
  deleteUser,
} = require("../controllers/user.controller");

const router = express.Router();

// Define your routes here
router.get("/", (req, res) => {
  res.send("User route is working!");
});

router.post("/register", registerUser);
router.post("/login", loginUser);
router.post("/logout", logoutUser);
router.put("/update/:id", updateUser);
router.delete("/delete/:id", deleteUser);

module.exports = router;
