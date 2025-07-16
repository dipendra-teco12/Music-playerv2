const express = require("express");

const router = express.Router();
const passport = require("passport");

const RefreshToken = require("../Models/refreshToken.Model");

const {
  generateAccessToken,
  generateRefreshToken,
} = require("../Utilities/jwt");

router.get(
  "/",
  passport.authenticate("google", { scope: ["profile", "email"] })
);

router.get(
  "/callback",
  passport.authenticate("google", {
    session: false,
    failureRedirect: "/auth/failure",
  }),
  async (req, res) => {
    const user = {
      _id: req.user._id,
      email: req.user.email,
    };
    const accessToken = generateAccessToken(user);

    const refreshToken = generateRefreshToken(user);

    // Store refresh token in DB
    await RefreshToken.create({
      token: refreshToken,
      userId: req.user.id,
      expiresAt: Date.now() + 7 * 24 * 60 * 60 * 1000,
    });

    // Set cookies
    res.cookie("accessToken", accessToken, {
      httpOnly: true,
      secure: false,
      sameSite: "Strict",
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    res.cookie("refreshToken", refreshToken, {
      httpOnly: true,
      secure: false,
      sameSite: "Strict",
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    res.redirect("/admin/dashboard");
  }
);

module.exports = router;
