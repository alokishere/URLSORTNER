const User = require("../models/user.model");
const jwt = require("jsonwebtoken");
async function registerUser(req, res) {
  try {
    const { fullName, email, password } = req.body;
    const existUser = await User.findOne({ email });
    if (existUser) {
      return res.status(400).json({ error: "User already exists" });
    }
    const user = await User.create({ fullName, email, password });
    res.status(201).json({
        message: "User registered successfully",
        user: {
            id: user._id,
            fullName: user.fullName,
            email: user.email,
            roles: user.roles,
        },
    });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
}

async function loginUser(req, res) {
    try {
        const { email, password } = req.body;
        const user = await User.findOne({ email });
        if (!user) {
            return res.status(404).json({ error: "User not found" });
        }
        if (user.password !== password) {
            return res.status(401).json({ error: "Invalid password" });
        }
        const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET);
        res.cookie('token', token); // 1 hour
        res.status(200).json({
            message: "Login successful",
            user: {
                id: user._id,
                fullName: user.fullName,
                email: user.email,
                roles: user.roles,
            },
        });
    } catch (error) {
        res.status(400).json({ "error While Logging In": error.message });
    }
}
async function logoutUser(req, res) {
    try {
        res.clearCookie('token');
        res.status(200).json({ message: "Logout successful" });
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
}
module.exports = {
  registerUser,
  loginUser,
    logoutUser,
};

