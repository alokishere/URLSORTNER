const jwt = require("jsonwebtoken");
const User = require("../models/user.model");

async function optionalAuth(req, res, next) {
  const token = req.cookies?.token;
  if (!token) return next();

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.id || decoded._id);
    if (!user || user.isActive === false) {
      return res.status(401).json({ error: "Unauthorized - User not found" });
    }
    req.user = user;
    return next();
  } catch {
    return res.status(401).json({ error: "Unauthorized" });
  }
}

module.exports = optionalAuth;
