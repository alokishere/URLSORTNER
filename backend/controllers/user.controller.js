const User = require("../models/user.model");
const jwt = require("jsonwebtoken");
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
      return res.status(401).json({ error: "Invalid email or password" });
    let user = await User.findOne({ email: email.trim().toLowerCase() }).select(
      "+password +passwordHash",
    );
    if (
      !user ||
      user.isActive === false ||
      !(await verifyPassword(user, password))
    )
      return res.status(401).json({ error: "Invalid email or password" });
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
    if ("email" in body) user.email = body.email;
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
};
