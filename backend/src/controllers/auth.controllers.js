import User from "../model/user.model.js";
import bcrypt from "bcryptjs";
import dotenv from "dotenv";
import { v2 as cloudinary } from "cloudinary";

import { generateToken } from "../lib/utils.js";
import {
  sendOTPmail,
  sendWelcomeEmail,
  sendResetPasswordOTPmail,
} from "../emails/emailHandler.js";

dotenv.config();

// SIGNUP
export const signup = async (req, res) => {
  const { fullname, email, password } = req.body;

  try {
    if (!fullname || !email || !password) {
      return res.status(400).json({ message: "All fields are required" });
    }

    if (fullname.trim().length < 2) {
      return res.status(400).json({ message: "Full name is too short" });
    }

    if (password.length < 6) {
      return res
        .status(400)
        .json({ message: "Password must be at least 6 characters long" });
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!emailRegex.test(email)) {
      return res.status(400).json({ message: "Invalid email format" });
    }

    const normalizedEmail = email.toLowerCase().trim();

    const existingUser = await User.findOne({ email: normalizedEmail });

    if (existingUser && existingUser.isVerified) {
      return res.status(400).json({ message: "Email already exists" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const hashedOtp = await bcrypt.hash(otp, 10);
    const otpExpiry = new Date(Date.now() + 10 * 60 * 1000);

    let user;

    if (existingUser && !existingUser.isVerified) {
      existingUser.fullname = fullname.trim();
      existingUser.password = hashedPassword;
      existingUser.otp = hashedOtp;
      existingUser.otpExpiry = otpExpiry;

      user = await existingUser.save();
    } else {
      user = await User.create({
        fullname: fullname.trim(),
        email: normalizedEmail,
        password: hashedPassword,
        isVerified: false,
        otp: hashedOtp,
        otpExpiry,
      });
    }

    await sendOTPmail(user.email, otp);

    return res.status(200).json({
      message: "OTP sent to your email",
      email: user.email,
    });
  } catch (error) {
    console.error("Signup error:", error);
    return res.status(500).json({ message: "Server error" });
  }
};

// VERIFY SIGNUP OTP
export const verifyOtp = async (req, res) => {
  const { email, otp } = req.body;

  try {
    if (!email || !otp) {
      return res.status(400).json({ message: "Email and OTP are required" });
    }

    const normalizedEmail = email.toLowerCase().trim();
    const user = await User.findOne({ email: normalizedEmail });

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    if (user.isVerified) {
      return res.status(400).json({ message: "User already verified" });
    }

    if (!user.otp || !user.otpExpiry) {
      return res
        .status(400)
        .json({ message: "No OTP found. Please sign up again." });
    }

    if (user.otpExpiry < new Date()) {
      return res.status(400).json({ message: "OTP expired" });
    }

    const isOTPCorrect = await bcrypt.compare(otp, user.otp);

    if (!isOTPCorrect) {
      return res.status(400).json({ message: "Invalid OTP" });
    }

    user.isVerified = true;
    user.otp = null;
    user.otpExpiry = null;

    await user.save();

    generateToken(user._id, res);

    try {
      await sendWelcomeEmail(
        user.email,
        user.fullname,
        process.env.CLIENT_URL || "http://localhost:5173"
      );
    } catch (error) {
      console.error("Failed to send welcome email:", error);
    }

    return res.status(200).json({
      message: "Email verified successfully",
      _id: user._id,
      fullname: user.fullname,
      email: user.email,
      profilePic: user.profilePic,
    });
  } catch (error) {
    console.error("Verify OTP error:", error);
    return res.status(500).json({ message: "Server error" });
  }
};

// LOGIN
export const login = async (req, res) => {
  const { email, password } = req.body;

  try {
    if (!email || !password) {
      return res.status(400).json({
        message: "All fields are required",
      });
    }

    const normalizedEmail = email.toLowerCase().trim();
    const user = await User.findOne({ email: normalizedEmail });

    if (!user) {
      return res.status(400).json({ message: "Invalid credentials" });
    }

    if (!user.isVerified) {
      return res.status(400).json({
        message: "Please verify your email first",
      });
    }

    const isPasswordCorrect = await bcrypt.compare(password, user.password);

    if (!isPasswordCorrect) {
      return res.status(400).json({ message: "Invalid credentials" });
    }

    generateToken(user._id, res);

    return res.status(200).json({
      _id: user._id,
      fullname: user.fullname,
      email: user.email,
      profilePic: user.profilePic,
    });
  } catch (error) {
    console.error("Error during login:", error);
    return res.status(500).json({ message: "Server error" });
  }
};

// LOGOUT
export const logout = (req, res) => {
  res.clearCookie("jwt");
  return res.status(200).json({ message: "Logged out successfully" });
};

// FORGOT PASSWORD - SEND RESET OTP
export const forgotPassword = async (req, res) => {
  const { email } = req.body;

  try {
    if (!email) {
      return res.status(400).json({ message: "Email is required" });
    }

    const normalizedEmail = email.toLowerCase().trim();
    const user = await User.findOne({ email: normalizedEmail });

    if (!user) {
      return res.status(404).json({ message: "Email does not exist" });
    }

    if (!user.isVerified) {
      return res.status(400).json({
        message: "Please verify your email first before resetting password",
      });
    }

    const resetOtp = Math.floor(100000 + Math.random() * 900000).toString();
    const hashedResetOtp = await bcrypt.hash(resetOtp, 10);
    const resetOtpExpiry = new Date(Date.now() + 10 * 60 * 1000);

    user.resetOtp = hashedResetOtp;
    user.resetOtpExpiry = resetOtpExpiry;

    await user.save();

    await sendResetPasswordOTPmail(user.email, resetOtp);

    return res.status(200).json({
      message: "Password reset OTP sent to your email",
      email: user.email,
    });
  } catch (error) {
    console.error("Forgot password error:", error);
    return res.status(500).json({ message: "Server error" });
  }
};

// RESET PASSWORD
export const resetPassword = async (req, res) => {
  const { email, otp, newPassword } = req.body;

  try {
    if (!email || !otp || !newPassword) {
      return res
        .status(400)
        .json({ message: "Email, OTP and new password are required" });
    }

    if (newPassword.length < 6) {
      return res
        .status(400)
        .json({ message: "New password must be at least 6 characters long" });
    }

    const normalizedEmail = email.toLowerCase().trim();
    const user = await User.findOne({ email: normalizedEmail });

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    if (!user.resetOtp || !user.resetOtpExpiry) {
      return res.status(400).json({
        message: "No reset OTP found. Please click forgot password again",
      });
    }

    if (user.resetOtpExpiry < new Date()) {
      return res.status(400).json({ message: "Reset OTP expired" });
    }

    const isOtpCorrect = await bcrypt.compare(otp, user.resetOtp);

    if (!isOtpCorrect) {
      return res.status(400).json({ message: "Invalid OTP" });
    }

    const hashedPassword = await bcrypt.hash(newPassword, 10);

    user.password = hashedPassword;
    user.resetOtp = null;
    user.resetOtpExpiry = null;

    await user.save();

    return res.status(200).json({
      message: "Password reset successful. Please login with your new password",
    });
  } catch (error) {
    console.error("Reset password error:", error);
    return res.status(500).json({ message: "Server error" });
  }
};

// UPDATE PROFILE
export const updateProfile = async (req, res) => {
  try {
    const { profilePic } = req.body;

    if (!profilePic) {
      return res.status(400).json({ message: "Profile picture is required" });
    }

    const userId = req.user._id;

    const uploadResponse = await cloudinary.uploader.upload(profilePic);

    const updatedUser = await User.findByIdAndUpdate(
      userId,
      { profilePic: uploadResponse.secure_url },
      { new: true }
    ).select("-password");

    return res.status(200).json(updatedUser);
  } catch (error) {
    console.error("Error during profile update:", error);
    return res.status(500).json({ message: "Server error" });
  }
};