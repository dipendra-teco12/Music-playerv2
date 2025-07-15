const express = require("express");
const {
  signup,
  login,
  refreshTokenHandler,
  logout,
  forgetPassword,
  resetPassword,
  verifyOtp,
} = require("../Controllers/auth.Controller");
const authenticateToken = require("../Middlewares/authMiddleware");
const router = express.Router();

router.post("/signup", signup);
router.post("/login", login);
router.post("/refreshtoken", refreshTokenHandler);
router.get("/logout", logout);
router.post("/forgetpassword", forgetPassword);
router.post("/verifyotp", verifyOtp);
router.post("/resetPassword", authenticateToken, resetPassword);

module.exports = router;
