
function restrictToAdmin(req, res, next) {
  if (req.user && req.user.role === "admin") {
    next(); // User is an admin, proceed to the next middleware or route handler
  } else {
    res.status(403).json({ error: "Access denied. Admins only." });
  }
}

module.exports = restrictToAdmin;

