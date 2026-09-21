import express from "express";

import {
  registerUser,
  loginUser,
  getMe,
  verifyEmail,
  resendVerificationEmail,
} from "../controllers/authController.js";

import { protect } from "../middleware/auth.js";

const router = express.Router();

router.post("/register", registerUser);

router.post("/verify-email", verifyEmail);

router.post(
  "/resend-verification",
  resendVerificationEmail
);

router.post("/login", loginUser);

router.get("/me", protect, getMe);

export default router;