function restrictToUser(req, res, next) {
  if (req.user) {
    next(); // User is authenticated, proceed to the next middleware or route handler
  } else {
    res.status(401).json({ error: "Unauthorized - Please login" });
  }
}

module.exports = restrictToUser;
