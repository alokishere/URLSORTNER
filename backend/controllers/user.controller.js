const User = require("../models/user.model");
const jwt = require("jsonwebtoken");

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
  const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: "7d" });
  res.cookie("token", token, cookieOptions());
};


async function registerUser(req, res) {
  try {
    const { fullName, email, password } = req.body;
    const existUser = await User.findOne({ email });
    if (existUser) {
      return res.status(400).json({ error: "User already exists" });
    }
    const user = await User.create({ fullName, email, password });
    issueSession(res, user);
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
    if (user.isActive === false) {
      return res.status(403).json({ error: "Account is inactive" });
    }
    if (user.password !== password) {
      return res.status(401).json({ error: "Invalid password" });
    }
    issueSession(res, user);
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
    res.clearCookie("token", clearCookieOptions());
    res.status(200).json({ message: "Logout successful" });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
}

async function getSession(req, res) {
  return res.status(200).json({
    authenticated: true,
    user: {
      id: req.user._id,
      fullName: req.user.fullName,
      email: req.user.email,
      roles: req.user.roles,
      isActive: req.user.isActive,
    },
  });
}

async function updateUser(req, res){
  try {
    const { id } = req.params;
    const { fullName, email, password, roles, isActive } = req.body;

    const updatedUser = await User.findByIdAndUpdate(
      id,
      { fullName, email, password, roles, isActive },
      { new: true }
    );

    if (!updatedUser) {
      return res.status(404).json({ error: "User not found" });
    }

    res.status(200).json({
      message: "User updated successfully",
      user: {
        id: updatedUser._id,
        fullName: updatedUser.fullName,
        email: updatedUser.email,
        roles: updatedUser.roles,
        isActive: updatedUser.isActive,
      },
    });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }

} 

async function deleteUser(req, res) {
  try {
    const { id } = req.params;
    const deletedUser = await User.findByIdAndDelete(id);

    if (!deletedUser) {
      return res.status(404).json({ error: "User not found" });
    }

    res.status(200).json({
      message: "User deleted successfully",
      user: {
        id: deletedUser._id,
        fullName: deletedUser.fullName,
        email: deletedUser.email,
        roles: deletedUser.roles,
        isActive: deletedUser.isActive,
      },
    });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
}

module.exports = {
  registerUser,
  loginUser,
  logoutUser,
  getSession,
  updateUser,
  deleteUser
};
