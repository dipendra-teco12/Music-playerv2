const User = require("../Models/user.Model");
const bcrypt = require("bcrypt");
const RefreshToken = require("../Models/refreshToken.Model");
const nodemailer = require("nodemailer");
const jwt = require("jsonwebtoken");
const {
  generateAccessToken,
  generateRefreshToken,
  verifyAccessToken,
  verifyRefreshToken,
} = require("../Utilities/jwt");

const signup = async (req, res) => {
  try {
    const { fullName, email, password } = req.body;
    if (!fullName || !email || !password) {
      return res.status(400).json({ message: "All Fields Required" });
    }

    if (!password || password.length < 6) {
      throw new Error("Password must be at least 6 characters long");
    }

    const userExits = await User.findOne({ email });

    if (userExits) {
      return res.status(409).json({ message: "User/Email Already Exits" });
    }
    const hashedPassword = await bcrypt.hash(password, 10);

    const data = await User.create({
      fullName,
      email,
      password: hashedPassword,
    });

    res.status(201).json({ message: "User Registered Successfully", data });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

const login = async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ message: "All Fields Required" });
    }

    const user = await User.findOne({ email });
    if (!user) return res.status(404).json({ message: "User Not Found" });

    const match = await bcrypt.compare(password, user.password);
    if (!match) return res.status(401).json({ message: "Invalid Credentials" });

    const { password: _, ...data } = user.toObject();

    const accessToken = generateAccessToken(user);
    const refreshToken = generateRefreshToken(user);

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

    await RefreshToken.deleteOne({ userId: user._id });
    await RefreshToken.create({
      token: refreshToken,
      userId: user._id,
      expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
    });
    data.accessToken = accessToken;
    data.refreshToken = refreshToken;

    res.status(200).json({
      message: "User logged in successfully",
      user: data,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

const refreshTokenHandler = async (req, res) => {
  try {
    const token = req.cookies.refreshToken;
    if (!token) {
      return res.status(401).json({ message: "Refresh token missing" });
    }

    const storedToken = await RefreshToken.findOne({ token });
    if (!storedToken) {
      return res.status(403).json({ message: "Refresh token not found" });
    }

    if (storedToken.expiresAt < new Date()) {
      await RefreshToken.deleteOne({ token });
      return res.status(403).json({ message: "Refresh token expired" });
    }

    const payload = verifyRefreshToken(token);
    if (!payload) {
      return res.status(403).json({ message: "Invalid refresh token" });
    }

    const { id: _id, email } = payload;
    const accessToken = generateAccessToken({ _id, email });

    res.cookie("accessToken", accessToken, {
      httpOnly: true,
      secure: false,
      sameSite: "Strict",
      maxAge: 24 * 60 * 60 * 1000,
    });
    return res.status(200).json({ accessToken });
  } catch (err) {
    console.error("Refresh token error:", err);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

const logout = async (req, res) => {
  try {
    const token = req.cookies.refreshToken;

    if (!token) {
      return res
        .status(400)
        .json({ message: "Refresh token not found in cookies" });
    }

    await RefreshToken.deleteOne({ token });

    res.clearCookie("refreshToken", {
      httpOnly: true,
      secure: false,
      sameSite: "Strict",
    });

    res.clearCookie("accessToken", {
      httpOnly: true,
      secure: false,
      sameSite: "Strict",
    });

    return res.status(200).json({ message: "Logged out successfully" });
  } catch (error) {
    console.error("Logout error:", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

const transporter = nodemailer.createTransport({
  service: "gmail",
  secure: true,
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});
const forgetPassword = async (req, res) => {
  try {
    const { email } = req.body;
    if (!email) {
      return res.status(400).json({ message: "Email is required" });
    }

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ message: "User does not exist" });
    }
    if (
      user.lastOTPSentAt &&
      Date.now() - user.lastOTPSentAt.getTime() < 5 * 1000 // wait for 5sec
    ) {
      return res
        .status(429)
        .json({ message: "Please wait before requesting another OTP" });
    }
    if (user.resetOtpExpiry && Date.now() > user.resetOtpExpiry) {
      user.otpAttemptCount = 0;
    }
    if (user.otpAttemptCount >= 3) {
      return res
        .status(429)
        .json({ message: "Too many OTP requests. Try again later." });
    }

    const otp = Math.floor(1000 + Math.random() * 9000).toString();

    await transporter.sendMail({
      from: process.env.EMAIL_USER,
      to: email,
      subject: "OTP for password reset",
      html: `
        <p>if you don't want to reset password please ignore !</p>
        <p>Here is the otp for resetting password :- <h3>${otp}</h3></p>
      `,
    });

    user.resetOtp = otp;
    user.resetOtpExpiry = Date.now() + 10 * 60 * 1000;
    user.lastOTPSentAt = new Date();
    user.otpAttemptCount += 1;
    await user.save();

    res
      .status(200)
      .json({ message: "Reset password otp has been sent to your email" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Internal server error" });
  }
};

const verifyOtp = async (req, res) => {
  try {
    const { otp, email } = req.body;
    console.log(otp, email);
    const user = await User.findOne({
      email,
      resetOtp: otp,
      resetOtpExpiry: { $gt: Date.now() },
    });
    if (!user)
      return res.status(410).json({ message: "Invalid or expired OTP" });

    user.resetOtp = undefined;
    user.resetOtpExpiry = undefined;
    //  user.otpAttemptCount = undefined;
    // user.lastOTPSentAt = undefined;

    await user.save();

    const tempToken = jwt.sign({ userId: user._id }, process.env.SECRET_KEY, {
      expiresIn: "5m",
    });

    res.cookie("accessToken", tempToken, {
      httpOnly: true,
      secure: false,
      sameSite: "Strict",
      maxAge: 5 * 60 * 1000,
    });

    res.json({ message: "OTP verified", tempToken });
  } catch (error) {
    console.error("Error in verifying:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
};

const resetPassword = async (req, res) => {
  try {
    const { password } = req.body;
    const userId = req.user.userId;

    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ message: "User not found" });

    user.password = await bcrypt.hash(password, 10);

    user.otpAttemptCount = undefined;
    user.lastOTPSentAt = undefined;
    await user.save();

    res.json({ message: "Password changed successfully" });
  } catch (error) {
    console.error("Error in resetPassword:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
};

module.exports = {
  login,
  signup,
  refreshTokenHandler,
  logout,
  forgetPassword,
  resetPassword,
  verifyOtp,
};
