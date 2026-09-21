import crypto from "crypto";

import asyncHandler from "../middleware/asyncHandler.js";
import User from "../models/User.js";
import PendingUser from "../models/PendingUser.js";
import generateToken from "../utils/generateToken.js";
import { sendVerificationEmail } from "../utils/sendEmail.js";

const generateOtp = () => {
  return Math.floor(
    100000 + Math.random() * 900000
  ).toString();
};

const hashOtp = (otp) => {
  return crypto
    .createHash("sha256")
    .update(otp)
    .digest("hex");
};

// @route POST /api/auth/register
// @access Public
export const registerUser = asyncHandler(async (req, res) => {
  const { username, email, password, skinType } = req.body;

  if (!username || !email || !password) {
    res.status(400);
    throw new Error(
      "Username, email, and password are all required"
    );
  }

  const normalizedEmail = email.toLowerCase().trim();
  const normalizedUsername = username.trim();

  // Check if an actual verified/existing user already exists
  const existingUser = await User.findOne({
    $or: [
      { email: normalizedEmail },
      { username: normalizedUsername },
    ],
  });

  if (existingUser) {
    res.status(400);
    throw new Error(
      "An account with that email or username already exists"
    );
  }

  // Remove any previous unfinished registration
  await PendingUser.deleteMany({
    $or: [
      { email: normalizedEmail },
      { username: normalizedUsername },
    ],
  });

  const otp = generateOtp();

  // Save registration temporarily.
  // This does NOT create a User.
  const pendingUser = await PendingUser.create({
    username: normalizedUsername,
    email: normalizedEmail,
    password,
    skinType,
    otp: hashOtp(otp),
    otpExpires: new Date(
      Date.now() + 10 * 60 * 1000
    ),
  });

  try {
    await sendVerificationEmail(
      pendingUser.email,
      pendingUser.username,
      otp
    );
  } catch (error) {
    await PendingUser.findByIdAndDelete(
      pendingUser._id
    );

    console.error(
      "Verification email failed:",
      error
    );

    res.status(500);
    throw new Error(
      "Could not send verification email. Please try again."
    );
  }

  res.status(201).json({
    message:
      "Verification code sent to your email.",
    email: pendingUser.email,
  });
});

// @route POST /api/auth/verify-email
// @access Public
export const verifyEmail = asyncHandler(async (req, res) => {
  const { email, otp } = req.body;

  if (!email || !otp) {
    res.status(400);
    throw new Error(
      "Email and verification code are required"
    );
  }

  const normalizedEmail = email.toLowerCase().trim();

  // Find temporary registration
  const pendingUser = await PendingUser.findOne({
    email: normalizedEmail,
  });

  if (!pendingUser) {
    res.status(404);
    throw new Error(
      "Registration not found or verification code has expired. Please register again."
    );
  }

  // Check OTP expiry
  if (
    pendingUser.otpExpires.getTime() <
    Date.now()
  ) {
    await PendingUser.findByIdAndDelete(
      pendingUser._id
    );

    res.status(400);
    throw new Error(
      "Verification code has expired. Please register again."
    );
  }

  // Hash entered OTP
  const hashedOtp = hashOtp(otp.trim());

  // Check OTP
  if (hashedOtp !== pendingUser.otp) {
    res.status(400);
    throw new Error(
      "Invalid verification code"
    );
  }

  // OTP is correct.
  // NOW create the actual User.
  const user = await User.create({
    username: pendingUser.username,
    email: pendingUser.email,
    password: pendingUser.password,
    skinType: pendingUser.skinType,
    isEmailVerified: true,
  });

  // Remove temporary registration
  await PendingUser.findByIdAndDelete(
    pendingUser._id
  );

  // Login user automatically after verification
  res.json({
    _id: user._id,
    username: user.username,
    email: user.email,
    avatar: user.avatar,
    token: generateToken(user._id),
  });
});

// @route POST /api/auth/resend-verification
// @access Public
export const resendVerificationEmail = asyncHandler(
  async (req, res) => {
    const { email } = req.body;

    if (!email) {
      res.status(400);
      throw new Error("Email is required");
    }

    const normalizedEmail = email.toLowerCase().trim();

    // Find temporary registration
    const pendingUser = await PendingUser.findOne({
      email: normalizedEmail,
    });

    if (!pendingUser) {
      res.status(404);
      throw new Error(
        "Registration not found or expired. Please register again."
      );
    }

    const otp = generateOtp();

    pendingUser.otp = hashOtp(otp);

    pendingUser.otpExpires = new Date(
      Date.now() + 10 * 60 * 1000
    );

    await pendingUser.save();

    try {
      await sendVerificationEmail(
        pendingUser.email,
        pendingUser.username,
        otp
      );
    } catch (error) {
      console.error(
        "Resend verification email failed:",
        error
      );

      res.status(500);
      throw new Error(
        "Could not send verification email. Please try again."
      );
    }

    res.json({
      message:
        "A new verification code has been sent.",
    });
  }
);

// @route POST /api/auth/login
// @access Public
export const loginUser = asyncHandler(async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    res.status(400);
    throw new Error(
      "Email and password are required"
    );
  }

  const normalizedEmail = email.toLowerCase().trim();

  const user = await User.findOne({
    email: normalizedEmail,
  }).select("+password");

  if (
    !user ||
    !(await user.matchPassword(password))
  ) {
    res.status(401);
    throw new Error(
      "Invalid email or password"
    );
  }

  // Do not allow unverified users to login
  if (!user.isEmailVerified) {
    res.status(403);
    throw new Error(
      "Please verify your email before logging in."
    );
  }

  res.json({
    _id: user._id,
    username: user.username,
    email: user.email,
    avatar: user.avatar,
    token: generateToken(user._id),
  });
});

// @route GET /api/auth/me
// @access Private
export const getMe = asyncHandler(async (req, res) => {
  res.json(req.user);
});