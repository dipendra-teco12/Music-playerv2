const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
  fullName: {
    type: String,
    required: true,
  },
  email: {
    type: String,
    required: true,
    unique: true,
  },
  password: {
    type: String,
    validate: {
      validator: function (v) {
        if (this.googleId) return true; // skip for Google users
        return v && v.length >= 6; // enforce a password otherwise
      },
      message: "Password is required for local signups",
    },
  },
  role: {
    type: String,
    enum: ["admin", "user"],
    default: "user",
  },
  resetOtp: String,

  resetOtpExpiry: Date,

  otpAttemptCount: {
    type: Number,
    default: 0,
  },
  lastOTPSentAt: {
    type: Date,
  },
  isDeleted: {
    type: Boolean,
    default: false,
  },
});

const User = mongoose.model("User", userSchema);
module.exports = User;
