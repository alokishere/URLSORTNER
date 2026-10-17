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
    res.cookie("token", token); // 1 hour
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
    res.clearCookie("token");
    res.status(200).json({ message: "Logout successful" });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
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
  updateUser,
  deleteUser
};
