const jwt = require("jsonwebtoken");
require("dotenv").config({ quiet: true });

const generateAccessToken = (user) => {
  try {
    return jwt.sign(
      { id: user._id, email: user.email },
      process.env.SECRET_KEY,
      { expiresIn: "1d" }
    );
  } catch (error) {
    console.error("Access Token Generation Error:", error);
    return null;
  }
};

const generateRefreshToken = (user) => {
  try {
    return jwt.sign(
      { id: user._id, email: user.email },
      process.env.REFRESH_SECRET_KEY,
      { expiresIn: "7d" }
    );
  } catch (error) {
    console.error("Refresh Token Generation Error:", error);
    return null;
  }
};

const verifyAccessToken = (token) => {
  try {
    return jwt.verify(token, process.env.SECRET_KEY);
  } catch (error) {
    console.error("Access Token Verification Error:", error);
    return null;
  }
};

const verifyRefreshToken = (token) => {
  try {
    return jwt.verify(token, process.env.REFRESH_SECRET_KEY);
  } catch (error) {
    console.error("Refresh Token Verification Error:", error);
    return null;
  }
};

module.exports = {
  generateAccessToken,
  generateRefreshToken,
  verifyAccessToken,
  verifyRefreshToken,
};
