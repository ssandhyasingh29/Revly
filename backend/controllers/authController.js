import crypto from "crypto";

import asyncHandler from "../middleware/asyncHandler.js";
import User from "../models/User.js";
import PendingUser from "../models/PendingUser.js";
import generateToken from "../utils/generateToken.js";
import { sendVerificationEmail } from "../utils/sendEmail.js";

const FRONTEND_URL =
  process.env.CLIENT_URL || "http://localhost:5173";


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

  // Generate a secure random verification token
  const verificationToken =
    crypto.randomBytes(32).toString("hex");

  // Save temporary registration
  const pendingUser = await PendingUser.create({
    username: normalizedUsername,
    email: normalizedEmail,
    password,
    skinType,

    verificationToken: crypto
      .createHash("sha256")
      .update(verificationToken)
      .digest("hex"),

    verificationTokenExpires: new Date(
      Date.now() + 60 * 60 * 1000
    ),
  });


  const verificationUrl =
    `${FRONTEND_URL}/verify-email?token=${verificationToken}&email=${encodeURIComponent(
      normalizedEmail
    )}`;

  try {
    await sendVerificationEmail(
      pendingUser.email,
      verificationUrl
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
      "Verification link sent to your email.",
    email: pendingUser.email,
  });
});


export const verifyEmail = asyncHandler(async (req, res) => {
  const { email, token } = req.body;

  if (!email || !token) {
    res.status(400);
    throw new Error(
      "Email and verification token are required"
    );
  }

  const normalizedEmail = email.toLowerCase().trim();

  const hashedToken = crypto
    .createHash("sha256")
    .update(token)
    .digest("hex");

  // Find temporary registration
  const pendingUser = await PendingUser.findOne({
    email: normalizedEmail,
    verificationToken: hashedToken,
  });

  if (!pendingUser) {
    res.status(404);
    throw new Error(
      "Invalid or expired verification link. Please register again."
    );
  }

  // Check token expiry
  if (
    pendingUser.verificationTokenExpires.getTime() <
    Date.now()
  ) {
    await PendingUser.findByIdAndDelete(
      pendingUser._id
    );

    res.status(400);
    throw new Error(
      "Verification link has expired. Please register again."
    );
  }

  // Token is correct, now create actual User
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

  // Automatically login user
  res.json({
    _id: user._id,
    username: user.username,
    email: user.email,
    avatar: user.avatar,
    token: generateToken(user._id),
  });
});


export const resendVerificationEmail = asyncHandler(
  async (req, res) => {
    const { email } = req.body;

    if (!email) {
      res.status(400);
      throw new Error("Email is required");
    }

    const normalizedEmail = email.toLowerCase().trim();

    const pendingUser = await PendingUser.findOne({
      email: normalizedEmail,
    });

    if (!pendingUser) {
      res.status(404);
      throw new Error(
        "Registration not found or expired. Please register again."
      );
    }

    // Generate new secure token
    const verificationToken =
      crypto.randomBytes(32).toString("hex");

    pendingUser.verificationToken =
      crypto
        .createHash("sha256")
        .update(verificationToken)
        .digest("hex");

    pendingUser.verificationTokenExpires =
      new Date(
        Date.now() + 60 * 60 * 1000
      );

    await pendingUser.save();

    const verificationUrl =
      `${FRONTEND_URL}/verify-email?token=${verificationToken}&email=${encodeURIComponent(
        normalizedEmail
      )}`;

    try {
      await sendVerificationEmail(
        pendingUser.email,
        verificationUrl
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
        "A new verification link has been sent.",
    });
  }
);


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


export const getMe = asyncHandler(async (req, res) => {
  res.json(req.user);
});