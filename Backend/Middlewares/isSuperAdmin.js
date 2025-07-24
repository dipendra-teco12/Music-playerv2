function isSuperAdmin(req, res, next) {
  if (req.user?.role === "superAdmin") {
    return next();
  }
  res.status(403).send("Access denied. super Admins only.");
}
module.exports = isSuperAdmin;
