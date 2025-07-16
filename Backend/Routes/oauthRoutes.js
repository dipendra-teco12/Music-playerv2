const express = require("express");

const router = express.Router();

require("dotenv").config({ quiet: true });
const passport = require("passport");

const RefreshToken = require("../Models/refreshToken.Model");
const jwt = require("jsonwebtoken");

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
    // Issue JWT after login
    // after passport.authenticate callback
    const accessToken = jwt.sign(
      { sub: req.user.id, email: req.user.email },
      process.env.SECRET_KEY,
      { expiresIn: "15m" }
    );

    const refreshToken = jwt.sign(
      { sub: req.user.id, email: req.user.email },
      process.env.REFRESH_SECRET_KEY,
      { expiresIn: "7d" }
    );

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
      maxAge: 24 * 60 * 60 * 1000,
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
