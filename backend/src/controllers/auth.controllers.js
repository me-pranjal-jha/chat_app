import User from "../model/user.model.js";
import bcrypt from "bcryptjs";
import dotenv from "dotenv";
import { v2 as cloudinary } from "cloudinary";

import { generateToken } from "../lib/utils.js";
import { sendOTPmail, sendWelcomeEmail } from "../emails/emailHandler.js";

dotenv.config();

// SIGNUP
export const signup = async (req, res) => {
  const { fullname, email, password } = req.body;

  try {
    if (!fullname || !email || !password) {
      return res.status(400).json({ message: "All fields are required" });
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

    const existingUser = await User.findOne({ email });

    if (existingUser && existingUser.isVerified) {
      return res.status(400).json({ message: "Email already exists" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const hashedOtp = await bcrypt.hash(otp, 10);
    const otpExpiry = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

    let user;

    if (existingUser && !existingUser.isVerified) {
      existingUser.fullname = fullname;
      existingUser.password = hashedPassword;
      existingUser.otp = hashedOtp;
      existingUser.otpExpiry = otpExpiry;

      user = await existingUser.save();
    } else {
      user = await User.create({
        fullname,
        email,
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

// VERIFY OTP
export const verifyOtp = async (req, res) => {
  const { email, otp } = req.body;

  try {
    if (!email || !otp) {
      return res.status(400).json({ message: "Email and OTP are required" });
    }

    const user = await User.findOne({ email });

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    if (user.isVerified) {
      return res.status(400).json({ message: "User already verified" });
    }

    if (!user.otp || !user.otpExpiry) {
      return res.status(400).json({ message: "No OTP found. Please sign up again." });
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
      await sendWelcomeEmail(user.email, user.fullname, process.env.CLIENT_URL);
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

    const user = await User.findOne({ email });

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