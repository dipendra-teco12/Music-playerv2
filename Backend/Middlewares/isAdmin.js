// middleware/ensureAdmin.js
function ensureAdmin(req, res, next) {
  if (req.user?.role === "admin") {
    return next();
  }

  // res.status(403).send("Access denied. Admins only.");
  // Redirect to a friendly error page in the browser
  // or send a 403 Forbidden for non-browser requests
  return res.status(303).redirect("/admin/error-403");
}

module.exports = ensureAdmin;
