import express from "express";
import {
  signup,
  verifyOtp,
  login,
  logout,
  forgotPassword,
  resetPassword,
  updateProfile,
  auth0Login,
  checkAuth,
} from "../controllers/auth.controllers.js";
import { protectRoute } from "../middleware/auth.middleware.js";
import { requireAuth0Token } from "../middleware/auth0.middleware.js";

const router = express.Router();

router.post("/signup", signup);
router.post("/verify-otp", verifyOtp);
router.post("/login", login);
router.post("/auth0-login", auth0Login);
router.post("/logout", logout);
router.post("/forgot-password", forgotPassword);
router.post("/reset-password", resetPassword);
router.get("/check", protectRoute, checkAuth);
router.put("/update-profile", protectRoute, updateProfile);

export default router;